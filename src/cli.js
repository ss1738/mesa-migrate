#!/usr/bin/env node
import process from 'node:process';

import { fixPath, scanPath } from './scanner.js';

function usage() {
  console.error('Usage: mesa-migrate <scan|fix> <directory> [--format text|json] [--write]');
}

const [, , command, target, ...options] = process.argv;
if (!['scan', 'fix'].includes(command) || !target) {
  usage();
  process.exitCode = 2;
} else {
  const formatIndex = options.indexOf('--format');
  const format = formatIndex === -1 ? 'text' : options[formatIndex + 1];
  if (!['text', 'json'].includes(format)) {
    console.error(`Unsupported format: ${format}`);
    process.exitCode = 2;
  } else {
    if (command === 'fix') {
      const changes = await fixPath(target, { write: options.includes('--write') });
      const mode = options.includes('--write') ? 'applied' : 'planned';
      if (format === 'json') {
        console.log(JSON.stringify({ mode, changes }, null, 2));
      } else if (changes.length === 0) {
        console.log('No supported safe fixes found.');
      } else {
        console.log(`${mode === 'applied' ? 'Applied' : 'Planned'} safe fixes:`);
        for (const change of changes) {
          for (const item of change.changes) {
            console.log(`${change.file} ${item.ruleId} (${item.replacements} replacement${item.replacements === 1 ? '' : 's'})`);
          }
        }
      }
    } else {
      const findings = await scanPath(target);
      if (format === 'json') {
        console.log(JSON.stringify({ findings }, null, 2));
      } else if (findings.length === 0) {
        console.log('No Mesa migration findings. This scanner only checks supported rules.');
      } else {
        for (const finding of findings) {
          console.log(
            `${finding.file}:${finding.line}:${finding.column} ${finding.severity} ${finding.ruleId} ${finding.message}`,
          );
        }
      }
      process.exitCode = findings.some((finding) => finding.severity === 'error') ? 1 : 0;
    }
  }
}
