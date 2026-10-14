import crypto from 'node:crypto';
import {
  createUser,
  findUserByLoginOrEmail,
  findUserById,
  ensureUserExists,
} from '../db/index.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  formatDateDDMMYYYY,
  JWT_COOKIE_NAME,
  JWT_EXPIRES_IN_SECONDS,
} from '../services/authService.js';

export async function authRoutes(fastify) {
  /**
   * Helper to extract token from Cookie or Authorization header
   */
  function extractToken(request) {
    if (request.cookies && request.cookies[JWT_COOKIE_NAME]) {
      return request.cookies[JWT_COOKIE_NAME];
    }
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return null;
  }

  /**
   * POST /api/auth/register
   * Registers a new user with unique email, login and password
   */
  fastify.post('/api/auth/register', async (request, reply) => {
    const { email, login, password } = request.body || {};

    // 1. Mandatory fields validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      return reply.code(400).send({ error: 'Email обязателен для заполнения' });
    }
    if (!login || typeof login !== 'string' || !login.trim()) {
      return reply.code(400).send({ error: 'Логин обязателен для заполнения' });
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      return reply.code(400).send({ error: 'Пароль обязателен для заполнения' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanLogin = login.trim();

    // 2. Format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return reply.code(400).send({ error: 'Некорректный формат email адреса' });
    }

    if (cleanLogin.length < 3 || cleanLogin.length > 32) {
      return reply.code(400).send({ error: 'Логин должен содержать от 3 до 32 символов' });
    }

    if (!/^[a-zA-Z0-9_\-]+$/.test(cleanLogin)) {
      return reply.code(400).send({
        error: 'Логин может содержать только латинские буквы, цифры, символы подчеркивания и дефиса',
      });
    }

    if (password.length < 6) {
      return reply.code(400).send({ error: 'Пароль должен содержать не менее 6 символов' });
    }

    try {
      const id = crypto.randomUUID();
      const createdAtFormatted = formatDateDDMMYYYY(new Date());
      const passwordHash = hashPassword(password);

      const user = await createUser({
        id,
        login: cleanLogin,
        email: cleanEmail,
        passwordHash,
        createdAtFormatted,
      });

      // Generate 7-day JWT
      const token = generateToken(user);

      // Set cookie for 7 days
      reply.setCookie(JWT_COOKIE_NAME, token, {
        path: '/',
        httpOnly: false, // client JS checks cookie for auth status
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: JWT_EXPIRES_IN_SECONDS,
        secure: process.env.NODE_ENV === 'production',
      });

      return reply.code(201).send({
        status: 'success',
        token,
        user: {
          id: user.id,
          login: user.login,
          email: user.email,
          created_at_formatted: user.created_at_formatted,
        },
      });
    } catch (err) {
      if (err.code === 'LOGIN_EXISTS' || err.code === 'EMAIL_EXISTS') {
        return reply.code(409).send({ error: err.message });
      }
      fastify.log.error(err, 'Registration error');
      return reply.code(500).send({ error: 'Внутренняя ошибка при регистрации' });
    }
  });

  /**
   * POST /api/auth/login
   * Authenticates user by login/email and password, issues 7-day JWT in cookie
   */
  fastify.post('/api/auth/login', async (request, reply) => {
    const { loginOrEmail, password } = request.body || {};

    if (!loginOrEmail || typeof loginOrEmail !== 'string' || !loginOrEmail.trim()) {
      return reply.code(400).send({ error: 'Введите логин или email' });
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      return reply.code(400).send({ error: 'Введите пароль' });
    }

    try {
      const user = await findUserByLoginOrEmail(loginOrEmail);
      if (!user) {
        return reply.code(401).send({ error: 'Неверный логин/email или пароль' });
      }

      const isValidPassword = verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return reply.code(401).send({ error: 'Неверный логин/email или пароль' });
      }

      // Generate 7-day JWT
      const token = generateToken(user);

      // Set cookie for 7 days
      reply.setCookie(JWT_COOKIE_NAME, token, {
        path: '/',
        httpOnly: false,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: JWT_EXPIRES_IN_SECONDS,
        secure: process.env.NODE_ENV === 'production',
      });

      return reply.send({
        status: 'success',
        token,
        user: {
          id: user.id,
          login: user.login,
          email: user.email,
          created_at_formatted: user.created_at_formatted,
        },
      });
    } catch (err) {
      fastify.log.error(err, 'Login error');
      return reply.code(500).send({ error: 'Внутренняя ошибка при входе' });
    }
  });

  /**
   * POST /api/auth/logout
   * Clears auth cookie
   */
  fastify.post('/api/auth/logout', async (request, reply) => {
    reply.clearCookie(JWT_COOKIE_NAME, {
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return reply.send({ status: 'success', message: 'Успешный выход из системы' });
  });

  /**
   * GET /api/auth/me
   * Returns authenticated user profile by JWT cookie/header
   */
  fastify.get('/api/auth/me', async (request, reply) => {
    const token = extractToken(request);
    if (!token) {
      return reply.code(401).send({ error: 'Пользователь не авторизован' });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      reply.clearCookie(JWT_COOKIE_NAME, { path: '/' });
      return reply.code(401).send({ error: 'Срок действия сессии истек' });
    }

    try {
      let user = await findUserById(payload.sub);
      if (!user && payload.login) {
        user = await ensureUserExists({
          id: payload.sub,
          login: payload.login,
          email: payload.email || `${payload.login}@sword.app`,
          createdAtFormatted: '14:10:2026',
        });
      }

      if (!user) {
        reply.clearCookie(JWT_COOKIE_NAME, { path: '/' });
        return reply.code(401).send({ error: 'Пользователь не найден' });
      }

      return reply.send({
        user: {
          id: user.id,
          login: user.login,
          email: user.email,
          created_at_formatted: user.created_at_formatted,
        },
      });
    } catch (err) {
      fastify.log.error(err, 'Auth me error');
      return reply.code(500).send({ error: 'Ошибка проверки авторизации' });
    }
  });

}
