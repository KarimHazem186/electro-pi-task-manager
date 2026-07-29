import { MongoMemoryServer } from 'mongodb-memory-server';
import '../src/config/env.js';

export default async function globalSetup() {
  // Start MongoDB Memory Server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Store the URI and instance for use in tests
  global.__MONGOSERVER__ = mongoServer;
  process.env.MONGODB_URI = mongoUri;
  
  console.log('✅ MongoDB Memory Server started for tests');
  console.log(`   URI: ${mongoUri}`);
}
