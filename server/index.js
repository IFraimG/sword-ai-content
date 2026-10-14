import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { config } from './src/config.js';
import { initDb } from './src/db/index.js';
import { proxyRoutes } from './src/routes/proxy.js';
import { reelsRoutes } from './src/routes/reels.js';
import { musicRoutes } from './src/routes/music.js';
import { youtubeRoutes } from './src/routes/youtube.js';
import { authRoutes } from './src/routes/auth.js';
import { usersRoutes } from './src/routes/users.js';
import { chatsRoutes } from './src/routes/chats.js';

const fastify = Fastify({
  logger: {
    level: config.environment === 'production' ? 'info' : 'info',
  },
  disableRequestLogging: false,
});

// Enable CORS for frontend clients
await fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Range',
    'Authorization',
    'Cookie',
    'x-auth-token',
    'X-Auth-Token',
  ],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges', 'Content-Disposition', 'Set-Cookie'],
  credentials: true,
});

await fastify.register(sensible);

// Native Cookie Parser & Serializer Hook (RFC 6265 compliant)
fastify.addHook('onRequest', (request, reply, done) => {
  const cookieHeader = request.headers.cookie;
  request.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((pair) => {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const key = pair.substring(0, idx).trim();
        const val = decodeURIComponent(pair.substring(idx + 1).trim());
        request.cookies[key] = val;
      }
    });
  }

  reply.setCookie = (name, value, options = {}) => {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (options.maxAge !== undefined) cookieStr += `; Max-Age=${options.maxAge}`;
    if (options.path) cookieStr += `; Path=${options.path}`;
    if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;
    if (options.secure) cookieStr += `; Secure`;
    if (options.httpOnly) cookieStr += `; HttpOnly`;

    const existing = reply.getHeader('Set-Cookie');
    if (!existing) {
      reply.header('Set-Cookie', cookieStr);
    } else if (Array.isArray(existing)) {
      reply.header('Set-Cookie', [...existing, cookieStr]);
    } else {
      reply.header('Set-Cookie', [existing, cookieStr]);
    }
  };

  reply.clearCookie = (name, options = {}) => {
    reply.setCookie(name, '', { ...options, maxAge: 0 });
  };

  done();
});

// Root & Healthcheck
fastify.get('/', async () => {
  return {
    app: config.appName,
    version: config.version,
    status: 'online',
    endpoints: {
      health: '/api/health',
      authRegister: 'POST /api/auth/register',
      authLogin: 'POST /api/auth/login',
      authLogout: 'POST /api/auth/logout',
      authMe: 'GET /api/auth/me',
      usersList: 'GET /api/users?query=...',
      chatsList: 'GET /api/chats',
      chatsDirect: 'POST /api/chats/direct',
      chatsAi: 'POST /api/chats/ai',
      chatMessages: 'GET /api/chats/:id/messages',
      chatPostMessage: 'POST /api/chats/:id/messages',
      chatStream: 'GET /api/chats/:id/stream (SSE)',
      trends: '/api/reels/trends',
      resolve: '/api/reels/resolve?url=...',
      videoProxy: '/api/proxy/video?url=...',
      audioProxy: '/api/proxy/audio?url=...',
      musicSearch: '/api/music/search?q=...',
      youtubeSearch: '/api/youtube/search?q=...&niche=ambient|dreamcore|coldcore',
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
await fastify.register(youtubeRoutes);
await fastify.register(authRoutes);
await fastify.register(usersRoutes);
await fastify.register(chatsRoutes);


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

// Initialize Database & Start Server
try {
  await initDb();
  await fastify.listen({ port: config.port, host: config.host });
  console.log(`\n🚀 Sword AI Fastify Server listening on http://${config.host}:${config.port}`);
  console.log(`📡 Healthcheck: http://${config.host}:${config.port}/api/health\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
