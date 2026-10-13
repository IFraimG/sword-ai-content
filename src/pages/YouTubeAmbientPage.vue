<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  fetchYouTubeVideos,
} from '@/shared/api/youtubeService';
import type {
  YouTubeVideo,
  YouTubeNiche,
  YouTubeAnalyticsSummary,
} from '@/entities/youtube/model/types';
import { showToast } from '@/shared/lib/toast/toastService';
import BaseButton from '@/shared/ui/BaseButton.vue';
import {
  Search,
  Sparkles,
  Clock,
  Tv,
  Headphones,
  ExternalLink,
  Copy,
  Check,
  Play,
  X,
  Volume2,
  RefreshCw,
  Layers,
  Radio,
  Snowflake,
  Eye,
  Activity,
  Disc,
} from 'lucide-vue-next';

// State
const searchQuery = ref('');
const selectedNiche = ref<YouTubeNiche>('all');
const activeHashtag = ref<string>('');
const isLoading = ref(false);
const videos = ref<YouTubeVideo[]>([]);
const analytics = ref<YouTubeAnalyticsSummary | null>(null);

// Active playing video modal
const activeVideo = ref<YouTubeVideo | null>(null);
const copiedId = ref<string | null>(null);

// Niche definition tabs
const nicheTabs: { id: YouTubeNiche; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Все направления', icon: Layers, color: 'text-sword-accent' },
  { id: 'ambient', label: 'Ambient', icon: Disc, color: 'text-emerald-400' },
  { id: 'dreamcore', label: 'Dreamcore', icon: Eye, color: 'text-purple-400' },
  { id: 'coldcore', label: 'Coldcore', icon: Snowflake, color: 'text-cyan-400' },
];

// Popular quick hashtags
const quickTags = [
  '#dreamcore',
  '#coldcore',
  '#ambient',
  '#liminalspace',
  '#weirdcore',
  '#spaceambient',
  '#doomerwave',
  '#winterwave',
];

// Load videos
async function loadVideos(niche = selectedNiche.value, query = searchQuery.value) {
  isLoading.value = true;
  try {
    const res = await fetchYouTubeVideos({
      query: query.trim(),
      niche,
      limit: 28,
    });
    // Strict enforcement on client
    videos.value = (res.items || []).filter((v) => v.durationSeconds > 3600);
    analytics.value = res.analytics;
  } catch (err) {
    showToast({
      message: 'Не удалось получить свежие данные с YouTube. Используется проверенная база миксов.',
      type: 'warning',
    });
  } finally {
    isLoading.value = false;
  }
}

// Handlers
function onSelectNiche(niche: YouTubeNiche) {
  selectedNiche.value = niche;
  activeHashtag.value = '';
  loadVideos(niche, searchQuery.value);
}

function onSelectTag(tag: string) {
  if (activeHashtag.value === tag) {
    activeHashtag.value = '';
    searchQuery.value = '';
  } else {
    activeHashtag.value = tag;
    searchQuery.value = tag;
  }
  loadVideos(selectedNiche.value, searchQuery.value);
}

function handleSearchSubmit() {
  activeHashtag.value = '';
  loadVideos(selectedNiche.value, searchQuery.value);
}

function playVideo(video: YouTubeVideo) {
  activeVideo.value = video;
}

function closePlayer() {
  activeVideo.value = null;
}

async function copyEmbedUrl(video: YouTubeVideo) {
  try {
    await navigator.clipboard.writeText(video.embedUrl);
    copiedId.value = video.id;
    showToast({
      message: `Embed-ссылка (${video.embedUrl}) скопирована!`,
      type: 'success',
      duration: 3000,
    });
    setTimeout(() => {
      if (copiedId.value === video.id) copiedId.value = null;
    }, 2500);
  } catch {
    showToast({
      message: 'Не удалось скопировать ссылку в буфер обмена',
      type: 'error',
    });
  }
}

