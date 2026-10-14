import { getUsersList, ensureUserExists } from '../db/index.js';
import { extractToken, verifyToken } from '../services/authService.js';

export async function usersRoutes(fastify) {
  /**
   * GET /api/users
   * Returns list of registered users with search by login or email
   */
  fastify.get('/api/users', async (request, reply) => {
    try {
      // 1. If caller is authenticated, ensure their user record is persisted in DB
      const token = extractToken(request);
      if (token) {
        const payload = verifyToken(token);
        if (payload && payload.sub && payload.login) {
          await ensureUserExists({
            id: payload.sub,
            login: payload.login,
            email: payload.email || `${payload.login}@sword.app`,
            createdAtFormatted: '14:10:2026',
          });
        }
      }

      const search = request.query?.query || request.query?.search || request.query?.q || '';
      const limit = parseInt(request.query?.limit, 10) || 100;

      const users = await getUsersList({ search, limit });

      return reply.send({
        users: users.map((u) => ({
          id: u.id,
          login: u.login,
          email: u.email,
          created_at_formatted: u.created_at_formatted,
          created_at: u.created_at,
        })),
        total: users.length,
      });
    } catch (err) {
      fastify.log.error(err, 'Get users error');
      return reply.code(500).send({ error: 'Не удалось получить список пользователей' });
    }
  });
}
