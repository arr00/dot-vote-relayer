import { getDatabase } from "./mongo";

const collectionName = "awaitingTxs";

async function getPendingTxs() {
  const database = await getDatabase();
  return await database
    .collection(collectionName)
    .find({ executed: false })
    .toArray();
}

export { getPendingTxs };
