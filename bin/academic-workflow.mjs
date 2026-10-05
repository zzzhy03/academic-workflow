#!/usr/bin/env node
import { main } from '../lib/installer.mjs';

main(process.argv.slice(2)).catch(error => {
  console.error('academic-workflow: ' + error.message);
  console.error('Completed steps are not rolled back. Resolve the issue, then rerun.');
  process.exitCode = 1;
});
