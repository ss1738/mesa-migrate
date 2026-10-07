#!/usr/bin/env node
import process from 'node:process';

import { scanPath } from './scanner.js';

function usage() {
  console.error('Usage: mesa-migrate scan <directory> [--format text|json]');
}

const [, , command, target, ...options] = process.argv;
if (command !== 'scan' || !target) {
  usage();
  process.exitCode = 2;
} else {
  const formatIndex = options.indexOf('--format');
  const format = formatIndex === -1 ? 'text' : options[formatIndex + 1];
  if (!['text', 'json'].includes(format)) {
    console.error(`Unsupported format: ${format}`);
    process.exitCode = 2;
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
