#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const candidates = ['python3', 'python'];
const command = candidates.find(name => {
  const result = spawnSync(name, ['-c', 'import sys; raise SystemExit(0 if sys.version_info >= (3, 9) else 1)'], { stdio: 'ignore', shell: false });
  return !result.error && result.status === 0;
});
if (!command) {
  console.error('Maintainer checks require Python 3.9 or newer. Skill installation does not.');
  process.exitCode = 1;
} else {
  const result = spawnSync(command, process.argv.slice(2), { stdio: 'inherit', shell: false });
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
}
