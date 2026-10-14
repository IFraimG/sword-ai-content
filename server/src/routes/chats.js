import {
  getUserChats,
  getOrCreateDirectChat,
  createOrGetAiChat,
  getChatById,
  getChatMessages,
  createMessage,
  findUserById,
} from '../db/index.js';
import { extractToken, verifyToken, formatTimeHHMM } from '../services/authService.js';
import { generateAmbientMusicRecipe } from '../services/ambientMusicAiService.js';

// Active SSE client streams mapped by chatId
const chatStreams = new Map();

/**
 * Broadcasts a new message payload to all active SSE subscribers of a chat
 */
export function broadcastMessage(chatId, message) {
  const clients = chatStreams.get(chatId);
  if (clients && clients.size > 0) {
    const payload = `data: ${JSON.stringify({ type: 'message', message })}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        clients.delete(client);
      }
    }
  }
}

/**
 * Helper to authenticate user from request
 */
async function authenticate(request, reply) {
  const token = extractToken(request) || request.query?.token;
  if (!token) {
    reply.code(401).send({ error: 'Пользователь не авторизован' });
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    reply.code(401).send({ error: 'Срок действия сессии истек' });
    return null;
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    reply.code(401).send({ error: 'Пользователь не найден' });
    return null;
  }

  return user;
}

export async function chatsRoutes(fastify) {
  /**
   * GET /api/chats
   * Lists all chats belonging to authenticated user
   */
  fastify.get('/api/chats', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    try {
      const chats = await getUserChats(user.id);
      return reply.send({ chats });
    } catch (err) {
      fastify.log.error(err, 'Failed to get user chats');
      return reply.code(500).send({ error: 'Не удалось получить список чатов' });
    }
  });

  /**
   * POST /api/chats/direct
   * Finds or initiates a direct chat with targetUserId
   */
  fastify.post('/api/chats/direct', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { targetUserId } = request.body || {};
    if (!targetUserId) {
      return reply.code(400).send({ error: 'Не указан ID собеседника' });
    }

    try {
      const chat = await getOrCreateDirectChat(user.id, targetUserId);
      return reply.code(201).send({ status: 'success', chat });
    } catch (err) {
      if (err.code === 'INVALID_PARTICIPANT' || err.code === 'USER_NOT_FOUND') {
        return reply.code(400).send({ error: err.message });
      }
      fastify.log.error(err, 'Failed to create direct chat');
      return reply.code(500).send({ error: 'Не удалось создать чат' });
    }
  });

  /**
   * POST /api/chats/ai
   * Creates or retrieves Ambient Music AI assistant chat
   */
  fastify.post('/api/chats/ai', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    try {
      const chat = await createOrGetAiChat(user.id);
      return reply.code(201).send({ status: 'success', chat });
    } catch (err) {
      fastify.log.error(err, 'Failed to create AI chat');
      return reply.code(500).send({ error: 'Не удалось открыть чат с ИИ' });
    }
  });

  /**
   * GET /api/chats/:id
   * Retrieves single chat metadata and participant info
   */
  fastify.get('/api/chats/:id', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { id: chatId } = request.params;
    try {
      const chat = await getChatById(chatId, user.id);
      if (!chat) {
        return reply.code(404).send({ error: 'Чат не найден' });
      }
      return reply.send({ chat });
    } catch (err) {
      fastify.log.error(err, 'Failed to get chat info');
      return reply.code(500).send({ error: 'Ошибка получения чата' });
    }
  });

  /**
   * GET /api/chats/:id/messages
   * Returns message history for a chat
   */
  fastify.get('/api/chats/:id/messages', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { id: chatId } = request.params;
    const limit = parseInt(request.query?.limit, 10) || 100;

    try {
      const chat = await getChatById(chatId, user.id);
      if (!chat) {
        return reply.code(404).send({ error: 'Чат не найден или доступ запрещен' });
      }

      const messages = await getChatMessages(chatId, limit);
      return reply.send({ messages });
    } catch (err) {
      fastify.log.error(err, 'Failed to get chat messages');
      return reply.code(500).send({ error: 'Не удалось загрузить сообщения' });
    }
  });

  /**
   * POST /api/chats/:id/messages
   * Sends a message to a chat, triggers real-time broadcast and AI response if applicable
   */
  fastify.post('/api/chats/:id/messages', async (request, reply) => {
    const user = await authenticate(request, reply);
    if (!user) return;

    const { id: chatId } = request.params;
    const { content, imageUrl } = request.body || {};

    if ((!content || !content.trim()) && !imageUrl) {
      return reply.code(400).send({ error: 'Сообщение не может быть пустым' });
    }

    try {
      const chat = await getChatById(chatId, user.id);
      if (!chat) {
        return reply.code(404).send({ error: 'Чат не найден или доступ запрещен' });
      }

      const now = new Date();
      const message = await createMessage({
        chatId,
        senderId: user.id,
        senderLogin: user.login,
        content: (content || '').trim() || (imageUrl ? 'Прикреплено изображение' : ''),
        imageUrl: imageUrl || null,
        aiMetadata: null,
        createdAtFormatted: formatTimeHHMM(now),
      });

      // Broadcast user's message in real time to all connected clients
      broadcastMessage(chatId, message);

      let aiMessage = null;

      // If chat is with AI, generate structural music recipe
      if (chat.type === 'ai') {
        const recipe = await generateAmbientMusicRecipe({
          text: content || '',
          imageUrl: imageUrl || '',
        });

        const aiTime = new Date();
        aiMessage = await createMessage({
          chatId,
          senderId: 'ai-assistant',
          senderLogin: 'Ambient AI',
          content: 'Готов детальный структурный план ambient-композиции на основе твоего запроса:',
          imageUrl: null,
          aiMetadata: recipe,
          createdAtFormatted: formatTimeHHMM(aiTime),
        });

        // Broadcast AI reply in real time as well
        broadcastMessage(chatId, aiMessage);
      }

      return reply.code(201).send({
        status: 'success',
        message,
        aiMessage,
      });
    } catch (err) {
      fastify.log.error(err, 'Failed to post message');
      return reply.code(500).send({ error: 'Не удалось отправить сообщение' });
    }
  });

  /**
   * GET /api/chats/:id/stream
   * Server-Sent Events (SSE) endpoint for real-time messaging
   */
  fastify.get('/api/chats/:id/stream', async (request, reply) => {
    const token = request.query?.token || extractToken(request);
    if (!token) {
      return reply.code(401).send({ error: 'Не авторизован' });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return reply.code(401).send({ error: 'Неверный токен' });
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      return reply.code(401).send({ error: 'Пользователь не найден' });
    }

    const { id: chatId } = request.params;
    const chat = await getChatById(chatId, user.id);
    if (!chat) {
      return reply.code(404).send({ error: 'Чат не найден' });
    }

    // Set SSE headers directly on raw response
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': request.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'X-Accel-Buffering': 'no',
    });

    reply.sent = true;

    // Send connection handshake
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected', chatId })}\n\n`);

    if (!chatStreams.has(chatId)) {
      chatStreams.set(chatId, new Set());
    }
    const clients = chatStreams.get(chatId);
    clients.add(reply.raw);

    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(': heartbeat\n\n');
      } catch {
        clearInterval(heartbeat);
      }
    }, 20000);

    request.raw.on('close', () => {
      clearInterval(heartbeat);
      clients.delete(reply.raw);
      if (clients.size === 0) {
        chatStreams.delete(chatId);
      }
    });
  });
}
