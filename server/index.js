import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { config } from './src/config.js';
import { proxyRoutes } from './src/routes/proxy.js';
import { reelsRoutes } from './src/routes/reels.js';
import { musicRoutes } from './src/routes/music.js';

const fastify = Fastify({
  logger: {
    level: config.environment === 'production' ? 'info' : 'info',
  },
  disableRequestLogging: false,
});

// Enable CORS for frontend clients (development and production deployments)
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Range', 'Authorization'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges', 'Content-Disposition'],
  credentials: true,
});

await fastify.register(sensible);

// Root & Healthcheck
fastify.get('/', async () => {
  return {
    app: config.appName,
    version: config.version,
    status: 'online',
    endpoints: {
      health: '/api/health',
      trends: '/api/reels/trends',
      resolve: '/api/reels/resolve?url=...',
      videoProxy: '/api/proxy/video?url=...',
      audioProxy: '/api/proxy/audio?url=...',
      musicSearch: '/api/music/search?q=...',
    },
  };
});

fastify.get('/api/health', async () => {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.environment,
    version: config.version,
  };
});

// Register API Route Modules
await fastify.register(proxyRoutes);
await fastify.register(reelsRoutes);
await fastify.register(musicRoutes);

// Graceful shutdown handlers
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await fastify.close();
      process.exit(0);
    } catch (err) {
      fastify.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  });
});

// Start Server
try {
  await fastify.listen({ port: config.port, host: config.host });
  console.log(`\n🚀 Sword AI Fastify Server listening on http://${config.host}:${config.port}`);
  console.log(`📡 Healthcheck: http://${config.host}:${config.port}/api/health\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
