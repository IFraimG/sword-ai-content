<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useChatStore, type Chat, type ChatMessage } from '@/entities/chat/model/chatStore';
import {
  MessageSquare,
  Sparkles,
  Send,
  Paperclip,
  Image as ImageIcon,
  Copy,
  Check,
  ArrowLeft,
  Search,
  Music,
  Disc,
  SlidersHorizontal,
  Bot,
  User,
  X,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-vue-next';
import { toast } from '@/shared/lib/toast/toastService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const searchQuery = ref('');
const messageInput = ref('');
const attachedImageBase64 = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const messagesContainerRef = ref<HTMLElement | null>(null);
const copiedPromptId = ref<string | null>(null);
const isMobileChatOpen = ref(false);

// Filtered chat list by search query
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chatStore.chats;
  const q = searchQuery.value.trim().toLowerCase();
  return chatStore.chats.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      (c.recipient?.login && c.recipient.login.toLowerCase().includes(q)) ||
      (c.last_message?.content && c.last_message.content.toLowerCase().includes(q))
  );
});

// Auto-scroll messages to bottom
function scrollToBottom(smooth = true) {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTo({
        top: messagesContainerRef.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  });
}

// Watch messages count change to auto scroll
watch(
  () => chatStore.activeMessages.length,
  () => {
    scrollToBottom(true);
  }
);

// Watch route query ?id= to open specific chat
watch(
  () => route.query.id,
  async (newId) => {
    if (newId && typeof newId === 'string' && newId !== chatStore.activeChatId) {
      await chatStore.selectChat(newId);
      isMobileChatOpen.value = true;
      scrollToBottom(false);
    }
  },
  { immediate: true }
);

async function selectChat(chat: Chat) {
  router.replace({ query: { ...route.query, id: chat.id } });
  await chatStore.selectChat(chat.id);
  isMobileChatOpen.value = true;
  scrollToBottom(false);
}

async function handleCreateAiChat() {
  try {
    const aiChat = await chatStore.openAiChat();
    if (aiChat) {
      router.replace({ query: { ...route.query, id: aiChat.id } });
      isMobileChatOpen.value = true;
      scrollToBottom(false);
    }
  } catch (err) {
    console.error('Failed to open AI chat:', err);
  }
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

function handleImageUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    alert('Изображение слишком большое (максимум 5MB)');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    attachedImageBase64.value = reader.result as string;
    // reset input
    target.value = '';
  };
  reader.readAsDataURL(file);
}

function removeAttachedImage() {
  attachedImageBase64.value = null;
}

