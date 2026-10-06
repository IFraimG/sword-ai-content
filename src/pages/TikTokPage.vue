<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import ReelFilterBar from '@/features/filter-reels/ui/ReelFilterBar.vue';
import ReelCard from '@/entities/reel/ui/ReelCard.vue';
import InfiniteScrollSentinel from '@/shared/ui/InfiniteScrollSentinel.vue';
import { AlertCircle } from 'lucide-vue-next';

const store = useReelsStore();

const PAGE_SIZE = 10;
const visibleCount = ref(PAGE_SIZE);
const isLoadingMore = ref(false);

watch(
  () => store.tiktokReels,
  () => {
    visibleCount.value = Math.min(PAGE_SIZE, store.tiktokReels.length || PAGE_SIZE);
  },
  { immediate: true }
);

const visibleReels = computed(() => {
  return store.tiktokReels.slice(0, visibleCount.value);
});

const hasMore = computed(() => {
  return visibleCount.value < store.tiktokReels.length;
});

function handleLoadMore() {
  if (isLoadingMore.value || !hasMore.value) return;
  isLoadingMore.value = true;
  setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, store.tiktokReels.length);
    isLoadingMore.value = false;
  }, 250);
}

function handleTagClick(tag: string) {
  store.searchQuery = tag;
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- TikTok Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-tiktok-dark via-sword-surface to-sword-card border border-tiktok-cyan/40 p-6 md:p-8 shadow-2xl">
      <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-tiktok-cyan/15 blur-3xl pointer-events-none"></div>
      <div class="absolute -right-8 -bottom-16 w-64 h-64 rounded-full bg-tiktok-pink/15 blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-tiktok-cyan/40 text-tiktok-cyan text-xs font-bold mb-3 shadow-md">
            <span class="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse"></span>
            <span>TIKTOK VIRAL TRENDS</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">
            Мониторинг трендов TikTok в реальном времени
          </h1>
          <p class="text-xs md:text-sm text-sword-muted mt-1 max-w-2xl">
            Отслеживайте алгоритмические всплески, вирусные звуки, челленджи и динамику просмотров с интервалом обновления каждые 2 минуты.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-black/60 border border-sword-border px-4 py-3 rounded-2xl text-center">
            <span class="text-[10px] text-sword-muted uppercase block">Трендовых видео</span>
            <span class="text-xl font-black text-tiktok-cyan">{{ store.tiktokReels.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <ReelFilterBar />

    <!-- TikTok Reels Grid with Infinite Scroll -->
    <div v-if="store.tiktokReels.length > 0" class="flex flex-col gap-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ReelCard
          v-for="reel in visibleReels"
          :key="reel.id"
          :reel="reel"
          @select="store.openDetail"
          @tag-click="handleTagClick"
        />
      </div>

      <!-- Infinite Scroll Sentinel & Batch Loader -->
      <InfiniteScrollSentinel
        :has-more="hasMore"
        :is-loading="isLoadingMore"
        :visible-count="visibleReels.length"
        :total-count="store.tiktokReels.length"
        platform="tiktok"
        @load-more="handleLoadMore"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 px-4 text-center bg-sword-surface/40 rounded-3xl border border-sword-border/60"
    >
      <div class="w-16 h-16 rounded-2xl bg-sword-card flex items-center justify-center text-sword-muted mb-4 border border-sword-border/60">
        <AlertCircle class="w-8 h-8 text-tiktok-cyan" />
      </div>
      <h3 class="text-base font-bold text-sword-text">В TikTok пока нет подходящих трендов</h3>
      <p class="text-xs text-sword-muted mt-1 max-w-md">
        Попробуйте изменить поисковый запрос или выбрать категорию "Все тренды".
      </p>
      <button
        type="button"
        class="mt-4 px-4 py-2 rounded-xl bg-sword-card text-xs text-sword-accent border border-sword-border hover:bg-sword-border transition-colors cursor-pointer"
        @click="store.searchQuery = ''; store.selectedNiche = 'all'"
      >
        Сбросить фильтры
      </button>
    </div>
  </div>
</template>
