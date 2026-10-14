import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackFilePath = path.resolve(__dirname, '../../data/users.json');

let pool = null;
let isPostgresConnected = false;

// In-memory / file fallback store
let fallbackUsers = [];

function loadFallbackData() {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const raw = fs.readFileSync(fallbackFilePath, 'utf-8');
      fallbackUsers = JSON.parse(raw);
    } else {
      fallbackUsers = [];
    }
  } catch (err) {
    console.warn('[DB Fallback] Could not read fallback file, using empty array:', err.message);
    fallbackUsers = [];
  }
}

function saveFallbackData() {
  try {
    const dir = path.dirname(fallbackFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fallbackFilePath, JSON.stringify(fallbackUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Fallback] Failed to save fallback data:', err.message);
  }
}

/**
 * Initialize PostgreSQL connection and run table migrations
 */
export async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && databaseUrl.trim()) {
    try {
      const { default: pg } = await import('pg');
      const { Pool } = pg;

      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('render.com') || process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : undefined,
        connectionTimeoutMillis: 5000,
      });

      // Test query and create schema
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            login VARCHAR(64) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at_formatted VARCHAR(16) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_users_login_lower ON users (LOWER(login));
          CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
        `);
        isPostgresConnected = true;
        console.log('✅ [DB] Connected to PostgreSQL on Render successfully. Schema initialized.');
      } finally {
        client.release();
      }
      return;
    } catch (err) {
      console.warn('⚠️ [DB] Failed to connect to PostgreSQL (' + err.message + '). Switching to local fallback store.');
      isPostgresConnected = false;
    }
  } else {
    console.log('ℹ️ [DB] DATABASE_URL not configured. Operating in local resilient fallback store.');
  }

  loadFallbackData();
}

/**
 * Creates a new user in DB
 */
export async function createUser({ id, login, email, passwordHash, createdAtFormatted }) {
  const normalizedLogin = login.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (isPostgresConnected && pool) {
    // 1. Check uniqueness in PostgreSQL
    const existingCheck = await pool.query(
      `SELECT login, email FROM users WHERE LOWER(login) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1`,
      [normalizedLogin, normalizedEmail]
    );

    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0];
      if (existing.login.toLowerCase() === normalizedLogin.toLowerCase()) {
        const err = new Error('Логин уже занят');
        err.code = 'LOGIN_EXISTS';
        throw err;
      }
      if (existing.email.toLowerCase() === normalizedEmail.toLowerCase()) {
        const err = new Error('Пользователь с таким email уже зарегистрирован');
        err.code = 'EMAIL_EXISTS';
        throw err;
      }
    }

    // 2. Insert into PostgreSQL
    const insertRes = await pool.query(
      `INSERT INTO users (id, login, email, password_hash, created_at_formatted, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, login, email, created_at_formatted, created_at`,
      [id, normalizedLogin, normalizedEmail, passwordHash, createdAtFormatted]
    );

    const user = insertRes.rows[0];
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      created_at_formatted: user.created_at_formatted,
      created_at: user.created_at,
    };
  }

  // Fallback mode
  loadFallbackData();
  const loginMatch = fallbackUsers.find((u) => u.login.toLowerCase() === normalizedLogin.toLowerCase());
  if (loginMatch) {
    const err = new Error('Логин уже занят');
    err.code = 'LOGIN_EXISTS';
    throw err;
  }

  const emailMatch = fallbackUsers.find((u) => u.email.toLowerCase() === normalizedEmail.toLowerCase());
  if (emailMatch) {
    const err = new Error('Пользователь с таким email уже зарегистрирован');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const newUser = {
    id,
    login: normalizedLogin,
    email: normalizedEmail,
    password_hash: passwordHash,
    created_at_formatted: createdAtFormatted,
    created_at: new Date().toISOString(),
  };

  fallbackUsers.push(newUser);
  saveFallbackData();

  return {
    id: newUser.id,
    login: newUser.login,
    email: newUser.email,
    created_at_formatted: newUser.created_at_formatted,
    created_at: newUser.created_at,
  };
}

/**
 * Finds user by login or email (case-insensitive)
 */
export async function findUserByLoginOrEmail(identifier) {
  if (!identifier) return null;
  const query = identifier.trim().toLowerCase();

  if (isPostgresConnected && pool) {
    const res = await pool.query(
      `SELECT * FROM users WHERE LOWER(login) = $1 OR LOWER(email) = $1 LIMIT 1`,
      [query]
    );
    return res.rows[0] || null;
  }

  loadFallbackData();
  return (
    fallbackUsers.find(
      (u) => u.login.toLowerCase() === query || u.email.toLowerCase() === query
    ) || null
  );
}

/**
 * Finds user by unique ID
 */
export async function findUserById(id) {
  if (!id) return null;

  if (isPostgresConnected && pool) {
    const res = await pool.query(
      `SELECT id, login, email, created_at_formatted, created_at FROM users WHERE id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  }

  loadFallbackData();
  const user = fallbackUsers.find((u) => u.id === id);
  if (!user) return null;
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    created_at_formatted: user.created_at_formatted,
    created_at: user.created_at,
  };
}

/**
 * Retrieves list of registered users with optional search by login
 */
export async function getUsersList({ search = '', limit = 100 } = {}) {
  const term = (search || '').trim().toLowerCase();

  if (isPostgresConnected && pool) {
    let queryText = `SELECT id, login, email, created_at_formatted, created_at FROM users`;
    const params = [];

    if (term) {
      queryText += ` WHERE LOWER(login) LIKE $1`;
      params.push(`%${term}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT ${parseInt(limit, 10) || 100}`;

    const res = await pool.query(queryText, params);
    return res.rows;
  }

  loadFallbackData();
  let list = [...fallbackUsers];

  if (term) {
    list = list.filter((u) => u.login.toLowerCase().includes(term));
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return list.slice(0, limit).map((u) => ({
    id: u.id,
    login: u.login,
    email: u.email,
    created_at_formatted: u.created_at_formatted,
    created_at: u.created_at,
  }));
}
