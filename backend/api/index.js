import dotenv from 'dotenv';
import app from '../src/app.js';
import { connectDB } from '../src/config/database.js';

// Load environment variables
dotenv.config();

// Connect to database (only once)
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  await connectDB();
  isConnected = true;
};

// Serverless function handler
export default async (req, res) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
