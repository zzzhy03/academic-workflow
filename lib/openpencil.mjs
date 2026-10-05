import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const config = JSON.parse(fs.readFileSync(path.join(root, 'dependencies.json'), 'utf8'));

export function commandExists(name) {
  const extensions = process.platform === 'win32' ? ['', '.exe', '.cmd'] : [''];
  return (process.env.PATH || '').split(path.delimiter).some(directory =>
    extensions.some(extension => fs.existsSync(path.join(directory, name + extension))));
}

export function resolveAgents(value = 'auto', detect = commandExists) {
  if (value === 'all') return ['codex', 'claude-code'];
  if (['codex', 'claude-code'].includes(value)) return [value];
  if (value !== 'auto') throw new Error('Choose --agent auto, all, codex, or claude-code.');
  const agents = [];
  if (detect('codex') || fs.existsSync(path.join(os.homedir(), '.codex'))) agents.push('codex');
  if (detect('claude') || fs.existsSync(path.join(os.homedir(), '.claude'))) agents.push('claude-code');
  return agents.length ? agents : ['codex'];
}

export function skillDestinations(agents, project = false, dest) {
  if (dest) return [path.resolve(dest)];
  const base = project ? process.cwd() : os.homedir();
  return [...new Set(agents.map(agent => path.join(base, agent === 'codex' ? '.agents' : '.claude', 'skills')))];
}

export function findNpmCli() {
  const candidates = [process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')];
  for (const directory of (process.env.PATH || '').split(path.delimiter)) {
    try { candidates.push(fs.realpathSync(path.join(directory, 'npm'))); } catch {}
  }
  const result = candidates.find(p => p && p.endsWith('npm-cli.js') && fs.existsSync(p));
  if (!result) throw new Error('Cannot locate npm. Install Node.js with npm first.');
  return result;
}

export function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command === 'npm' ? process.execPath : command,
    command === 'npm' ? [findNpmCli(), ...args] : args,
    { stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8', shell: false,
      ...(capture ? { timeout: 30000 } : {}) });
  if (result.error) throw new Error(command + ': ' + result.error.message);
  return result;
}

export function mcpCommand(agent, designRoot, executable) {
  if (agent === 'codex') return { command: 'codex', args: [
    'mcp', 'add', 'open-pencil', '--env', 'OPENPENCIL_MCP_ROOT=' + designRoot, '--', executable] };
  return { command: 'claude', args: ['mcp', 'add-json', '--scope', 'user', 'open-pencil',
    JSON.stringify({ type: 'stdio', command: executable, args: [], env: { OPENPENCIL_MCP_ROOT: designRoot } })] };
}

export function inspectMcp(rows, designRoot) {
  const matches = rows.filter(row => {
    const t = row.transport || {};
    return ['open-pencil', 'openpencil'].includes(row.name)
      || /openpencil-mcp|@open-pencil[/\\]mcp/.test([t.command || '', ...(t.args || [])].join(' '));
  });
  if (!matches.length) return false;
  if (matches.length > 1) throw new Error('Multiple OpenPencil MCP entries exist; review them before setup.');
  const item = matches[0], t = item.transport || {};
  const launch = [t.command || '', ...(t.args || [])].join(' ');
  if (item.enabled === false || (t.type && t.type !== 'stdio')
      || !/openpencil-mcp|@open-pencil[/\\]mcp/.test(launch)
      || t.env?.OPENPENCIL_MCP_ROOT !== designRoot) {
    throw new Error('Existing OpenPencil MCP settings differ. They were preserved; review them in the client before setup.');
  }
  return true;
}

export function claudeServerRows() {
  const home = os.homedir(), custom = process.env.CLAUDE_CONFIG_DIR;
  const files = custom ? [path.join(custom, '.claude.json'), path.join(custom, 'claude.json')]
    : [path.join(home, '.claude.json')];
  const rows = [];
  function add(servers) {
    for (const [name, transport] of Object.entries(servers || {})) {
      if (['open-pencil', 'openpencil'].includes(name) || /openpencil-mcp/.test(transport.command || '')) {
        rows.push({ name, transport });
      }
    }
  }
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    add(data.mcpServers);
    for (const [directory, project] of Object.entries(data.projects || {})) {
      const relative = path.relative(directory, process.cwd());
      if (!relative.startsWith('..') && !path.isAbsolute(relative)) add(project.mcpServers);
    }
  }
  let directory = process.cwd();
  while (true) {
    const file = path.join(directory, '.mcp.json');
    if (fs.existsSync(file)) add(JSON.parse(fs.readFileSync(file, 'utf8')).mcpServers);
    if (fs.existsSync(path.join(directory, '.git')) || path.dirname(directory) === directory) break;
    directory = path.dirname(directory);
  }
  return rows;
}

