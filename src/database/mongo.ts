import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let database = null;

async function startDatabase() {
  const mongoDBURL = process.env.MONGODB_URL;
  const connection = await MongoClient.connect(mongoDBURL);
  database = connection.db();
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

export { getDatabase, startDatabase };
