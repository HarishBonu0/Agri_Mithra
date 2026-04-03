import 'dotenv/config';
import { validateEnv, config } from './config/env.js';
import app from './app.js';
import connectDB, { closeDB } from './config/db.js';

// Fail fast if required env vars are missing
validateEnv();

const server = app.listen(config.port, () => {
  console.log(`[Server] Running on http://localhost:${config.port} [${config.nodeEnv}]`);
  console.log(`[Server] Health: http://localhost:${config.port}/api/health`);
});

connectDB().catch((err) => {
  console.warn(`[DB] Continuing without database: ${err?.message || err}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[Server] ${signal} received - shutting down gracefully`);
  server.close(async () => {
    await closeDB();
    console.log('[Server] Shutdown complete');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});
