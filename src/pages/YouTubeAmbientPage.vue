<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { fetchYouTubeVideos } from '@/shared/api/youtubeService';
import { getApiBaseUrl } from '@/shared/api/reelsApi';
import { saveAs } from 'file-saver';
import type {
  YouTubeVideo,
  YouTubeNiche,
  YouTubeAnalyticsSummary,
} from '@/entities/youtube/model/types';
import { showToast } from '@/shared/lib/toast/toastService';
import BaseButton from '@/shared/ui/BaseButton.vue';
import AtmosphereChatDrawer from '@/features/atmosphere-chat/ui/AtmosphereChatDrawer.vue';
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
  RefreshCw,
  Layers,
  Radio,
  Snowflake,
  Eye,
  Activity,
  Disc,
  ArrowDown,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Download,
  Bot,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Hash,
  Bookmark,
  BookmarkCheck,
} from 'lucide-vue-next';
import { useYouTubeFavoritesStore } from '@/entities/youtube/model/youtubeFavoritesStore';

const favoritesStore = useYouTubeFavoritesStore();

// Search & filter state
const searchQuery = ref('');
const selectedNiche = ref<YouTubeNiche>('all');
const activeHashtag = ref<string>('');

// Data state (strictly from server, no static/local video lists)
const videos = ref<YouTubeVideo[]>([]);
const analytics = ref<YouTubeAnalyticsSummary | null>(null);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const serverError = ref<string | null>(null);

// Pagination & lazy loading (пролистывание)
const currentPage = ref(1);
const hasMore = ref(true);
const loadMoreError = ref<string | null>(null);
const bottomSentinelRef = ref<HTMLElement | null>(null);
let scrollObserver: IntersectionObserver | null = null;

// Auto-refresh state (автообновление)
const isAutoRefreshEnabled = ref(true);
const AUTO_REFRESH_INTERVAL_SEC = 45;
const secondsLeft = ref(AUTO_REFRESH_INTERVAL_SEC);
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;

// Active playing video modal
const activeVideo = ref<YouTubeVideo | null>(null);
const copiedId = ref<string | null>(null);
const isDownloadingPreview = ref(false);
const isChatOpen = ref(false);

// Niche definition tabs
const nicheTabs: { id: YouTubeNiche; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Все направления', icon: Layers, color: 'text-sword-accent' },
  { id: 'ambient', label: 'Ambient', icon: Disc, color: 'text-emerald-400' },
  { id: 'dreamcore', label: 'Dreamcore', icon: Eye, color: 'text-purple-400' },
  { id: 'coldcore', label: 'Coldcore', icon: Snowflake, color: 'text-cyan-400' },
];

// Full list of 42 search hashtags requested by user (individually selectable & searchable)
const allHashtags = [
  '#ambient',
  '#dreamcore',
  '#weirdcore',
  '#nostalgiacore',
  '#miinstronaut',
  '#liminalspace',
  '#coldcore',
  '#haunting',
  '#ambientmusic',
  '#album',
  '#playlist',
  '#kidcore',
  '#nostalgia',
  '#retroaesthetic',
  '#chillmix',
  '#sleepmusic',
  '#studymusic',
  '#dreamcoreaesthetic',
  '#studyplaylist',
  '#relaxingmusic',
  '#calmingmusic',
  '#trending',
  '#darkambient',
  '#snowstorm',
  '#snowambience',
  '#blizzardambience',
  '#winterstorm',
  '#calm',
  '#relax',
  '#snowfall',
  '#dreamscore',
  '#calmmusic',
  '#meditation',
  '#aesthetic',
  '#vaporwave',
  '#wintermix',
  '#nightambience',
  '#snowyambience',
  '#wintervibes',
  '#coldnightmix',
  '#darkmusic',
  '#aestheticplaylist',
];

const selectedHashtagCategory = ref<'all' | 'dreamcore' | 'coldcore' | 'ambient'>('all');
const isHashtagsExpanded = ref(false);

const dreamcoreTags = [
  '#dreamcore',
  '#weirdcore',
  '#nostalgiacore',
  '#miinstronaut',
  '#liminalspace',
  '#kidcore',
  '#nostalgia',
  '#retroaesthetic',
  '#dreamcoreaesthetic',
  '#dreamscore',
  '#vaporwave',
  '#aesthetic',
  '#aestheticplaylist',
];

const coldcoreTags = [
  '#coldcore',
  '#haunting',
  '#snowstorm',
  '#snowambience',
  '#blizzardambience',
  '#winterstorm',
  '#snowfall',
  '#wintermix',
  '#nightambience',
  '#snowyambience',
  '#wintervibes',
  '#coldnightmix',
  '#darkmusic',
];

