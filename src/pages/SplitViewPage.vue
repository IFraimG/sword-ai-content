<script setup lang="ts">
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import ReelFilterBar from '@/features/filter-reels/ui/ReelFilterBar.vue';
import PlatformColumn from '@/widgets/PlatformColumn/ui/PlatformColumn.vue';
import { formatCompactNumber } from '@/shared/lib/formatters';
import { Eye, TrendingUp, Sparkles, Video, Flame } from 'lucide-vue-next';

const store = useReelsStore();
</script>

<template>
  <div class="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Top Summary Metrics Ribbon -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Total Views -->
      <div class="bg-sword-surface/80 border border-sword-border/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Eye class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-sword-muted block">Общие просмотры в топе</span>
          <span class="text-lg font-extrabold text-sword-text">
            {{ formatCompactNumber(store.summaryMetrics.totalViews) }}
          </span>
        </div>
      </div>

      <!-- Average ER -->
      <div class="bg-sword-surface/80 border border-sword-border/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-sword-muted block">Средняя вовлеченность (ER)</span>
          <span class="text-lg font-extrabold text-emerald-400">
            {{ store.summaryMetrics.avgEngagement }}%
          </span>
        </div>
      </div>

      <!-- Max Velocity -->
      <div class="bg-sword-surface/80 border border-sword-border/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-sword-muted block">Пиковый темп роста (Velocity)</span>
          <span class="text-lg font-extrabold text-amber-400">
            +{{ store.summaryMetrics.topGrowth }}%/ч
          </span>
        </div>
      </div>

      <!-- Active Monitored Trends -->
      <div class="bg-sword-surface/80 border border-sword-border/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <Flame class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[11px] text-sword-muted block">Активных вирусных видео</span>
          <span class="text-lg font-extrabold text-sword-text">
            {{ store.summaryMetrics.totalItems }} трендов
          </span>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <ReelFilterBar />

    <!-- 50/50 Vertical Split Columns: TikTok (Left) | Instagram (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- Left Column: TikTok -->
      <PlatformColumn
        platform="tiktok"
        :reels="store.tiktokReels"
      />

      <!-- Right Column: Instagram -->
      <PlatformColumn
        platform="instagram"
        :reels="store.instagramReels"
      />
    </div>
  </div>
</template>
