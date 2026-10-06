import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Reel, Niche, SortBy, Platform } from './types';
import { INITIAL_REELS, simulateRealtimeTick } from './mockData';

export const useReelsStore = defineStore('reels', () => {
  // State
  const reels = ref<Reel[]>([...INITIAL_REELS]);
  const searchQuery = ref('');
  const selectedNiche = ref<Niche>('all');
  const sortBy = ref<SortBy>('rank');
  const selectedPlatform = ref<'all' | Platform>('all');

  // Real-time synchronization state (2-minute intervals)
  const SYNC_INTERVAL_SECONDS = 120;
  const countdown = ref(SYNC_INTERVAL_SECONDS);
  const isLiveSyncing = ref(true);
  const isRefreshing = ref(false);
  const lastSyncTime = ref(new Date().toISOString());
  let timerId: number | null = null;

  // Modals state
  const activeReelDetail = ref<Reel | null>(null);
  const isExportModalOpen = ref(false);

  // Sorting helper
  function sortReels(items: Reel[], criteria: SortBy): Reel[] {
    const copy = [...items];
    switch (criteria) {
      case 'views':
        return copy.sort((a, b) => b.metrics.views - a.metrics.views);
      case 'velocity':
        return copy.sort((a, b) => b.metrics.velocityScore - a.metrics.velocityScore);
      case 'engagement':
        return copy.sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);
      case 'recent':
        return copy.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case 'rank':
      default:
        return copy.sort((a, b) => a.trendingRank - b.trendingRank);
    }
  }

  // Getters
  const filteredReels = computed(() => {
    let result = reels.value;

    // Platform filter
    if (selectedPlatform.value !== 'all') {
      result = result.filter((r) => r.platform === selectedPlatform.value);
    }

    // Niche filter
    if (selectedNiche.value !== 'all') {
      result = result.filter((r) => r.niche === selectedNiche.value);
    }

    // Search query filter (matches title, description, author, hashtags, audio)
    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
      result = result.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.authorUsername.toLowerCase().includes(q) ||
          r.soundTitle.toLowerCase().includes(q) ||
          r.hashtags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
    }

    return sortReels(result, sortBy.value);
  });

  const tiktokReels = computed(() => {
    const list = filteredReels.value.filter((r) => r.platform === 'tiktok');
    return sortReels(list, sortBy.value);
  });

  const instagramReels = computed(() => {
    const list = filteredReels.value.filter((r) => r.platform === 'instagram');
    return sortReels(list, sortBy.value);
  });

  // Global metrics summary
  const summaryMetrics = computed(() => {
    const list = filteredReels.value;
    if (list.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        avgEngagement: 0,
        topGrowth: 0,
        totalItems: 0,
      };
    }

    const totalViews = list.reduce((acc, r) => acc + r.metrics.views, 0);
    const totalLikes = list.reduce((acc, r) => acc + r.metrics.likes, 0);
    const sumER = list.reduce((acc, r) => acc + r.metrics.engagementRate, 0);
    const avgEngagement = parseFloat((sumER / list.length).toFixed(1));
    const maxVelocity = Math.max(...list.map((r) => r.metrics.velocityScore));

    return {
      totalViews,
      totalLikes,
      avgEngagement,
      topGrowth: maxVelocity,
      totalItems: list.length,
    };
  });

  // Actions
  function triggerRefresh() {
    isRefreshing.value = true;
    setTimeout(() => {
      reels.value = simulateRealtimeTick(reels.value);
      countdown.value = SYNC_INTERVAL_SECONDS;
      lastSyncTime.value = new Date().toISOString();
      isRefreshing.value = false;
    }, 400);
  }

  function startAutoRefresh() {
    if (timerId !== null) return;
    countdown.value = SYNC_INTERVAL_SECONDS;
    isLiveSyncing.value = true;

    timerId = window.setInterval(() => {
      if (!isLiveSyncing.value) return;
      if (countdown.value > 1) {
        countdown.value--;
      } else {
        triggerRefresh();
      }
    }, 1000);
  }

  function stopAutoRefresh() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    isLiveSyncing.value = false;
  }

  function toggleLiveSync() {
    if (isLiveSyncing.value) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
    }
  }

  function openDetail(reel: Reel) {
    activeReelDetail.value = reel;
  }

  function closeDetail() {
    activeReelDetail.value = null;
  }

  function openExport() {
    isExportModalOpen.value = true;
  }

  function closeExport() {
    isExportModalOpen.value = false;
  }

  return {
    // State
    reels,
    searchQuery,
    selectedNiche,
    sortBy,
    selectedPlatform,
    countdown,
    SYNC_INTERVAL_SECONDS,
    isLiveSyncing,
    isRefreshing,
    lastSyncTime,
    activeReelDetail,
    isExportModalOpen,

    // Getters
    filteredReels,
    tiktokReels,
    instagramReels,
    summaryMetrics,

    // Actions
    triggerRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    toggleLiveSync,
    openDetail,
    closeDetail,
    openExport,
    closeExport,
  };
});
