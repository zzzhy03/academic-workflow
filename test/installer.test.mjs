import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, makePlan, preflight, main, config } from '../lib/installer.mjs';

function workspace(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'academic-workflow-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

test('one skill installs only that skill and has no tool/config side effects', () => {
  const plan = makePlan(parseArgs(['install', '--skill', 'academic-paper-writing', '--project']));
  assert.equal(plan.length, 1);
  assert.ok(plan[0].args.includes('academic-paper-writing'));
  assert.ok(!plan[0].args.includes('academic-diagram-design'));
  assert.ok(!plan[0].args.includes('--global'));
});

test('multiple selections are deduplicated and unknown names fail before execution', () => {
  const options = parseArgs(['install', '--skill', 'academic-paper-writing', '--skill', 'academic-diagram-design', '--skill', 'academic-paper-writing']);
  assert.deepEqual(options.skills, config.skills);
  assert.throws(() => parseArgs(['install', '--skill', '../../outside']), /Unknown skill/);
  assert.throws(() => parseArgs(['install', '--all', '--skill', 'academic-paper-writing']), /Choose/);
});

test('OpenPencil requires an explicit existing root and keeps it one argument', t => {
  const directory = workspace(t);
  assert.throws(() => makePlan(parseArgs(['install', '--with-openpencil']), 'darwin'), /absolute/);
  const root = path.join(directory, 'design space ; untouched');
  fs.mkdirSync(root);
  const options = parseArgs(['install', '--with-openpencil', '--mcp-root', root]);
  const plan = makePlan(options, 'darwin');
  assert.equal(plan.length, 4);
  assert.ok(plan[3].args.includes('OPENPENCIL_MCP_ROOT=' + fs.realpathSync(root)));
  assert.ok(!plan.some(step => ['brew', 'open', 'sudo'].includes(step.command)));
  assert.throws(() => makePlan(options, 'win32'), /manual MCP/);
});

test('dry run executes nothing', async () => {
  let calls = 0;
  await main(['install', '--dry-run'], { runner: () => { calls++; }, output: () => {} });
  assert.equal(calls, 0);
});

test('an installer failure stops subsequent work and reports failure', async () => {
  const calls = [];
  await assert.rejects(() => main(['install', '--yes'], {
    runner: (command, args) => { calls.push([command, args]); return { status: 7 }; }, output: () => {}
  }), /exit code 7/);
  assert.equal(calls.length, 1);
});

function inspector(root, rows = [], packages = {}) {
  return (command, args) => {
    if (command === 'codex') return { status: 0, stdout: JSON.stringify(rows) };
    if (args[0] === 'prefix') return { status: 0, stdout: path.parse(root).root + 'npm-tools\n' };
    return { status: 0, stdout: JSON.stringify({ dependencies: packages }) };
  };
}

test('existing MCP with a different root is preserved by refusing installation', t => {
  const root = workspace(t);
  const options = parseArgs(['install', '--with-openpencil', '--mcp-root', root]);
  const rows = [{ name: 'open-pencil', enabled: true, transport: { type: 'stdio', command: 'openpencil-mcp', env: { OPENPENCIL_MCP_ROOT: root + '/other' } } }];
  assert.throws(() => preflight(options, inspector(root, rows)), /has been preserved/);
});

test('matching tools and alias-named MCP can be reused', t => {
  const root = workspace(t);
  const options = parseArgs(['install', '--with-openpencil', '--mcp-root', root]);
  const packages = Object.fromEntries(Object.entries(config.openPencil.packages).map(([name, version]) => [name, { version }]));
  const rows = [{ name: 'openpencil', enabled: true, transport: { type: 'stdio', command: '/tools/openpencil-mcp', env: { OPENPENCIL_MCP_ROOT: fs.realpathSync(root) } } }];
  const state = preflight(options, inspector(root, rows, packages));
  assert.equal(state.skipMcp, true);
  assert.equal(state.skipTools, true);
});

test('replacing different tool versions needs the explicit update option', t => {
  const root = workspace(t);
  const options = parseArgs(['install', '--with-openpencil', '--mcp-root', root]);
  const packages = { '@open-pencil/mcp': { version: '0.1.0' } };
  assert.throws(() => preflight(options, inspector(root, [], packages)), /--update-tools/);
  assert.equal(preflight({ ...options, updateTools: true }, inspector(root, [], packages)).skipTools, false);
});
