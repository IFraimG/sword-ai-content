<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import type { YouTubeVideo } from '@/entities/youtube/model/types';
import type {
  AtmosphereChatMessage,
  QuickPromptOption,
} from '../model/types';
import { analyzeAtmosphereWithLLaVA } from '../api/atmosphereService';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RefreshCw,
  Eye,
  Disc,
  Snowflake,
  Layers,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Wand2,
  Copy,
  Check,
} from 'lucide-vue-next';
import { toast } from '@/shared/lib/toast/toastService';

const props = defineProps<{
  video: YouTubeVideo;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const messages = ref<AtmosphereChatMessage[]>([]);
const inputPrompt = ref('');
const isLoading = ref(false);
const chatContainerRef = ref<HTMLElement | null>(null);

// Preset quick prompt options
const initialQuickPrompts: QuickPromptOption[] = [
  {
    id: 'mood',
    label: 'Какую атмосферу передает превью?',
    prompt: 'Какую атмосферу и эмоциональное настроение передает это превью?',
    icon: '🌌',
    category: 'mood',
  },
  {
    id: 'dreamcore',
    label: 'Есть ли здесь эстетика Dreamcore?',
    prompt: 'Оцени эстетику превью: присутствуют ли здесь черты Dreamcore, лиминальных пространств или ностальгии?',
    icon: '🚪',
    category: 'style',
  },
  {
    id: 'coldcore',
    label: 'Оцени уровень Coldcore и меланхолии',
    prompt: 'Насколько этот кадр передает настроение Coldcore, домер-вейва или зимней меланхолии?',
    icon: '❄️',
    category: 'style',
  },
  {
    id: 'palette',
    label: 'Разбери цветовую гамму и свет',
    prompt: 'Разбери цветовую палитру, работу со светотенью и композиционный фокус этого превью.',
    icon: '🎨',
    category: 'style',
  },
  {
    id: 'usage',
    label: 'Для чего лучше всего подойдет этот сет?',
    prompt: 'Для чего лучше всего включить этот звуковой и визуальный ряд (сон, работа, медитация, чтение)?',
    icon: '🎧',
    category: 'usage',
  },
  {
    id: 'poetic',
    label: 'Поэтическое описание атмосферы',
    prompt: 'Придумай красивое поэтическое описание атмосферы для плейлиста в соцсетях.',
    icon: '✍️',
    category: 'mood',
  },
];

// Initialize chat for the current video
function initChatForVideo() {
  messages.value = [
    {
      id: `welcome-${props.video.id}`,
      role: 'assistant',
      content: `Привет! Я проанализировал превью и параметры видео **«${props.video.title}»** (${props.video.duration}).\n\nВыберите интересующий вас аспект атмосферы на кнопках ниже или задайте свой вопрос о визуальном стиле, настроении или резонансе этого сета.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];
  scrollToBottom();
}

// Watch for video change
watch(
  () => props.video.id,
  () => {
    initChatForVideo();
  },
  { immediate: true }
);

function scrollToBottom() {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
}

// Active follow-ups from the latest assistant message
const currentFollowUps = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const msg = messages.value[i];
    if (msg.role === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0) {
      return msg.suggestedFollowUps;
    }
  }
  return [];
});

async function sendMessage(promptText: string) {
  const text = (promptText || '').trim();
  if (!text || isLoading.value) return;

  const userMsgId = `user-${Date.now()}`;
  messages.value.push({
    id: userMsgId,
    role: 'user',
    content: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  inputPrompt.value = '';
  isLoading.value = true;
  scrollToBottom();

  const historyPayload = messages.value
    .filter((m) => m.id !== userMsgId && !m.isTyping)
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const response = await analyzeAtmosphereWithLLaVA({
      video: props.video,
      prompt: text,
      history: historyPayload,
    });

    messages.value.push({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      atmosphere: response.atmosphere || null,
      suggestedFollowUps: response.suggestedFollowUps || [],
    });
  } catch (err: any) {
    messages.value.push({
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: `⚠️ ${err?.message || 'Не удалось получить ответ от LLaVA 1.5 7B. Пожалуйста, попробуйте еще раз.'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
}

function handleInputSubmit() {
  if (inputPrompt.value.trim()) {
    sendMessage(inputPrompt.value);
  }
}

// Clipboard copying state & handler for assistant messages
const copiedMessageId = ref<string | null>(null);

async function copyMessageContent(msg: AtmosphereChatMessage) {
  if (!msg.content) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(msg.content);
    } else {
      // Fallback for non-secure / restricted environments
      const textArea = document.createElement('textarea');
      textArea.value = msg.content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    copiedMessageId.value = msg.id;
    toast.success('Ответ ИИ скопирован в буфер обмена');

    setTimeout(() => {
      if (copiedMessageId.value === msg.id) {
        copiedMessageId.value = null;
      }
    }, 2000);
  } catch {
    toast.error('Не удалось скопировать текст в буфер обмена');
  }
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-sword-surface/95 border-l border-sword-border text-sword-text overflow-hidden backdrop-blur-xl shadow-2xl transition-all"
  >
    <!-- Header -->
    <header class="p-3.5 bg-sword-card/90 border-b border-sword-border flex items-center justify-between gap-3 shrink-0">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shrink-0 shadow-md">
          <div class="w-full h-full bg-sword-bg rounded-[10px] flex items-center justify-center">
            <Bot class="w-4 h-4 text-cyan-400" />
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-sword-bg animate-pulse"></span>
        </div>
        <div class="truncate">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-white tracking-wide">LLaVA 1.5 7B</span>
            <span class="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono border border-purple-500/30">
              Vision AI
            </span>
          </div>
          <div class="text-[10px] text-sword-muted truncate">
            Анализ атмосферы по превью
          </div>
        </div>
      </div>

      <button
        type="button"
        class="p-1.5 rounded-lg text-sword-muted hover:text-white hover:bg-sword-surface transition-colors cursor-pointer"
        title="Закрыть чат"
        @click="emit('close')"
      >
        <X class="w-4 h-4" />
      </button>
    </header>

    <!-- Mini Target Video Context Banner -->
    <div class="px-3.5 py-2.5 bg-sword-card/50 border-b border-sword-border/60 flex items-center gap-2.5 shrink-0">
      <img
        :src="video.thumbnailUrl"
        :alt="video.title"
        class="w-12 h-8 rounded-lg object-cover border border-sword-border/80 shrink-0 shadow-sm"
      />
      <div class="min-w-0 flex-1">
        <div class="text-xs font-semibold text-sword-text truncate" :title="video.title">
          {{ video.title }}
        </div>
        <div class="text-[10px] text-sword-muted flex items-center gap-1.5">
          <span>{{ video.channelTitle }}</span>
          <span>•</span>
          <span class="font-mono text-cyan-400">{{ video.duration }}</span>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="chatContainerRef"
      class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col space-y-1.5"
        :class="msg.role === 'user' ? 'items-end' : 'items-start'"
      >
        <!-- Message Author Header -->
        <div class="flex items-center gap-1.5 text-[10px] text-sword-muted px-1">
          <span v-if="msg.role === 'assistant'" class="flex items-center gap-1 font-semibold text-purple-400">
            <Sparkles class="w-2.5 h-2.5" />
            LLaVA Vision
          </span>
          <span v-else class="font-semibold text-cyan-400">Вы</span>
          <span>•</span>
          <span>{{ msg.timestamp }}</span>
        </div>

        <!-- Bubble -->
        <div
          class="max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md"
          :class="
            msg.role === 'user'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none border border-purple-400/30'
              : 'bg-sword-card/90 border border-sword-border text-sword-text rounded-bl-none prose-invert'
          "
        >
          <!-- Assistant Message Content -->
          <div class="whitespace-pre-line leading-relaxed text-[12px]">
            {{ msg.content }}
          </div>

          <!-- Aesthetic Score Badges if present -->
          <div
            v-if="msg.atmosphere && msg.atmosphere.scores"
            class="mt-3 pt-2.5 border-t border-sword-border/80 flex flex-wrap gap-1.5"
          >
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
              <Disc class="w-3 h-3 text-emerald-400" />
              <span>Ambient: {{ msg.atmosphere.scores.ambient }}%</span>
            </div>
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
              <Eye class="w-3 h-3 text-purple-400" />
              <span>Dreamcore: {{ msg.atmosphere.scores.dreamcore }}%</span>
            </div>
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-mono">
              <Snowflake class="w-3 h-3 text-cyan-400" />
              <span>Coldcore: {{ msg.atmosphere.scores.coldcore }}%</span>
            </div>
          </div>
        </div>

        <!-- Action button under Assistant Message (Копирование в буфер обмена) -->
        <div
          v-if="msg.role === 'assistant' && msg.content"
          class="flex items-center gap-1.5 pt-0.5 px-1 animate-fade-in"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border shadow-sm"
            :class="
              copiedMessageId === msg.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-sword-card/70 hover:bg-sword-card text-sword-muted hover:text-white border-sword-border/70 hover:border-sword-accent/50'
            "
            title="Скопировать ответ ИИ в буфер обмена"
            @click="copyMessageContent(msg)"
          >
            <Check v-if="copiedMessageId === msg.id" class="w-3 h-3 text-emerald-400" />
            <Copy v-else class="w-3 h-3 text-sword-muted hover:text-white" />
            <span>{{ copiedMessageId === msg.id ? 'Скопировано!' : 'Копировать ответ' }}</span>
          </button>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isLoading" class="flex items-start gap-2 animate-fade-in">
        <div class="w-6 h-6 rounded-lg bg-sword-card border border-sword-border flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles class="w-3 h-3 text-purple-400 animate-spin" />
        </div>
        <div class="bg-sword-card/80 border border-sword-border rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs text-sword-muted flex items-center gap-2">
          <span>LLaVA 1.5 7B анализирует визуальный ряд превью</span>
          <span class="flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
          </span>
        </div>
      </div>
    </div>

    <!-- Suggested Prompt Buttons Section (Кнопки выбора) -->
    <div class="p-3 bg-sword-card/70 border-t border-sword-border shrink-0 space-y-2">
      <div class="flex items-center justify-between text-[11px] text-sword-muted font-semibold">
        <span class="flex items-center gap-1">
          <Wand2 class="w-3 h-3 text-sword-accent" />
          <span>Предлагаемые вопросы:</span>
        </span>
        <span class="text-[10px] text-sword-muted/70">Клик для отправки</span>
      </div>

      <!-- Quick prompts scroll area -->
      <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
        <!-- Dynamic Follow-ups if available -->
        <template v-if="currentFollowUps.length > 0">
          <button
            v-for="(followUp, idx) in currentFollowUps"
            :key="`fu-${idx}`"
            type="button"
            :disabled="isLoading"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400 text-[11px] text-purple-200 hover:text-white transition-all text-left cursor-pointer disabled:opacity-50"
            @click="sendMessage(followUp)"
          >
            <span>✨</span>
            <span class="truncate max-w-[280px]">{{ followUp }}</span>
          </button>
        </template>

        <!-- Default Initial Prompts -->
        <button
          v-for="chip in initialQuickPrompts"
          :key="chip.id"
          type="button"
          :disabled="isLoading"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sword-surface hover:bg-sword-card border border-sword-border hover:border-sword-accent/50 text-[11px] text-sword-muted hover:text-white transition-all text-left cursor-pointer disabled:opacity-50"
          @click="sendMessage(chip.prompt)"
        >
          <span>{{ chip.icon }}</span>
          <span class="truncate max-w-[280px]">{{ chip.label }}</span>
        </button>
      </div>

      <!-- Chat Custom Input Form -->
      <form
        class="relative flex items-center gap-1.5 pt-1"
        @submit.prevent="handleInputSubmit"
      >
        <input
          v-model="inputPrompt"
          type="text"
          :disabled="isLoading"
          placeholder="Спросить LLaVA о превью и атмосфере..."
          class="w-full pl-3 pr-10 py-2 rounded-xl bg-sword-bg border border-sword-border focus:border-sword-accent focus:ring-1 focus:ring-sword-accent/30 text-xs text-white placeholder:text-sword-muted/60 transition-all outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          :disabled="isLoading || !inputPrompt.trim()"
          class="absolute right-1.5 p-1.5 rounded-lg bg-sword-accent/20 hover:bg-sword-accent text-sword-accent hover:text-black transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Отправить вопрос"
        >
          <Send class="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  </aside>
</template>
