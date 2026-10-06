import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Reel, Niche, SortBy, Platform, ContinentId, CountryId, NicheInfo } from './types';
import {
  INITIAL_REELS,
  simulateRealtimeTick,
  CONTINENTS,
  COUNTRIES,
  ALL_NICHES,
  REGION_POPULAR_NICHES,
  ensureRichContent
} from './mockData';

export const useReelsStore = defineStore('reels', () => {
  // State
  const reels = ref<Reel[]>([...INITIAL_REELS]);
  const searchQuery = ref('');
  const selectedNiche = ref<Niche>('all');
  const sortBy = ref<SortBy>('rank');
  const selectedPlatform = ref<'all' | Platform>('all');

  // Geographic filtering state
  const selectedContinent = ref<ContinentId>('all');
  const selectedCountry = ref<CountryId>('all');

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
  const activeMusicSearchReel = ref<Reel | null>(null);

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

  /** Available countries dynamically scoped to the selected continent */
  const availableCountries = computed(() => {
    if (selectedContinent.value === 'all') {
      return COUNTRIES;
    }
    return COUNTRIES.filter((c) => c.continent === selectedContinent.value);
  });

  /**
   * Adaptive niches based on selected continent/country:
   * Reorganizes and highlights niche filters based on what is popular in that region.
   */
  const adaptiveNiches = computed<NicheInfo[]>(() => {
    const priorityNiches = REGION_POPULAR_NICHES[selectedContinent.value] || REGION_POPULAR_NICHES.all;

    // Split into priority vs others
    const prioritized: NicheInfo[] = [];
    const others: NicheInfo[] = [];

    ALL_NICHES.forEach((niche) => {
      if (niche.id === 'all') {
        prioritized.unshift({ ...niche, isPopularInRegion: false });
      } else if (priorityNiches.includes(niche.id)) {
        prioritized.push({ ...niche, isPopularInRegion: true });
      } else {
        others.push({ ...niche, isPopularInRegion: false });
      }
    });

    return [...prioritized, ...others];
  });

  /** Human-readable label of current geo location */
  const currentGeoLabel = computed(() => {
    const continent = CONTINENTS.find((c) => c.id === selectedContinent.value);
    const country = COUNTRIES.find((c) => c.id === selectedCountry.value);

    if (selectedCountry.value !== 'all' && country) {
      return `${country.flag} ${country.label} (${continent?.label || ''})`;
    }
    if (selectedContinent.value !== 'all' && continent) {
      return `${continent.label}`;
    }
    return 'Весь мир (Global)';
  });

  // Filtered Reels including Geographic filter
  const filteredReels = computed(() => {
    let result = reels.value;

    // Geographic: Continent filter
    if (selectedContinent.value !== 'all') {
      result = result.filter((r) => r.continent === selectedContinent.value);
    }

    // Geographic: Country filter
    if (selectedCountry.value !== 'all') {
      result = result.filter((r) => r.country === selectedCountry.value);
    }

    // Platform filter
    if (selectedPlatform.value !== 'all') {
      result = result.filter((r) => r.platform === selectedPlatform.value);
    }

    // Niche filter
    if (selectedNiche.value !== 'all') {
      result = result.filter((r) => r.niche === selectedNiche.value);
    }

    // Search query filter (matches title, description, author, hashtags, audio, country)
    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
      result = result.filter((r) => {
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          r.authorUsername.toLowerCase().includes(q) ||
          r.soundTitle.toLowerCase().includes(q) ||
          r.countryName.toLowerCase().includes(q) ||
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
  function setContinent(continent: ContinentId) {
    selectedContinent.value = continent;
    if (selectedCountry.value !== 'all') {
      const countryObj = COUNTRIES.find((c) => c.id === selectedCountry.value);
      if (countryObj && continent !== 'all' && countryObj.continent !== continent) {
        selectedCountry.value = 'all';
      }
    }
    reels.value = ensureRichContent(reels.value, selectedContinent.value, selectedCountry.value, selectedNiche.value);
  }

  function setCountry(country: CountryId) {
    selectedCountry.value = country;
    if (country !== 'all') {
      const countryObj = COUNTRIES.find((c) => c.id === country);
      if (countryObj && countryObj.continent) {
        selectedContinent.value = countryObj.continent;
      }
    }
    reels.value = ensureRichContent(reels.value, selectedContinent.value, selectedCountry.value, selectedNiche.value);
  }

  function setNiche(niche: Niche) {
    selectedNiche.value = niche;
    reels.value = ensureRichContent(reels.value, selectedContinent.value, selectedCountry.value, selectedNiche.value);
  }

  function resetGeoFilter() {
    selectedContinent.value = 'all';
    selectedCountry.value = 'all';
  }

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

  function openMusicSearch(reel: Reel) {
    activeMusicSearchReel.value = reel;
  }

  function closeMusicSearch() {
    activeMusicSearchReel.value = null;
  }

  return {
    // State
    reels,
    searchQuery,
    selectedNiche,
    sortBy,
    selectedPlatform,
    selectedContinent,
    selectedCountry,
    countdown,
    SYNC_INTERVAL_SECONDS,
    isLiveSyncing,
    isRefreshing,
    lastSyncTime,
    activeReelDetail,
    isExportModalOpen,
    activeMusicSearchReel,

    // Getters
    availableCountries,
    adaptiveNiches,
    currentGeoLabel,
    filteredReels,
    tiktokReels,
    instagramReels,
    summaryMetrics,

    // Actions
    setContinent,
    setCountry,
    setNiche,
    resetGeoFilter,
    triggerRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    toggleLiveSync,
    openDetail,
    closeDetail,
    openExport,
    closeExport,
    openMusicSearch,
    closeMusicSearch,
  };
});