// Format duration seconds to human hours/minutes
function formatDurationBadge(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Play next mix
function playNextMix() {
  if (!activeVideo.value || videos.value.length <= 1) return;
  const currentIndex = videos.value.findIndex((v) => v.id === activeVideo.value?.id);
  const nextIndex = (currentIndex + 1) % videos.value.length;
  activeVideo.value = videos.value[nextIndex];
}

onMounted(() => {
  loadVideos();
});
</script>

<template>
  <div class="min-h-screen bg-sword-bg text-sword-text pb-24">
    <!-- Hero / Header Section -->
    <section class="relative overflow-hidden border-b border-sword-border/80 bg-gradient-to-b from-sword-surface/80 via-sword-bg to-sword-bg py-10 px-4 sm:px-6 lg:px-8">
      <!-- Glow ambient background blobs -->
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sword-card/90 border border-sword-border text-xs text-sword-muted">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-semibold text-sword-text">YouTube Deep Intelligence</span>
              <span class="text-sword-border">•</span>
              <span class="text-cyan-400 font-mono font-medium">Только миксы > 1:00:00</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Ambient</span>
              <span class="text-sword-muted/40 font-light">•</span>
              <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dreamcore</span>
              <span class="text-sword-muted/40 font-light">•</span>
              <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Coldcore</span>
            </h1>

            <p class="text-sm sm:text-base text-sword-muted max-w-2xl leading-relaxed">
              Анализ и подборка полноформатных видео с YouTube по ключевым эстетическим направлениям.
              Система автоматически отсеивает короткие ролики и отображает <strong class="text-sword-text">только сеты длительностью более одного часа</strong> со встроенными Embed-плеерами.
            </p>
          </div>

          <!-- Strict Duration Badge Indicator -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-sword-card/80 border border-sword-border/90 p-3.5 rounded-2xl shadow-xl backdrop-blur-sm">
            <div class="w-10 h-10 rounded-xl bg-sword-accent/10 border border-sword-accent/30 flex items-center justify-center text-sword-accent shrink-0">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs font-bold text-sword-text flex items-center gap-1.5">
                <span>Строгий фильтр хронометража</span>
                <span class="px-1.5 py-0.2 rounded bg-sword-accent/20 text-sword-accent text-[10px] font-mono">1h+ PASS</span>
              </div>
              <div class="text-[11px] text-sword-muted mt-0.5">
                Видео &le; 60 минут исключены из подборки
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Filter Tabs & Search Controls -->
        <div class="mt-8 pt-6 border-t border-sword-border/60 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <!-- Genre Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              v-for="tab in nicheTabs"
              :key="tab.id"
              type="button"
              :class="[
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none',
                selectedNiche === tab.id
                  ? 'bg-sword-card text-white border border-sword-accent/50 shadow-md shadow-sword-accent/10'
                  : 'text-sword-muted hover:text-sword-text bg-sword-surface/50 border border-transparent hover:border-sword-border'
              ]"
              @click="onSelectNiche(tab.id)"
            >
              <component :is="tab.icon" :class="['w-4 h-4', tab.color]" />
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Search & Scrape Input -->
          <form
            class="flex items-center gap-2 w-full lg:w-96"
            @submit.prevent="handleSearchSubmit"
          >
            <div class="relative flex-1">
              <Search class="w-4 h-4 text-sword-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по YouTube: запрос или #хэштег..."
                class="w-full bg-sword-card/90 border border-sword-border rounded-xl pl-9 pr-3 py-2 text-xs text-sword-text placeholder:text-sword-muted focus:outline-none focus:border-sword-accent transition-colors"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-sword-muted hover:text-white"
                @click="searchQuery = ''; handleSearchSubmit()"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <BaseButton
              variant="primary"
              size="sm"
              type="submit"
              :disabled="isLoading"
              class="shrink-0 font-bold text-xs"
            >
              <RefreshCw v-if="isLoading" class="w-3.5 h-3.5 animate-spin mr-1 text-black" />
              <Sparkles v-else class="w-3.5 h-3.5 mr-1 text-black" />
              <span>Скрапить</span>
            </BaseButton>
          </form>
        </div>

        <!-- Quick Hashtags Bar -->
        <div class="mt-4 flex items-center gap-2 flex-wrap text-xs">
          <span class="text-sword-muted text-[11px] font-semibold">Популярные хэштеги:</span>
          <button
            v-for="tag in quickTags"
            :key="tag"
            type="button"
            :class="[
              'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border',
              activeHashtag === tag
                ? 'bg-sword-accent/20 text-sword-accent border-sword-accent/40 font-bold'
                : 'bg-sword-surface/40 text-sword-muted hover:text-sword-text border-sword-border/60 hover:border-sword-border'
            ]"
            @click="onSelectTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
      <!-- Analytics Stats Cards -->
      <section v-if="analytics" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Total 1h+ Mixes -->
        <div class="bg-sword-card/70 border border-sword-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-sword-muted mb-2">
            <span class="text-xs font-semibold">Собрано миксов (> 1ч)</span>
            <Tv class="w-4 h-4 text-sword-accent" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white">
            {{ analytics.totalVideos }}
          </div>
          <div class="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <span>✓</span> Все хронометражем &gt; 60 мин
          </div>
        </div>

        <!-- Total Duration -->
        <div class="bg-sword-card/70 border border-sword-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-sword-muted mb-2">
            <span class="text-xs font-semibold">Суммарное время</span>
            <Clock class="w-4 h-4 text-purple-400" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white">
            {{ analytics.totalDurationFormatted }}
          </div>
          <div class="text-[10px] text-sword-muted mt-1">
            Непрерывного звукового потока
          </div>
        </div>

        <!-- Average Duration -->
        <div class="bg-sword-card/70 border border-sword-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-sword-muted mb-2">
            <span class="text-xs font-semibold">Средний сет</span>
            <Radio class="w-4 h-4 text-cyan-400" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white">
            {{ analytics.avgDurationFormatted }}
          </div>
          <div class="text-[10px] text-cyan-400 font-mono mt-1">
            Deep listening формат
          </div>
        </div>

        <!-- Genre Distribution -->
        <div class="bg-sword-card/70 border border-sword-border rounded-2xl p-4 flex flex-col justify-between">
          <div class="flex items-center justify-between text-sword-muted mb-2">
            <span class="text-xs font-semibold">Распределение</span>
            <Activity class="w-4 h-4 text-pink-400" />
          </div>
          <div class="flex items-center gap-2 text-xs font-mono font-bold mt-1">
            <span class="text-emerald-400" title="Ambient">A: {{ analytics.nichesCount.ambient }}</span>
            <span class="text-sword-muted">/</span>
            <span class="text-purple-400" title="Dreamcore">D: {{ analytics.nichesCount.dreamcore }}</span>
            <span class="text-sword-muted">/</span>
            <span class="text-cyan-400" title="Coldcore">C: {{ analytics.nichesCount.coldcore }}</span>
          </div>
          <div class="text-[10px] text-sword-muted mt-1">
            Ambient • Dreamcore • Coldcore
          </div>
        </div>
      </section>

      <!-- Video Feed Grid Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-white">
              Подборка YouTube Embed (Длительность &gt; 1:00:00)
            </h2>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-sword-card text-sword-accent border border-sword-border">
              {{ videos.length }} видео
            </span>
          </div>

          <div v-if="isLoading" class="flex items-center gap-2 text-xs text-sword-muted">
            <RefreshCw class="w-3.5 h-3.5 animate-spin text-sword-accent" />
            <span>Анализ поисковой выдачи...</span>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="!isLoading && videos.length === 0"
          class="bg-sword-card/40 border border-dashed border-sword-border rounded-2xl p-12 text-center"
        >
          <Tv class="w-12 h-12 text-sword-muted mx-auto mb-3" />
          <h3 class="text-base font-bold text-white mb-1">
            Видео длительностью > 1 часа не найдены
          </h3>
          <p class="text-xs text-sword-muted max-w-md mx-auto mb-4">
            Попробуйте изменить поисковый запрос или переключиться на хэштег #dreamcore, #coldcore или #ambient.
          </p>
          <BaseButton
            variant="outline"
            size="sm"
            @click="searchQuery = ''; selectedNiche = 'all'; loadVideos('all', '')"
          >
            Сбросить фильтры
          </BaseButton>
        </div>

        <!-- Video Cards Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <article
            v-for="video in videos"
            :key="video.id"
            class="group bg-sword-card/90 border border-sword-border/90 hover:border-sword-accent/70 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-sword-accent/5 hover:-translate-y-1"
          >
            <!-- Thumbnail & Player Trigger -->
            <div
              class="relative aspect-video w-full bg-black/60 overflow-hidden cursor-pointer"
              @click="playVideo(video)"
            >
              <img
                :src="video.thumbnailUrl"
                :alt="video.title"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                @error="(e) => { (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`; }"
              />

              <!-- Overlay gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 group-hover:from-black/90 transition-colors"></div>

              <!-- Niche Badge (Top Left) -->
              <div class="absolute top-2.5 left-2.5">
                <span
                  v-if="video.niche === 'dreamcore'"
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40 backdrop-blur-md"
                >
                  Dreamcore
                </span>
                <span
                  v-else-if="video.niche === 'coldcore'"
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md"
                >
                  Coldcore
                </span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md"
                >
                  Ambient
                </span>
              </div>

              <!-- Duration Badge (Bottom Right) STRICT > 1 HOUR -->
              <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/85 border border-white/20 text-white font-mono text-[11px] font-bold backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-sword-accent animate-pulse"></span>
                <span>{{ video.duration }}</span>
                <span class="text-[9px] text-sword-accent font-sans px-1 rounded bg-sword-accent/20">1h+</span>
              </div>

              <!-- Hover Play Button Icon -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-12 h-12 rounded-full bg-sword-accent/90 text-black flex items-center justify-center shadow-lg shadow-sword-accent/40 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play class="w-6 h-6 ml-0.5 fill-black" />
                </div>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-4 flex-1 flex flex-col justify-between gap-3">
              <div>
                <!-- Title -->
                <h3
                  class="text-sm font-bold text-white group-hover:text-sword-accent transition-colors line-clamp-2 leading-snug cursor-pointer"
                  :title="video.title"
                  @click="playVideo(video)"
                >
                  {{ video.title }}
                </h3>

                <!-- Channel and Meta -->
                <div class="mt-2 flex items-center justify-between text-xs text-sword-muted">
                  <span class="font-medium truncate max-w-[65%]" :title="video.channelTitle">
                    {{ video.channelTitle }}
                  </span>
                  <span class="text-[11px] shrink-0 font-mono text-sword-muted">
                    {{ video.views }}
                  </span>
                </div>

                <!-- Tags -->
                <div class="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span
                    v-for="tag in (video.tags || []).slice(0, 3)"
                    :key="tag"
                    class="text-[10px] text-sword-muted/90 bg-sword-surface/80 px-1.5 py-0.5 rounded border border-sword-border/60"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Actions Bar -->
              <div class="pt-3 border-t border-sword-border/70 flex items-center justify-between gap-2">
                <!-- Play Button -->
                <BaseButton
                  variant="primary"
                  size="sm"
                  class="flex-1 text-xs font-bold py-1.5"
                  @click="playVideo(video)"
                >
                  <Play class="w-3.5 h-3.5 mr-1 fill-black" />
                  <span>Слушать Embed</span>
                </BaseButton>

                <!-- Copy Embed Link -->
                <button
                  type="button"
                  :title="copiedId === video.id ? 'Скопировано!' : 'Скопировать Embed-ссылку'"
                  class="p-2 rounded-xl bg-sword-surface/80 border border-sword-border hover:border-sword-accent/60 text-sword-muted hover:text-white transition-colors cursor-pointer"
                  @click="copyEmbedUrl(video)"
                >
                  <Check v-if="copiedId === video.id" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>

                <!-- External YouTube Link -->
                <a
                  :href="video.youtubeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Открыть оригинальное видео на YouTube"
                  class="p-2 rounded-xl bg-sword-surface/80 border border-sword-border hover:border-sword-accent/60 text-sword-muted hover:text-white transition-colors"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Interactive Embed Player Modal -->
    <div
      v-if="activeVideo"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="closePlayer"
    >
      <div class="relative w-full max-w-4xl bg-sword-surface border border-sword-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <!-- Modal Top Bar -->
        <div class="p-4 bg-sword-card/90 border-b border-sword-border flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 truncate">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            <span class="font-bold text-sm text-white truncate">
              {{ activeVideo.title }}
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Copy Embed -->
            <button
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sword-surface border border-sword-border text-sword-muted hover:text-white transition-colors"
              @click="copyEmbedUrl(activeVideo)"
            >
              <Copy class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Скопировать Embed</span>
            </button>

            <!-- Close Modal -->
            <button
              type="button"
              class="p-1.5 rounded-lg text-sword-muted hover:text-white hover:bg-sword-card transition-colors"
              @click="closePlayer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- YouTube Embed Iframe Container -->
        <div class="relative aspect-video w-full bg-black">
          <iframe
            :src="`${activeVideo.embedUrl}?autoplay=1&enablejsapi=1&rel=0`"
            :title="activeVideo.title"
            class="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>

        <!-- Modal Bottom Details & Controls -->
        <div class="p-4 bg-sword-surface border-t border-sword-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 text-xs text-sword-muted">
            <div class="flex items-center gap-1 font-bold text-sword-text">
              <Headphones class="w-4 h-4 text-sword-accent" />
              <span>{{ activeVideo.channelTitle }}</span>
            </div>
            <span>•</span>
            <div class="flex items-center gap-1 font-mono text-cyan-400">
              <Clock class="w-3.5 h-3.5" />
              <span>{{ activeVideo.duration }} (> 1ч)</span>
            </div>
            <span>•</span>
            <span>{{ activeVideo.views }}</span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <a
              :href="activeVideo.youtubeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sword-card border border-sword-border text-sword-muted hover:text-white transition-colors"
            >
              <span>Смотреть на YouTube</span>
              <ExternalLink class="w-3.5 h-3.5" />
            </a>

            <BaseButton
              variant="outline"
              size="sm"
              class="text-xs"
              @click="playNextMix"
            >
              <span>Следующий микс</span>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
