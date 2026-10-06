<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import LiveTicker from '@/features/real-time-ticker/ui/LiveTicker.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import {
  Columns2,
  FileDown,
  BarChart3,
  Layers,
  Menu,
  X,
  Sparkles
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const store = useReelsStore();

const isMobileMenuOpen = ref(false);

const navItems = [
  { path: '/', label: 'Split View (50/50)', icon: Columns2 },
  { path: '/tiktok', label: 'TikTok', icon: Layers, platform: 'tiktok' },
  { path: '/instagram', label: 'Instagram', icon: Layers, platform: 'instagram' },
  { path: '/analytics', label: 'Аналитика', icon: BarChart3 },
];

function navigate(path: string) {
  router.push(path);
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full bg-sword-bg/95 backdrop-blur-md border-b border-sword-border/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Left: Logo "Sword" -->
      <div class="flex items-center gap-6">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <!-- Sword SVG Brand Icon -->
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
            <span class="text-[10px] text-sword-muted tracking-tight -mt-0.5 hidden sm:block">
              Reels & TikTok Live Intelligence
            </span>
          </div>
        </router-link>

        <!-- Desktop Navigation Tabs -->
        <nav class="hidden lg:flex items-center gap-1 bg-sword-surface/60 p-1 rounded-xl border border-sword-border/60">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
              route.path === item.path
                ? 'bg-sword-card text-sword-accent shadow-sm border border-sword-border/80'
                : 'text-sword-muted hover:text-sword-text hover:bg-sword-card/40'
            ]"
            @click="navigate(item.path)"
          >
            <component :is="item.icon" class="w-3.5 h-3.5" />
            <span>{{ item.label }}</span>
            <span
              v-if="item.platform === 'tiktok'"
              class="w-1.5 h-1.5 rounded-full bg-tiktok-cyan"
            ></span>
            <span
              v-if="item.platform === 'instagram'"
              class="w-1.5 h-1.5 rounded-full bg-insta-pink"
            ></span>
          </button>
        </nav>
      </div>

      <!-- Right: Real-time Ticker & Export Action -->
      <div class="flex items-center gap-3">
        <!-- Live Ticker Widget -->
        <div class="hidden md:block">
          <LiveTicker />
        </div>

        <!-- Export Report Button -->
        <BaseButton
          variant="primary"
          size="sm"
          class="shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          @click="store.openExport"
        >
          <FileDown class="w-4 h-4 text-black mr-1" />
          <span class="font-bold">Экспорт</span>
        </BaseButton>

        <!-- Mobile Menu Toggle -->
        <button
          type="button"
          class="lg:hidden p-2 rounded-xl text-sword-muted hover:text-sword-text hover:bg-sword-card transition-colors"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <X v-if="isMobileMenuOpen" class="w-5 h-5" />
          <Menu v-else class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden border-t border-sword-border/80 bg-sword-surface/98 p-4 flex flex-col gap-3"
    >
      <div class="mb-2">
        <LiveTicker />
      </div>

      <div class="flex flex-col gap-1">
        <button
          v-for="item in navItems"
          :key="item.path"
          type="button"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left',
            route.path === item.path
              ? 'bg-sword-card text-sword-accent border border-sword-border'
              : 'text-sword-muted hover:text-sword-text hover:bg-sword-card/50'
          ]"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" class="w-4 h-4 text-sword-accent" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
