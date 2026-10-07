export const RULES = [
  {
    id: 'MESA001',
    title: 'Transaction.setFeePerSnarkCost() was removed',
    severity: 'error',
    pattern: /\bTransaction\.setFeePerSnarkCost\s*\(/g,
    message:
      'Mesa removed Transaction.setFeePerSnarkCost(). Use Transaction.setFeePerAccountUpdate() after reviewing the transaction-limit change.',
    replacement: 'Transaction.setFeePerAccountUpdate(',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
  {
    id: 'MESA002',
    title: 'The TransactionCost constants were removed',
    severity: 'error',
    pattern:
      /\bTransactionCost\.(?:PROOF_COST|SIGNED_PAIR_COST|SIGNED_SINGLE_COST|COST_LIMIT)\b/g,
    message:
      'Mesa removed TransactionCost constants. Review TransactionLimits.MAX_ZKAPP_SEGMENT_PER_TRANSACTION instead of applying a mechanical replacement.',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
  {
    id: 'MESA003',
    title: 'The project declares an o1js pre-Mesa dependency',
    severity: 'warning',
    includeStrings: true,
    pattern: /"o1js"\s*:\s*"[~^]?(?:0|1|2)\./g,
    message:
      'This project declares o1js before 3.0.0. Upgrade planning must include the Mesa migration changes before using a Mesa network.',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
];
