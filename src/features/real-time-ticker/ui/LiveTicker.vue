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
  <div class="flex flex-col gap-2 bg-sword-surface/80 border border-sword-border/60 rounded-xl p-2.5 shadow-md">
    <!-- Top row: Live indicator, Countdown & Controls -->
    <div class="flex items-center justify-between gap-1.5 w-full">
      <!-- Live indicator -->
      <div class="flex items-center gap-1.5">
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
        <span class="text-[10px] text-sword-muted/80">Авто:</span>
        <span class="text-sword-accent font-bold">{{ formattedTime }}</span>
      </div>

      <!-- Actions: Pause/Resume & Force Refresh -->
      <div class="flex items-center gap-1">
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
    </div>

    <!-- Bottom row: Fastify API Server Status indicator (Clickable for settings) -->
    <button
      type="button"
      class="flex items-center justify-between w-full pt-1.5 border-t border-sword-border/60 text-[10px] hover:opacity-80 transition-opacity cursor-pointer group"
      :title="store.isApiConnected ? 'Fastify API бэкенд подключен (нажмите для настройки)' : 'Автономный режим (нажмите для подключения Fastify)'"
      @click="isSettingsModalOpen = true"
    >
      <div class="flex items-center gap-1.5">
        <span
          :class="[
            'w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125',
            store.isApiConnected ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-amber-400'
          ]"
        ></span>
        <span class="text-slate-400 font-medium font-mono group-hover:text-sword-text">
          {{ store.isApiConnected ? 'API: Fastify 3.0' : 'API: Standby' }}
        </span>
      </div>
      <Settings2 class="w-3 h-3 text-slate-500 group-hover:text-sword-accent transition-colors" />
    </button>

    <ApiSettingsModal v-model="isSettingsModalOpen" />
  </div>
</template>
