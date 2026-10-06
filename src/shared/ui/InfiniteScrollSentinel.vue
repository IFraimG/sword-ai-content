<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Loader2, Sparkles, ArrowDown } from 'lucide-vue-next';

interface Props {
  hasMore: boolean;
  isLoading: boolean;
  totalCount: number;
  visibleCount: number;
  rootMargin?: string;
  platform?: 'tiktok' | 'instagram' | 'all';
}

const props = withDefaults(defineProps<Props>(), {
  rootMargin: '250px',
  platform: 'all',
});

const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let scrollContainer: HTMLElement | Window | null = null;

function checkVisibility() {
  if (!props.hasMore || props.isLoading || !sentinelRef.value) return;
  const rect = sentinelRef.value.getBoundingClientRect();
  if (rect.top <= window.innerHeight + 300) {
    emit('load-more');
  }
}

function findScrollParent(element: HTMLElement | null): HTMLElement | Window {
  let parent = element?.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function setupObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', checkVisibility);
    scrollContainer = null;
  }

  if (!sentinelRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && props.hasMore && !props.isLoading) {
        emit('load-more');
      }
    },
    {
      root: null,
      rootMargin: props.rootMargin,
      threshold: 0.05,
    }
  );

  observer.observe(sentinelRef.value);

  scrollContainer = findScrollParent(sentinelRef.value);
  scrollContainer.addEventListener('scroll', checkVisibility, { passive: true });
  window.addEventListener('scroll', checkVisibility, { passive: true });
}

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', checkVisibility);
    scrollContainer = null;
  }
  window.removeEventListener('scroll', checkVisibility);
});

watch(
  () => props.hasMore,
  () => {
    // Re-evaluate sentinel visibility after list updates
    if (props.hasMore) {
      setTimeout(() => setupObserver(), 50);
    }
  }
);
</script>

<template>
  <div class="w-full py-6 flex flex-col items-center justify-center">
    <!-- Intersection Observer Sentinel Target -->
    <div ref="sentinelRef" class="w-full h-6 -mb-6 pointer-events-none opacity-0"></div>

    <!-- Active Loading Spinner State -->
    <div
      v-if="isLoading"
      class="flex items-center gap-3 px-5 py-2.5 rounded-full bg-sword-card/90 border border-sword-accent/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] text-xs text-white animate-pulse"
    >
      <Loader2 class="w-4 h-4 text-sword-accent animate-spin" />
      <span class="font-bold">Подгрузка следующих 10 трендов...</span>
      <span class="text-[10px] text-sword-muted font-mono">({{ visibleCount }} / {{ totalCount }})</span>
    </div>

    <!-- Has More Fallback Button (visible if user stops scrolling or observer delayed) -->
    <button
      v-else-if="hasMore"
      type="button"
      class="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-sword-muted hover:text-white bg-sword-surface/60 hover:bg-sword-card border border-sword-border/60 hover:border-sword-accent/40 transition-all cursor-pointer shadow-sm"
      @click="emit('load-more')"
    >
      <ArrowDown class="w-3.5 h-3.5 text-sword-accent group-hover:translate-y-0.5 transition-transform" />
      <span>Показать еще 10 рилсов</span>
      <span class="text-[10px] px-2 py-0.5 rounded-md bg-black/50 text-slate-300 font-mono">
        {{ visibleCount }} из {{ totalCount }}
      </span>
    </button>

    <!-- End of Feed State -->
    <div
      v-else-if="totalCount > 10"
      class="flex items-center gap-2 text-xs text-sword-muted py-2"
    >
      <Sparkles class="w-3.5 h-3.5 text-amber-400" />
      <span>Все {{ totalCount }} рилсов загружены</span>
    </div>
  </div>
</template>
