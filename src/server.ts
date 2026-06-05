import http from 'http';
import app from './app';
import { env } from './config/env';
import { initializeSocket } from './sockets';
import prisma from './config/database';

const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible throughout the app
app.set('io', io);

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    server.listen(env.PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 ProjectX API Server                  ║
║                                            ║
║   Port:        ${String(env.PORT).padEnd(25)}║
║   Environment: ${env.NODE_ENV.padEnd(25)}║
║   API:         /api/v1                     ║
║   Health:      /api/health                 ║
║   WebSocket:   ws://localhost:${String(env.PORT).padEnd(13)}║
║                                            ║
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server shut down');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();

export { io };
