import { Transaction, TransactionCost } from 'o1js';

Transaction.setFeePerSnarkCost(0.1);

export const maxCost = TransactionCost.COST_LIMIT;
