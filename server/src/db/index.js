import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { formatTimeHHMM, formatDateDDMMYYYY, hashPassword } from '../services/authService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackUsersFilePath = path.resolve(__dirname, '../../data/users.json');
const fallbackChatsFilePath = path.resolve(__dirname, '../../data/chats.json');

let pool = null;
let isPostgresConnected = false;

// In-memory / file fallback store
let fallbackUsers = [];
let fallbackChatsData = {
  chats: [],
  participants: [],
  messages: [],
};

export function isMockUser(u) {
  if (!u) return false;
  const login = (u.login || '').toLowerCase();
  const email = (u.email || '').toLowerCase();
  return (
    login.startsWith('ambient_producer_') ||
    login.startsWith('coldcore_fan_') ||
    login.includes('ambient_producer') ||
    login.includes('coldcore_fan') ||
    email.endsWith('@ambient.fm')
  );
}

function loadFallbackData() {
  try {
    if (fs.existsSync(fallbackUsersFilePath)) {
      const raw = fs.readFileSync(fallbackUsersFilePath, 'utf-8');
      fallbackUsers = JSON.parse(raw);
    } else {
      fallbackUsers = [];
    }
  } catch (err) {
    console.warn('[DB Fallback] Could not read fallback users file:', err.message);
    fallbackUsers = [];
  }
  fallbackUsers = (fallbackUsers || []).filter((u) => !isMockUser(u));

  try {
    if (fs.existsSync(fallbackChatsFilePath)) {
      const raw = fs.readFileSync(fallbackChatsFilePath, 'utf-8');
      fallbackChatsData = JSON.parse(raw);
      if (!Array.isArray(fallbackChatsData.chats)) fallbackChatsData.chats = [];
      if (!Array.isArray(fallbackChatsData.participants)) fallbackChatsData.participants = [];
      if (!Array.isArray(fallbackChatsData.messages)) fallbackChatsData.messages = [];
    } else {
      fallbackChatsData = { chats: [], participants: [], messages: [] };
    }
  } catch (err) {
    console.warn('[DB Fallback] Could not read fallback chats file:', err.message);
    fallbackChatsData = { chats: [], participants: [], messages: [] };
  }

  // Filter out any mock chats/participants/messages
  fallbackChatsData.messages = (fallbackChatsData.messages || []).filter(
    (m) =>
      !m.sender_login?.toLowerCase().includes('ambient_producer') &&
      !m.sender_login?.toLowerCase().includes('coldcore_fan')
  );
  fallbackChatsData.chats = (fallbackChatsData.chats || []).filter(
    (c) =>
      !c.title?.toLowerCase().includes('ambient_producer') &&
      !c.title?.toLowerCase().includes('coldcore_fan')
  );
}

