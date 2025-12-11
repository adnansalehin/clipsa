require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI; // e.g. mongodb+srv://adnansalehin03_db_user:<db_password>@clipsa.suxarfg.mongodb.net/?appName=clipsa

if (!uri) {
  console.error("Missing MONGODB_URI env var");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged deployment: connection OK");
  } catch (err) {
    console.error("Connection failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
