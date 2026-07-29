// Load environment variables FIRST
import './config/env.js';

import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { verifyCloudinaryConfig } from './config/cloudinary.js';

// Connect to database
connectDB();

// Verify Cloudinary configuration
verifyCloudinaryConfig();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Task Manager API Server                            ║
║                                                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║   Port: ${PORT}                                           ║
║   API Docs: http://localhost:${PORT}/api-docs             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

export default server;
