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
  {
    id: 'MESA004',
    title: 'VerificationKey.toJSON() changed its return shape',
    severity: 'warning',
    pattern: /\b[\w$]*(?:verificationKey|vk)[\w$]*\.toJSON\s*\(/gi,
    message:
      'Mesa changed VerificationKey.toJSON() from a string to an object with data and hash. Review consumers of this value.',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
  {
    id: 'MESA005',
    title: 'Legacy Berkeley signing is explicitly configured',
    severity: 'warning',
    includeStrings: true,
    pattern: /\bera\s*:\s*["']berkeley["']/gi,
    message:
      'mina-signer v4 signs Mesa transactions by default. Keep era: berkeley only when legacy transaction output is intentional.',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
  {
    id: 'MESA006',
    title: 'Cairo gate types were removed',
    severity: 'error',
    pattern: /\b(?:CairoClaim|CairoInstruction|CairoFlags|CairoTransition)\b/g,
    message:
      'Mesa removed this unused Cairo gate type from o1js. Remove or replace the reference before upgrading.',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
  {
    id: 'MESA007',
    title: 'The project declares mina-signer before v4',
    severity: 'warning',
    includeStrings: true,
    pattern: /"mina-signer"\s*:\s*"[~^]?(?:0|1|2|3)\./g,
    message:
      'Mesa requires mina-signer v4 for Mesa-format zkApp commands. Review signing behavior when upgrading.',
    source:
      'https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18',
  },
];
