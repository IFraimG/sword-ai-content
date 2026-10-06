<script setup lang="ts">
import { computed } from 'vue';
import type { Platform, Reel } from '@/entities/reel/model/types';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import ReelCard from '@/entities/reel/ui/ReelCard.vue';
import { formatCompactNumber } from '@/shared/lib/formatters';
import { TrendingUp, Eye, Sparkles, AlertCircle } from 'lucide-vue-next';

interface Props {
  platform: Platform;
  reels: Reel[];
}

const props = defineProps<Props>();
const store = useReelsStore();

const isTikTok = computed(() => props.platform === 'tiktok');

const platformStats = computed(() => {
  const list = props.reels;
  if (!list.length) return { views: 0, avgEr: 0, count: 0 };
  const views = list.reduce((acc, r) => acc + r.metrics.views, 0);
  const avgEr = (list.reduce((acc, r) => acc + r.metrics.engagementRate, 0) / list.length).toFixed(1);
  return { views, avgEr, count: list.length };
});

function handleTagClick(tag: string) {
  store.searchQuery = tag;
}
</script>

<template>
  <div class="flex flex-col flex-1 h-full min-w-0 bg-sword-surface/40 rounded-2xl border border-sword-border/60 overflow-hidden">
    <!-- Platform Header Banner -->
    <div
      :class="[
        'p-4 border-b transition-colors relative overflow-hidden',
        isTikTok
          ? 'border-tiktok-cyan/30 bg-gradient-to-r from-tiktok-dark via-sword-surface to-sword-surface'
          : 'border-pink-500/30 bg-gradient-to-r from-insta-card via-sword-surface to-sword-surface'
      ]"
    >
      <!-- Background Ambient Glow -->
      <div
        :class="[
          'absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none',
          isTikTok ? 'bg-tiktok-cyan' : 'bg-insta-pink'
        ]"
      ></div>

      <div class="relative z-10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Platform Icon Badge -->
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-lg',
              isTikTok
                ? 'bg-black text-tiktok-cyan border border-tiktok-cyan/40 shadow-tiktok-cyan/20'
                : 'bg-gradient-to-br from-insta-purple via-insta-pink to-insta-orange text-white shadow-pink-500/20'
            ]"
          >
            <span v-if="isTikTok">TT</span>
            <span v-else>IG</span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-extrabold text-sword-text tracking-wide">
                {{ isTikTok ? 'TikTok Тренды' : 'Instagram Reels' }}
              </h2>
              <span
                :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  isTikTok
                    ? 'bg-tiktok-cyan/15 text-tiktok-cyan border-tiktok-cyan/30'
                    : 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                ]"
              >
                {{ platformStats.count }} рилсов
              </span>
            </div>
            <p class="text-xs text-sword-muted">
              {{ isTikTok ? 'Вирусные тренды, звуки и вызовы' : 'Популярные рилсы, эстетика и вовлечение' }}
            </p>
          </div>
        </div>

        <!-- Quick Platform Stats Pills -->
        <div class="hidden sm:flex items-center gap-2 text-xs">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sword-card/80 border border-sword-border/60">
            <Eye class="w-3.5 h-3.5 text-sword-accent" />
            <span class="font-bold text-sword-text">{{ formatCompactNumber(platformStats.views) }}</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sword-card/80 border border-sword-border/60">
            <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
            <span class="font-bold text-emerald-400">{{ platformStats.avgEr }}% ER</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Feed Body -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div v-if="reels.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ReelCard
          v-for="reel in reels"
          :key="reel.id"
          :reel="reel"
          @select="store.openDetail"
          @tag-click="handleTagClick"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-sword-card flex items-center justify-center text-sword-muted mb-3 border border-sword-border/60">
          <AlertCircle class="w-7 h-7 text-sword-accent" />
        </div>
        <h4 class="text-sm font-bold text-sword-text">Тренды не найдены</h4>
        <p class="text-xs text-sword-muted mt-1 max-w-xs">
          По вашему поисковому запросу или выбранной нише в {{ isTikTok ? 'TikTok' : 'Instagram' }} пока нет подходящих рилсов.
        </p>
        <button
          type="button"
          class="mt-4 px-3 py-1.5 rounded-lg bg-sword-card text-xs text-sword-accent border border-sword-border hover:bg-sword-border transition-colors cursor-pointer"
          @click="store.searchQuery = ''; store.selectedNiche = 'all'"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  </div>
</template>
