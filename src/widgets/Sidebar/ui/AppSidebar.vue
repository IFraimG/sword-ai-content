<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { useYouTubeFavoritesStore } from '@/entities/youtube/model/youtubeFavoritesStore';
import { useAuthStore } from '@/entities/user/model/authStore';
import LiveTicker from '@/features/real-time-ticker/ui/LiveTicker.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import {
  Columns2,
  FileDown,
  BarChart3,
  Layers,
  Radio,
  Bookmark,
  Users,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const store = useReelsStore();
const favoritesStore = useYouTubeFavoritesStore();
const authStore = useAuthStore();

const isMobileDrawerOpen = ref(false);

const navItems = [
  { path: '/', label: 'Split View (50/50)', icon: Columns2, platform: 'split' },
  { path: '/tiktok', label: 'TikTok', icon: Layers, platform: 'tiktok' },
  { path: '/instagram', label: 'Instagram', icon: Layers, platform: 'instagram' },
  { path: '/analytics', label: 'Аналитика', icon: BarChart3, platform: 'analytics' },
  { path: '/youtube', label: 'YouTube Ambient (>1ч)', icon: Radio, platform: 'youtube' },
  { path: '/youtube/favorites', label: 'Избранное YT', icon: Bookmark, platform: 'youtube-favorites' },
  { path: '/users', label: 'Пользователи', icon: Users, platform: 'users' },
];

function openMobileDrawer() {
  isMobileDrawerOpen.value = true;
}

function closeMobileDrawer() {
  isMobileDrawerOpen.value = false;
}

function navigate(path: string) {
  router.push(path);
  closeMobileDrawer();
}

async function handleLogout() {
  await authStore.logout();
  closeMobileDrawer();
  router.push('/auth');
}

// Auto-close drawer on route change
watch(
  () => route.path,
  () => {
    isMobileDrawerOpen.value = false;
  }
);

// Prevent body scroll when drawer is open on mobile
watch(isMobileDrawerOpen, (isOpen) => {
  if (typeof document !== 'undefined') {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
});

// Close drawer on Escape key
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isMobileDrawerOpen.value) {
    closeMobileDrawer();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (typeof document !== 'undefined') {
    document.body.classList.remove('overflow-hidden');
  }
});
</script>

