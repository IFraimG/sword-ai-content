<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import AppHeader from '@/widgets/Header/ui/AppHeader.vue';
import ReelDetailModal from '@/widgets/ReelDetailModal/ui/ReelDetailModal.vue';
import ExportModal from '@/features/export-report/ui/ExportModal.vue';
import MusicSearchModal from '@/widgets/MusicSearchModal/ui/MusicSearchModal.vue';
import ToastContainer from '@/shared/ui/ToastContainer.vue';
import { formatDate } from '@/shared/lib/formatters';

const store = useReelsStore();

onMounted(() => {
  store.startAutoRefresh();
});

onUnmounted(() => {
  store.stopAutoRefresh();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-sword-bg text-sword-text selection:bg-sword-accent selection:text-black">
    <!-- Top Header -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="flex-1 pb-12">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Modals & Toast Alerts -->
    <ReelDetailModal />
    <ExportModal />
    <MusicSearchModal />
    <ToastContainer />

    <!-- Footer -->
    <footer class="border-t border-sword-border/60 bg-sword-surface/40 py-6 px-4">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sword-muted">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sword-text">SWORD</span>
          <span>— Аналитическая платформа трендов TikTok и Instagram Reels</span>
        </div>
        <div class="flex items-center gap-3">
          <span>Синхронизация каждые 2 мин</span>
          <span>•</span>
          <span>Клиентский режим (Serverless)</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
