<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseModal from '@/shared/ui/BaseModal.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import {
  getApiBaseUrl,
  setCustomApiUrl,
  getCustomApiUrl,
  checkServerHealth
} from '@/shared/api/reelsApi';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { Server, CheckCircle2, AlertCircle, RefreshCw, Globe, ExternalLink } from 'lucide-vue-next';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const store = useReelsStore();

const apiUrlInput = ref('');
const isChecking = ref(false);
const checkResult = ref<{ status: 'idle' | 'success' | 'error'; message: string }>({
  status: 'idle',
  message: '',
});

onMounted(() => {
  apiUrlInput.value = getCustomApiUrl() || getApiBaseUrl() || '';
});

async function handleTestConnection() {
  const url = apiUrlInput.value.trim();
  if (!url) {
    checkResult.value = {
      status: 'error',
      message: 'Укажите URL адрес сервера Fastify',
    };
    return;
  }

  isChecking.value = true;
  checkResult.value = { status: 'idle', message: '' };

  const isOk = await checkServerHealth(url);
  isChecking.value = false;

  if (isOk) {
    checkResult.value = {
      status: 'success',
      message: 'Соединение успешно установлено! Сервер Fastify отвечает.',
    };
  } else {
    checkResult.value = {
      status: 'error',
      message: 'Не удалось подключиться к серверу. Убедитесь, что сервер запущен и доступен по HTTPS.',
    };
  }
}

async function handleSave() {
  const url = apiUrlInput.value.trim();
  setCustomApiUrl(url);
  emit('update:modelValue', false);
  await store.triggerRefresh();
}

function handleResetToStandalone() {
  apiUrlInput.value = '';
  setCustomApiUrl('');
  checkResult.value = {
    status: 'idle',
    message: '',
  };
  emit('update:modelValue', false);
  store.triggerRefresh();
}
</script>

<template>
  <BaseModal
    :model-value="props.modelValue"
    max-width="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <Server class="w-5 h-5 text-sword-accent" />
        <h3 class="text-base font-bold text-sword-text">Настройка Fastify API Сервера</h3>
      </div>
    </template>

    <div class="space-y-4 pt-1">
      <p class="text-xs text-slate-300 leading-relaxed">
        Sword AI может работать в автономном режиме либо подключиться к выделенному Node.js + Fastify серверу для прямого проксирования платформенных видео- и аудиопотоков.
      </p>

      <!-- Connection Status Card -->
      <div
        :class="[
          'p-3 rounded-xl border flex items-center gap-3',
          store.isApiConnected
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        ]"
      >
        <CheckCircle2 v-if="store.isApiConnected" class="w-5 h-5 text-emerald-400 shrink-0" />
        <AlertCircle v-else class="w-5 h-5 text-amber-400 shrink-0" />
        <div class="text-xs">
          <div class="font-bold">
            {{ store.isApiConnected ? 'Сервер Fastify подключен' : 'Автономный режим (Standalone)' }}
          </div>
          <div class="text-[11px] opacity-80 mt-0.5">
            {{ store.isApiConnected ? 'Потоки видео и аудио транслируются через прокси.' : 'Используется мастер-каталог. Для проксирования подключите Fastify.' }}
          </div>
        </div>
      </div>

      <!-- Server URL Input -->
      <div>
        <label class="block text-xs font-semibold text-sword-text mb-1.5">
          Адрес Fastify API сервера:
        </label>
        <div class="relative">
          <Globe class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="apiUrlInput"
            type="text"
            placeholder="https://your-api.onrender.com или http://localhost:3001"
            class="w-full pl-9 pr-3 py-2 bg-sword-dark border border-sword-border/80 rounded-xl text-xs text-sword-text placeholder-slate-500 focus:outline-none focus:border-sword-accent transition-colors font-mono"
          />
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
          <span>Локально: <code class="text-cyan-300">http://localhost:3001</code></span>
          <button
            type="button"
            class="text-sword-accent hover:underline cursor-pointer"
            @click="apiUrlInput = 'http://localhost:3001'"
          >
            Вставить localhost
          </button>
        </div>
      </div>

      <!-- Test Connection Feedback -->
      <div
        v-if="checkResult.message"
        :class="[
          'p-2.5 rounded-lg text-xs flex items-center gap-2',
          checkResult.status === 'success'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
        ]"
      >
        <CheckCircle2 v-if="checkResult.status === 'success'" class="w-4 h-4 shrink-0" />
        <AlertCircle v-else class="w-4 h-4 shrink-0" />
        <span>{{ checkResult.message }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 pt-2 border-t border-sword-border/60">
        <button
          type="button"
          :disabled="isChecking"
          class="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-sword-card hover:bg-sword-surface text-sword-text border border-sword-border transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          @click="handleTestConnection"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isChecking }" />
          <span>{{ isChecking ? 'Проверка...' : 'Проверить связь' }}</span>
        </button>

        <button
          type="button"
          class="flex-1 py-2 px-3 rounded-xl text-xs font-extrabold bg-sword-accent hover:bg-cyan-300 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
          @click="handleSave"
        >
          Сохранить
        </button>
      </div>

      <div class="text-center pt-1">
        <button
          type="button"
          class="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          @click="handleResetToStandalone"
        >
          Сбросить и переключить в автономный режим
        </button>
      </div>
    </div>
  </BaseModal>
</template>
