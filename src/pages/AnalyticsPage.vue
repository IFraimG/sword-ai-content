<script setup lang="ts">
import { computed } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { NICHES } from '@/entities/reel/model/mockData';
import { formatCompactNumber, formatPercentage } from '@/shared/lib/formatters';
import BaseButton from '@/shared/ui/BaseButton.vue';
import {
  BarChart2,
  TrendingUp,
  Eye,
  Sparkles,
  Music,
  Share2,
  FileDown,
  Layers
} from 'lucide-vue-next';

const store = useReelsStore();

const ttViews = computed(() =>
  store.reels.filter((r) => r.platform === 'tiktok').reduce((acc, r) => acc + r.metrics.views, 0)
);

const igViews = computed(() =>
  store.reels.filter((r) => r.platform === 'instagram').reduce((acc, r) => acc + r.metrics.views, 0)
);

const totalViews = computed(() => ttViews.value + igViews.value || 1);
const ttPercent = computed(() => Math.round((ttViews.value / totalViews.value) * 100));
const igPercent = computed(() => 100 - ttPercent.value);

const ttAvgEr = computed(() => {
  const items = store.reels.filter((r) => r.platform === 'tiktok');
  return items.length ? (items.reduce((acc, r) => acc + r.metrics.engagementRate, 0) / items.length).toFixed(1) : '0';
});

const igAvgEr = computed(() => {
  const items = store.reels.filter((r) => r.platform === 'instagram');
  return items.length ? (items.reduce((acc, r) => acc + r.metrics.engagementRate, 0) / items.length).toFixed(1) : '0';
});

const topTrendingSounds = computed(() => {
  return [...store.reels]
    .sort((a, b) => b.metrics.velocityScore - a.metrics.velocityScore)
    .slice(0, 5);
});

const nicheStats = computed(() => {
  return NICHES.filter((n) => n.id !== 'all').map((niche) => {
    const reelsInNiche = store.reels.filter((r) => r.niche === niche.id);
    const count = reelsInNiche.length;
    const views = reelsInNiche.reduce((acc, r) => acc + r.metrics.views, 0);
    const avgEr = count ? (reelsInNiche.reduce((acc, r) => acc + r.metrics.engagementRate, 0) / count).toFixed(1) : '0';
    return {
      ...niche,
      count,
      views,
      avgEr,
    };
  }).filter((n) => n.count > 0);
});
</script>