<template>
  <!-- ========================================================================= -->
  <!-- 1. MOBILE TOP BAR (visible when screen < lg, where sidebar is collapsed)  -->
  <!-- ========================================================================= -->
  <header class="lg:hidden sticky top-0 z-30 w-full bg-sword-bg/95 backdrop-blur-md border-b border-sword-border/80 px-4 h-16 flex items-center justify-between">
    <!-- Left: Hamburger toggle + App Logo -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="p-2 rounded-xl text-sword-muted hover:text-sword-text hover:bg-sword-card border border-sword-border/60 transition-colors cursor-pointer"
        aria-label="Открыть меню навигации"
        @click="openMobileDrawer"
      >
        <Menu class="w-5 h-5 text-sword-accent" />
      </button>

      <!-- Web App Brand Logo -->
      <router-link to="/" class="flex items-center gap-2 group">
        <div class="relative w-8 h-8 rounded-xl bg-gradient-to-br from-sword-surface to-sword-card border border-sword-border flex items-center justify-center shadow-md group-hover:border-sword-accent/80 transition-all duration-300">
          <svg class="w-4 h-4 text-sword-accent transform -rotate-45 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
            <line x1="13" y1="19" x2="19" y2="13"></line>
            <line x1="16" y1="16" x2="20" y2="20"></line>
            <line x1="19" y1="21" x2="21" y2="19"></line>
          </svg>
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-tiktok-pink rounded-full"></span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-lg font-black tracking-wider text-sword-text font-sans group-hover:text-sword-accent transition-colors">
            SWORD
          </span>
          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sword-accent/15 text-sword-accent border border-sword-accent/30 tracking-tight">
            V2.0
          </span>
        </div>
      </router-link>
    </div>

    <!-- Right: Quick Actions -->
    <div class="flex items-center gap-2">
      <!-- User login badge if authenticated -->
      <router-link
        v-if="authStore.user"
        to="/users"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sword-card border border-sword-border/80 text-xs text-white"
        title="Текущий профиль"
      >
        <div class="w-4 h-4 rounded-full bg-sword-accent/20 flex items-center justify-center text-[10px] text-sword-accent font-bold">
          @
        </div>
        <span class="font-bold text-xs truncate max-w-[80px]">{{ authStore.user.login }}</span>
      </router-link>

      <BaseButton
        variant="primary"
        size="sm"
        class="shadow-[0_0_12px_rgba(0,240,255,0.2)]"
        @click="store.openExport"
      >
        <FileDown class="w-3.5 h-3.5 text-black mr-1" />
        <span class="font-bold text-xs">Экспорт</span>
      </BaseButton>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- 2. MOBILE SLIDE-OVER DRAWER OVERLAY (opens over page with dimmed backdrop)-->
  <!-- ========================================================================= -->
  <Transition name="fade">
    <div
      v-if="isMobileDrawerOpen"
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity lg:hidden"
      aria-hidden="true"
      @click="closeMobileDrawer"
    ></div>
  </Transition>

  <Transition name="slide-drawer">
    <aside
      v-if="isMobileDrawerOpen"
      class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] h-full bg-sword-bg/98 backdrop-blur-2xl border-r border-sword-border/80 shadow-2xl flex flex-col justify-between p-4 overflow-y-auto lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Боковая панель навигации"
    >
      <!-- Drawer Header: Brand Logo & Close Button -->
      <div>
        <div class="flex items-center justify-between pb-3.5 border-b border-sword-border/60">
          <router-link to="/" class="flex items-center gap-2.5 group" @click="closeMobileDrawer">
            <div class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-sword-surface to-sword-card border border-sword-border flex items-center justify-center shadow-lg group-hover:border-sword-accent/80 transition-all duration-300">
              <svg class="w-5 h-5 text-sword-accent transform -rotate-45 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
                <line x1="13" y1="19" x2="19" y2="13"></line>
                <line x1="16" y1="16" x2="20" y2="20"></line>
                <line x1="19" y1="21" x2="21" y2="19"></line>
              </svg>
              <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-tiktok-pink rounded-full"></span>
            </div>

            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="text-xl font-black tracking-wider text-sword-text font-sans group-hover:text-sword-accent transition-colors">
                  SWORD
                </span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sword-accent/15 text-sword-accent border border-sword-accent/30 tracking-tight">
                  V2.0
                </span>
              </div>
              <span class="text-[10px] text-sword-muted tracking-tight -mt-0.5">
                Reels & TikTok Intelligence
              </span>
            </div>
          </router-link>

          <!-- Close (X) Button -->
          <button
            type="button"
            class="p-2 rounded-xl text-sword-muted hover:text-sword-text hover:bg-sword-card border border-sword-border/60 transition-colors cursor-pointer"
            aria-label="Закрыть панель"
            @click="closeMobileDrawer"
          >
            <X class="w-5 h-5 text-sword-muted hover:text-sword-accent transition-colors" />
          </button>
        </div>

        <!-- Navigation Section -->
        <div class="mt-4">
          <div class="text-[10px] uppercase font-bold tracking-wider text-sword-muted/50 px-2.5 py-1 mb-1">
            Навигация
          </div>
          <nav class="flex flex-col gap-1.5">
            <button
              v-for="item in navItems"
              :key="item.path"
              type="button"
              :class="[
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer select-none group',
                route.path === item.path
                  ? 'bg-sword-card text-sword-accent border border-sword-accent/40 shadow-sm shadow-sword-accent/10 font-bold'
                  : 'text-sword-muted hover:text-sword-text hover:bg-sword-card/50 border border-transparent'
              ]"
              @click="navigate(item.path)"
            >
              <div class="flex items-center gap-3">
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 transition-colors',
                    route.path === item.path ? 'text-sword-accent' : 'text-sword-muted group-hover:text-sword-text'
                  ]"
                />
                <span>{{ item.label }}</span>
              </div>

              <!-- Indicators & Badges -->
              <div class="flex items-center gap-1.5">
                <span
                  v-if="item.platform === 'tiktok'"
                  class="w-2 h-2 rounded-full bg-tiktok-cyan shadow-[0_0_8px_#00f0ff]"
                ></span>
                <span
                  v-if="item.platform === 'instagram'"
                  class="w-2 h-2 rounded-full bg-insta-pink shadow-[0_0_8px_#fd1d1d]"
                ></span>
                <span
                  v-if="item.platform === 'youtube'"
                  class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"
                ></span>
                <span
                  v-if="item.platform === 'youtube-favorites' && favoritesStore.count > 0"
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sword-accent text-black shadow-sm"
                >
                  {{ favoritesStore.count }}
                </span>
              </div>
            </button>
          </nav>

          <!-- User Profile Display (Below Nav items) -->
          <div v-if="authStore.user" class="mt-3 p-3 rounded-2xl bg-sword-card/80 border border-sword-border/80 flex items-center justify-between gap-3 shadow-md">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-sword-surface to-sword-card border border-sword-accent/40 flex items-center justify-center text-sword-accent font-bold text-xs shrink-0 shadow-sm uppercase">
                {{ authStore.user.login.substring(0, 2) }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-white truncate" :title="`@${authStore.user.login}`">
                  @{{ authStore.user.login }}
                </span>
                <span class="text-[10px] text-sword-muted truncate" :title="authStore.user.email">
                  {{ authStore.user.email }}
                </span>
              </div>
            </div>

            <button
              type="button"
              class="p-1.5 rounded-lg text-sword-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
              title="Выйти из аккаунта"
              @click="handleLogout"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Drawer Footer: Ticker & Export -->
      <div class="pt-4 border-t border-sword-border/60 flex flex-col gap-3">
        <LiveTicker />

        <BaseButton
          variant="primary"
          size="md"
          class="w-full justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          @click="store.openExport(); closeMobileDrawer();"
        >
          <FileDown class="w-4 h-4 text-black mr-2" />
          <span class="font-bold">Экспорт отчёта</span>
        </BaseButton>

        <div class="text-[10px] text-center text-sword-muted/50 font-mono">
          SWORD V2.0 • PostgreSQL + Render
        </div>
      </div>
    </aside>
  </Transition>

  <!-- ========================================================================= -->
  <!-- 3. DESKTOP DOCKED SIDEBAR (Permanently visible on screens >= lg)           -->
  <!-- ========================================================================= -->
  <aside class="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-screen sticky top-0 bg-sword-bg/95 backdrop-blur-xl border-r border-sword-border/80 z-30 justify-between p-4 select-none">
    <!-- Top Block: Brand Logo & Navigation -->
    <div class="flex flex-col flex-1 min-h-0">
      <!-- Brand Logo Header -->
      <div class="pb-3 border-b border-sword-border/60">
        <router-link to="/" class="flex items-center gap-3 group">
          <!-- Sword SVG Brand Icon -->
          <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sword-surface to-sword-card border border-sword-border flex items-center justify-center shadow-lg group-hover:border-sword-accent/80 transition-all duration-300 shrink-0">
            <svg class="w-5 h-5 text-sword-accent transform -rotate-45 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
              <line x1="13" y1="19" x2="19" y2="13"></line>
              <line x1="16" y1="16" x2="20" y2="20"></line>
              <line x1="19" y1="21" x2="21" y2="19"></line>
            </svg>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-tiktok-pink rounded-full"></span>
          </div>

          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-xl font-black tracking-wider text-sword-text font-sans group-hover:text-sword-accent transition-colors">
                SWORD
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sword-accent/15 text-sword-accent border border-sword-accent/30 tracking-tight">
                V2.0
              </span>
            </div>
            <span class="text-[10px] text-sword-muted tracking-tight -mt-0.5 truncate">
              Reels & TikTok Live Intelligence
            </span>
          </div>
        </router-link>
      </div>

      <!-- Navigation Links Container -->
      <div class="mt-4 flex-1 flex flex-col min-h-0">
        <div class="text-[10px] uppercase font-bold tracking-wider text-sword-muted/50 px-2.5 py-1 mb-1 shrink-0">
          Навигация
        </div>

        <nav class="flex flex-col gap-1 overflow-y-auto pr-0.5 custom-scrollbar">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="[
              'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer select-none group',
              route.path === item.path
                ? 'bg-sword-card text-sword-accent border border-sword-accent/40 shadow-sm shadow-sword-accent/10 font-bold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-sword-accent before:rounded-r'
                : 'text-sword-muted hover:text-sword-text hover:bg-sword-card/50 border border-transparent'
            ]"
            @click="navigate(item.path)"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <component
                :is="item.icon"
                :class="[
                  'w-4 h-4 shrink-0 transition-colors',
                  route.path === item.path ? 'text-sword-accent' : 'text-sword-muted group-hover:text-sword-text'
                ]"
              />
              <span class="truncate">{{ item.label }}</span>
            </div>

            <!-- Indicators & Badges -->
            <div class="flex items-center gap-1.5 shrink-0 ml-2">
              <span
                v-if="item.platform === 'tiktok'"
                class="w-2 h-2 rounded-full bg-tiktok-cyan shadow-[0_0_8px_#00f0ff]"
                title="TikTok Reels"
              ></span>
              <span
                v-if="item.platform === 'instagram'"
                class="w-2 h-2 rounded-full bg-insta-pink shadow-[0_0_8px_#fd1d1d]"
                title="Instagram Reels"
              ></span>
              <span
                v-if="item.platform === 'youtube'"
                class="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"
                title="YouTube Ambient"
              ></span>
              <span
                v-if="item.platform === 'youtube-favorites' && favoritesStore.count > 0"
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sword-accent text-black shadow-sm"
                title="Сохранено видео"
              >
                {{ favoritesStore.count }}
              </span>
            </div>
          </button>
        </nav>

        <!-- User Profile Card (Below Navigation links: @login & smaller email) -->
        <div v-if="authStore.user" class="mt-3 p-3 rounded-2xl bg-sword-surface/90 border border-sword-border/80 flex items-center justify-between gap-2.5 shadow-md shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- User Avatar -->
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-sword-card to-sword-surface border border-sword-accent/40 flex items-center justify-center text-sword-accent font-bold text-xs shrink-0 shadow-sm uppercase">
              {{ authStore.user.login.substring(0, 2) }}
            </div>

            <!-- Login (@login) & Email -->
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-bold text-white truncate" :title="`@${authStore.user.login}`">
                @{{ authStore.user.login }}
              </span>
              <span class="text-[10px] text-sword-muted truncate" :title="authStore.user.email">
                {{ authStore.user.email }}
              </span>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            type="button"
            class="p-1.5 rounded-lg text-sword-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            title="Выйти из аккаунта"
            @click="handleLogout"
          >
            <LogOut class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Block: LiveTicker & Export Button -->
    <div class="pt-3 border-t border-sword-border/60 flex flex-col gap-3 shrink-0">
      <!-- Live Sync & API Status Widget -->
      <LiveTicker />

      <!-- Global Export Report Button -->
      <BaseButton
        variant="primary"
        size="md"
        class="w-full justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]"
        @click="store.openExport"
      >
        <FileDown class="w-4 h-4 text-black mr-2" />
        <span class="font-bold">Экспорт отчёта</span>
      </BaseButton>

      <!-- App version & Mode Info -->
      <div class="flex items-center justify-between text-[10px] font-mono text-sword-muted/50 px-1">
        <span>SWORD v2.0</span>
        <span>PostgreSQL + JWT</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Backdrop fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-over drawer animation */
.slide-drawer-enter-active,
.slide-drawer-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-drawer-enter-from,
.slide-drawer-leave-to {
  transform: translateX(-100%);
}

/* Custom scrollbar for nav links */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(34, 47, 70, 0.6);
  border-radius: 4px;
}
</style>
