import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { RULES } from './rules.js';

const SOURCE_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx']);
const IGNORED_DIRECTORIES = new Set(['.git', 'coverage', 'dist', 'node_modules']);

function lineAndColumn(source, offset) {
  const before = source.slice(0, offset);
  const lines = before.split('\n');
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

// Removes comments and string contents while preserving offsets and newlines. This
// keeps diagnostics useful without matching migration examples in documentation.
export function maskNonCode(source) {
  let masked = '';
  let index = 0;
  let state = 'code';
  let quote = '';

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (state === 'code' && current === '/' && next === '/') {
      state = 'line-comment';
      masked += '  ';
      index += 2;
      continue;
    }
    if (state === 'code' && current === '/' && next === '*') {
      state = 'block-comment';
      masked += '  ';
      index += 2;
      continue;
    }
    if (state === 'code' && (current === "'" || current === '"' || current === '`')) {
      state = 'string';
      quote = current;
      masked += ' ';
      index += 1;
      continue;
    }
    if (state === 'line-comment' && current === '\n') {
      state = 'code';
      masked += '\n';
      index += 1;
      continue;
    }
    if (state === 'block-comment' && current === '*' && next === '/') {
      state = 'code';
      masked += '  ';
      index += 2;
      continue;
    }
    if (state === 'string' && current === '\\') {
      masked += current === '\n' ? '\n' : ' ';
      if (next !== undefined) masked += next === '\n' ? '\n' : ' ';
      index += 2;
      continue;
    }
    if (state === 'string' && current === quote) {
      state = 'code';
      masked += ' ';
      index += 1;
      continue;
    }

    masked += state === 'code' || current === '\n' ? current : ' ';
    index += 1;
  }
  return masked;
}

export function scanSource(source, file = '<memory>') {
  const masked = maskNonCode(source);
  const findings = [];

  for (const rule of RULES) {
    const searchableSource = rule.includeStrings ? source : masked;
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    for (const match of searchableSource.matchAll(pattern)) {
      const location = lineAndColumn(source, match.index);
      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        title: rule.title,
        message: rule.message,
        source: rule.source,
        file,
        line: location.line,
        column: location.column,
        match: source.slice(match.index, match.index + match[0].length),
      });
    }
  }
  return findings;
}

async function collectFiles(target) {
  const entry = await readdir(target, { withFileTypes: true });
  const files = [];
  for (const item of entry) {
    if (item.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(item.name)) {
        files.push(...(await collectFiles(path.join(target, item.name))));
      }
    } else if (
      item.isFile() &&
      (SOURCE_EXTENSIONS.has(path.extname(item.name)) || item.name === 'package.json')
    ) {
      files.push(path.join(target, item.name));
    }
  }
  return files;
}

export async function scanPath(target) {
  const absoluteTarget = path.resolve(target);
  const files = await collectFiles(absoluteTarget);
  const findings = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    findings.push(...scanSource(source, path.relative(absoluteTarget, file)));
  }
  return findings.sort((left, right) =>
    left.file.localeCompare(right.file) || left.line - right.line || left.column - right.column,
  );
}