const ambientTags = [
  '#ambient',
  '#ambientmusic',
  '#chillmix',
  '#sleepmusic',
  '#studymusic',
  '#studyplaylist',
  '#relaxingmusic',
  '#calmingmusic',
  '#calm',
  '#relax',
  '#calmmusic',
  '#meditation',
  '#darkambient',
  '#trending',
  '#album',
  '#playlist',
];

const filteredHashtags = computed(() => {
  if (selectedHashtagCategory.value === 'dreamcore') return dreamcoreTags;
  if (selectedHashtagCategory.value === 'coldcore') return coldcoreTags;
  if (selectedHashtagCategory.value === 'ambient') return ambientTags;
  return allHashtags;
});

const displayedHashtags = computed(() => {
  if (isHashtagsExpanded.value) {
    return filteredHashtags.value;
  }
  return filteredHashtags.value.slice(0, 15);
});

// Recompute analytics from loaded videos
function updateLocalAnalytics() {
  const strictList = videos.value.filter((v) => v.durationSeconds >= 1800);
  const totalSeconds = strictList.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
  const avgSeconds = strictList.length > 0 ? Math.round(totalSeconds / strictList.length) : 0;

  const formatSec = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  analytics.value = {
    totalVideos: strictList.length,
    strictConstraint: 'duration >= 30 min (1800s)',
    totalDurationFormatted: formatSec(totalSeconds),
    avgDurationFormatted: formatSec(avgSeconds),
    nichesCount: {
      ambient: strictList.filter((v) => v.niche === 'ambient').length,
      dreamcore: strictList.filter((v) => v.niche === 'dreamcore').length,
      coldcore: strictList.filter((v) => v.niche === 'coldcore').length,
    },
    source: 'live-server-api',
  };
}

/**
 * Loads the initial batch of videos from the server
 */
async function loadVideos(niche = selectedNiche.value, query = searchQuery.value, isRefresh = false) {
  isLoading.value = true;
  serverError.value = null;
  currentPage.value = 1;
  hasMore.value = true;

  try {
    const res = await fetchYouTubeVideos({
      query: query.trim(),
      niche,
      limit: 20,
      page: 1,
      refresh: isRefresh,
    });

    // Ensure all items strictly satisfy durationSeconds >= 1800
    const filtered = (res.items || []).filter((v) => v.durationSeconds >= 1800);
    videos.value = filtered;

    if (res.analytics) {
      analytics.value = res.analytics;
    } else {
      updateLocalAnalytics();
    }

    if (filtered.length === 0) {
      hasMore.value = false;
    }

    // Reset countdown timer on successful refresh
    secondsLeft.value = AUTO_REFRESH_INTERVAL_SEC;
  } catch (err: any) {
    const msg = err?.message || 'Не удалось связаться с сервером YouTube API';
    serverError.value = msg;
    showToast({
      message: `Ошибка получения данных с сервера: ${msg}`,
      type: 'error',
    });
  } finally {
    isLoading.value = false;
  }
}

/**
 * Lazy loading (пролистывание): fetches the next page/batch from the server and appends to feed
 */
async function loadMoreVideos() {
  if (isLoading.value || isLoadingMore.value || !hasMore.value) return;

  isLoadingMore.value = true;
  loadMoreError.value = null;
  const nextPage = currentPage.value + 1;

  try {
    const res = await fetchYouTubeVideos({
      query: searchQuery.value.trim(),
      niche: selectedNiche.value,
      limit: 16,
      page: nextPage,
    });

    const newItems = (res.items || []).filter((v) => v.durationSeconds >= 1800);

    if (newItems.length === 0) {
      if (nextPage < 10) {
        // Try skipping forward to next variation if current page returned 0
        currentPage.value = nextPage;
      } else {
        hasMore.value = false;
      }
    } else {
      currentPage.value = nextPage;
      // Deduplicate by ID before appending
      const existingIds = new Set(videos.value.map((v) => v.id));
      const uniqueNewItems = newItems.filter((v) => !existingIds.has(v.id));

      if (uniqueNewItems.length > 0) {
        videos.value.push(...uniqueNewItems);
        updateLocalAnalytics();
      }

      // Check server hasMore or allow up to 25 pages
      if (res.hasMore !== undefined) {
        hasMore.value = res.hasMore;
      } else {
        hasMore.value = nextPage < 25;
      }
    }
  } catch (err: any) {
    loadMoreError.value = err?.message || 'Не удалось подгрузить следующие видео';
  } finally {
    isLoadingMore.value = false;
  }
}

// Setup IntersectionObserver for bottom-of-page sentinel
function setupScrollObserver() {
  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }

  if (typeof window === 'undefined') return;

  scrollObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        loadMoreVideos();
      }
    },
    {
      root: null,
      rootMargin: '600px', // start loading 600px before reaching the bottom
      threshold: 0,
    }
  );

  if (bottomSentinelRef.value) {
    scrollObserver.observe(bottomSentinelRef.value);
  }
}