function saveFallbackUsers() {
  try {
    const dir = path.dirname(fallbackUsersFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fallbackUsersFilePath, JSON.stringify(fallbackUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Fallback] Failed to save fallback users data:', err.message);
  }
}

function saveFallbackChats() {
  try {
    const dir = path.dirname(fallbackChatsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fallbackChatsFilePath, JSON.stringify(fallbackChatsData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Fallback] Failed to save fallback chats data:', err.message);
  }
}

let lastConnectionError = null;
let databaseUrlPresent = false;
let databaseUrlPreview = '';

/**
 * Export current database status for diagnostics
 */
export function getDbStatus() {
  return {
    type: isPostgresConnected ? 'postgres' : 'fallback',
    isPostgresConnected,
    databaseUrlPresent,
    databaseUrlPreview,
    lastConnectionError,
    fallbackUsersCount: fallbackUsers.length,
  };
}

/**
 * Adaptively connect to PostgreSQL
 * Attempts Render internal connection (non-SSL) or external connection (SSL)
 */
async function connectToPostgres(databaseUrl) {
  const { default: pg } = await import('pg');
  const { Pool } = pg;

  const isInternalRender = databaseUrl.includes('@dpg-') && !databaseUrl.includes('.render.com');

  const configs = isInternalRender
    ? [
        { ssl: false, name: 'Render internal non-SSL' },
        { ssl: { rejectUnauthorized: false }, name: 'SSL (rejectUnauthorized: false)' },
      ]
    : [
        { ssl: { rejectUnauthorized: false }, name: 'SSL (rejectUnauthorized: false)' },
        { ssl: false, name: 'non-SSL' },
      ];

  let lastErr = null;
  for (const cfg of configs) {
    try {
      console.log(`🔌 [DB] Attempting PostgreSQL connection via ${cfg.name}...`);
      const testPool = new Pool({
        connectionString: databaseUrl,
        ssl: cfg.ssl,
        connectionTimeoutMillis: 7000,
      });

      const client = await testPool.connect();
      client.release();
      console.log(`✅ [DB] Successfully connected to PostgreSQL via ${cfg.name}`);
      return testPool;
    } catch (err) {
      console.warn(`⚠️ [DB] Connection attempt via ${cfg.name} failed: ${err.message}`);
      lastErr = err;
    }
  }

  throw lastErr || new Error('Failed to connect to PostgreSQL with all available SSL modes');
}

/**
 * Initialize PostgreSQL connection and run table migrations
 */
export async function initDb() {
  loadFallbackData();

  const databaseUrl = process.env.DATABASE_URL;
  databaseUrlPresent = !!(databaseUrl && databaseUrl.trim());
  if (databaseUrlPresent) {
    const raw = databaseUrl.trim();
    databaseUrlPreview = raw.replace(/:([^:@]+)@/, ':***@');
  }

  if (databaseUrl && databaseUrl.trim()) {
    try {
      pool = await connectToPostgres(databaseUrl.trim());

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

          CREATE TABLE IF NOT EXISTS chats (
            id VARCHAR(64) PRIMARY KEY,
            type VARCHAR(16) NOT NULL DEFAULT 'direct',
            title VARCHAR(255),
            created_by VARCHAR(64) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats (updated_at DESC);

          CREATE TABLE IF NOT EXISTS chat_participants (
            id VARCHAR(64) PRIMARY KEY,
            chat_id VARCHAR(64) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
            user_id VARCHAR(64) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(chat_id, user_id)
          );
          CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
          CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants(chat_id);

          CREATE TABLE IF NOT EXISTS messages (
            id VARCHAR(64) PRIMARY KEY,
            chat_id VARCHAR(64) NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
            sender_id VARCHAR(64) NOT NULL,
            sender_login VARCHAR(64) NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            ai_metadata JSONB,
            created_at_formatted VARCHAR(16) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
        `);
        isPostgresConnected = true;
        console.log('✅ [DB] Connected to PostgreSQL on Render successfully. Schema initialized.');

        // 1. Purge artificial mock accounts from PostgreSQL
        try {
          await client.query(`
            DELETE FROM messages 
            WHERE sender_login LIKE 'ambient_producer_%' 
               OR sender_login LIKE 'coldcore_fan_%' 
               OR sender_login LIKE '%ambient_producer%' 
               OR sender_login LIKE '%coldcore_fan%';

            DELETE FROM chat_participants 
            WHERE user_id IN (
              SELECT id FROM users 
              WHERE login LIKE 'ambient_producer_%' 
                 OR login LIKE 'coldcore_fan_%' 
                 OR email LIKE '%@ambient.fm'
            );

            DELETE FROM chats 
            WHERE created_by IN (
              SELECT id FROM users 
              WHERE login LIKE 'ambient_producer_%' 
                 OR login LIKE 'coldcore_fan_%' 
                 OR email LIKE '%@ambient.fm'
            );

            DELETE FROM chats 
            WHERE type = 'direct' 
              AND id NOT IN (SELECT chat_id FROM chat_participants GROUP BY chat_id HAVING count(*) >= 2);

            DELETE FROM users 
            WHERE login LIKE 'ambient_producer_%' 
               OR login LIKE 'coldcore_fan_%' 
               OR email LIKE '%@ambient.fm';
          `);
          console.log('🧹 [DB] Purged artificial mock accounts from PostgreSQL.');
        } catch (cleanupErr) {
          console.warn('⚠️ [DB] Mock cleanup note:', cleanupErr.message);
        }

        // 2. Seed / sync fallback users into PostgreSQL so none are lost (excluding mock users)
        if (fallbackUsers.length > 0) {
          for (const u of fallbackUsers) {
            if (isMockUser(u)) continue;
            try {
              await client.query(
                `INSERT INTO users (id, login, email, password_hash, created_at_formatted, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO NOTHING`,
                [
                  u.id,
                  u.login,
                  u.email,
                  u.password_hash || hashPassword('sword_persistent_fallback_seed'),
                  u.created_at_formatted || '14:10:2026',
                  u.created_at ? new Date(u.created_at) : new Date(),
                ]
              );
            } catch (syncErr) {
              // Ignore single user conflict
            }
          }
        }

        // 3. Back-sync all PostgreSQL users to local cache (excluding mock users)
        const allDbUsers = await client.query('SELECT id, login, email, created_at_formatted, created_at FROM users');
        if (allDbUsers.rows.length > 0) {
          for (const row of allDbUsers.rows) {
            if (isMockUser(row)) continue;
            if (!fallbackUsers.some((fu) => fu.id === row.id)) {
              fallbackUsers.push(row);
            }
          }
          saveFallbackUsers();
        }
      } finally {
        client.release();
      }
      return;
    } catch (err) {
      lastConnectionError = err.message;
      console.warn('⚠️ [DB] Failed to connect to PostgreSQL (' + err.message + '). Switching to local fallback store.');
      isPostgresConnected = false;
    }
  } else {
    lastConnectionError = 'DATABASE_URL environment variable is not defined or empty';
    console.log('ℹ️ [DB] DATABASE_URL not configured. Operating in local resilient fallback store.');
  }
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
  saveFallbackUsers();

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
 * Ensures user is persisted in DB (PostgreSQL + fallback)
 * Safe and idempotent: never overwrites or deletes existing data
 */
export async function ensureUserExists({ id, login, email, createdAtFormatted }) {
  const normalizedLogin = (login || '').trim();
  const normalizedEmail = (email || `${normalizedLogin}@sword.app`).trim().toLowerCase();
  const formattedDate = createdAtFormatted || formatDateDDMMYYYY(new Date());

  if (isPostgresConnected && pool) {
    try {
      // 1. Check if user already exists by ID, login, or email
      const checkRes = await pool.query(
        `SELECT id, login, email, created_at_formatted, created_at FROM users
         WHERE id = $1 OR LOWER(login) = LOWER($2) OR LOWER(email) = LOWER($3)
         LIMIT 1`,
        [id, normalizedLogin, normalizedEmail]
      );

      if (checkRes.rows.length > 0) {
        const u = checkRes.rows[0];
        if (!fallbackUsers.some((fu) => fu.id === u.id)) {
          fallbackUsers.push(u);
          saveFallbackUsers();
        }
        return u;
      }

      // 2. Safe insert if not present
      const dummyHash = hashPassword(crypto.randomUUID());
      const insertRes = await pool.query(
        `INSERT INTO users (id, login, email, password_hash, created_at_formatted, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (id) DO NOTHING
         RETURNING id, login, email, created_at_formatted, created_at`,
        [id, normalizedLogin, normalizedEmail, dummyHash, formattedDate]
      );

      if (insertRes.rows.length > 0) {
        const inserted = insertRes.rows[0];
        if (!fallbackUsers.some((fu) => fu.id === inserted.id)) {
          fallbackUsers.push(inserted);
          saveFallbackUsers();
        }
        return inserted;
      }

      // 3. Fallback select in case of conflict on login/email
      const recheck = await pool.query(
        `SELECT id, login, email, created_at_formatted, created_at FROM users
         WHERE id = $1 OR LOWER(login) = LOWER($2) LIMIT 1`,
        [id, normalizedLogin]
      );
      if (recheck.rows.length > 0) {
        return recheck.rows[0];
      }
    } catch (err) {
      console.warn('[DB] ensureUserExists postgres exception:', err.message);
    }
  }

  // Fallback store
  loadFallbackData();
  let found = fallbackUsers.find(
    (u) => u.id === id || u.login.toLowerCase() === normalizedLogin.toLowerCase() || u.email.toLowerCase() === normalizedEmail.toLowerCase()
  );

  if (!found) {
    found = {
      id,
      login: normalizedLogin,
      email: normalizedEmail,
      password_hash: hashPassword(crypto.randomUUID()),
      created_at_formatted: formattedDate,
      created_at: new Date().toISOString(),
    };
    fallbackUsers.push(found);
    saveFallbackUsers();
  }

  return {
    id: found.id,
    login: found.login,
    email: found.email,
    created_at_formatted: found.created_at_formatted,
    created_at: found.created_at,
  };
}

/**
 * Retrieves list of registered users with optional search by login or email
 */
export async function getUsersList({ search = '', limit = 100 } = {}) {
  const term = (search || '').trim().toLowerCase();

  if (isPostgresConnected && pool) {
    let queryText = `SELECT id, login, email, created_at_formatted, created_at FROM users
      WHERE login NOT LIKE 'ambient_producer_%'
        AND login NOT LIKE 'coldcore_fan_%'
        AND login NOT LIKE '%ambient_producer%'
        AND login NOT LIKE '%coldcore_fan%'
        AND email NOT LIKE '%@ambient.fm'`;
    const params = [];

    if (term) {
      queryText += ` AND (LOWER(login) LIKE $1 OR LOWER(email) LIKE $1)`;
      params.push(`%${term}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT ${parseInt(limit, 10) || 100}`;

    const res = await pool.query(queryText, params);
    return res.rows;
  }

  loadFallbackData();
  let list = fallbackUsers.filter((u) => !isMockUser(u));

  if (term) {
    list = list.filter((u) => u.login.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
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

/**
 * Retrieves all chats for a given user (with last message and recipient details)
 */
export async function getUserChats(userId) {
  if (isPostgresConnected && pool) {
    const query = `
      SELECT 
        c.id,
        c.type,
        c.title,
        c.created_by,
        c.created_at,
        c.updated_at,
        other_u.id as recipient_id,
        other_u.login as recipient_login,
        other_u.email as recipient_email,
        m.id as last_message_id,
        m.content as last_message_content,
        m.sender_login as last_message_sender,
        m.created_at_formatted as last_message_time,
        m.created_at as last_message_created_at
      FROM chats c
      JOIN chat_participants cp ON cp.chat_id = c.id AND cp.user_id = $1
      LEFT JOIN chat_participants other_cp ON other_cp.chat_id = c.id AND other_cp.user_id != $1
      LEFT JOIN users other_u ON other_u.id = other_cp.user_id
      LEFT JOIN LATERAL (
        SELECT id, content, sender_login, created_at_formatted, created_at
        FROM messages
        WHERE messages.chat_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE (c.type = 'ai' OR (other_u.id IS NOT NULL AND other_u.login NOT LIKE 'ambient_producer_%' AND other_u.login NOT LIKE 'coldcore_fan_%' AND other_u.email NOT LIKE '%@ambient.fm'))
      ORDER BY c.updated_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.type === 'ai' ? (r.title || 'Ambient Music AI') : (r.recipient_login ? `@${r.recipient_login}` : r.title || 'Личный чат'),
      created_by: r.created_by,
      created_at: r.created_at,
      updated_at: r.updated_at,
      recipient: r.type === 'ai'
        ? { id: 'ai-assistant', login: 'Ambient AI', email: 'ai@sword.ambient' }
        : (r.recipient_id ? { id: r.recipient_id, login: r.recipient_login, email: r.recipient_email } : null),
      last_message: r.last_message_id ? {
        id: r.last_message_id,
        content: r.last_message_content,
        sender_login: r.last_message_sender,
        created_at_formatted: r.last_message_time,
        created_at: r.last_message_created_at,
      } : null,
    }));
  }

  // Fallback mode
  loadFallbackData();
  const userChatIds = fallbackChatsData.participants
    .filter((p) => p.user_id === userId)
    .map((p) => p.chat_id);

  const chats = fallbackChatsData.chats.filter((c) => {
    if (!userChatIds.includes(c.id)) return false;
    if (c.type === 'ai') return true;
    const otherPart = fallbackChatsData.participants.find((p) => p.chat_id === c.id && p.user_id !== userId);
    if (!otherPart) return false;
    const u = fallbackUsers.find((user) => user.id === otherPart.user_id);
    return u && !isMockUser(u);
  });
  chats.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

  return chats.map((c) => {
    let recipient = null;
    let title = c.title || 'Чат';

    if (c.type === 'ai') {
      recipient = { id: 'ai-assistant', login: 'Ambient AI', email: 'ai@sword.ambient' };
      title = c.title || 'Ambient Music AI';
    } else {
      const otherPart = fallbackChatsData.participants.find((p) => p.chat_id === c.id && p.user_id !== userId);
      if (otherPart) {
        const u = fallbackUsers.find((user) => user.id === otherPart.user_id);
        if (u) {
          recipient = { id: u.id, login: u.login, email: u.email };
          title = `@${u.login}`;
        }
      }
    }

    const chatMsgs = fallbackChatsData.messages
      .filter((m) => m.chat_id === c.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const lastMsg = chatMsgs[0] || null;

    return {
      id: c.id,
      type: c.type,
      title,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      recipient,
      last_message: lastMsg ? {
        id: lastMsg.id,
        content: lastMsg.content,
        sender_login: lastMsg.sender_login,
        created_at_formatted: lastMsg.created_at_formatted,
        created_at: lastMsg.created_at,
      } : null,
    };
  });
}

/**
 * Finds or creates a direct chat between two users
 */
export async function getOrCreateDirectChat(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    const err = new Error('Нельзя создать чат с самим собой');
    err.code = 'INVALID_PARTICIPANT';
    throw err;
  }

  const targetUser = await findUserById(targetUserId);
  if (!targetUser) {
    const err = new Error('Пользователь не найден');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  if (isPostgresConnected && pool) {
    const existingRes = await pool.query(`
      SELECT c.id, c.type, c.title, c.created_by, c.created_at, c.updated_at
      FROM chats c
      JOIN chat_participants p1 ON p1.chat_id = c.id AND p1.user_id = $1
      JOIN chat_participants p2 ON p2.chat_id = c.id AND p2.user_id = $2
      WHERE c.type = 'direct'
      LIMIT 1
    `, [currentUserId, targetUserId]);

    if (existingRes.rows.length > 0) {
      const c = existingRes.rows[0];
      return {
        id: c.id,
        type: c.type,
        title: `@${targetUser.login}`,
        created_by: c.created_by,
        created_at: c.created_at,
        updated_at: c.updated_at,
        recipient: {
          id: targetUser.id,
          login: targetUser.login,
          email: targetUser.email,
        },
      };
    }

    const chatId = crypto.randomUUID();
    const now = new Date();

    await pool.query(`
      INSERT INTO chats (id, type, title, created_by, created_at, updated_at)
      VALUES ($1, 'direct', $2, $3, $4, $4)
    `, [chatId, `@${targetUser.login}`, currentUserId, now]);

    await pool.query(`
      INSERT INTO chat_participants (id, chat_id, user_id, created_at)
      VALUES 
        ($1, $2, $3, $4),
        ($5, $2, $6, $4)
    `, [
      crypto.randomUUID(), chatId, currentUserId, now,
      crypto.randomUUID(), chatId, targetUserId, now,
    ]);

    return {
      id: chatId,
      type: 'direct',
      title: `@${targetUser.login}`,
      created_by: currentUserId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      recipient: {
        id: targetUser.id,
        login: targetUser.login,
        email: targetUser.email,
      },
    };
  }

  // Fallback mode
  loadFallbackData();
  const existingChatId = fallbackChatsData.chats.find((c) => {
    if (c.type !== 'direct') return false;
    const parts = fallbackChatsData.participants
      .filter((p) => p.chat_id === c.id)
      .map((p) => p.user_id);
    return parts.includes(currentUserId) && parts.includes(targetUserId);
  })?.id;

  if (existingChatId) {
    const c = fallbackChatsData.chats.find((item) => item.id === existingChatId);
    return {
      id: c.id,
      type: c.type,
      title: `@${targetUser.login}`,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      recipient: {
        id: targetUser.id,
        login: targetUser.login,
        email: targetUser.email,
      },
    };
  }

  const chatId = crypto.randomUUID();
  const now = new Date().toISOString();
  const newChat = {
    id: chatId,
    type: 'direct',
    title: `@${targetUser.login}`,
    created_by: currentUserId,
    created_at: now,
    updated_at: now,
  };

  fallbackChatsData.chats.push(newChat);
  fallbackChatsData.participants.push(
    { id: crypto.randomUUID(), chat_id: chatId, user_id: currentUserId, created_at: now },
    { id: crypto.randomUUID(), chat_id: chatId, user_id: targetUserId, created_at: now }
  );
  saveFallbackChats();

  return {
    ...newChat,
    recipient: {
      id: targetUser.id,
      login: targetUser.login,
      email: targetUser.email,
    },
  };
}

/**
 * Creates or retrieves the AI assistant chat for a user
 */
export async function createOrGetAiChat(userId) {
  if (isPostgresConnected && pool) {
    const existing = await pool.query(`
      SELECT c.id, c.type, c.title, c.created_by, c.created_at, c.updated_at
      FROM chats c
      WHERE c.created_by = $1 AND c.type = 'ai'
      ORDER BY c.created_at DESC
      LIMIT 1
    `, [userId]);

    if (existing.rows.length > 0) {
      const c = existing.rows[0];
      return {
        id: c.id,
        type: 'ai',
        title: c.title || 'Ambient Music AI',
        created_by: c.created_by,
        created_at: c.created_at,
        updated_at: c.updated_at,
        recipient: {
          id: 'ai-assistant',
          login: 'Ambient AI',
          email: 'ai@sword.ambient',
        },
      };
    }

    const chatId = crypto.randomUUID();
    const now = new Date();

    await pool.query(`
      INSERT INTO chats (id, type, title, created_by, created_at, updated_at)
      VALUES ($1, 'ai', 'Ambient Music AI', $2, $3, $3)
    `, [chatId, userId, now]);

    await pool.query(`
      INSERT INTO chat_participants (id, chat_id, user_id, created_at)
      VALUES ($1, $2, $3, $4)
    `, [crypto.randomUUID(), chatId, userId, now]);

    // Initial greeting from AI
    const welcomeMsgId = crypto.randomUUID();
    const welcomeTime = formatTimeHHMM(now);
    const welcomeMetadata = {
      genres: ['Dark Ambient', 'Drone', 'Dreamcore', 'Liminal Space'],
      bpm: '48-56 BPM / Unquantized',
      key: 'D minor (Ре минор)',
      instruments: [
        'Analog Drift Pad (Roland Juno-106)',
        'Granular Synth Texture',
        'Sub-bass Drone 40Hz',
        'Tape Loop Hiss & Vinyl Crackle',
      ],
      soundDesign: 'Длинный реверб (Decay > 8s), lowpass фильтрация на 3.5 kHz, стерео-дилэй с модуляцией высоты тона',
      sunoPrompt: 'dark ambient, ethereal drone pads, deep sub bass, tape flutter, atmospheric, dreamy, haunting, cinematic soundscape, melancholic, 50 bpm',
      summary: 'Готов к генерации атмосферного звукового ландшафта. Отправь референсный текст или прикрепи изображение (арт/пейзаж/кадр) для анализа.',
    };

    await pool.query(`
      INSERT INTO messages (id, chat_id, sender_id, sender_login, content, image_url, ai_metadata, created_at_formatted, created_at)
      VALUES ($1, $2, 'ai-assistant', 'Ambient AI', $3, NULL, $4, $5, $6)
    `, [
      welcomeMsgId,
      chatId,
      'Привет! Я твой персональный Ambient AI музыкальный продюсер. Напиши мне текстовое описание настроения или прикрепи изображение (арт, обложку, пейзаж, кадр из видео), и я создам детальный структурный план трека: подходящие ambient-жанры, темп (BPM), тональность, инструменты, саунд-дизайн и готовый промпт для Suno/Udio.',
      JSON.stringify(welcomeMetadata),
      welcomeTime,
      now,
    ]);

    return {
      id: chatId,
      type: 'ai',
      title: 'Ambient Music AI',
      created_by: userId,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      recipient: {
        id: 'ai-assistant',
        login: 'Ambient AI',
        email: 'ai@sword.ambient',
      },
    };
  }

  // Fallback mode
  loadFallbackData();
  const existingChat = fallbackChatsData.chats.find(
    (c) => c.created_by === userId && c.type === 'ai'
  );

  if (existingChat) {
    return {
      id: existingChat.id,
      type: 'ai',
      title: existingChat.title || 'Ambient Music AI',
      created_by: existingChat.created_by,
      created_at: existingChat.created_at,
      updated_at: existingChat.updated_at,
      recipient: {
        id: 'ai-assistant',
        login: 'Ambient AI',
        email: 'ai@sword.ambient',
      },
    };
  }

  const chatId = crypto.randomUUID();
  const now = new Date();
  const newChat = {
    id: chatId,
    type: 'ai',
    title: 'Ambient Music AI',
    created_by: userId,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  fallbackChatsData.chats.push(newChat);
  fallbackChatsData.participants.push({
    id: crypto.randomUUID(),
    chat_id: chatId,
    user_id: userId,
    created_at: now.toISOString(),
  });

  const welcomeMsg = {
    id: crypto.randomUUID(),
    chat_id: chatId,
    sender_id: 'ai-assistant',
    sender_login: 'Ambient AI',
    content: 'Привет! Я твой персональный Ambient AI музыкальный продюсер. Напиши мне текстовое описание настроения или прикрепи изображение (арт, обложку, пейзаж, кадр из видео), и я создам детальный структурный план трека: подходящие ambient-жанры, темп (BPM), тональность, инструменты, саунд-дизайн и готовый промпт для Suno/Udio.',
    image_url: null,
    ai_metadata: {
      genres: ['Dark Ambient', 'Drone', 'Dreamcore', 'Liminal Space'],
      bpm: '48-56 BPM / Unquantized',
      key: 'D minor (Ре минор)',
      instruments: [
        'Analog Drift Pad (Roland Juno-106)',
        'Granular Synth Texture',
        'Sub-bass Drone 40Hz',
        'Tape Loop Hiss & Vinyl Crackle',
      ],
      soundDesign: 'Длинный реверб (Decay > 8s), lowpass фильтрация на 3.5 kHz, стерео-дилэй с модуляцией высоты тона',
      sunoPrompt: 'dark ambient, ethereal drone pads, deep sub bass, tape flutter, atmospheric, dreamy, haunting, cinematic soundscape, melancholic, 50 bpm',
      summary: 'Готов к генерации атмосферного звукового ландшафта. Отправь референсный текст или прикрепи изображение (арт/пейзаж/кадр) для анализа.',
    },
    created_at_formatted: formatTimeHHMM(now),
    created_at: now.toISOString(),
  };

  fallbackChatsData.messages.push(welcomeMsg);
  saveFallbackChats();

  return {
    ...newChat,
    recipient: {
      id: 'ai-assistant',
      login: 'Ambient AI',
      email: 'ai@sword.ambient',
    },
  };
}

/**
 * Gets a chat by ID ensuring the user is a participant
 */
export async function getChatById(chatId, userId) {
  if (isPostgresConnected && pool) {
    const res = await pool.query(`
      SELECT 
        c.id,
        c.type,
        c.title,
        c.created_by,
        c.created_at,
        c.updated_at,
        other_u.id as recipient_id,
        other_u.login as recipient_login,
        other_u.email as recipient_email
      FROM chats c
      JOIN chat_participants cp ON cp.chat_id = c.id AND cp.user_id = $1
      LEFT JOIN chat_participants other_cp ON other_cp.chat_id = c.id AND other_cp.user_id != $1
      LEFT JOIN users other_u ON other_u.id = other_cp.user_id
      WHERE c.id = $2
      LIMIT 1
    `, [userId, chatId]);

    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      id: r.id,
      type: r.type,
      title: r.type === 'ai' ? (r.title || 'Ambient Music AI') : (r.recipient_login ? `@${r.recipient_login}` : r.title || 'Чат'),
      created_by: r.created_by,
      created_at: r.created_at,
      updated_at: r.updated_at,
      recipient: r.type === 'ai'
        ? { id: 'ai-assistant', login: 'Ambient AI', email: 'ai@sword.ambient' }
        : (r.recipient_id ? { id: r.recipient_id, login: r.recipient_login, email: r.recipient_email } : null),
    };
  }

  // Fallback mode
  loadFallbackData();
  const isPart = fallbackChatsData.participants.some(
    (p) => p.chat_id === chatId && p.user_id === userId
  );
  if (!isPart) return null;

  const chat = fallbackChatsData.chats.find((c) => c.id === chatId);
  if (!chat) return null;

  let recipient = null;
  let title = chat.title || 'Чат';

  if (chat.type === 'ai') {
    recipient = { id: 'ai-assistant', login: 'Ambient AI', email: 'ai@sword.ambient' };
    title = chat.title || 'Ambient Music AI';
  } else {
    const otherPart = fallbackChatsData.participants.find(
      (p) => p.chat_id === chatId && p.user_id !== userId
    );
    if (otherPart) {
      const u = fallbackUsers.find((user) => user.id === otherPart.user_id);
      if (u) {
        recipient = { id: u.id, login: u.login, email: u.email };
        title = `@${u.login}`;
      }
    }
  }

  return {
    id: chat.id,
    type: chat.type,
    title,
    created_by: chat.created_by,
    created_at: chat.created_at,
    updated_at: chat.updated_at,
    recipient,
  };
}

/**
 * Gets messages for a chat in chronological order
 */
export async function getChatMessages(chatId, limit = 100) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 300);

  if (isPostgresConnected && pool) {
    const res = await pool.query(`
      SELECT id, chat_id, sender_id, sender_login, content, image_url, ai_metadata, created_at_formatted, created_at
      FROM messages
      WHERE chat_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `, [chatId, safeLimit]);
    return res.rows;
  }

  // Fallback mode
  loadFallbackData();
  const msgs = fallbackChatsData.messages
    .filter((m) => m.chat_id === chatId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-safeLimit);

  return msgs;
}

/**
 * Creates a new message in a chat and updates chat timestamp
 */
export async function createMessage({
  chatId,
  senderId,
  senderLogin,
  content,
  imageUrl = null,
  aiMetadata = null,
  createdAtFormatted,
}) {
  const id = crypto.randomUUID();
  const now = new Date();
  const timeFormatted = createdAtFormatted || formatTimeHHMM(now);

  if (isPostgresConnected && pool) {
    const res = await pool.query(`
      INSERT INTO messages (id, chat_id, sender_id, sender_login, content, image_url, ai_metadata, created_at_formatted, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, chat_id, sender_id, sender_login, content, image_url, ai_metadata, created_at_formatted, created_at
    `, [
      id,
      chatId,
      senderId,
      senderLogin,
      content,
      imageUrl,
      aiMetadata ? JSON.stringify(aiMetadata) : null,
      timeFormatted,
      now,
    ]);

    await pool.query(`
      UPDATE chats SET updated_at = $1 WHERE id = $2
    `, [now, chatId]);

    return res.rows[0];
  }

  // Fallback mode
  loadFallbackData();
  const newMsg = {
    id,
    chat_id: chatId,
    sender_id: senderId,
    sender_login: senderLogin,
    content,
    image_url: imageUrl,
    ai_metadata: aiMetadata,
    created_at_formatted: timeFormatted,
    created_at: now.toISOString(),
  };

  fallbackChatsData.messages.push(newMsg);

  const chat = fallbackChatsData.chats.find((c) => c.id === chatId);
  if (chat) {
    chat.updated_at = now.toISOString();
  }

  saveFallbackChats();
  return newMsg;
}

