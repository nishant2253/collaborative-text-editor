const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongo;

beforeAll(async () => {
  // IMPORTANT: ensure index.js sees test mode BEFORE loading app
  process.env.NODE_ENV = "test";

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = "test_jwt";
  process.env.JWT_REFRESH_SECRET = "test_jwt_refresh";
  process.env.GEMINI_API_KEY = "test_key";
  process.env.CLIENT_URL = "http://localhost:3000";

  await mongoose.connect(uri, { dbName: "jest" });
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});
