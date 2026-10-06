import { PLATFORM_REELS } from '../services/platformCatalog.js';
import { resolvePlatformStream } from '../services/platformResolver.js';

export async function reelsRoutes(fastify, options) {
  // GET /api/reels/trends - filtered feed with pagination
  fastify.get('/api/reels/trends', async (request, reply) => {
    const {
      platform = 'all',
      continent = 'all',
      country = 'all',
      niche = 'all',
      search = '',
      sortBy = 'rank',
      limit = 10,
      offset = 0,
    } = request.query;

    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

    let filtered = [...PLATFORM_REELS];

    // Filter by platform
    if (platform && platform !== 'all') {
      filtered = filtered.filter((r) => r.platform === platform);
    }

    // Filter by continent
    if (continent && continent !== 'all') {
      filtered = filtered.filter((r) => r.continent === continent);
    }

    // Filter by country
    if (country && country !== 'all') {
      filtered = filtered.filter((r) => r.country === country);
    }

    // Filter by niche
    if (niche && niche !== 'all') {
      filtered = filtered.filter((r) => r.niche === niche);
    }

    // Filter by search query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.authorUsername.toLowerCase().includes(q) ||
        r.hashtags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.metrics.views - a.metrics.views;
        case 'velocity':
          return b.metrics.velocityScore - a.metrics.velocityScore;
        case 'engagement':
          return b.metrics.engagementRate - a.metrics.engagementRate;
        case 'recent':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'rank':
        default:
          return a.trendingRank - b.trendingRank;
      }
    });

    const total = filtered.length;
    const paginatedItems = filtered.slice(parsedOffset, parsedOffset + parsedLimit);
    const hasMore = parsedOffset + parsedLimit < total;

    return {
      items: paginatedItems,
      total,
      offset: parsedOffset,
      limit: parsedLimit,
      hasMore,
    };
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

  // GET /api/reels/:id - single reel details
  fastify.get('/api/reels/:id', async (request, reply) => {
    const { id } = request.params;
    const found = PLATFORM_REELS.find((r) => r.id === id);

    if (!found) {
      return reply.status(404).send({ error: 'Reel not found' });
    }

    return found;
  });
}
