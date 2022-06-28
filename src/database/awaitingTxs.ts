import { getDatabase } from "./mongo";

const collectionName = "awaitingTxs";

type BySig = {
  from: string;
  v: string;
  r: string;
  s: string;
  support: boolean;
  proposalId: number;
  type: string;
  delegatee: string;
  nonce: number;
  expiry: number;
  createdAt: Date;
  executed: boolean;
};

async function getPendingTxs(): Promise<[BySig]> {
  const database = await getDatabase();
  return await database
    .collection(collectionName)
    .find({ executed: false })
    .toArray();
}

export { getPendingTxs };
