import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getApiBaseUrl } from '@/shared/api/reelsApi';
import { getCookie, getAuthHeaders } from '@/shared/lib/cookie';

export interface ChatRecipient {
  id: string;
  login: string;
  email: string;
}

export interface ChatLastMessage {
  id: string;
  content: string;
  sender_login: string;
  created_at_formatted: string;
  created_at: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'ai';
  title: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  recipient?: ChatRecipient | null;
  last_message?: ChatLastMessage | null;
}

export interface AiMetadata {
  genres?: string[];
  bpm?: string;
  key?: string;
  instruments?: string[];
  fieldRecordings?: string;
  soundDesign?: string;
  sunoPrompt?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_login: string;
  content: string;
  image_url?: string | null;
  ai_metadata?: AiMetadata | null;
  created_at_formatted: string;
  created_at: string;
}

export const useChatStore = defineStore('chat', () => {
  const chats = ref<Chat[]>([]);
  const activeChatId = ref<string | null>(null);
  const messages = ref<Record<string, ChatMessage[]>>({});

  const isLoadingChats = ref(false);
  const isLoadingMessages = ref(false);
  const isSendingMessage = ref(false);
  const activeEventSource = ref<EventSource | null>(null);

  const activeChat = computed(() => {
    if (!activeChatId.value) return null;
    return chats.value.find((c) => c.id === activeChatId.value) || null;
  });

  const activeMessages = computed(() => {
    if (!activeChatId.value) return [];
    return messages.value[activeChatId.value] || [];
  });

  /**
   * Loads all chats of the current user
   */
  async function loadChats() {
    isLoadingChats.value = true;
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/chats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Не удалось загрузить список чатов');
      }

      const data = await res.json();
      chats.value = data.chats || [];
    } catch (err: any) {
      console.error('[ChatStore] Error loading chats:', err);
    } finally {
      isLoadingChats.value = false;
    }
  }

  /**
   * Loads messages for a specific chat
   */
  async function loadMessages(chatId: string) {
    if (!chatId) return;
    isLoadingMessages.value = true;
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/chats/${chatId}/messages`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Не удалось загрузить историю сообщений');
      }

      const data = await res.json();
      const list: ChatMessage[] = (data.messages || []).map((m: any) => ({
        ...m,
        ai_metadata: typeof m.ai_metadata === 'string' ? JSON.parse(m.ai_metadata) : m.ai_metadata,
      }));

      messages.value[chatId] = list;
    } catch (err: any) {
      console.error('[ChatStore] Error loading messages:', err);
    } finally {
      isLoadingMessages.value = false;
    }
  }

  /**
   * Subscribes to real-time Server-Sent Events (SSE) for the active chat
   */
  function subscribeToChatStream(chatId: string) {
    // Unsubscribe from previous stream if open
    if (activeEventSource.value) {
      activeEventSource.value.close();
      activeEventSource.value = null;
    }

    if (!chatId) return;

    try {
      const token = getCookie('sword_jwt_token');
      const apiBase = getApiBaseUrl();
      const streamUrl = new URL(`${apiBase}/api/chats/${chatId}/stream`);
      if (token) {
        streamUrl.searchParams.set('token', token);
      }

      const es = new EventSource(streamUrl.toString(), { withCredentials: true });

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'message' && payload.message) {
            const rawMsg = payload.message;
            const newMsg: ChatMessage = {
              ...rawMsg,
              ai_metadata:
                typeof rawMsg.ai_metadata === 'string'
                  ? JSON.parse(rawMsg.ai_metadata)
                  : rawMsg.ai_metadata,
            };

            const targetChatId = newMsg.chat_id;
            if (!messages.value[targetChatId]) {
              messages.value[targetChatId] = [];
            }

            // Deduplicate by ID
            const exists = messages.value[targetChatId].some((m) => m.id === newMsg.id);
            if (!exists) {
              messages.value[targetChatId].push(newMsg);
            }

            // Update chat's last message and sort chats
            const chatIdx = chats.value.findIndex((c) => c.id === targetChatId);
            if (chatIdx !== -1) {
              const chat = chats.value[chatIdx];
              chat.last_message = {
                id: newMsg.id,
                content: newMsg.content,
                sender_login: newMsg.sender_login,
                created_at_formatted: newMsg.created_at_formatted,
                created_at: newMsg.created_at,
              };
              chat.updated_at = newMsg.created_at;

              // Move updated chat to the top
              chats.value.splice(chatIdx, 1);
              chats.value.unshift(chat);
            }
          }
        } catch (parseErr) {
          console.warn('[ChatStore] SSE parse error:', parseErr);
        }
      };

      es.onerror = () => {
        // EventSource will automatically attempt to reconnect on its own
      };

      activeEventSource.value = es;
    } catch (err) {
      console.error('[ChatStore] Failed to establish SSE stream:', err);
    }
  }

  /**
   * Selects an active chat and connects to its real-time stream
   */
  async function selectChat(chatId: string) {
    if (activeChatId.value === chatId) return;
    activeChatId.value = chatId;
    await loadMessages(chatId);
    subscribeToChatStream(chatId);
  }

  /**
   * Initiates or opens a direct chat with target user
   */
  async function openDirectChat(targetUserId: string): Promise<Chat | null> {
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/chats/direct`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Не удалось открыть диалог');
      }

      const data = await res.json();
      const chat: Chat = data.chat;

      // Update or add in list
      const idx = chats.value.findIndex((c) => c.id === chat.id);
      if (idx !== -1) {
        chats.value[idx] = chat;
      } else {
        chats.value.unshift(chat);
      }

      await selectChat(chat.id);
      return chat;
    } catch (err: any) {
      console.error('[ChatStore] Error opening direct chat:', err);
      throw err;
    }
  }

  /**
   * Creates or retrieves Ambient Music AI chat
   */
  async function openAiChat(): Promise<Chat | null> {
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/chats/ai`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Не удалось открыть чат с ИИ');
      }

      const data = await res.json();
      const chat: Chat = data.chat;

      const idx = chats.value.findIndex((c) => c.id === chat.id);
      if (idx !== -1) {
        chats.value[idx] = chat;
      } else {
        chats.value.unshift(chat);
      }

      await selectChat(chat.id);
      return chat;
    } catch (err: any) {
      console.error('[ChatStore] Error opening AI chat:', err);
      throw err;
    }
  }

  /**
   * Sends a message to the active chat
   */
  async function sendMessage(params: { content: string; imageUrl?: string | null }) {
    if (!activeChatId.value) return;
    const chatId = activeChatId.value;

    isSendingMessage.value = true;
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Не удалось отправить сообщение');
      }

      const data = await res.json();
      if (data.message) {
        const msg = data.message;
        if (!messages.value[chatId]) messages.value[chatId] = [];
        if (!messages.value[chatId].some((m) => m.id === msg.id)) {
          messages.value[chatId].push(msg);
        }
      }

      if (data.aiMessage) {
        const aiMsg = {
          ...data.aiMessage,
          ai_metadata:
            typeof data.aiMessage.ai_metadata === 'string'
              ? JSON.parse(data.aiMessage.ai_metadata)
              : data.aiMessage.ai_metadata,
        };
        if (!messages.value[chatId]) messages.value[chatId] = [];
        if (!messages.value[chatId].some((m) => m.id === aiMsg.id)) {
          messages.value[chatId].push(aiMsg);
        }
      }
    } catch (err: any) {
      console.error('[ChatStore] Error sending message:', err);
      throw err;
    } finally {
      isSendingMessage.value = false;
    }
  }

  function cleanupStream() {
    if (activeEventSource.value) {
      activeEventSource.value.close();
      activeEventSource.value = null;
    }
  }

  return {
    chats,
    activeChatId,
    activeChat,
    activeMessages,
    isLoadingChats,
    isLoadingMessages,
    isSendingMessage,
    loadChats,
    selectChat,
    openDirectChat,
    openAiChat,
    sendMessage,
    cleanupStream,
  };
});
