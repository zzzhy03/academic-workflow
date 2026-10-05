import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const config = JSON.parse(fs.readFileSync(path.join(packageRoot, 'dependencies.json'), 'utf8'));

export function parseArgs(args) {
  const options = { skills: [], global: true, withOpenPencil: false, yes: false, dryRun: false, updateTools: false };
  options.command = args[0] && !args[0].startsWith('-') ? args.shift() : 'install';
  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    if (value === '--skill') {
      if (!args[i + 1] || args[i + 1].startsWith('-')) throw new Error('--skill requires a name.');
      options.skills.push(args[++i]);
    } else if (value === '--mcp-root') {
      if (!args[i + 1] || args[i + 1].startsWith('-')) throw new Error('--mcp-root requires a directory.');
      options.mcpRoot = args[++i];
    } else if (value === '--all') options.all = true;
    else if (value === '--project') options.global = false;
    else if (value === '--global') options.global = true;
    else if (value === '--with-openpencil') options.withOpenPencil = true;
    else if (value === '--yes') options.yes = true;
    else if (value === '--dry-run') options.dryRun = true;
    else if (value === '--update-tools') options.updateTools = true;
    else if (value === '--help' || value === '-h') options.command = 'help';
    else throw new Error('Unknown option: ' + value);
  }
  if (!['install', 'list', 'help'].includes(options.command)) throw new Error('Use install, list, or --help.');
  if (options.all && options.skills.length) throw new Error('Choose --all or one or more --skill arguments.');
  if (!options.skills.length) options.skills = [...config.skills];
  options.skills = [...new Set(options.skills)];
  for (const name of options.skills) {
    if (!config.skills.includes(name)) throw new Error('Unknown skill: ' + name);
  }
  if (!options.withOpenPencil && (options.mcpRoot || options.updateTools)) {
    throw new Error('--mcp-root and --update-tools require --with-openpencil.');
  }
  return options;
}

export function makePlan(options, platform = process.platform) {
  if (options.withOpenPencil) {
    if (platform === 'win32') throw new Error('Automatic OpenPencil setup currently supports macOS/Linux. Use the documented manual MCP setup on Windows.');
    if (!options.mcpRoot || !path.isAbsolute(options.mcpRoot)) throw new Error('--with-openpencil requires an absolute --mcp-root directory.');
    if (!fs.statSync(options.mcpRoot, { throwIfNoEntry: false })?.isDirectory()) throw new Error('--mcp-root must be an existing directory.');
  }
  const flags = ['--agent', 'codex', ...(options.global ? ['--global'] : []), ...(options.yes ? ['--yes'] : [])];
  const install = (source, skills) => ({
    command: 'npm',
    args: ['exec', '--yes', '--package=skills@' + config.skillsCliVersion, '--', 'skills', 'add', source,
      ...skills.flatMap(name => ['--skill', name]), ...flags]
  });
  const steps = [install(config.repository, options.skills)];
  if (options.withOpenPencil) {
    steps.push(install(config.openPencil.skillSource, ['open-pencil']));
    steps.push({ command: 'npm', kind: 'tools',
      args: ['install', '--global', ...Object.entries(config.openPencil.packages).map(([name, version]) => name + '@' + version)] });
    steps.push({ command: 'codex', kind: 'mcp',
      args: ['mcp', 'add', 'open-pencil', '--env', 'OPENPENCIL_MCP_ROOT=' + fs.realpathSync(options.mcpRoot), '--', 'openpencil-mcp'] });
  }
  return steps;
}

export function findNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ];
  for (const directory of (process.env.PATH || '').split(path.delimiter)) {
    const candidate = path.join(directory, 'npm');
    try { candidates.push(fs.realpathSync(candidate)); } catch { /* not an npm executable */ }
  }
  const match = candidates.find(p => p && p.endsWith('npm-cli.js') && fs.existsSync(p));
  if (!match) throw new Error('Cannot locate npm-cli.js. Run with npm exec/npx, or install Node.js with npm.');
  return match;
}

export function run(command, args, { capture = false } = {}) {
  const actual = command === 'npm' ? process.execPath : command;
  const actualArgs = command === 'npm' ? [findNpmCli(), ...args] : args;
  const result = spawnSync(actual, actualArgs, {
    stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8', shell: false,
    ...(capture ? { timeout: 30000 } : {})
  });
  if (result.error) throw new Error(command + ': ' + result.error.message);
  return result;
}

