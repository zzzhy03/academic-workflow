import fs from 'node:fs';
import path from 'node:path';
import { config, resolveAgents, skillDestinations, run, setupPlan, setupOpenPencil, preflightSetup } from './openpencil.mjs';
export { config, run };

export function parseArgs(input) {
  const args=[...input];
  const options={command:'install',skills:[],agent:'auto',global:true,withOpenPencil:false,yes:false,dryRun:false,mcpRoot:process.cwd()};
  if (args[0] && !args[0].startsWith('-')) options.command=args.shift();
  for (let i=0;i<args.length;i++) {
    const arg=args[i];
    if (['--skill','--agent','--mcp-root'].includes(arg)) {
      if (!args[i+1] || args[i+1].startsWith('-')) throw new Error(arg+' requires a value.');
      const value=args[++i];
      if(arg==='--skill') options.skills.push(value);
      else if(arg==='--agent') options.agent=value;
      else options.mcpRoot=path.resolve(value);
    } else if(arg==='--all') options.all=true;
    else if(arg==='--project') options.global=false;
    else if(arg==='--global') options.global=true;
    else if(arg==='--with-openpencil') options.withOpenPencil=true;
    else if(arg==='--yes') options.yes=true;
    else if(arg==='--dry-run') options.dryRun=true;
    else if(arg==='--help'||arg==='-h') options.command='help';
    else throw new Error('Unknown option: '+arg);
  }
  if(!['install','update','list','help'].includes(options.command)) throw new Error('Use install, update, list, or --help.');
  if(!['auto','all','codex','claude-code'].includes(options.agent)) throw new Error('Unsupported --agent value.');
  if(options.all&&options.skills.length) throw new Error('Choose --all or --skill.');
  if(!options.skills.length) options.skills=[...config.skills];
  options.skills=[...new Set(options.skills)];
  for(const name of options.skills) if(!config.skills.includes(name)) throw new Error('Unknown skill: '+name);
  return options;
}

export function integrationOptions(options) {
  const agents=resolveAgents(options.agent);
  return {agents,destinations:skillDestinations(agents,!options.global),
    designRoot:options.mcpRoot,update:options.command==='update',dryRun:options.dryRun};
}

export function makePlan(options, platform=process.platform) {
  const integration=integrationOptions(options);
  const flags=[...options.skills.flatMap(name=>['--skill',name]),
    ...integration.agents.flatMap(agent=>['--agent',agent]),
    ...(options.global?['--global']:[]),...(options.yes?['--yes']:[])];
  const plan=[{command:'npm',args:['exec','--yes','--package=skills@'+config.skillsCliVersion,'--',
    'skills','add',config.repository,...flags]}];
  if(options.withOpenPencil) plan.push(...setupPlan(integration,platform));
  return plan;
}

export function preflight(options, runner=run, readClaude) {
  if(!options.withOpenPencil) return;
  return preflightSetup(integrationOptions(options),runner,readClaude);
}

export function help() {
  return `Academic Workflow — Skills CLI with optional drawing tools
Usage: academic-workflow [install|update] [options]
       academic-workflow list

--skill NAME         Select a skill; repeat for several
--all                Install all collection skills (default)
--agent TARGET       auto (default), all, codex, claude-code
--global             User-wide skills (default)
--project            Install skills under the current project
--with-openpencil    Install the official skill, CLI/MCP, and register the selected clients
--mcp-root DIRECTORY  OpenPencil access directory (default: current directory)
--yes                Accept Skills CLI installation prompts
--dry-run            Show the plan without making changes
--help               Show this help

The OpenPencil desktop app is separate. Software/MCP setup requires macOS/Linux or WSL.
Skill scope and MCP scope are separate: MCP registration is user-wide.
`;
}

export async function main(args,{runner=run,output=console.log,setup=setupOpenPencil,readClaude}={}) {
  const options=parseArgs(args);
  if(options.command==='help') return output(help());
  if(options.command==='list') return output(config.skills.join('\n'));
  const plan=makePlan(options);
  output('Selected skills: '+options.skills.join(', '));
  for(const step of plan) output(JSON.stringify([step.command,...step.args]));
  if(options.withOpenPencil) output('Official OpenPencil skill will be installed alongside the selected skills.');
  if(options.dryRun) return;
  preflight(options,runner,readClaude);
  const result=runner(plan[0].command,plan[0].args);
  if(result.status!==0) throw new Error('Skill installation failed with exit code '+result.status+'.');
  if(options.withOpenPencil) await setup(integrationOptions(options),{runner,readClaude,output});
  output('Requested installation completed.');
}
