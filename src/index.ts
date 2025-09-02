import { createServer } from 'http';
import { env } from './config/env.js';
import { initializeFirebase } from './config/firebase.js';

// Initialize Firebase FIRST before importing any models
initializeFirebase();

import createApp from './app.js';

// Create the app asynchronously
const app = await createApp();
const server = createServer(app);

// Initialize Socket.io after app is created
const { initSockets } = await import('./sockets/index.js');
const io = initSockets(server);

// Make io available globally for other modules if needed
(global as any).io = io;

const PORT = env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║        Rozgarly API Server           ║
  ║                                      ║
  ║  🚀 Server running on port ${PORT}        ║
  ║  🌍 Environment: ${env.NODE_ENV.padEnd(10)} ║
  ║  📡 Socket.io enabled               ║
  ║  🔥 Firebase connected              ║
  ║                                      ║
  ║  📚 API Documentation: /api/docs     ║
  ║  ❤️  Health Check: /health           ║
  ║  🔌 Socket.io: /community            ║
  ╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
