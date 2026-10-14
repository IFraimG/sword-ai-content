<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { useAuthStore } from '@/entities/user/model/authStore';
import AppSidebar from '@/widgets/Sidebar/ui/AppSidebar.vue';
import ReelDetailModal from '@/widgets/ReelDetailModal/ui/ReelDetailModal.vue';
import ExportModal from '@/features/export-report/ui/ExportModal.vue';
import MusicSearchModal from '@/widgets/MusicSearchModal/ui/MusicSearchModal.vue';
import ToastContainer from '@/shared/ui/ToastContainer.vue';

const route = useRoute();
const store = useReelsStore();
const authStore = useAuthStore();

const isAuthPage = computed(() => route.path === '/auth');

onMounted(() => {
  authStore.initAuth();
  store.startAutoRefresh();
});

onUnmounted(() => {
  store.stopAutoRefresh();
});
</script>

<template>
  <!-- Standalone Auth View (Clean screen without sidebar, footer or other elements) -->
  <div v-if="isAuthPage" class="min-h-screen bg-sword-bg text-sword-text selection:bg-sword-accent selection:text-black">
    <router-view />
    <ToastContainer />
  </div>

  <!-- Main Application Layout with Left Sidebar -->
  <div v-else class="min-h-screen flex flex-col lg:flex-row bg-sword-bg text-sword-text selection:bg-sword-accent selection:text-black">
    <!-- Left Navigation Sidebar + Mobile Responsive Drawer -->
    <AppSidebar />

    <!-- Main Content Area Column (to the right of sidebar on desktop) -->
    <div class="flex-1 flex flex-col min-w-0">
      <main class="flex-1 pb-12">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

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

    <!-- Global Modals & Toast Alerts -->
    <ReelDetailModal />
    <ExportModal />
    <MusicSearchModal />
    <ToastContainer />
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
