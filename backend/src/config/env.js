import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : 
                existsSync(resolve(__dirname, '../../.env.local')) ? '.env.local' : '.env';

const envPath = resolve(__dirname, '../..', envFile);

if (existsSync(envPath)) {
  console.log(`📝 Loading environment from ${envFile}`);
  dotenv.config({ path: envPath });
} else {
  console.log('⚠️  No .env file found, using environment variables');
  dotenv.config();
}