async function handleSendMessage() {
  const content = messageInput.value.trim();
  const image = attachedImageBase64.value;

  if (!content && !image) return;
  if (chatStore.isSendingMessage) return;

  messageInput.value = '';
  attachedImageBase64.value = null;

  try {
    await chatStore.sendMessage({
      content,
      imageUrl: image,
    });
    scrollToBottom(true);
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
}

async function copySunoPrompt(prompt: string, messageId: string) {
  try {
    await navigator.clipboard.writeText(prompt);
    copiedPromptId.value = messageId;
    toast.success('Промпт для Suno / Udio скопирован в буфер обмена!');
    setTimeout(() => {
      if (copiedPromptId.value === messageId) {
        copiedPromptId.value = null;
      }
    }, 2500);
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    toast.error('Не удалось скопировать в буфер обмена');
  }
}

function getAvatarGradient(login: string) {
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
    'from-violet-500 to-purple-600',
  ];
  let hash = 0;
  for (let i = 0; i < login.length; i++) {
    hash = login.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

onMounted(async () => {
  await chatStore.loadChats();
  if (route.query.id && typeof route.query.id === 'string') {
    await chatStore.selectChat(route.query.id);
    isMobileChatOpen.value = true;
    scrollToBottom(false);
  } else if (chatStore.chats.length > 0 && window.innerWidth >= 768) {
    // Select first chat on desktop if none selected
    selectChat(chatStore.chats[0]);
  }
});

onUnmounted(() => {
  chatStore.cleanupStream();
});
</script>

<template>
  <div class="h-[calc(100vh-2rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col">
    <!-- Messenger Layout Container -->
    <div class="flex-1 bg-sword-surface/80 border border-sword-border rounded-3xl overflow-hidden shadow-2xl flex relative">
      
      <!-- ================= LEFT COLUMN: CHATS LIST ================= -->
      <div
        :class="[
          'w-full md:w-80 lg:w-96 flex flex-col border-r border-sword-border/80 bg-sword-bg/50 shrink-0 transition-all duration-300',
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        ]"
      >
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-sword-border/60 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-sword-surface border border-sword-border flex items-center justify-center text-sword-accent">
                <MessageSquare class="w-4 h-4 text-sword-accent" />
              </div>
              <h2 class="text-base font-extrabold text-white">Сообщения</h2>
            </div>
            <span class="text-xs font-mono font-bold text-sword-muted px-2 py-0.5 rounded-full bg-sword-card border border-sword-border">
              {{ chatStore.chats.length }}
            </span>
          </div>

          <!-- DEDICATED AI CHAT BUTTON -->
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-black tracking-wide text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 shadow-lg shadow-purple-900/30 hover:shadow-cyan-500/20 active:scale-[0.99] transition-all cursor-pointer border border-white/20"
            @click="handleCreateAiChat"
          >
            <Sparkles class="w-4 h-4 animate-spin text-amber-200" style="animation-duration: 4s;" />
            <span>Создать чат с ИИ</span>
          </button>

          <!-- Search Chats Input -->
          <div class="relative w-full">
            <Search class="w-3.5 h-3.5 text-sword-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по диалогам..."
              class="w-full pl-9 pr-4 py-2 bg-sword-surface/60 border border-sword-border/60 rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent"
            />
          </div>
        </div>

        <!-- Chat List Items -->
        <div class="flex-1 overflow-y-auto divide-y divide-sword-border/40 scrollbar-thin">
          <div
            v-if="chatStore.isLoadingChats && chatStore.chats.length === 0"
            class="p-6 text-center text-xs text-sword-muted flex items-center justify-center gap-2"
          >
            <RefreshCw class="w-4 h-4 animate-spin text-sword-accent" />
            <span>Загрузка диалогов...</span>
          </div>

          <div
            v-else-if="filteredChats.length === 0"
            class="p-8 text-center text-xs text-sword-muted flex flex-col items-center gap-2"
          >
            <MessageSquare class="w-8 h-8 text-sword-muted/40" />
            <span>{{ searchQuery ? 'Ничего не найдено' : 'Диалогов пока нет' }}</span>
            <p v-if="!searchQuery" class="text-[11px] text-sword-muted/60 max-w-xs">
              Начните диалог с пользователем со страницы «Пользователи» или создайте чат с Ambient ИИ!
            </p>
          </div>

          <button
            v-for="c in filteredChats"
            :key="c.id"
            type="button"
            :class="[
              'w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer group',
              chatStore.activeChatId === c.id
                ? 'bg-sword-card/80 border-l-4 border-l-sword-accent'
                : 'hover:bg-sword-surface/50 border-l-4 border-l-transparent'
            ]"
            @click="selectChat(c)"
          >
            <!-- Avatar -->
            <div class="relative shrink-0">
              <div
                v-if="c.type === 'ai'"
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center text-white shadow-md border border-white/20"
              >
                <Bot class="w-5 h-5 text-white" />
              </div>
              <div
                v-else
                :class="[
                  'w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-extrabold text-xs shadow-md border border-white/10 uppercase',
                  getAvatarGradient(c.recipient?.login || c.title)
                ]"
              >
                {{ (c.recipient?.login || c.title).replace('@', '').substring(0, 2) }}
              </div>

              <!-- AI badge indicator -->
              <span
                v-if="c.type === 'ai'"
                class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] font-black shadow"
              >
                AI
              </span>
            </div>

            <!-- Chat Info Preview -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span
                  :class="[
                    'text-xs font-bold truncate transition-colors',
                    chatStore.activeChatId === c.id ? 'text-sword-accent' : 'text-white group-hover:text-sword-accent'
                  ]"
                >
                  {{ c.title }}
                </span>
                <span v-if="c.last_message?.created_at_formatted" class="text-[10px] text-sword-muted/70 shrink-0 font-mono">
                  {{ c.last_message.created_at_formatted }}
                </span>
              </div>

              <p class="text-[11px] text-sword-muted truncate leading-relaxed">
                <span v-if="c.last_message?.sender_login" class="text-slate-400 font-semibold">
                  {{ c.last_message.sender_login === authStore.user?.login ? 'Вы: ' : '' }}
                </span>
                {{ c.last_message?.content || (c.type === 'ai' ? 'Чат с Ambient ИИ' : 'Нет сообщений') }}
              </p>
            </div>
          </button>
        </div>
      </div>

      <!-- ================= RIGHT COLUMN: ACTIVE CHAT ================= -->
      <div
        :class="[
          'flex-1 flex flex-col bg-sword-bg/30 min-w-0',
          !isMobileChatOpen ? 'hidden md:flex' : 'flex'
        ]"
      >
        <template v-if="chatStore.activeChat">
          <!-- Chat Header -->
          <div class="p-3.5 sm:px-6 border-b border-sword-border/60 flex items-center justify-between bg-sword-surface/60 backdrop-blur-md">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Mobile Back Button -->
              <button
                type="button"
                class="md:hidden p-1.5 rounded-xl hover:bg-sword-card text-sword-muted hover:text-white transition-colors cursor-pointer"
                title="Назад к списку чатов"
                @click="isMobileChatOpen = false"
              >
                <ArrowLeft class="w-5 h-5" />
              </button>

              <!-- Avatar -->
              <div
                v-if="chatStore.activeChat.type === 'ai'"
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center text-white shadow-md border border-white/20 shrink-0"
              >
                <Bot class="w-5 h-5 text-white" />
              </div>
              <div
                v-else
                :class="[
                  'w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-extrabold text-xs shadow-md border border-white/10 uppercase shrink-0',
                  getAvatarGradient(chatStore.activeChat.recipient?.login || chatStore.activeChat.title)
                ]"
              >
                {{ (chatStore.activeChat.recipient?.login || chatStore.activeChat.title).replace('@', '').substring(0, 2) }}
              </div>

              <!-- Recipient Info -->
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-extrabold text-white truncate">
                    {{ chatStore.activeChat.title }}
                  </h3>
                  <span
                    v-if="chatStore.activeChat.type === 'ai'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  >
                    Музыкальный продюсер
                  </span>
                </div>
                <p class="text-[11px] text-sword-muted truncate">
                  <span v-if="chatStore.activeChat.type === 'ai'">
                    Генерация параметров ambient-треков по тексту и изображениям
                  </span>
                  <span v-else>
                    {{ chatStore.activeChat.recipient?.email || 'Личная переписка' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Header Status -->
            <div class="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="hidden sm:inline text-[11px]">В сети</span>
            </div>
          </div>

          <!-- Messages Container -->
          <div
            ref="messagesContainerRef"
            class="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 scrollbar-thin"
          >
            <!-- Loading History State -->
            <div
              v-if="chatStore.isLoadingMessages && chatStore.activeMessages.length === 0"
              class="my-auto text-center text-xs text-sword-muted flex flex-col items-center gap-2"
            >
              <RefreshCw class="w-5 h-5 animate-spin text-sword-accent" />
              <span>Загрузка сообщений...</span>
            </div>

            <!-- Empty Messages Prompt -->
            <div
              v-else-if="chatStore.activeMessages.length === 0"
              class="my-auto text-center text-xs text-sword-muted flex flex-col items-center gap-3 py-10"
            >
              <div class="w-12 h-12 rounded-2xl bg-sword-card flex items-center justify-center text-sword-accent">
                <Sparkles class="w-6 h-6" />
              </div>
              <p class="text-white font-semibold">Начните диалог прямо сейчас</p>
              <p v-if="chatStore.activeChat.type === 'ai'" class="text-[11px] text-sword-muted max-w-sm">
                Отправьте описание настроения (например: «холодная метель, заброшенный бассейн») или прикрепите изображение для музыкального анализа!
              </p>
            </div>

            <!-- Messages List -->
            <template v-else>
              <div
                v-for="m in chatStore.activeMessages"
                :key="m.id"
                :class="[
                  'flex flex-col max-w-[85%] sm:max-w-[75%]',
                  m.sender_id === authStore.user?.id ? 'self-end items-end' : 'self-start items-start'
                ]"
              >
                <!-- Sender Login & Time Header -->
                <div class="flex items-center gap-1.5 mb-1 text-[10px] text-sword-muted font-mono px-1">
                  <span class="font-bold text-slate-300">
                    {{ m.sender_id === authStore.user?.id ? 'Вы' : (m.sender_login || 'Собеседник') }}
                  </span>
                  <span>•</span>
                  <span>{{ m.created_at_formatted }}</span>
                </div>

                <!-- Message Bubble -->
                <div
                  :class="[
                    'p-3.5 sm:p-4 rounded-3xl shadow-lg flex flex-col gap-2.5 text-xs sm:text-sm leading-relaxed',
                    m.sender_id === authStore.user?.id
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-sm border border-cyan-400/30'
                      : m.sender_id === 'ai-assistant'
                        ? 'bg-sword-card/90 text-white rounded-tl-sm border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                        : 'bg-sword-surface text-slate-200 rounded-tl-sm border border-sword-border'
                  ]"
                >
                  <!-- Attached Image (if present) -->
                  <div v-if="m.image_url" class="rounded-2xl overflow-hidden max-w-sm max-h-72 border border-white/10 shadow-md">
                    <img :src="m.image_url" alt="Прикрепленное изображение" class="w-full h-auto object-cover" />
                  </div>

                  <!-- Text Content -->
                  <p class="whitespace-pre-wrap break-words">{{ m.content }}</p>

                  <!-- ================= AI STRUCTURED MUSIC METADATA CARD ================= -->
                  <div
                    v-if="m.ai_metadata"
                    class="mt-2 pt-3 border-t border-white/10 flex flex-col gap-3 bg-black/30 p-3.5 rounded-2xl"
                  >
                    <!-- Genres Badges -->
                    <div v-if="m.ai_metadata.genres?.length" class="flex flex-wrap items-center gap-1.5">
                      <span class="text-[10px] font-bold text-sword-muted uppercase tracking-wider mr-1">Жанры:</span>
                      <span
                        v-for="g in m.ai_metadata.genres"
                        :key="g"
                        class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        {{ g }}
                      </span>
                    </div>

                    <!-- BPM and Key Row -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div v-if="m.ai_metadata.bpm" class="flex items-center gap-2 p-2 rounded-xl bg-sword-surface/60 border border-sword-border/60">
                        <Clock class="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div>
                          <div class="text-[9px] text-sword-muted uppercase font-bold">Темп / BPM</div>
                          <div class="font-mono font-bold text-white">{{ m.ai_metadata.bpm }}</div>
                        </div>
                      </div>

                      <div v-if="m.ai_metadata.key" class="flex items-center gap-2 p-2 rounded-xl bg-sword-surface/60 border border-sword-border/60">
                        <Music class="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <div>
                          <div class="text-[9px] text-sword-muted uppercase font-bold">Тональность / Лад</div>
                          <div class="font-mono font-bold text-white">{{ m.ai_metadata.key }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Instruments List -->
                    <div v-if="m.ai_metadata.instruments?.length" class="flex flex-col gap-1 text-[11px]">
                      <div class="flex items-center gap-1.5 text-sword-accent font-bold text-[10px] uppercase">
                        <SlidersHorizontal class="w-3 h-3" />
                        <span>Инструменты и Синтезаторы</span>
                      </div>
                      <ul class="list-disc list-inside space-y-0.5 text-slate-300 text-[11px] pl-1">
                        <li v-for="inst in m.ai_metadata.instruments" :key="inst">{{ inst }}</li>
                      </ul>
                    </div>

                    <!-- Field Recordings & Foley -->
                    <div v-if="m.ai_metadata.fieldRecordings" class="text-[11px]">
                      <span class="text-amber-400 font-bold text-[10px] uppercase block mb-0.5">Полевые записи (Foley / Атмосфера):</span>
                      <span class="text-slate-300">{{ m.ai_metadata.fieldRecordings }}</span>
                    </div>

                    <!-- Sound Design Details -->
                    <div v-if="m.ai_metadata.soundDesign" class="text-[11px]">
                      <span class="text-cyan-300 font-bold text-[10px] uppercase block mb-0.5">Саунд-дизайн и эффекты:</span>
                      <span class="text-slate-300">{{ m.ai_metadata.soundDesign }}</span>
                    </div>

                    <!-- Summary -->
                    <div v-if="m.ai_metadata.summary" class="text-[11px] italic text-slate-300/90 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
                      «{{ m.ai_metadata.summary }}»
                    </div>

                    <!-- Suno / Udio Ready Prompt with 1-click Copy -->
                    <div v-if="m.ai_metadata.sunoPrompt" class="flex flex-col gap-1.5 mt-1">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                          <Disc class="w-3.5 h-3.5 text-cyan-300" />
                          <span>Промпт для Suno / Udio</span>
                        </span>
                        <button
                          type="button"
                          class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
                          @click="copySunoPrompt(m.ai_metadata.sunoPrompt!, m.id)"
                        >
                          <Check v-if="copiedPromptId === m.id" class="w-3 h-3 text-emerald-400" />
                          <Copy v-else class="w-3 h-3" />
                          <span>{{ copiedPromptId === m.id ? 'Скопировано!' : 'Скопировать промпт' }}</span>
                        </button>
                      </div>
                      <div class="p-2.5 rounded-xl bg-black/60 border border-sword-border font-mono text-[10px] text-cyan-200 select-all break-words">
                        {{ m.ai_metadata.sunoPrompt }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Bottom Input Bar -->
          <div class="p-3 sm:p-4 border-t border-sword-border/60 bg-sword-surface/80 backdrop-blur-md flex flex-col gap-2">
            <!-- Image Attachment Preview Thumbnail -->
            <div v-if="attachedImageBase64" class="relative inline-block self-start">
              <div class="w-20 h-20 rounded-xl overflow-hidden border-2 border-sword-accent shadow-md">
                <img :src="attachedImageBase64" alt="Превью" class="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-red-500 cursor-pointer"
                title="Удалить прикрепленное фото"
                @click="removeAttachedImage"
              >
                <X class="w-3 h-3" />
              </button>
            </div>

            <!-- Input Controls Form -->
            <div class="flex items-end gap-2">
              <!-- Hidden File Input for Image -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageUpload"
              />

              <!-- Attach Image Button -->
              <button
                type="button"
                class="p-2.5 rounded-2xl bg-sword-card hover:bg-sword-card/80 border border-sword-border hover:border-sword-accent/50 text-sword-muted hover:text-white transition-all cursor-pointer shrink-0"
                :title="chatStore.activeChat.type === 'ai' ? 'Прикрепить арт или обложку для музыкального анализа' : 'Прикрепить изображение'"
                @click="triggerFileInput"
              >
                <ImageIcon class="w-5 h-5 text-sword-accent" />
              </button>

              <!-- Textarea / Input -->
              <div class="flex-1 relative">
                <textarea
                  v-model="messageInput"
                  rows="1"
                  :placeholder="
                    chatStore.activeChat.type === 'ai'
                      ? 'Опишите ambient-настроение или загрузите картинку (Enter для отправки)...'
                      : 'Напишите сообщение (Enter для отправки)...'
                  "
                  class="w-full max-h-32 py-2.5 px-4 bg-sword-bg/80 border border-sword-border rounded-2xl text-xs sm:text-sm text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent resize-none scrollbar-thin"
                  @keydown="handleKeydown"
                ></textarea>
              </div>

              <!-- Send Button -->
              <button
                type="button"
                :disabled="chatStore.isSendingMessage || (!messageInput.trim() && !attachedImageBase64)"
                class="p-2.5 rounded-2xl bg-sword-accent text-black font-black hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-sword-accent transition-all cursor-pointer shrink-0 shadow-lg shadow-sword-accent/20 active:scale-95"
                @click="handleSendMessage"
              >
                <RefreshCw v-if="chatStore.isSendingMessage" class="w-5 h-5 animate-spin" />
                <Send v-else class="w-5 h-5" />
              </button>
            </div>
          </div>
        </template>

        <!-- No Chat Selected Placeholder -->
        <div
          v-else
          class="flex-1 flex flex-col items-center justify-center p-8 text-center text-sword-muted gap-4"
        >
          <div class="w-16 h-16 rounded-3xl bg-sword-surface border border-sword-border flex items-center justify-center text-sword-accent shadow-xl">
            <MessageSquare class="w-8 h-8 text-sword-accent" />
          </div>
          <div>
            <h3 class="text-base font-extrabold text-white">Выберите диалог</h3>
            <p class="text-xs text-sword-muted max-w-sm mt-1">
              Выберите чат из списка слева, напишите пользователю или создайте чат с Ambient AI продюсером.
            </p>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/10 cursor-pointer transition-all"
            @click="handleCreateAiChat"
          >
            <Sparkles class="w-4 h-4 text-amber-200" />
            <span>Создать чат с ИИ</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