// Window scroll fallback listener to guarantee infinite scroll triggers smoothly on all screens
function onWindowScroll() {
  if (isLoading.value || isLoadingMore.value || !hasMore.value) return;
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const clientHeight = window.innerHeight || document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 700) {
    loadMoreVideos();
  }
}

// Auto-refresh interval management
function startAutoRefreshTimer() {
  stopAutoRefreshTimer();
  secondsLeft.value = AUTO_REFRESH_INTERVAL_SEC;

  autoRefreshTimer = setInterval(() => {
    if (!isAutoRefreshEnabled.value || isLoading.value) return;

    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0) {
      secondsLeft.value = AUTO_REFRESH_INTERVAL_SEC;
      // Trigger live refresh from server
      loadVideos(selectedNiche.value, searchQuery.value, true);
    }
  }, 1000);
}

function stopAutoRefreshTimer() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

function toggleAutoRefresh() {
  isAutoRefreshEnabled.value = !isAutoRefreshEnabled.value;
  if (isAutoRefreshEnabled.value) {
    secondsLeft.value = AUTO_REFRESH_INTERVAL_SEC;
    showToast({
      message: `Автообновление включено (${AUTO_REFRESH_INTERVAL_SEC}с)`,
      type: 'info',
    });
  } else {
    showToast({
      message: 'Автообновление приостановлено',
      type: 'info',
    });
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

function triggerManualRefresh() {
  loadVideos(selectedNiche.value, searchQuery.value, true);
}

function playVideo(video: YouTubeVideo) {
  activeVideo.value = video;
}

function closePlayer() {
  activeVideo.value = null;
  isChatOpen.value = false;
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

/**
 * Downloads the video preview thumbnail image (HD maxresdefault with hqdefault fallback)
 */
async function downloadPreview(video: YouTubeVideo | null) {
  if (!video || !video.id || isDownloadingPreview.value) return;

  isDownloadingPreview.value = true;
  const fileName = `youtube-preview-${video.id}.jpg`;
  const base = getApiBaseUrl();

  showToast({
    message: 'Скачивание превью видео...',
    type: 'info',
    duration: 2500,
  });

  try {
    let blob: Blob | null = null;

    // 1. Try server proxy endpoint (bypasses any ISP blocks or CORS issues)
    if (base) {
      try {
        const res = await fetch(`${base}/api/youtube/thumbnail?id=${video.id}&quality=maxres`, {
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          blob = await res.blob();
        }
      } catch {
        // Fallback to client fetch
      }
    }

    // 2. Direct client fetch fallback
    if (!blob) {
      const directCandidates = [
        `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
        video.thumbnailUrl,
        `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      ];

      for (const url of directCandidates) {
        if (!url) continue;
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
          if (res.ok) {
            const tempBlob = await res.blob();
            if (tempBlob.size > 1500 || directCandidates.indexOf(url) === directCandidates.length - 1) {
              blob = tempBlob;
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }

    if (blob && blob.size > 500) {
      saveAs(blob, fileName);
      showToast({
        message: 'Превью успешно скачано!',
        type: 'success',
      });
      return;
    }

    // 3. Fallback direct anchor download
    const anchor = document.createElement('a');
    anchor.href = video.thumbnailUrl;
    anchor.download = fileName;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    showToast({
      message: 'Превью открыто для сохранения',
      type: 'success',
    });
  } catch (err: any) {
    showToast({
      message: `Ошибка скачивания превью: ${err?.message || 'Попробуйте позже'}`,
      type: 'error',
    });
  } finally {
    isDownloadingPreview.value = false;
  }
}

// Play next mix
function playNextMix() {
  if (!activeVideo.value || videos.value.length <= 1) return;
  const currentIndex = videos.value.findIndex((v) => v.id === activeVideo.value?.id);
  const nextIndex = (currentIndex + 1) % videos.value.length;
  activeVideo.value = videos.value[nextIndex];
}

watch(bottomSentinelRef, () => {
  setupScrollObserver();
});

onMounted(() => {
  loadVideos();
  startAutoRefreshTimer();
  setupScrollObserver();
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', onWindowScroll, { passive: true });
  }
});

onUnmounted(() => {
  stopAutoRefreshTimer();
  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onWindowScroll);
  }
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
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sword-card/90 border border-sword-border text-xs text-sword-muted flex-wrap">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-semibold text-sword-text">Live YouTube Stream</span>
              <span class="text-sword-border">•</span>
              <span class="text-cyan-400 font-mono font-medium">Только видео &ge; 30:00</span>
              <span class="text-sword-border">•</span>
              <span class="text-purple-400 font-mono text-[11px]">Lazy-Loading включен</span>
            </div>

            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Ambient</span>
              <span class="text-sword-muted/40 font-light">•</span>
              <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dreamcore</span>
              <span class="text-sword-muted/40 font-light">•</span>
              <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Coldcore</span>
            </h1>

            <p class="text-sm sm:text-base text-sword-muted max-w-2xl leading-relaxed">
              Динамический поиск и аналитика полноформатных сетов с серверов YouTube в реальном времени.
              При пролистывании автоматически подгружаются новые ссылки и превью, все миксы <strong class="text-sword-text">минимум от 30 минут</strong>.
            </p>
          </div>

          <!-- Controls: Auto-refresh & Strict Filter Badge -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <!-- Link to Favorites Page -->
            <router-link
              to="/youtube/favorites"
              class="bg-sword-card/90 border border-sword-border/90 hover:border-sword-accent/60 p-3 rounded-2xl flex items-center justify-between sm:justify-start gap-3 shadow-xl backdrop-blur-sm transition-all group cursor-pointer"
              title="Перейти в Избранные видео"
            >
              <div class="w-8 h-8 rounded-xl bg-sword-accent/15 border border-sword-accent/30 flex items-center justify-center text-sword-accent group-hover:scale-105 transition-transform shrink-0">
                <Bookmark class="w-4 h-4 fill-sword-accent" />
              </div>
              <div class="text-left">
                <div class="text-xs font-bold text-sword-text flex items-center gap-1.5">
                  <span>Избранное</span>
                  <span
                    v-if="favoritesStore.count > 0"
                    class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sword-accent text-black font-extrabold"
                  >
                    {{ favoritesStore.count }}
                  </span>
                </div>
                <div class="text-[11px] text-sword-muted">
                  {{ favoritesStore.count > 0 ? `${favoritesStore.count} видео в списке` : 'Сохранённые видео' }}
                </div>
              </div>
            </router-link>

            <!-- Auto-refresh Controller Panel -->
            <div class="bg-sword-card/90 border border-sword-border/90 p-3 rounded-2xl flex items-center justify-between sm:justify-start gap-3 shadow-xl backdrop-blur-sm">
              <button
                type="button"
                class="flex items-center gap-2 cursor-pointer text-left"
                title="Переключить автообновление ленты"
                @click="toggleAutoRefresh"
              >
                <component
                  :is="isAutoRefreshEnabled ? ToggleRight : ToggleLeft"
                  :class="['w-7 h-7 transition-colors', isAutoRefreshEnabled ? 'text-emerald-400' : 'text-sword-muted']"
                />
                <div>
                  <div class="text-xs font-bold text-sword-text flex items-center gap-1.5">
                    <span>Автообновление</span>
                    <span
                      v-if="isAutoRefreshEnabled"
                      class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-semibold"
                    >
                      {{ secondsLeft }}с
                    </span>
                  </div>
                  <div class="text-[11px] text-sword-muted">
                    {{ isAutoRefreshEnabled ? 'Свежие ссылки каждые 45с' : 'Приостановлено' }}
                  </div>
                </div>
              </button>

              <button
                type="button"
                :disabled="isLoading"
                title="Обновить сейчас с сервера"
                class="p-2 rounded-xl bg-sword-surface border border-sword-border hover:border-sword-accent/60 text-sword-muted hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                @click="triggerManualRefresh"
              >
                <RefreshCw :class="['w-4 h-4', isLoading ? 'animate-spin text-sword-accent' : '']" />
              </button>
            </div>

            <!-- Strict Duration Badge Indicator -->
            <div class="flex items-center gap-3 bg-sword-card/80 border border-sword-border/90 p-3 rounded-2xl shadow-xl backdrop-blur-sm">
              <div class="w-9 h-9 rounded-xl bg-sword-accent/10 border border-sword-accent/30 flex items-center justify-center text-sword-accent shrink-0">
                <Clock class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-bold text-sword-text flex items-center gap-1.5">
                  <span>Фильтр длительности</span>
                  <span class="px-1.5 py-0.2 rounded bg-sword-accent/20 text-sword-accent text-[10px] font-mono">30m+</span>
                </div>
                <div class="text-[11px] text-sword-muted">
                  &lt; 30 мин отсеиваются
                </div>
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
              <span>Найти</span>
            </BaseButton>
          </form>
        </div>

        <!-- Quick Hashtags Bar with 42 target hashtags -->
        <div class="mt-5 pt-4 border-t border-sword-border/40 space-y-2.5">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-sword-muted text-[11px] font-semibold flex items-center gap-1">
                <Hash class="w-3.5 h-3.5 text-sword-accent" />
                <span>Хэштеги поиска ({{ allHashtags.length }}):</span>
              </span>

              <!-- Category filter pills -->
              <div class="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  :class="[
                    'px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer',
                    selectedHashtagCategory === 'all'
                      ? 'bg-sword-card text-white border border-sword-accent/50'
                      : 'text-sword-muted hover:text-white bg-sword-surface/50'
                  ]"
                  @click="selectedHashtagCategory = 'all'"
                >
                  Все ({{ allHashtags.length }})
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer',
                    selectedHashtagCategory === 'dreamcore'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-sword-muted hover:text-purple-300 bg-sword-surface/50'
                  ]"
                  @click="selectedHashtagCategory = 'dreamcore'"
                >
                  Dreamcore & Liminal ({{ dreamcoreTags.length }})
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer',
                    selectedHashtagCategory === 'coldcore'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-sword-muted hover:text-cyan-300 bg-sword-surface/50'
                  ]"
                  @click="selectedHashtagCategory = 'coldcore'"
                >
                  Coldcore & Зима ({{ coldcoreTags.length }})
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer',
                    selectedHashtagCategory === 'ambient'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-sword-muted hover:text-emerald-300 bg-sword-surface/50'
                  ]"
                  @click="selectedHashtagCategory = 'ambient'"
                >
                  Ambient & Релакс ({{ ambientTags.length }})
                </button>
              </div>
            </div>

            <!-- Active Tag Indicator & Reset -->
            <div v-if="activeHashtag" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sword-accent/20 border border-sword-accent/40 text-sword-accent text-[11px] font-semibold animate-fade-in">
              <span>Активен: {{ activeHashtag }}</span>
              <button
                type="button"
                class="hover:text-white transition-colors cursor-pointer ml-1"
                title="Сбросить хэштег"
                @click="onSelectTag(activeHashtag)"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Tags List -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="tag in displayedHashtags"
              :key="tag"
              type="button"
              :class="[
                'px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border',
                activeHashtag === tag
                  ? 'bg-sword-accent text-black border-sword-accent font-bold shadow-sm shadow-sword-accent/20'
                  : 'bg-sword-surface/50 text-sword-muted hover:text-sword-text border-sword-border/60 hover:border-sword-accent/50 hover:bg-sword-card'
              ]"
              :title="`Искать видео по хэштегу ${tag}`"
              @click="onSelectTag(tag)"
            >
              {{ tag }}
            </button>

            <!-- Toggle Expand / Collapse button -->
            <button
              v-if="filteredHashtags.length > 15"
              type="button"
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-sword-muted hover:text-white bg-sword-card/60 hover:bg-sword-card border border-sword-border/60 transition-colors cursor-pointer"
              @click="isHashtagsExpanded = !isHashtagsExpanded"
            >
              <component :is="isHashtagsExpanded ? ChevronUp : ChevronDown" class="w-3 h-3" />
              <span>{{ isHashtagsExpanded ? 'Свернуть' : `Все ${filteredHashtags.length}` }}</span>
            </button>
          </div>
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
            <span class="text-xs font-semibold">Собрано сетов (&ge; 30м)</span>
            <Tv class="w-4 h-4 text-sword-accent" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white">
            {{ analytics.totalVideos }}
          </div>
          <div class="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <span>✓</span> Все хронометражем &ge; 30 мин
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

      <!-- Server Error Alert Banner -->
      <div
        v-if="serverError"
        class="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 flex items-start justify-between gap-3 text-amber-200 text-xs"
      >
        <div class="flex items-start gap-2.5">
          <AlertCircle class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div class="font-bold text-amber-300">Сервер временно недоступен или перезагружается</div>
            <div class="text-[11px] text-amber-200/80 mt-0.5">{{ serverError }}</div>
          </div>
        </div>
        <BaseButton
          variant="outline"
          size="sm"
          class="shrink-0 text-xs"
          @click="loadVideos(selectedNiche, searchQuery, true)"
        >
          Повторить попытку
        </BaseButton>
      </div>

      <!-- Video Feed Grid Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-white">
              Подборка YouTube Embed (Длительность &ge; 30:00)
            </h2>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-sword-card text-sword-accent border border-sword-border">
              {{ videos.length }} видео
            </span>
          </div>

          <div v-if="isLoading" class="flex items-center gap-2 text-xs text-sword-muted">
            <RefreshCw class="w-3.5 h-3.5 animate-spin text-sword-accent" />
            <span>Запрос к серверу YouTube...</span>
          </div>
        </div>

        <!-- Initial Loading Skeleton -->
        <div
          v-if="isLoading && videos.length === 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="bg-sword-card/50 border border-sword-border/60 rounded-2xl overflow-hidden animate-pulse flex flex-col h-72"
          >
            <div class="aspect-video w-full bg-sword-surface/80"></div>
            <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div class="space-y-2">
                <div class="h-4 bg-sword-surface/90 rounded w-3/4"></div>
                <div class="h-3 bg-sword-surface/60 rounded w-1/2"></div>
              </div>
              <div class="h-8 bg-sword-surface/80 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!isLoading && videos.length === 0"
          class="bg-sword-card/40 border border-dashed border-sword-border rounded-2xl p-12 text-center"
        >
          <Tv class="w-12 h-12 text-sword-muted mx-auto mb-3" />
          <h3 class="text-base font-bold text-white mb-1">
            Видео длительностью от 30 минут не найдены
          </h3>
          <p class="text-xs text-sword-muted max-w-md mx-auto mb-4">
            Попробуйте изменить поисковый запрос, переключиться на другое направление или запустить автообновление.
          </p>
          <div class="flex items-center justify-center gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              @click="searchQuery = ''; selectedNiche = 'all'; loadVideos('all', '', true)"
            >
              Сбросить фильтры
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              @click="loadVideos(selectedNiche, searchQuery, true)"
            >
              Обновить с сервера
            </BaseButton>
          </div>
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

              <!-- Favorite Bookmark Button (Top Right) -->
              <button
                type="button"
                class="absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all z-10 cursor-pointer shadow-sm border"
                :class="
                  favoritesStore.isFavorite(video.id)
                    ? 'bg-sword-accent/30 text-sword-accent border-sword-accent/60 shadow-sword-accent/20'
                    : 'bg-black/60 hover:bg-black/80 text-white/70 hover:text-white border-white/20 hover:border-sword-accent/50'
                "
                :title="favoritesStore.isFavorite(video.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                @click.stop="favoritesStore.toggleFavorite(video)"
              >
                <BookmarkCheck v-if="favoritesStore.isFavorite(video.id)" class="w-3.5 h-3.5 fill-sword-accent text-sword-accent" />
                <Bookmark v-else class="w-3.5 h-3.5" />
              </button>

              <!-- Duration Badge (Bottom Right) STRICT >= 30 MIN -->
              <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/85 border border-white/20 text-white font-mono text-[11px] font-bold backdrop-blur-md">
                <span class="w-1.5 h-1.5 rounded-full bg-sword-accent animate-pulse"></span>
                <span>{{ video.duration }}</span>
                <span class="text-[9px] text-sword-accent font-sans px-1 rounded bg-sword-accent/20">{{ video.durationSeconds >= 3600 ? '1h+' : '30m+' }}</span>
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
                  <button
                    v-for="tag in (video.tags || []).slice(0, 4)"
                    :key="tag"
                    type="button"
                    class="text-[10px] text-sword-muted/90 bg-sword-surface/80 hover:bg-sword-card px-1.5 py-0.5 rounded border border-sword-border/60 hover:border-sword-accent/60 hover:text-white transition-colors cursor-pointer"
                    :title="`Искать видео по хэштегу ${tag}`"
                    @click.stop="onSelectTag(tag)"
                  >
                    {{ tag }}
                  </button>
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

                <!-- Favorite Bookmark Button -->
                <button
                  type="button"
                  :title="favoritesStore.isFavorite(video.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                  class="p-2 rounded-xl border transition-all cursor-pointer"
                  :class="
                    favoritesStore.isFavorite(video.id)
                      ? 'bg-sword-accent/20 text-sword-accent border-sword-accent/50 shadow-sm'
                      : 'bg-sword-surface/80 border-sword-border hover:border-sword-accent/60 text-sword-muted hover:text-white'
                  "
                  @click.stop="favoritesStore.toggleFavorite(video)"
                >
                  <BookmarkCheck v-if="favoritesStore.isFavorite(video.id)" class="w-3.5 h-3.5 fill-sword-accent text-sword-accent" />
                  <Bookmark v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Lazy Loading Sentinel & Indicator (Пролистывание) -->
        <div
          ref="bottomSentinelRef"
          class="mt-10 py-8 flex flex-col items-center justify-center gap-3"
        >
          <!-- Loading More Indicator -->
          <div
            v-if="isLoadingMore"
            class="flex items-center gap-3 px-5 py-2.5 rounded-full bg-sword-card/90 border border-sword-accent/40 text-xs text-white shadow-xl animate-pulse backdrop-blur-sm"
          >
            <RefreshCw class="w-4 h-4 animate-spin text-sword-accent" />
            <span>Подгрузка новых видео с YouTube (от 30 минут)...</span>
          </div>

          <!-- Error with Retry button -->
          <div
            v-else-if="loadMoreError"
            class="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-amber-950/60 border border-amber-600/40 text-xs text-amber-200 shadow-md"
          >
            <AlertCircle class="w-4 h-4 text-amber-400 shrink-0" />
            <span>{{ loadMoreError }}</span>
            <button
              type="button"
              class="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition-colors cursor-pointer"
              @click="loadMoreVideos"
            >
              Повторить
            </button>
          </div>

          <!-- Has More Button / Indicator -->
          <div
            v-else-if="videos.length > 0 && hasMore"
            class="flex flex-col items-center gap-2"
          >
            <button
              type="button"
              class="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-sword-card/90 border border-sword-border hover:border-sword-accent text-xs font-semibold text-sword-muted hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-sword-accent/10"
              @click="loadMoreVideos"
            >
              <ArrowDown class="w-4 h-4 text-sword-accent group-hover:translate-y-0.5 transition-transform" />
              <span>Пролистайте вниз или нажмите для загрузки ещё</span>
              <span class="px-2 py-0.5 rounded-full bg-sword-surface text-[10px] text-sword-muted">
                Стр. {{ currentPage }}
              </span>
            </button>
            <span class="text-[11px] text-sword-muted/60">
              Показано {{ videos.length }} миксов (> 1ч)
            </span>
          </div>

          <!-- All Loaded -->
          <div
            v-else-if="videos.length > 0 && !hasMore"
            class="text-xs text-sword-muted/70 font-mono py-3 flex items-center gap-2"
          >
            <span class="text-emerald-400">✓</span>
            <span>Все доступные сеты (> 1ч) по текущему запросу загружены (всего {{ videos.length }})</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Interactive Embed Player Modal -->
    <div
      v-if="activeVideo"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      @click.self="closePlayer"
    >
      <div
        class="relative w-full bg-sword-surface border border-sword-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] transition-all duration-300"
        :class="isChatOpen ? 'max-w-6xl' : 'max-w-4xl'"
      >
        <!-- Modal Top Bar -->
        <div class="p-4 bg-sword-card/90 border-b border-sword-border flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 truncate">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            <span class="font-bold text-sm text-white truncate">
              {{ activeVideo.title }}
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Toggle LLaVA Atmosphere Vision Chat -->
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
              :class="
                isChatOpen
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30'
                  : 'bg-sword-surface hover:bg-purple-500/10 border-sword-border hover:border-purple-500/50 text-sword-muted hover:text-purple-300'
              "
              title="Анализ атмосферы превью через LLaVA 1.5 7B"
              @click="isChatOpen = !isChatOpen"
            >
              <Sparkles class="w-3.5 h-3.5" :class="isChatOpen ? 'text-white' : 'text-purple-400'" />
              <span class="hidden sm:inline">Атмосфера AI</span>
              <span class="px-1 py-0.2 rounded bg-purple-500/20 text-[9px] font-mono border border-purple-500/30">LLaVA</span>
            </button>

            <!-- Toggle Favorite Button -->
            <button
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
              :class="
                favoritesStore.isFavorite(activeVideo.id)
                  ? 'bg-sword-accent/20 text-sword-accent border-sword-accent/50 shadow-sm'
                  : 'bg-sword-surface hover:bg-sword-card border-sword-border text-sword-muted hover:text-white'
              "
              :title="favoritesStore.isFavorite(activeVideo.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
              @click="favoritesStore.toggleFavorite(activeVideo)"
            >
              <BookmarkCheck v-if="favoritesStore.isFavorite(activeVideo.id)" class="w-3.5 h-3.5 fill-sword-accent text-sword-accent" />
              <Bookmark v-else class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ favoritesStore.isFavorite(activeVideo.id) ? 'В избранном' : 'В избранное' }}</span>
            </button>

            <!-- Download Preview -->
            <button
              type="button"
              :disabled="isDownloadingPreview"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sword-surface border border-sword-border hover:border-sword-accent/50 text-sword-muted hover:text-sword-accent transition-all cursor-pointer disabled:opacity-50"
              title="Скачать обложку / превью видео"
              @click="downloadPreview(activeVideo)"
            >
              <RefreshCw v-if="isDownloadingPreview" class="w-3.5 h-3.5 animate-spin text-sword-accent" />
              <Download v-else class="w-3.5 h-3.5 text-sword-accent" />
              <span class="hidden sm:inline">Скачать превью</span>
            </button>

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

        <!-- Modal Content (Player + Optional Side Chat) -->
        <div class="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          <!-- Left Column (Video Player + Controls) -->
          <div class="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0">
            <!-- YouTube Embed Iframe Container -->
            <div class="relative aspect-video w-full bg-black shrink-0">
              <iframe
                :src="`${activeVideo.embedUrl}?autoplay=1&enablejsapi=1&rel=0`"
                :title="activeVideo.title"
                class="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Invitation Callout Banner to Analyze Atmosphere (if chat is closed) -->
            <div
              v-if="!isChatOpen"
              class="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-sword-card to-sword-card border border-purple-500/30 flex items-center justify-between gap-3 text-xs animate-fade-in"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bot class="w-4 h-4 text-purple-400" />
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-white flex items-center gap-1.5">
                    <span>ИИ-анализ атмосферы видео</span>
                    <span class="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono">llava-1.5-7b</span>
                  </div>
                  <div class="text-sword-muted text-[11px] truncate">
                    Узнайте, какое настроение, свет, эстетику и звуковой резонанс передает превью сета
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shrink-0 cursor-pointer shadow-md hover:shadow-purple-500/25"
                @click="isChatOpen = true"
              >
                <Sparkles class="w-3.5 h-3.5" />
                <span>Открыть чат</span>
              </button>
            </div>

            <!-- Modal Bottom Details & Controls -->
            <div class="p-3 sm:p-4 bg-sword-surface border-t border-sword-border mt-auto flex flex-col gap-2.5">
              <!-- Video Metadata Row -->
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-sword-muted">
                <div class="flex items-center gap-1.5 font-bold text-sword-text min-w-0">
                  <Headphones class="w-4 h-4 text-sword-accent shrink-0" />
                  <span class="truncate max-w-[280px] sm:max-w-md" :title="activeVideo.channelTitle">{{ activeVideo.channelTitle }}</span>
                </div>
                <div class="flex items-center gap-2 font-mono text-cyan-400 shrink-0 text-xs">
                  <div class="flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5" />
                    <span>{{ activeVideo.duration }} ({{ (activeVideo.durationSeconds || 0) >= 3600 ? '&gt; 1ч' : '&ge; 30м' }})</span>
                  </div>
                  <span class="text-sword-border">•</span>
                  <span class="text-sword-muted">{{ activeVideo.views }}</span>
                </div>
              </div>

              <!-- Action Buttons Row (wraps cleanly to next line without horizontal scroll) -->
              <div class="flex flex-wrap items-center gap-2 w-full pt-1.5 border-t border-sword-border/40">
                <!-- Toggle Favorite Button -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0"
                  :class="
                    favoritesStore.isFavorite(activeVideo.id)
                      ? 'bg-sword-accent/20 text-sword-accent border-sword-accent/50 shadow-sm'
                      : 'bg-sword-card hover:bg-sword-surface border-sword-border text-sword-muted hover:text-white'
                  "
                  :title="favoritesStore.isFavorite(activeVideo.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                  @click="favoritesStore.toggleFavorite(activeVideo)"
                >
                  <BookmarkCheck v-if="favoritesStore.isFavorite(activeVideo.id)" class="w-3.5 h-3.5 fill-sword-accent text-sword-accent" />
                  <Bookmark v-else class="w-3.5 h-3.5" />
                  <span>{{ favoritesStore.isFavorite(activeVideo.id) ? 'В избранном' : 'В избранное' }}</span>
                </button>

                <!-- Open Chat Button in controls -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0"
                  :class="isChatOpen ? 'bg-purple-600 text-white border-purple-400' : 'bg-sword-card hover:bg-purple-500/10 border-sword-border text-sword-muted hover:text-purple-300'"
                  @click="isChatOpen = !isChatOpen"
                >
                  <MessageSquare class="w-3.5 h-3.5" />
                  <span>Чат LLaVA</span>
                </button>

                <!-- Download Preview HD Button -->
                <button
                  type="button"
                  :disabled="isDownloadingPreview"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sword-card hover:bg-sword-card/80 border border-sword-border hover:border-sword-accent/50 text-sword-muted hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  title="Скачать превью видео в максимальном разрешении"
                  @click="downloadPreview(activeVideo)"
                >
                  <RefreshCw v-if="isDownloadingPreview" class="w-3.5 h-3.5 animate-spin text-sword-accent" />
                  <Download v-else class="w-3.5 h-3.5 text-sword-accent" />
                  <span>Скачать превью</span>
                </button>

                <a
                  :href="activeVideo.youtubeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sword-card border border-sword-border text-sword-muted hover:text-white transition-colors shrink-0"
                >
                  <span>Смотреть на YouTube</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>

                <BaseButton
                  variant="outline"
                  size="sm"
                  class="text-xs shrink-0 sm:ml-auto"
                  @click="playNextMix"
                >
                  <span>Следующий микс</span>
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Right Side Chat Column (LLaVA 1.5 7B Vision) -->
          <div
            v-if="isChatOpen"
            class="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-sword-border h-[460px] lg:h-auto flex flex-col"
          >
            <AtmosphereChatDrawer
              :video="activeVideo"
              :is-open="isChatOpen"
              @close="isChatOpen = false"
            />
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
