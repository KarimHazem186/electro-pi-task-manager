import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

/**
 * Global test setup - runs once before all tests
 */
export const setup = async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the MongoDB URI for tests
  process.env.MONGODB_URI = mongoUri;
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  console.log('✅ MongoDB Memory Server started for tests');
};

/**
 * Global test teardown - runs once after all tests
 */
export const teardown = async () => {
  // Close mongoose connection
  await mongoose.disconnect();
  
  // Stop in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
    console.log('✅ MongoDB Memory Server stopped');
  }
};

/**
 * Clear all test data after each test
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
