import { getLiveReels } from '../services/reelsLiveScraper.js';
import { resolvePlatformStream } from '../services/platformResolver.js';

export async function reelsRoutes(fastify, options) {
  // GET /api/reels/trends - dynamically parsed live feed with pagination and filters
  fastify.get('/api/reels/trends', async (request, reply) => {
    const {
      platform = 'all',
      continent = 'all',
      country = 'all',
      niche = 'all',
      search = '',
      sortBy = 'rank',
      limit = 20,
      offset = 0,
      refresh = 'false',
    } = request.query;

    try {
      const result = await getLiveReels({
        platform,
        continent,
        country,
        niche,
        search,
        sortBy,
        limit,
        offset,
        forceRefresh: refresh === 'true',
      });

      return result;
    } catch (err) {
      request.log.error({ err: err.message }, 'Failed to fetch live reels');
      return reply.status(500).send({
        error: 'Ошибка получения живого списка рилсов',
        items: [],
        total: 0,
        offset: 0,
        limit: parseInt(limit, 10) || 20,
        hasMore: false,
      });
    }
  });

  // GET /api/reels/resolve - dynamically resolve real platform stream for a TikTok or Instagram link
  fastify.get('/api/reels/resolve', async (request, reply) => {
    const { url, platform } = request.query;

    if (!url) {
      return reply.status(400).send({
        available: false,
        error: 'Missing required query parameter "url"',
      });
    }

    const host = request.headers.host || 'localhost:3001';
    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const serverOrigin = `${protocol}://${host}`;

    const streamInfo = await resolvePlatformStream(platform, url, serverOrigin);
    return streamInfo;
  });

  // GET /api/reels/:id - single reel details from live cache
  fastify.get('/api/reels/:id', async (request, reply) => {
    const { id } = request.params;
    const { items } = await getLiveReels({ limit: 100 });
    const found = items.find((r) => r.id === id);

    if (!found) {
      return reply.status(404).send({ error: 'Reel not found' });
    }

    return found;
  });
}
