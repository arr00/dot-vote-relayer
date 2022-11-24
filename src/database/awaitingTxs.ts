import { getDatabase } from "./mongo";

const collectionName = "awaitingTxs";

type BySig = {
  _id: string;
  from: string;
  v: string;
  r: string;
  s: string;
  support: boolean | number;
  proposalId: number;
  type: string;
  delegatee: string;
  nonce: number;
  expiry: number;
  createdAt: Date;
  executed: boolean;
};

/**
 * Gets pending transactions from the mongodb database
 * @returns The transactions that are awaiting execution
 */
async function getPendingTxs(): Promise<[BySig]> {
  const database = await getDatabase();
  return await database
    .collection(collectionName)
    .find({ executed: false })
    .toArray();
}

/**
 * Mark transactions as executed
 * @param txIds The transaction ids to mark as executed
 */
async function transactionsExecuted(txIds: string[]) {
  const database = await getDatabase();
  await database.collection(collectionName).updateMany(
    {
      _id: { $in: txIds },
    },
    {
      $set: { executed: true },
    }
  );
}

export { getPendingTxs, transactionsExecuted };
