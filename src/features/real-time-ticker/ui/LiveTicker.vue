<script setup lang="ts">
import { computed } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { formatDuration } from '@/shared/lib/formatters';
import { RefreshCw, Radio, Pause, Play } from 'lucide-vue-next';

const store = useReelsStore();

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
  </div>
</template>
