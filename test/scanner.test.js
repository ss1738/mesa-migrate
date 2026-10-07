import test from 'node:test';
import assert from 'node:assert/strict';

import { maskNonCode, scanSource } from '../src/scanner.js';

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
