<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useYouTubeFavoritesStore } from '@/entities/youtube/model/youtubeFavoritesStore';
import type { YouTubeVideo, YouTubeNiche } from '@/entities/youtube/model/types';
import { showToast } from '@/shared/lib/toast/toastService';
import BaseButton from '@/shared/ui/BaseButton.vue';
import AtmosphereChatDrawer from '@/features/atmosphere-chat/ui/AtmosphereChatDrawer.vue';
import { saveAs } from 'file-saver';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  FileDown,
  Play,
  Copy,
  Check,
  Search,
  X,
  Clock,
  Layers,
  Disc,
  Eye,
  Snowflake,
  ExternalLink,
  Download,
  Bot,
  Sparkles,
  ArrowLeft,
  Headphones,
  CheckSquare,
  Square,
  RefreshCw,
  MessageSquare,
} from 'lucide-vue-next';

const router = useRouter();
const favoritesStore = useYouTubeFavoritesStore();

// Filter & search state within favorites
const searchQuery = ref('');
const selectedNiche = ref<YouTubeNiche>('all');

// Modal player state
const activeVideo = ref<YouTubeVideo | null>(null);
const isPlayerModalOpen = ref(false);
const isChatOpen = ref(false);
const copiedEmbedId = ref<string | null>(null);
const isDownloadingPreview = ref(false);

const nicheTabs: { id: YouTubeNiche; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Все направления', icon: Layers, color: 'text-sword-accent' },
  { id: 'ambient', label: 'Ambient', icon: Disc, color: 'text-emerald-400' },
  { id: 'dreamcore', label: 'Dreamcore', icon: Eye, color: 'text-purple-400' },
  { id: 'coldcore', label: 'Coldcore', icon: Snowflake, color: 'text-cyan-400' },
];

