import { Transaction, TransactionCost } from 'o1js';
import { CairoClaim } from 'o1js';

Transaction.setFeePerSnarkCost(0.1);

export const maxCost = TransactionCost.COST_LIMIT;
export const verificationKeyJson = verificationKey.toJSON();
export const legacyClient = new Client({ era: 'berkeley' });
