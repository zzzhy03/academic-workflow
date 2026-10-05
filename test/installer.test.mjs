import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, makePlan, main } from '../lib/installer.mjs';
import { config, mcpCommand, inspectMcp, preflightSetup, setupOpenPencil, installOfficialSkill } from '../lib/openpencil.mjs';

function workspace(t) {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'academic-workflow-test-'));
  t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));
  return directory;
}
function runnerFor(root,rows=[],packages={}) {
  return (command,args)=>{
    if(command==='codex') return {status:0,stdout:JSON.stringify(rows)};
    if(command==='claude') return {status:0,stdout:'test client'};
    if(args[0]==='prefix') return {status:0,stdout:path.parse(root).root+'npm-tools\n'};
    return {status:0,stdout:JSON.stringify({dependencies:packages})};
  };
}
function entry(root) {
  return {name:'open-pencil',enabled:true,transport:{type:'stdio',command:'openpencil-mcp',env:{OPENPENCIL_MCP_ROOT:root}}};
}
test('skill-only install selects the requested skill and client without tools',()=>{
  const plan=makePlan(parseArgs(['install','--agent','claude-code','--skill','academic-paper-writing','--project']));
  assert.equal(plan.length,1);
  assert.ok(plan[0].args.includes('claude-code'));
  assert.ok(plan[0].args.includes('academic-paper-writing'));
  assert.ok(!plan[0].args.includes('academic-diagram-design'));
  assert.ok(!plan[0].args.includes('--global'));
});
test('both clients are accepted and invalid selectors are rejected',()=>{
  const plan=makePlan(parseArgs(['--agent','all']));
  assert.ok(plan[0].args.includes('codex'));
  assert.ok(plan[0].args.includes('claude-code'));
  assert.throws(()=>parseArgs(['--skill','../../outside']));
  assert.throws(()=>parseArgs(['--agent','unknown']));
  assert.throws(()=>parseArgs(['--replace']));
  assert.equal(parseArgs(['update']).command,'update');
});
test('MCP commands preserve root paths as single arguments for both clients',t=>{
  const root=workspace(t)+' ; space';
  const codex=mcpCommand('codex',root,'/tools/openpencil-mcp');
  assert.ok(codex.args.includes('OPENPENCIL_MCP_ROOT='+root));
  const claude=mcpCommand('claude-code',root,'/tools/openpencil-mcp');
  const payload=JSON.parse(claude.args.at(-1));
  assert.equal(payload.env.OPENPENCIL_MCP_ROOT,root);
  assert.equal(payload.command,'/tools/openpencil-mcp');
  assert.ok(claude.args.includes('user'));
});
test('dry run executes no commands',async()=>{
  let calls=0;
  await main(['--agent','all','--dry-run'],{runner:()=>{calls++;},output:()=>{}});
  assert.equal(calls,0);
});
test('a failed skill install stops before optional setup',async()=>{
  let setupCalls=0;
  await assert.rejects(()=>main(['--agent','codex'],{
    runner:()=>({status:7}),output:()=>{},setup:()=>{setupCalls++;}
  }));
  assert.equal(setupCalls,0);
});
test('conflicting MCP settings are preserved and matching settings reused',t=>{
  const root=workspace(t);
  assert.equal(inspectMcp([entry(root)],root),true);
  assert.throws(()=>inspectMcp([entry(root+'/other')],root));
  assert.throws(()=>inspectMcp([entry(root),entry(root)],root));
});
test('upstream skill copies include references/license and update backs up local changes',t=>{
  const root=workspace(t),dest=path.join(root,'skills');
  installOfficialSkill(dest);
  const target=path.join(dest,'open-pencil');
  assert.ok(fs.existsSync(path.join(target,'SKILL.md')));
  assert.ok(fs.existsSync(path.join(target,'LICENSE.txt')));
  assert.ok(fs.existsSync(path.join(target,'references/design-authoring.md')));
  fs.writeFileSync(path.join(target,'SKILL.md'),'local changes');
  assert.throws(()=>installOfficialSkill(dest));
  installOfficialSkill(dest,true);
  const backup=fs.readdirSync(root).find(name=>name.startsWith('.academic-workflow-backup-'));
  assert.equal(fs.readFileSync(path.join(root,backup,'open-pencil/SKILL.md'),'utf8'),'local changes');
});
test('tool setup requires update before replacing different package versions',{skip:process.platform==='win32'},t=>{
  const root=workspace(t),options={agents:['codex'],destinations:[],designRoot:root,update:false};
  const packages={'@open-pencil/mcp':{version:'0.1.0'}};
  assert.throws(()=>preflightSetup(options,runnerFor(root,[],packages),()=>[]),/update/);
  assert.equal(preflightSetup({...options,update:true},runnerFor(root,[],packages),()=>[]).skipTools,false);
});
test('optional setup registers both client types using the shared implementation',{skip:process.platform==='win32'},async t=>{
  const root=workspace(t),calls=[],copies=[];
  const runner=(command,args,options)=>{
    calls.push([command,args,options]);
    if(command==='codex' && args.includes('list')) return {status:0,stdout:'[]'};
    if(command==='claude' && args.includes('--version')) return {status:0,stdout:'client'};
    if(command==='npm' && args[0]==='list') return {status:0,stdout:'{}'};
    if(command==='npm' && args[0]==='prefix') return {status:0,stdout:root};
    return {status:0,stdout:'Added MCP server'};
  };
  await setupOpenPencil({agents:['codex','claude-code'],destinations:[root+'/a',root+'/b'],designRoot:root,update:false},
    {runner,readClaude:()=>[],installSkill:(directory)=>copies.push(directory),output:()=>{}});
  assert.equal(copies.length,2);
  assert.ok(calls.some(([command,args])=>command==='codex'&&args.includes('add')));
  assert.ok(calls.some(([command,args])=>command==='claude'&&args.includes('add-json')));
  assert.equal(calls.filter(([command,args])=>command==='npm'&&args[0]==='install').length,1);
});
test('matching MCP and packages cause no repeated configuration writes',{skip:process.platform==='win32'},async t=>{
  const root=workspace(t),writes=[];
  const packages=Object.fromEntries(Object.entries(config.openPencil.packages).map(([name,version])=>[name,{version}]));
  const inspector=runnerFor(root,[entry(fs.realpathSync(root))],packages);
  await setupOpenPencil({agents:['codex','claude-code'],destinations:[],designRoot:root,update:false},{
    runner:(cmd,args,opts)=>{if(!opts?.capture) writes.push([cmd,args]);return inspector(cmd,args);},
    readClaude:()=>[entry(fs.realpathSync(root))],installSkill:()=>{},output:()=>{}
  });
  assert.deepEqual(writes,[]);
});