<template>
  <div class="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-sword-surface/80 border border-sword-border/60 rounded-3xl p-6 shadow-xl">
      <div>
        <div class="flex items-center gap-2 text-sword-accent text-xs font-bold tracking-wide uppercase mb-1">
          <BarChart2 class="w-4 h-4" />
          <span>Cross-Platform Intelligence</span>
        </div>
        <h1 class="text-2xl font-black text-sword-text">
          Сравнительный анализ платформ (TikTok vs Instagram)
        </h1>
        <p class="text-xs text-sword-muted mt-1">
          Динамика вовлечения, распределение долей просмотров и самые быстрорастущие аудиодорожки.
        </p>
      </div>

      <BaseButton variant="primary" size="md" @click="store.openExport">
        <FileDown class="w-4 h-4 mr-1 text-black" />
        <span>Выгрузить аналитический срез</span>
      </BaseButton>
    </div>

    <!-- Comparative Visual Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 1. Volume & Views Share Comparison -->
      <div class="bg-sword-card/70 border border-sword-border/60 rounded-2xl p-5 flex flex-col gap-4">
        <h3 class="text-sm font-bold text-sword-text flex items-center gap-2">
          <Eye class="w-4 h-4 text-cyan-400" />
          <span>Распределение объемов просмотров</span>
        </h3>

        <!-- Comparative Progress Bar -->
        <div class="flex flex-col gap-2">
          <div class="w-full h-5 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-sword-border/60">
            <div
              :style="{ width: `${ttPercent}%` }"
              class="h-full rounded-l-full bg-tiktok-cyan transition-all duration-500 relative group flex items-center justify-center text-[10px] font-extrabold text-black"
            >
              {{ ttPercent }}%
            </div>
            <div
              :style="{ width: `${igPercent}%` }"
              class="h-full rounded-r-full bg-gradient-to-r from-insta-purple to-insta-pink transition-all duration-500 relative group flex items-center justify-center text-[10px] font-extrabold text-white"
            >
              {{ igPercent }}%
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-tiktok-cyan"></span>
              <span class="text-sword-text font-bold">TikTok: {{ formatCompactNumber(ttViews) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-gradient-to-r from-insta-purple to-insta-pink"></span>
              <span class="text-sword-text font-bold">Instagram: {{ formatCompactNumber(igViews) }}</span>
            </div>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <div class="bg-sword-surface/80 p-3 rounded-xl border border-tiktok-cyan/30">
            <span class="text-[11px] text-sword-muted block">TikTok ER (Вовлеченность)</span>
            <span class="text-xl font-black text-tiktok-cyan">{{ ttAvgEr }}%</span>
            <span class="text-[10px] text-sword-muted block mt-0.5">Высокая виральность репостов</span>
          </div>

          <div class="bg-sword-surface/80 p-3 rounded-xl border border-pink-500/30">
            <span class="text-[11px] text-sword-muted block">Instagram ER (Вовлеченность)</span>
            <span class="text-xl font-black text-pink-400">{{ igAvgEr }}%</span>
            <span class="text-[10px] text-sword-muted block mt-0.5">Высокий процент сохранений</span>
          </div>
        </div>
      </div>

      <!-- 2. Viral Audio Tracks -->
      <div class="bg-sword-card/70 border border-sword-border/60 rounded-2xl p-5 flex flex-col gap-4">
        <h3 class="text-sm font-bold text-sword-text flex items-center gap-2">
          <Music class="w-4 h-4 text-tiktok-pink" />
          <span>Топ вирусных звуков прямо сейчас</span>
        </h3>

        <div class="flex flex-col gap-2">
          <div
            v-for="(reel, index) in topTrendingSounds"
            :key="reel.id"
            class="flex items-center justify-between p-2.5 rounded-xl bg-sword-surface/60 border border-sword-border/40 hover:border-sword-accent/40 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-6 h-6 rounded-lg bg-sword-card flex items-center justify-center text-xs font-bold text-sword-accent">
                #{{ index + 1 }}
              </span>
              <div class="min-w-0">
                <span class="text-xs font-bold text-sword-text block truncate">{{ reel.soundTitle }}</span>
                <span class="text-[10px] text-sword-muted block truncate">{{ reel.soundAuthor }} • {{ reel.platform.toUpperCase() }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-300 text-xs font-bold whitespace-nowrap">
              <TrendingUp class="w-3.5 h-3.5" />
              <span>+{{ reel.metrics.velocityScore }}%/ч</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Niches Performance Breakdown -->
    <div class="bg-sword-card/70 border border-sword-border/60 rounded-2xl p-5 flex flex-col gap-4">
      <h3 class="text-sm font-bold text-sword-text flex items-center gap-2">
        <Layers class="w-4 h-4 text-sword-accent" />
        <span>Сводка по тематическим нишам</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="item in nicheStats"
          :key="item.id"
          class="bg-sword-surface/70 border border-sword-border/60 rounded-xl p-3.5 flex flex-col justify-between gap-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-sword-text">{{ item.label }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-sword-card border border-sword-border text-cyan-400 font-semibold">
              {{ item.count }} видео
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-sword-border/40 text-xs">
            <div>
              <span class="text-[10px] text-sword-muted block">Просмотры:</span>
              <span class="font-extrabold text-sword-text">{{ formatCompactNumber(item.views) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-sword-muted block">Средний ER:</span>
              <span class="font-extrabold text-emerald-400">{{ item.avgEr }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