export function inspectMcp(rows, root) {
  const matches = rows.filter(row => {
    const transport = row.transport || {};
    const command = [transport.command || '', ...(transport.args || [])].join(' ');
    return ['open-pencil', 'openpencil'].includes(row.name) || /openpencil-mcp/.test(command);
  });
  if (!matches.length) return false;
  if (matches.length !== 1) throw new Error('Multiple OpenPencil MCP configurations exist. Resolve them in Codex first; none were changed.');
  const existing = matches[0];
  const transport = existing.transport || {};
  const launch = [transport.command || '', ...(transport.args || [])].join(' ');
  if (existing.enabled === false || transport.type !== 'stdio' || !/openpencil-mcp|@open-pencil[/\\\\]mcp/.test(launch)
      || transport.env?.OPENPENCIL_MCP_ROOT !== root) {
    throw new Error('An existing OpenPencil MCP configuration differs from the requested root or transport. It has been preserved; review it in Codex before continuing.');
  }
  return true;
}

export function preflight(options, runner = run) {
  if (!options.withOpenPencil) return { skipMcp: false, skipTools: false };
  const codex = runner('codex', ['mcp', 'list', '--json'], { capture: true });
  if (codex.status !== 0) throw new Error('Codex CLI must be installed and able to list MCP servers.');
  const skipMcp = inspectMcp(JSON.parse(codex.stdout), fs.realpathSync(options.mcpRoot));
  const npm = runner('npm', ['list', '--global', '--depth=0', '--json', ...Object.keys(config.openPencil.packages)], { capture: true });
  let installed;
  try { installed = JSON.parse(npm.stdout).dependencies || {}; }
  catch { throw new Error('Could not inspect globally installed OpenPencil packages.'); }
  if (npm.status !== 0 && npm.status !== 1) throw new Error('npm could not inspect installed packages.');
  for (const [name, version] of Object.entries(config.openPencil.packages)) {
    if (installed[name]?.version && installed[name].version !== version && !options.updateTools) {
      throw new Error(name + ' already has another version. Match the desktop/tool versions first, or explicitly use --update-tools to replace the packages.');
    }
  }
  const skipTools = Object.entries(config.openPencil.packages).every(([name, version]) => installed[name]?.version === version);
  const prefix = runner('npm', ['prefix', '--global'], { capture: true });
  if (prefix.status !== 0 || !path.isAbsolute(prefix.stdout.trim())) throw new Error('Cannot determine the global npm executable directory.');
  return { skipMcp, skipTools, mcpExecutable: path.join(prefix.stdout.trim(), 'bin', 'openpencil-mcp') };
}

export function help() {
  return `Academic Workflow
Usage: academic-workflow [install] [options]
       academic-workflow list

--skill NAME           Install one skill; repeat to select several
--all                  Install both repository skills (default)
--global               User-wide Codex skills (default)
--project              Install skills into the current project
--with-openpencil      Add the upstream skill, CLI, MCP, and user-level Codex MCP registration
--mcp-root /path        Existing directory that OpenPencil may access (required with OpenPencil)
--update-tools         Explicitly allow replacement of different installed OpenPencil package versions
--yes                  Accept the Skills CLI installation prompts
--dry-run              Print the plan without installing or changing configuration

Requires Node >=22.20.0 and npm. OpenPencil setup requires Codex CLI and macOS/Linux.
Project scope applies to skills only; optional tools and MCP configuration are user-wide.
The desktop application is installed separately. No desktop app is opened automatically.
`;
}

export async function main(args, { runner = run, output = console.log } = {}) {
  const options = parseArgs([...args]);
  if (options.command === 'help') return output(help());
  if (options.command === 'list') return output(config.skills.join('\n'));
  const plan = makePlan(options);
  output('Selected skills: ' + options.skills.join(', '));
  if (options.withOpenPencil) output('Optional setup: upstream OpenPencil skill + global CLI/MCP packages + Codex MCP registration.');
  for (const step of plan) output(JSON.stringify([step.command, ...step.args]));
  if (options.dryRun) return output('Dry run only. No commands executed.');
  const state = preflight(options, runner);
  for (const step of plan) {
    if (step.kind === 'tools' && state.skipTools) { output('Matching OpenPencil packages already installed; skipped.'); continue; }
    if (step.kind === 'mcp' && state.skipMcp) { output('Matching OpenPencil MCP configuration already exists; preserved.'); continue; }
    const args = step.kind === 'mcp' ? [...step.args.slice(0, -1), state.mcpExecutable] : step.args;
    const result = runner(step.command, args);
    if (result.status !== 0) throw new Error(step.command + ' failed with exit code ' + result.status + '.');
  }
  output('Requested installation steps completed.');
  if (options.withOpenPencil) output('OpenPencil desktop is separate. Open it with a document, then reconnect/restart the Codex MCP client and verify tools.');
}
