<script setup lang="ts">
import { ref, computed } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { formatDuration } from '@/shared/lib/formatters';
import { RefreshCw, Radio, Pause, Play, Settings2 } from 'lucide-vue-next';
import ApiSettingsModal from '@/widgets/ApiSettingsModal/ui/ApiSettingsModal.vue';

const store = useReelsStore();
const isSettingsModalOpen = ref(false);

const formattedTime = computed(() => formatDuration(store.countdown));
</script>

<template>
  <div class="flex items-center gap-2 bg-sword-surface/80 border border-sword-border/60 rounded-xl px-3 py-1.5 shadow-md">
    <!-- Live indicator -->
    <div class="flex items-center gap-1.5 pr-2 border-r border-sword-border/60">
      <span class="relative flex h-2.5 w-2.5">
        <span
          v-if="store.isLiveSyncing"
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
        ></span>
        <span
          :class="[
            'relative inline-flex rounded-full h-2.5 w-2.5',
            store.isLiveSyncing ? 'bg-emerald-500' : 'bg-slate-500'
          ]"
        ></span>
      </span>
      <span class="text-[11px] font-bold tracking-wider text-sword-text uppercase">
        {{ store.isLiveSyncing ? 'Live' : 'Пауза' }}
      </span>
    </div>

    <!-- Countdown Timer -->
    <div class="flex items-center gap-1 text-xs font-mono font-medium text-sword-muted">
      <span class="text-[11px]">Автообновление:</span>
      <span class="text-sword-accent font-bold">{{ formattedTime }}</span>
    </div>

    <!-- Actions: Pause/Resume & Force Refresh -->
    <div class="flex items-center gap-1 pl-1">
      <button
        type="button"
        class="p-1 rounded-lg text-sword-muted hover:text-sword-text hover:bg-sword-card transition-colors"
        :title="store.isLiveSyncing ? 'Поставить на паузу' : 'Возобновить автообновление'"
        @click="store.toggleLiveSync"
      >
        <Pause v-if="store.isLiveSyncing" class="w-3.5 h-3.5" />
        <Play v-else class="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        class="p-1 rounded-lg text-sword-muted hover:text-sword-accent hover:bg-sword-card transition-colors"
        :class="{ 'pointer-events-none': store.isRefreshing }"
        title="Обновить тренды сейчас"
        @click="store.triggerRefresh"
      >
        <RefreshCw
          :class="[
            'w-3.5 h-3.5',
            store.isRefreshing ? 'animate-spin text-sword-accent' : ''
          ]"
        />
      </button>
    </div>

    <!-- Fastify API Server Status indicator (Clickable for settings) -->
    <button
      type="button"
      class="hidden md:flex items-center gap-1.5 pl-2 border-l border-sword-border/60 text-[10px] hover:opacity-80 transition-opacity cursor-pointer group"
      :title="store.isApiConnected ? 'Fastify API бэкенд подключен (нажмите для настройки)' : 'Автономный режим (нажмите для подключения Fastify)'"
      @click="isSettingsModalOpen = true"
    >
      <span
        :class="[
          'w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125',
          store.isApiConnected ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-amber-400'
        ]"
      ></span>
      <span class="text-slate-400 font-medium font-mono group-hover:text-sword-text">
        {{ store.isApiConnected ? 'API: Fastify 3.0' : 'API: Standby' }}
      </span>
      <Settings2 class="w-3 h-3 text-slate-500 group-hover:text-sword-accent transition-colors ml-0.5" />
    </button>

    <ApiSettingsModal v-model="isSettingsModalOpen" />
  </div>
</template>