export function setupPlan(options, platform = process.platform) {
  if (platform === 'win32') throw new Error('Use macOS/Linux or WSL for automatic OpenPencil setup.');
  if (!path.isAbsolute(options.designRoot) || !fs.statSync(options.designRoot, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error('--mcp-root must be an existing absolute directory.');
  }
  const designRoot = fs.realpathSync(options.designRoot);
  return [
    { command: 'npm', args: ['install', '--global', ...Object.entries(config.openPencil.packages).map(([n,v]) => n + '@' + v)] },
    ...options.agents.map(agent => mcpCommand(agent, designRoot, 'openpencil-mcp')),
  ];
}

export function preflightSetup(options, runner = run, readClaude = claudeServerRows) {
  setupPlan(options);
  const designRoot = fs.realpathSync(options.designRoot), skipMcp = {};
  for (const agent of options.agents) {
    let rows;
    if (agent === 'codex') {
      const response = runner('codex', ['mcp', 'list', '--json'], { capture: true });
      if (response.status !== 0) throw new Error('Cannot read MCP configuration from the selected client.');
      rows = JSON.parse(response.stdout);
    } else {
      const response = runner('claude', ['--version'], { capture: true });
      if (response.status !== 0) throw new Error('The selected client CLI is unavailable.');
      rows = readClaude();
    }
    skipMcp[agent] = inspectMcp(rows, designRoot);
  }
  const packages = runner('npm', ['list', '--global', '--depth=0', '--json', ...Object.keys(config.openPencil.packages)], { capture: true });
  if (![0, 1].includes(packages.status)) throw new Error('Cannot inspect installed OpenPencil packages.');
  const installed = JSON.parse(packages.stdout).dependencies || {};
  for (const [name, version] of Object.entries(config.openPencil.packages)) {
    if (installed[name]?.version && installed[name].version !== version && !options.update) {
      throw new Error(name + ' has another version. Use update to align it with this release.');
    }
  }
  const prefix = runner('npm', ['prefix', '--global'], { capture: true });
  if (prefix.status !== 0 || !path.isAbsolute(prefix.stdout.trim())) throw new Error('Cannot locate the global npm binaries.');
  return { designRoot, skipMcp,
    skipTools: Object.entries(config.openPencil.packages).every(([n,v]) => installed[n]?.version === v),
    executable: path.join(prefix.stdout.trim(), 'bin', 'openpencil-mcp') };
}

function integrationFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Unexpected symlink in bundled integration.');
    if (entry.isDirectory()) return integrationFiles(file);
    return ['UPSTREAM.md', '.DS_Store'].includes(entry.name) ? [] : [file];
  });
}

export function installOfficialSkill(destination, update = false) {
  const source = path.join(root, 'integrations/open-pencil'), target = path.join(destination, 'open-pencil');
  const files = integrationFiles(source).map(file => [file, path.relative(source, file).replace(/^SKILL.source.md$/, 'SKILL.md')]);
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isSymbolicLink()) throw new Error('The existing open-pencil skill is a symlink; update its source.');
    if (files.every(([file, rel]) => fs.existsSync(path.join(target, rel))
      && fs.readFileSync(file).equals(fs.readFileSync(path.join(target, rel))))) return;
    if (!update) throw new Error('The open-pencil skill already exists. Use update to replace it with a backup.');
  }
  fs.mkdirSync(destination, { recursive: true });
  const stage = fs.mkdtempSync(path.join(path.dirname(destination), '.open-pencil-stage-'));
  let backup;
  try {
    for (const [file, rel] of files) {
      const output = path.join(stage, rel);
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.copyFileSync(file, output);
    }
    if (fs.existsSync(target)) {
      const backupRoot = fs.mkdtempSync(path.join(path.dirname(destination), '.academic-workflow-backup-'));
      backup = path.join(backupRoot, 'open-pencil');
      fs.renameSync(target, backup);
      console.log('Previous OpenPencil skill retained in: ' + backup);
    }
    fs.renameSync(stage, target);
  } catch (error) {
    if (backup && !fs.existsSync(target)) fs.renameSync(backup, target);
    throw error;
  } finally { fs.rmSync(stage, { recursive: true, force: true }); }
}

export async function setupOpenPencil(options, { runner = run, readClaude = claudeServerRows, installSkill = installOfficialSkill, output = console.log } = {}) {
  const plan = setupPlan(options);
  if (options.dryRun) {
    for (const directory of options.destinations) output('OpenPencil skill → ' + path.join(directory, 'open-pencil'));
    for (const step of plan) output(JSON.stringify([step.command, ...step.args]));
    return;
  }
  const state = preflightSetup(options, runner, readClaude);
  if (options.checkOnly) return;
  for (const directory of options.destinations) installSkill(directory, options.update);
  if (!state.skipTools && runner(plan[0].command, plan[0].args).status !== 0) throw new Error('OpenPencil package installation failed.');
  for (const agent of options.agents) {
    if (state.skipMcp[agent]) { output('Existing matching OpenPencil MCP settings preserved.'); continue; }
    const step = mcpCommand(agent, state.designRoot, state.executable);
    const result = runner(step.command, step.args, { capture: true });
    if (result.status !== 0 || /was not saved|may not have been saved/i.test(result.stdout || '')) {
      throw new Error('OpenPencil MCP registration did not complete for ' + agent + '.');
    }
    output('OpenPencil MCP registered for ' + agent + '.');
  }
  output('OpenPencil skill and tools are ready. Open the desktop app separately with a document, then verify the client connection.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), options = { agents: [], destinations: [], designRoot: process.cwd(), update: false };
  for (let i=0;i<args.length;i++) {
    const arg=args[i];
    if (arg==='--agent') options.agents.push(args[++i]);
    else if (arg==='--dest') options.destinations.push(path.resolve(args[++i]));
    else if (arg==='--mcp-root') options.designRoot=path.resolve(args[++i]);
    else if (arg==='--update') options.update=true;
    else if (arg==='--dry-run') options.dryRun=true;
    else if (arg==='--check') options.checkOnly=true;
    else throw new Error('Unknown integration option: '+arg);
  }
  if (!options.agents.length || !options.destinations.length || options.agents.some(x=>!['codex','claude-code'].includes(x))) {
    throw new Error('Integration setup requires a supported agent and skill destination.');
  }
  setupOpenPencil(options).catch(error => { console.error(error.message); process.exitCode=1; });
}
