import { handleStreamProxy } from '../services/streamProxy.js';

export async function proxyRoutes(fastify, options) {
  // Video proxy stream
  fastify.get('/api/proxy/video', async (request, reply) => {
    return handleStreamProxy(request, reply, 'video');
  });

  // Audio proxy stream
  fastify.get('/api/proxy/audio', async (request, reply) => {
    return handleStreamProxy(request, reply, 'audio');
  });
}
