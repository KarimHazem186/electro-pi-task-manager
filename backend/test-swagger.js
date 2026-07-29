// Quick test script to verify Swagger is working
import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('🚀 Test server started');
  console.log(`📝 Server: http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
  console.log('\n✅ Try opening these URLs in your browser');
  console.log('⏹️  Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('👋 Server stopped');
    process.exit(0);
  });
});
