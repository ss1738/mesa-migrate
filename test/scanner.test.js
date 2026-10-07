import test from 'node:test';
import assert from 'node:assert/strict';

import { applySafeFixes, maskComments, maskNonCode, scanSource } from '../src/scanner.js';

test('finds removed Mesa transaction APIs with locations', () => {
  const source = [
    'Transaction.setFeePerSnarkCost(0.1);',
    'const limit = TransactionCost.COST_LIMIT;',
  ].join('\n');

  const findings = scanSource(source, 'example.ts');

  assert.deepEqual(
    findings.map(({ ruleId, file, line, column }) => ({ ruleId, file, line, column })),
    [
      { ruleId: 'MESA001', file: 'example.ts', line: 1, column: 1 },
      { ruleId: 'MESA002', file: 'example.ts', line: 2, column: 15 },
    ],
  );
});

test('does not report API names in comments or strings', () => {
  const source = [
    '// Transaction.setFeePerSnarkCost(0.1);',
    "const help = 'TransactionCost.COST_LIMIT';",
    '/* TransactionCost.PROOF_COST */',
  ].join('\n');

  assert.deepEqual(scanSource(source), []);
  assert.equal(maskNonCode(source).split('\n').length, 3);
});

test('reports an explicit pre-Mesa o1js package dependency', () => {
  const source = '{\n  "dependencies": { "o1js": "^2.15.0" }\n}';
  const findings = scanSource(source, 'package.json');

  assert.deepEqual(
    findings.map(({ ruleId, line, column }) => ({ ruleId, line, column })),
    [{ ruleId: 'MESA003', line: 2, column: 21 }],
  );
});

test('plans a safe fee-cost replacement without touching comments', () => {
  const source = [
    '// Transaction.setFeePerSnarkCost(0.1);',
    'Transaction.setFeePerSnarkCost(0.1);',
  ].join('\n');

  const result = applySafeFixes(source);

  assert.deepEqual(result.changes, [{ ruleId: 'MESA001', replacements: 1 }]);
  assert.equal(
    result.source,
    [
      '// Transaction.setFeePerSnarkCost(0.1);',
      'Transaction.setFeePerAccountUpdate(0.1);',
    ].join('\n'),
  );
});

test('finds Mesa API and configuration changes that need human review', () => {
  const source = [
    'import { CairoClaim } from \'o1js\';',
    'const value = verificationKey.toJSON();',
    "const client = new Client({ era: 'berkeley' });",
  ].join('\n');

  const findings = scanSource(source, 'example.ts');

  assert.deepEqual(
    findings.map(({ ruleId, line, column }) => ({ ruleId, line, column })),
    [
      { ruleId: 'MESA004', line: 2, column: 15 },
      { ruleId: 'MESA005', line: 3, column: 29 },
      { ruleId: 'MESA006', line: 1, column: 10 },
    ],
  );
});

test('does not report Berkeley configuration text in comments', () => {
  const source = [
    "// Legacy callers used era: 'berkeley'.",
    "/* era: 'berkeley' */",
  ].join('\n');

  assert.deepEqual(scanSource(source), []);
  assert.equal(maskComments(source).includes("era: 'berkeley'"), false);
});

test('reports a pre-Mesa mina-signer package dependency', () => {
  const source = '{\n  "dependencies": { "mina-signer": "^3.1.0" }\n}';
  const findings = scanSource(source, 'package.json');

  assert.deepEqual(
    findings.map(({ ruleId, line, column }) => ({ ruleId, line, column })),
    [{ ruleId: 'MESA007', line: 2, column: 21 }],
  );
});