const filteredFavorites = computed(() => {
  return favoritesStore.favorites.filter((v) => {
    if (selectedNiche.value !== 'all' && v.niche !== selectedNiche.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase().replace(/^#/, '');
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchChannel = v.channelTitle.toLowerCase().includes(q);
      const matchTags = (v.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchChannel && !matchTags) return false;
    }
    return true;
  });
});

function playVideo(video: YouTubeVideo) {
  activeVideo.value = video;
  isPlayerModalOpen.value = true;
  isChatOpen.value = false;
}

function closePlayerModal() {
  isPlayerModalOpen.value = false;
  activeVideo.value = null;
  isChatOpen.value = false;
}

function playNextFavorite() {
  if (!activeVideo.value || filteredFavorites.value.length <= 1) return;
  const currentIndex = filteredFavorites.value.findIndex((v) => v.id === activeVideo.value?.id);
  const nextIndex = (currentIndex + 1) % filteredFavorites.value.length;
  activeVideo.value = filteredFavorites.value[nextIndex];
}

async function copyEmbedLink(video: YouTubeVideo) {
  try {
    const embedHtml = `<iframe width="560" height="315" src="${video.embedUrl}" title="${video.title.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(embedHtml);
    } else {
      const ta = document.createElement('textarea');
      ta.value = embedHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    copiedEmbedId.value = video.id;
    showToast({
      message: 'Embed-код скопирован в буфер обмена',
      type: 'success',
    });

    setTimeout(() => {
      if (copiedEmbedId.value === video.id) {
        copiedEmbedId.value = null;
      }
    }, 2500);
  } catch {
    showToast({
      message: 'Не удалось скопировать Embed-код',
      type: 'error',
    });
  }
}

async function downloadPreview(video: YouTubeVideo) {
  if (isDownloadingPreview.value || !video) return;
  isDownloadingPreview.value = true;

  showToast({
    message: 'Скачивание превью видео...',
    type: 'info',
  });

  const filename = `youtube-preview-${video.id}.jpg`;
  try {
    const response = await fetch(video.thumbnailUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    saveAs(blob, filename);
    showToast({
      message: 'Превью успешно скачано!',
      type: 'success',
    });
  } catch {
    // Fallback: direct synthetic link
    const link = document.createElement('a');
    link.href = video.thumbnailUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({
      message: 'Превью открыто для сохранения',
      type: 'success',
    });
  } finally {
    isDownloadingPreview.value = false;
  }
}

function handleExportJSON() {
  favoritesStore.exportToJSON(favoritesStore.selectedCount > 0);
}

function handleSelectAllToggle() {
  if (favoritesStore.isAllSelected) {
    favoritesStore.deselectAll();
  } else {
    favoritesStore.selectAll();
  }
}
</script>

<template>
  <div class="min-h-screen bg-sword-bg text-sword-text pb-24 selection:bg-sword-accent selection:text-black">
    <!-- Header Hero Banner -->
    <section class="relative border-b border-sword-border/80 bg-gradient-to-b from-sword-surface/80 via-sword-bg to-sword-bg pt-8 pb-8 overflow-hidden">
      <!-- Glow ambient background blobs -->
      <div class="absolute -top-32 left-1/4 w-96 h-96 bg-sword-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -top-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Breadcrumb / Back button -->
        <div class="flex items-center justify-between mb-4">
          <router-link
            to="/youtube"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sword-surface hover:bg-sword-card border border-sword-border hover:border-sword-accent/50 text-xs font-semibold text-sword-muted hover:text-white transition-all group"
          >
            <ArrowLeft class="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Вернуться к каталогу сетов</span>
          </router-link>

          <span class="text-xs text-sword-muted font-mono">
            localStorage &bull; offline-ready
          </span>
        </div>

        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sword-accent/15 border border-sword-accent/30 text-sword-accent text-xs font-bold mb-3 shadow-sm">
              <Bookmark class="w-3.5 h-3.5 fill-sword-accent" />
              <span>Локальная коллекция видео</span>
            </div>

            <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Избранные YouTube сеты (&ge; 30м)</span>
              <span class="text-xl px-2.5 py-0.5 rounded-xl bg-sword-card border border-sword-border text-sword-accent font-mono font-bold">
                {{ favoritesStore.count }}
              </span>
            </h1>

            <p class="mt-2 text-sm text-sword-muted max-w-2xl leading-relaxed">
              Ваши сохранённые эмбиент, дримкор и колдкор видео длительностью от 30 минут. Выбирайте понравившиеся сеты и экспортируйте их ссылки и сводку в формате JSON.
            </p>
          </div>

          <!-- Quick Actions / Export Buttons -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <!-- Export JSON Button -->
            <button
              type="button"
              :disabled="favoritesStore.count === 0"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold"
              :title="favoritesStore.selectedCount > 0 ? `Экспортировать ${favoritesStore.selectedCount} выбранных сетов в JSON` : 'Экспортировать все сохраненные сеты в JSON'"
              @click="handleExportJSON"
            >
              <FileDown class="w-4 h-4 text-black" />
              <span>
                {{ favoritesStore.selectedCount > 0 ? `Экспорт выбранных (${favoritesStore.selectedCount})` : 'Экспорт всех в JSON' }}
              </span>
            </button>

            <!-- Delete Selected Button -->
            <button
              v-if="favoritesStore.selectedCount > 0"
              type="button"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer animate-fade-in"
              title="Удалить выбранные видео из избранного"
              @click="favoritesStore.removeSelected"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Удалить ({{ favoritesStore.selectedCount }})</span>
            </button>

            <!-- Clear All Button -->
            <button
              v-if="favoritesStore.count > 0 && favoritesStore.selectedCount === 0"
              type="button"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-sword-muted hover:text-red-400 bg-sword-surface hover:bg-red-500/10 border border-sword-border hover:border-red-500/30 transition-all cursor-pointer"
              title="Очистить весь список избранного"
              @click="favoritesStore.clearAll"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Очистить всё</span>
            </button>
          </div>
        </div>

        <!-- Filter bar & In-Favorites Search -->
        <div v-if="favoritesStore.count > 0" class="mt-8 pt-6 border-t border-sword-border/60 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <!-- Selection & Genre Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <!-- Select All Checkbox Button -->
            <button
              type="button"
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0"
              :class="
                favoritesStore.isAllSelected
                  ? 'bg-sword-accent/20 border-sword-accent text-sword-accent font-bold'
                  : 'bg-sword-surface border-sword-border text-sword-muted hover:text-white'
              "
              @click="handleSelectAllToggle"
            >
              <component :is="favoritesStore.isAllSelected ? CheckSquare : Square" class="w-3.5 h-3.5" />
              <span>{{ favoritesStore.isAllSelected ? 'Снять выбор' : 'Выбрать все' }}</span>
            </button>

            <!-- Niche Filter Tabs -->
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
              @click="selectedNiche = tab.id"
            >
              <component :is="tab.icon" :class="['w-4 h-4', tab.color]" />
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Search Input within favorites -->
          <div class="relative w-full lg:w-80">
            <Search class="w-4 h-4 text-sword-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по избранному..."
              class="w-full bg-sword-card/90 border border-sword-border rounded-xl pl-9 pr-8 py-2 text-xs text-sword-text placeholder:text-sword-muted focus:outline-none focus:border-sword-accent transition-colors"
            />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-sword-muted hover:text-white"
              @click="searchQuery = ''"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
      <!-- Empty State -->
      <section
        v-if="favoritesStore.count === 0"
        class="bg-sword-card/60 border border-sword-border rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl backdrop-blur-sm animate-fade-in"
      >
        <div class="w-16 h-16 rounded-2xl bg-sword-accent/10 border border-sword-accent/30 flex items-center justify-center text-sword-accent mx-auto shadow-inner">
          <Bookmark class="w-8 h-8" />
        </div>
        <h2 class="text-xl font-bold text-white">Список избранного пока пуст</h2>
        <p class="text-xs text-sword-muted leading-relaxed">
          Вы можете сохранить любое эмбиент-видео длительностью от 30 минут в этот список, нажав на иконку закладки на карточке ролика или в модальном окне плеера.
        </p>
        <div class="pt-2">
          <router-link
            to="/youtube"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sword-accent hover:bg-sword-accent/90 text-black font-bold text-xs transition-all shadow-lg hover:shadow-sword-accent/25"
          >
            <Sparkles class="w-4 h-4 fill-black" />
            <span>Перейти к YouTube сетам</span>
          </router-link>
        </div>
      </section>

      <!-- Filtered out State -->
      <div
        v-else-if="filteredFavorites.length === 0"
        class="bg-sword-card/50 border border-sword-border rounded-2xl p-8 text-center text-sword-muted text-xs space-y-2"
      >
        <p class="font-semibold text-sword-text">Нет видео, соответствующих фильтру или запросу</p>
        <p>Попробуйте сбросить поиск или выбрать другую вкладку направления.</p>
        <button
          type="button"
          class="mt-2 text-sword-accent underline hover:text-white"
          @click="searchQuery = ''; selectedNiche = 'all'"
        >
          Сбросить фильтры
        </button>
      </div>

      <!-- Favorites Video Grid -->
      <section v-else class="space-y-4">
        <div class="flex items-center justify-between text-xs text-sword-muted px-1">
          <div>
            Показано <span class="font-mono font-bold text-sword-text">{{ filteredFavorites.length }}</span> из
            <span class="font-mono font-bold text-sword-text">{{ favoritesStore.count }}</span> сохраненных видео
          </div>
          <div v-if="favoritesStore.selectedCount > 0" class="text-sword-accent font-semibold font-mono">
            Выбрано для экспорта: {{ favoritesStore.selectedCount }}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <article
            v-for="video in filteredFavorites"
            :key="video.id"
            class="group bg-sword-card/90 hover:bg-sword-card border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-black/50"
            :class="
              favoritesStore.selectedIds.has(video.id)
                ? 'border-sword-accent shadow-md shadow-sword-accent/10 ring-1 ring-sword-accent/40'
                : 'border-sword-border hover:border-sword-accent/40'
            "
          >
            <!-- Thumbnail Container with Overlays -->
            <div class="relative aspect-video w-full bg-black/60 overflow-hidden cursor-pointer" @click="playVideo(video)">
              <img
                :src="video.thumbnailUrl"
                :alt="video.title"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                @error="($event.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`"
              />

              <!-- Dark Gradient Vignette -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

              <!-- Top Left: Selection Checkbox -->
              <button
                type="button"
                class="absolute top-2.5 left-2.5 p-1 rounded-lg bg-black/70 hover:bg-black text-white border border-white/20 transition-all z-10 cursor-pointer shadow"
                :class="favoritesStore.selectedIds.has(video.id) ? 'text-sword-accent border-sword-accent bg-black' : 'text-white/60 hover:text-white'"
                title="Выбрать видео для экспорта"
                @click.stop="favoritesStore.toggleSelect(video.id)"
              >
                <component :is="favoritesStore.selectedIds.has(video.id) ? CheckSquare : Square" class="w-4 h-4" />
              </button>

              <!-- Top Right: Niche Pill & Favorite Bookmark -->
              <div class="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border"
                  :class="
                    video.niche === 'dreamcore'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      : video.niche === 'coldcore'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  "
                >
                  {{ video.niche }}
                </span>

                <button
                  type="button"
                  class="p-1 rounded-md bg-black/70 hover:bg-red-500/30 text-sword-accent hover:text-red-400 border border-sword-accent/40 hover:border-red-500/40 transition-colors shadow-sm cursor-pointer"
                  title="Удалить из избранного"
                  @click.stop="favoritesStore.removeFromFavorites(video.id)"
                >
                  <BookmarkCheck class="w-3.5 h-3.5 fill-sword-accent" />
                </button>
              </div>

              <!-- Bottom Left: Strict Duration Badge (> 1h) -->
              <div class="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-cyan-500/40 font-mono text-[11px] font-bold text-cyan-400 shadow-sm">
                <Clock class="w-3 h-3 text-cyan-400" />
                <span>{{ video.duration }}</span>
              </div>

              <!-- Bottom Right: HD Badge -->
              <div class="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sword-card/90 text-sword-muted border border-sword-border">
                HD 1080p
              </div>

              <!-- Center Hover Play Overlay -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                <div class="w-12 h-12 rounded-full bg-sword-accent text-black flex items-center justify-center shadow-lg shadow-sword-accent/40 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play class="w-5 h-5 fill-black ml-0.5" />
                </div>
              </div>
            </div>

            <!-- Content Area -->
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  class="font-bold text-sm text-sword-text line-clamp-2 leading-snug group-hover:text-sword-accent transition-colors cursor-pointer"
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
                    v-for="tag in (video.tags || []).slice(0, 4)"
                    :key="tag"
                    class="text-[10px] text-sword-muted/90 bg-sword-surface/80 px-1.5 py-0.5 rounded border border-sword-border/60"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <!-- Actions Bar -->
              <div class="pt-3 mt-3 border-t border-sword-border/70 flex items-center justify-between gap-2">
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
                  class="p-2 rounded-xl bg-sword-surface hover:bg-sword-card border border-sword-border hover:border-sword-accent/50 text-sword-muted hover:text-white transition-colors cursor-pointer"
                  title="Скопировать HTML iframe для встраивания"
                  @click="copyEmbedLink(video)"
                >
                  <Check v-if="copiedEmbedId === video.id" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>

                <!-- External YouTube Link -->
                <a
                  :href="video.youtubeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 rounded-xl bg-sword-surface hover:bg-sword-card border border-sword-border hover:border-sword-accent/50 text-sword-muted hover:text-white transition-colors cursor-pointer"
                  title="Открыть оригинал на YouTube"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Modal Player with LLaVA Vision Side Drawer -->
    <Teleport to="body">
      <div
        v-if="isPlayerModalOpen && activeVideo"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
        @click.self="closePlayerModal"
      >
        <div
          class="relative w-full bg-sword-card border border-sword-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] transition-all duration-300"
          :class="isChatOpen ? 'max-w-6xl' : 'max-w-4xl'"
        >
          <!-- Modal Header Bar (Global across player and chat) -->
          <div class="p-4 bg-sword-surface border-b border-sword-border flex items-center justify-between gap-3 shrink-0">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 border"
                  :class="
                    activeVideo.niche === 'dreamcore'
                      ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      : activeVideo.niche === 'coldcore'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  "
                >
                  {{ activeVideo.niche }}
                </span>
                <h3 class="font-bold text-sm text-white truncate" :title="activeVideo.title">
                  {{ activeVideo.title }}
                </h3>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <!-- Toggle Favorite Button -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                  :class="
                    favoritesStore.isFavorite(activeVideo.id)
                      ? 'bg-sword-accent/20 text-sword-accent border-sword-accent/50'
                      : 'bg-sword-card hover:bg-sword-surface text-sword-muted hover:text-white border-sword-border'
                  "
                  title="Удалить / добавить в избранное"
                  @click="favoritesStore.toggleFavorite(activeVideo)"
                >
                  <BookmarkCheck v-if="favoritesStore.isFavorite(activeVideo.id)" class="w-3.5 h-3.5 fill-sword-accent" />
                  <Bookmark v-else class="w-3.5 h-3.5" />
                  <span>{{ favoritesStore.isFavorite(activeVideo.id) ? 'В избранном' : 'В избранное' }}</span>
                </button>

                <!-- Toggle LLaVA Chat Button in Top Bar -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
                  :class="
                    isChatOpen
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/25'
                      : 'bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 border-purple-500/40'
                  "
                  title="Анализ атмосферы через LLaVA 1.5 7B Vision"
                  @click="isChatOpen = !isChatOpen"
                >
                  <Bot class="w-3.5 h-3.5 text-purple-300" />
                  <span>{{ isChatOpen ? 'Скрыть ИИ' : '🔮 Атмосфера AI' }}</span>
                </button>

                <!-- Close Button -->
                <button
                  type="button"
                  class="p-2 rounded-xl text-sword-muted hover:text-white hover:bg-sword-card transition-colors cursor-pointer"
                  @click="closePlayerModal"
                >
                  <X class="w-5 h-5" />
                </button>
            </div>
          </div>

          <!-- Modal Body (Player + Optional Side Chat) -->
          <div class="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
            <!-- Left Column: Video Player & Details -->
            <div class="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
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
              class="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-sword-card to-sword-card border border-purple-500/30 flex items-center justify-between gap-3 text-xs animate-fade-in shrink-0"
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
            <div class="p-3 sm:p-4 bg-sword-surface border-t border-sword-border mt-auto flex flex-col gap-2.5 shrink-0">
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
                  v-if="filteredFavorites.length > 1"
                  variant="outline"
                  size="sm"
                  class="text-xs shrink-0 sm:ml-auto"
                  @click="playNextFavorite"
                >
                  <span>Следующее</span>
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Right Side Chat Column (LLaVA 1.5 7B Vision) -->
          <div
            v-if="isChatOpen"
            class="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-sword-border h-[460px] lg:h-auto flex flex-col min-h-0"
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
  </Teleport>
  </div>
</template>
