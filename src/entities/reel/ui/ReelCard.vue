<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Reel } from '../model/types';
import { useReelsStore } from '../model/reelsStore';
import { formatCompactNumber, formatPercentage } from '@/shared/lib/formatters';
import { downloadReelVideo } from '@/shared/lib/export/videoExporter';
import {
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Music,
  ExternalLink,
  Play,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  Check,
  Disc3
} from 'lucide-vue-next';

interface Props {
  reel: Reel;
}

const props = defineProps<Props>();
const store = useReelsStore();

const emit = defineEmits<{
  (e: 'select', reel: Reel): void;
  (e: 'tag-click', tag: string): void;
}>();

const isTikTok = computed(() => props.reel.platform === 'tiktok');

const rankBadgeColor = computed(() => {
  if (props.reel.trendingRank === 1) return 'bg-amber-400 text-black font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.5)]';
  if (props.reel.trendingRank === 2) return 'bg-slate-300 text-black font-bold';
  if (props.reel.trendingRank === 3) return 'bg-amber-700 text-white font-bold';
  return 'bg-sword-surface/90 text-sword-text border border-sword-border font-medium';
});

const rankDeltaClass = computed(() => {
  if (props.reel.rankChange === 'up') return 'text-emerald-400';
  if (props.reel.rankChange === 'down') return 'text-rose-400';
  if (props.reel.rankChange === 'new') return 'text-cyan-400 font-bold';
  return 'text-sword-muted';
});

const isDownloading = ref(false);
const downloaded = ref(false);

async function handleDownload(e: MouseEvent) {
  e.stopPropagation();
  if (isDownloading.value) return;
  isDownloading.value = true;
  try {
    await downloadReelVideo(props.reel);
    downloaded.value = true;
    setTimeout(() => {
      downloaded.value = false;
    }, 2000);
  } catch (err) {
    console.error('Ошибка скачивания видео:', err);
  } finally {
    isDownloading.value = false;
  }
}
</script>

