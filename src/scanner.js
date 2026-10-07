import { readFile, readdir, writeFile } from 'node:fs/promises';
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

// Removes comments while preserving string literals, offsets, and newlines.
// A small number of rules intentionally inspect literal configuration values.
export function maskComments(source) {
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
    } else if (state === 'string' && current === '\\') {
      masked += current;
      if (next !== undefined) masked += next;
      index += 2;
      continue;
    } else if (state === 'string' && current === quote) {
      state = 'code';
    } else if (state === 'line-comment' && current === '\n') {
      state = 'code';
    } else if (state === 'block-comment' && current === '*' && next === '/') {
      state = 'code';
      masked += '  ';
      index += 2;
      continue;
    }

    masked += state === 'line-comment' || state === 'block-comment' ? (current === '\n' ? '\n' : ' ') : current;
    index += 1;
  }
  return masked;
}

export function scanSource(source, file = '<memory>') {
  const masked = maskNonCode(source);
  const commentsMasked = maskComments(source);
  const findings = [];

  for (const rule of RULES) {
    const searchableSource = rule.includeStrings ? commentsMasked : masked;
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

export function applySafeFixes(source) {
  let updatedSource = source;
  const changes = [];

  for (const rule of RULES) {
    if (!rule.replacement) continue;

    const masked = maskNonCode(updatedSource);
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    const matches = [...masked.matchAll(pattern)];
    if (matches.length === 0) continue;

    for (const match of matches.toReversed()) {
      updatedSource =
        updatedSource.slice(0, match.index) +
        rule.replacement +
        updatedSource.slice(match.index + match[0].length);
    }
    changes.push({ ruleId: rule.id, replacements: matches.length });
  }

  return { source: updatedSource, changes };
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

export async function fixPath(target, { write = false } = {}) {
  const absoluteTarget = path.resolve(target);
  const files = await collectFiles(absoluteTarget);
  const changes = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const result = applySafeFixes(source);
    if (result.changes.length === 0) continue;

    if (write) await writeFile(file, result.source);
    changes.push({
      file: path.relative(absoluteTarget, file),
      changes: result.changes,
    });
  }
  return changes;
}
