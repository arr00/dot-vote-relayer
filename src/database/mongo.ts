import { MongoClient } from "mongodb";
import { globalConfig } from "../index";

let database = null;

async function startDatabase() {
  const mongoDBURL = globalConfig.mongodDbUrl;
  const connection = await MongoClient.connect(mongoDBURL);
  database = connection.db();
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

export { getDatabase, startDatabase };