<template>
  <div
    class="group relative flex flex-col bg-sword-card/90 hover:bg-sword-card rounded-2xl border border-sword-border/60 hover:border-sword-accent/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer"
    @click="emit('select', reel)"
  >
    <!-- Top Media / Thumbnail Container -->
    <div class="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
      <img
        :src="reel.thumbnailUrl"
        :alt="reel.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-sword-surface via-transparent to-black/60 pointer-events-none"></div>

      <!-- Platform & Rank Header overlay -->
      <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div class="flex items-center gap-1.5 pointer-events-auto">
          <!-- Platform Badge -->
          <div
            :class="[
              'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-md',
              isTikTok
                ? 'bg-black/75 text-tiktok-cyan border border-tiktok-cyan/40'
                : 'bg-gradient-to-r from-insta-purple/80 to-insta-pink/80 text-white border border-pink-400/40'
            ]"
          >
            <span v-if="isTikTok" class="w-1.5 h-1.5 rounded-full bg-tiktok-pink animate-pulse"></span>
            <span v-else class="w-1.5 h-1.5 rounded-full bg-insta-orange animate-pulse"></span>
            <span>{{ isTikTok ? 'TikTok' : 'Reels' }}</span>
          </div>

          <!-- Country Badge -->
          <div
            v-if="reel.countryFlag"
            class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-md"
            :title="`Страна: ${reel.countryName}`"
          >
            <span>{{ reel.countryFlag }}</span>
            <span class="text-[10px] text-slate-300 font-mono">{{ reel.country.toUpperCase() }}</span>
          </div>
        </div>

        <!-- Rank & Change Badge -->
        <div class="flex items-center gap-1.5 pointer-events-auto">
          <div
            :class="[
              'flex items-center justify-center w-7 h-7 rounded-lg text-xs shadow-md',
              rankBadgeColor
            ]"
          >
            #{{ reel.trendingRank }}
          </div>
          <div
            :class="[
              'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-black/60 backdrop-blur-md',
              rankDeltaClass
            ]"
          >
            <span v-if="reel.rankChange === 'up'" class="flex items-center">
              <ArrowUpRight class="w-3.5 h-3.5" />
              <span>{{ reel.rankChangeDelta }}</span>
            </span>
            <span v-else-if="reel.rankChange === 'down'" class="flex items-center">
              <ArrowDownRight class="w-3.5 h-3.5" />
              <span>{{ reel.rankChangeDelta }}</span>
            </span>
            <span v-else-if="reel.rankChange === 'new'" class="flex items-center gap-0.5">
              <Sparkles class="w-3 h-3 text-cyan-400" />
              <span>NEW</span>
            </span>
            <span v-else class="flex items-center">
              <Minus class="w-3 h-3 text-slate-500" />
            </span>
          </div>
        </div>
      </div>

      <!-- Play Icon Overlay on Hover -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div class="w-12 h-12 rounded-full bg-sword-accent/90 text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.6)] transform scale-90 group-hover:scale-100 transition-transform">
          <Play class="w-6 h-6 fill-black ml-0.5" />
        </div>
      </div>

      <!-- Bottom overlay on image: Views & Velocity Score -->
      <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
        <div class="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white font-medium">
          <Eye class="w-3.5 h-3.5 text-cyan-400" />
          <span>{{ formatCompactNumber(reel.metrics.views) }}</span>
        </div>
        <div class="flex items-center gap-1 bg-emerald-500/20 backdrop-blur-md px-2 py-1 rounded-lg border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
          <TrendingUp class="w-3.5 h-3.5 text-emerald-400" />
          <span>{{ formatPercentage(reel.metrics.velocityScore) }}/ч</span>
        </div>
      </div>
    </div>

    <!-- Content Card Body -->
    <div class="p-4 flex flex-col flex-1 justify-between gap-3">
      <!-- Author info -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <img
            :src="reel.authorAvatar"
            :alt="reel.authorName"
            class="w-8 h-8 rounded-full object-cover border border-sword-border flex-shrink-0"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <span class="text-xs font-semibold text-sword-text truncate">{{ reel.authorName }}</span>
              <CheckCircle2 v-if="reel.authorVerified" class="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 fill-cyan-400/20" />
            </div>
            <span class="text-[11px] text-sword-muted truncate block">{{ reel.authorUsername }}</span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Download MP4 -->
          <button
            type="button"
            class="p-1.5 text-sword-muted hover:text-sword-accent hover:bg-sword-surface rounded-lg transition-colors cursor-pointer"
            :title="downloaded ? 'Видео скачано!' : 'Скачать видео (.mp4)'"
            @click="handleDownload"
          >
            <Check v-if="downloaded" class="w-4 h-4 text-emerald-400" />
            <Download v-else class="w-4 h-4" :class="{ 'animate-bounce text-cyan-400': isDownloading }" />
          </button>

          <!-- Music Search & MP3 Discovery -->
          <button
            type="button"
            class="p-1.5 text-sword-muted hover:text-pink-400 hover:bg-pink-500/10 rounded-lg transition-colors cursor-pointer"
            title="Найти трек на Spotify, Apple Music, YouTube Music и скачать MP3"
            @click.stop="store.openMusicSearch(reel)"
          >
            <Disc3 class="w-4 h-4 text-pink-400/90 hover:text-pink-300 hover:rotate-90 transition-transform" />
          </button>

          <!-- External Original Link -->
          <a
            :href="reel.originalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 text-sword-muted hover:text-sword-accent hover:bg-sword-surface rounded-lg transition-colors"
            title="Открыть оригинал"
            @click.stop
          >
            <ExternalLink class="w-4 h-4" />
          </a>
        </div>
      </div>

      <!-- Title & Description -->
      <div>
        <h4 class="text-sm font-bold text-sword-text line-clamp-2 leading-snug group-hover:text-sword-accent transition-colors">
          {{ reel.title }}
        </h4>
        <p class="text-xs text-sword-muted line-clamp-2 mt-1 leading-relaxed">
          {{ reel.description }}
        </p>
      </div>

      <!-- Hashtags -->
      <div class="flex flex-wrap gap-1.5 overflow-hidden max-h-12" @click.stop>
        <button
          v-for="tag in reel.hashtags.slice(0, 4)"
          :key="tag"
          type="button"
          class="text-[11px] font-medium text-cyan-400/90 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 px-2 py-0.5 rounded-md transition-colors"
          @click="emit('tag-click', tag)"
        >
          {{ tag }}
        </button>
      </div>

      <!-- Trending Sound Info (Clickable for Music Search) -->
      <button
        type="button"
        class="flex items-center justify-between gap-1.5 py-1 px-2.5 rounded-lg bg-sword-surface/70 hover:bg-sword-surface border border-sword-border/40 hover:border-pink-500/40 text-[11px] text-sword-muted hover:text-white transition-all group/sound cursor-pointer w-full text-left"
        title="Найти трек на Spotify, Apple Music, YouTube Music, SoundCloud и скачать MP3"
        @click.stop="store.openMusicSearch(reel)"
      >
        <div class="flex items-center gap-1.5 min-w-0">
          <Music class="w-3.5 h-3.5 text-tiktok-pink flex-shrink-0 animate-bounce" />
          <span class="truncate">{{ reel.soundTitle }}</span>
        </div>
        <span class="text-[10px] text-pink-400 opacity-0 group-hover/sound:opacity-100 transition-opacity font-semibold flex items-center gap-0.5 flex-shrink-0">
          Музыка →
        </span>
      </button>

      <!-- Bottom Metrics Grid -->
      <div class="pt-2 border-t border-sword-border/60 grid grid-cols-3 gap-2 text-center text-xs">
        <div class="bg-sword-surface/50 rounded-lg p-1.5 border border-sword-border/30">
          <div class="flex items-center justify-center gap-1 text-sword-muted text-[10px] mb-0.5">
            <Heart class="w-3 h-3 text-rose-400" />
            <span>Лайки</span>
          </div>
          <span class="font-bold text-sword-text">{{ formatCompactNumber(reel.metrics.likes) }}</span>
        </div>

        <div class="bg-sword-surface/50 rounded-lg p-1.5 border border-sword-border/30">
          <div class="flex items-center justify-center gap-1 text-sword-muted text-[10px] mb-0.5">
            <Share2 class="w-3 h-3 text-sky-400" />
            <span>Шеринг</span>
          </div>
          <span class="font-bold text-sword-text">{{ formatCompactNumber(reel.metrics.shares) }}</span>
        </div>

        <div class="bg-sword-surface/50 rounded-lg p-1.5 border border-sword-border/30">
          <div class="flex items-center justify-center gap-1 text-sword-muted text-[10px] mb-0.5">
            <Sparkles class="w-3 h-3 text-emerald-400" />
            <span>ER %</span>
          </div>
          <span class="font-bold text-emerald-400">{{ reel.metrics.engagementRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
