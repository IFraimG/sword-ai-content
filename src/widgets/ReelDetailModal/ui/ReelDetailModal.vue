<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import BaseModal from '@/shared/ui/BaseModal.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import { downloadReelVideo } from '@/shared/lib/export/videoExporter';
import { downloadReelAudio } from '@/shared/lib/export/audioExporter';
import {
  formatCompactNumber,
  formatFullNumber,
  formatPercentage,
  formatDate
} from '@/shared/lib/formatters';
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Music,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Download,
  AlertCircle,
  Film,
  Radio,
  Disc3,
  Search,
  ShieldCheck
} from 'lucide-vue-next';
import { resolveReelStream } from '@/shared/api/reelsApi';

const store = useReelsStore();

const reel = computed(() => store.activeReelDetail);
const isTikTok = computed(() => reel.value?.platform === 'tiktok');

const isDownloading = ref(false);
const downloadStatus = ref('');
const isDownloadingAudio = ref(false);
const audioDownloadStatus = ref('');
const videoFailed = ref(false);
const isResolvingStream = ref(false);
const streamUnavailableReason = ref('');
const currentVideoUrl = ref('');
const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoReady = ref(false);
const videoDuration = ref<number | null>(null);
const currentCoverUrl = ref('');

const hasRealCover = computed(() => {
  const url = currentCoverUrl.value || reel.value?.thumbnailUrl;
  if (!url || !url.trim()) return false;
  if (url.includes('images.unsplash.com')) return false;
  if (url.includes('placeholder')) return false;
  return true;
});

const resolvedCover = computed(() => {
  if (hasRealCover.value) {
    return currentCoverUrl.value || reel.value?.thumbnailUrl || '';
  }
  return '';
});

const displayDuration = computed(() => {
  if (videoDuration.value && videoDuration.value > 0) {
    return videoDuration.value;
  }
  return reel.value?.durationSeconds || 30;
});

// Dynamically resolve platform stream when active reel changes
watch(
  () => reel.value?.id,
  async (newId) => {
    isVideoReady.value = false;
    videoFailed.value = false;
    isResolvingStream.value = false;
    streamUnavailableReason.value = '';
    videoDuration.value = null;
    currentCoverUrl.value = '';
    downloadStatus.value = '';
    isDownloading.value = false;

    // Immediately stop previous video playback if still playing
    if (videoRef.value) {
      videoRef.value.pause();
      videoRef.value.currentTime = 0;
    }

    if (!reel.value) {
      currentVideoUrl.value = '';
      return;
    }

    // If reel already has a stream URL
    if (reel.value.videoUrl) {
      currentVideoUrl.value = reel.value.videoUrl;
      return;
    }

    // Dynamically query Fastify stream resolver
    if (reel.value.originalUrl) {
      isResolvingStream.value = true;
      try {
        const resolved = await resolveReelStream(reel.value.platform, reel.value.originalUrl);
        if (resolved && resolved.available && resolved.videoUrl) {
          currentVideoUrl.value = resolved.videoUrl;
          if (resolved.duration) {
            videoDuration.value = resolved.duration;
          }
          if (resolved.cover) {
            currentCoverUrl.value = resolved.cover;
          }
        } else {
          videoFailed.value = true;
          streamUnavailableReason.value = resolved?.reason || 'Прямой веб-стриминг видеопотока ограничен платформой';
        }
      } catch (err: any) {
        videoFailed.value = true;
        streamUnavailableReason.value = 'Сервер разрешения потоков временно недоступен';
      } finally {
        isResolvingStream.value = false;
      }
    } else {
      videoFailed.value = true;
      streamUnavailableReason.value = 'Ссылка на оригинальное видео платформы отсутствует';
    }
  },
  { immediate: true }
);

function handleMetadataLoaded() {
  if (videoRef.value && !isNaN(videoRef.value.duration) && videoRef.value.duration > 0) {
    videoDuration.value = Math.round(videoRef.value.duration);
  }
}

function handleVideoLoaded() {
  isVideoReady.value = true;
  handleMetadataLoaded();
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      // Browser autoplay policy might require user click or mute
    });
  }
}

function handleVideoError() {
  console.warn('Стриминг видеопотока ограничен платформой');
  videoFailed.value = true;
  streamUnavailableReason.value = 'Платформа заблокировала прямой браузерный стриминг или доступ ограничен вашим регионом.';
}

async function handleDownloadMp4() {
  if (!reel.value) return;
  if (!currentVideoUrl.value || videoFailed.value) {
    downloadStatus.value = 'Видео защищено платформой';
    window.open(reel.value.originalUrl, '_blank');
    setTimeout(() => {
      downloadStatus.value = '';
    }, 2500);
    return;
  }
  isDownloading.value = true;
  try {
    await downloadReelVideo(reel.value, (status) => {
      downloadStatus.value = status;
    });
  } catch (err: any) {
    console.error('Ошибка скачивания видео:', err);
    downloadStatus.value = 'Ошибка скачивания';
  } finally {
    setTimeout(() => {
      isDownloading.value = false;
    }, 1500);
  }
}

async function handleDownloadMp3() {
  if (!reel.value) return;
  if (!reel.value.audioUrl) {
    audioDownloadStatus.value = 'Аудио защищено платформой';
    window.open(reel.value.originalUrl, '_blank');
    setTimeout(() => {
      audioDownloadStatus.value = '';
    }, 2500);
    return;
  }
  isDownloadingAudio.value = true;
  try {
    await downloadReelAudio(reel.value, (status: string) => {
      audioDownloadStatus.value = status;
    });
  } catch (err: any) {
    console.error('Ошибка скачивания аудио:', err);
    audioDownloadStatus.value = 'Ошибка скачивания';
  } finally {
    setTimeout(() => {
      isDownloadingAudio.value = false;
      audioDownloadStatus.value = '';
    }, 1500);
  }
}

function handleOpenMusicDiscovery() {
  if (!reel.value) return;
  store.openMusicSearch(reel.value);
}
</script>

<template>
  <BaseModal
    :model-value="!!reel"
    max-width="3xl"
    @update:model-value="store.closeDetail"
  >
    <template #header>
      <div v-if="reel" class="flex items-center gap-3">
        <div
          :class="[
            'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
            isTikTok
              ? 'bg-tiktok-pink/20 text-tiktok-pink border border-tiktok-pink/40'
              : 'bg-gradient-to-r from-insta-purple/30 to-insta-pink/30 text-pink-300 border border-pink-400/40'
          ]"
        >
          {{ isTikTok ? 'TikTok Trend' : 'Instagram Reel' }}
        </div>
        <div
          v-if="reel.countryFlag"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sword-card border border-sword-border text-sword-text"
        >
          <span>{{ reel.countryFlag }}</span>
          <span>{{ reel.countryName }} ({{ reel.country.toUpperCase() }})</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-sword-muted">
          <span class="font-bold text-sword-accent">#{{ reel.trendingRank }}</span> в топе
        </div>
      </div>
    </template>

    <div v-if="reel" class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
      <!-- Left Column: Video / Player Container -->
      <div class="md:col-span-5 flex flex-col items-center">
        <!-- Player Container -->
        <div class="relative w-full aspect-[9/16] max-h-[480px] rounded-2xl overflow-hidden bg-black border border-sword-border/80 shadow-2xl flex items-center justify-center group">
          <!-- Loading placeholder while platform stream resolves -->
          <div
            v-if="isResolvingStream || (currentVideoUrl && !isVideoReady && !videoFailed)"
            class="absolute inset-0 z-10 flex items-center justify-center bg-black transition-opacity duration-200"
          >
            <!-- Real platform cover if available -->
            <img
              v-if="hasRealCover"
              :src="resolvedCover"
              :alt="reel.title"
              class="w-full h-full object-cover filter brightness-[0.6]"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-slate-950"></div>
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <div class="w-10 h-10 rounded-full border-2 border-sword-accent border-t-transparent animate-spin"></div>
              <span class="text-[11px] font-semibold text-cyan-300 drop-shadow">
                {{ isResolvingStream ? 'Разрешение видеопотока с платформы...' : 'Буферизация видео...' }}
              </span>
            </div>
          </div>

          <!-- Active Video Player with 403 prevention attributes and reel.id key -->
          <video
            v-if="currentVideoUrl && !videoFailed"
            ref="videoRef"
            :key="reel.id"
            :src="currentVideoUrl"
            :poster="hasRealCover ? resolvedCover : undefined"
            referrerpolicy="no-referrer"
            crossorigin="anonymous"
            controls
            autoplay
            muted
            loop
            playsinline
            class="w-full h-full object-cover transition-opacity duration-300"
            :class="{ 'opacity-100': isVideoReady, 'opacity-0': !isVideoReady }"
            @loadedmetadata="handleMetadataLoaded"
            @loadeddata="handleVideoLoaded"
            @durationchange="handleMetadataLoaded"
            @canplay="handleVideoLoaded"
            @error="handleVideoError"
          ></video>

          <!-- Platform Restricted / Stream Unavailable State -->
          <div
            v-else-if="!isResolvingStream"
            class="relative w-full h-full flex flex-col justify-between overflow-hidden p-4"
          >
            <!-- Background Image with Soft Blur (only if authentic) -->
            <img
              v-if="hasRealCover"
              :src="resolvedCover"
              :alt="reel.title"
              class="absolute inset-0 w-full h-full object-cover filter brightness-[0.25] blur-sm scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-black to-slate-950"></div>

            <!-- Top Indicator -->
            <div class="relative z-10 flex items-center justify-between">
              <span class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-300 font-bold">
                <AlertCircle class="w-3.5 h-3.5 text-amber-400" />
                <span>Ограничение платформы</span>
              </span>
              <span class="text-[10px] text-slate-300 bg-black/70 px-2 py-0.5 rounded-full border border-white/10">
                {{ isTikTok ? 'TikTok' : 'Instagram' }}
              </span>
            </div>

            <!-- Center Alert Message -->
            <div class="relative z-10 flex flex-col items-center justify-center gap-3 text-center px-2">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
                <ShieldCheck v-if="!isTikTok" class="w-6 h-6 text-pink-400" />
                <Film v-else class="w-6 h-6 text-tiktok-cyan" />
              </div>
              
              <div>
                <h4 class="text-xs font-bold text-white mb-1.5 drop-shadow">
                  Видео недоступно для прямого веб-стриминга
                </h4>
                <p class="text-[11px] text-slate-300 leading-relaxed max-w-[240px] mx-auto">
                  {{ streamUnavailableReason || 'Платформа блокирует прямой стриминг без авторизации или в данном регионе.' }}
                </p>
              </div>

              <!-- Direct Button to Open Canonical Platform Reel -->
              <a
                :href="reel.originalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all hover:scale-105 shadow-md"
              >
                <span>Открыть оригинал на платформе</span>
                <ExternalLink class="w-3.5 h-3.5 text-sword-accent" />
              </a>
            </div>

            <!-- Bottom Video Overlay -->
            <div class="relative z-10 text-left">
              <span class="text-xs font-bold text-white block truncate">{{ reel.title }}</span>
              <span class="text-[10px] text-slate-400 block truncate">{{ reel.authorUsername }}</span>
            </div>
          </div>
        </div>

        <!-- Download & External Actions -->
        <div class="w-full mt-3 flex flex-col gap-2">
          <!-- Download MP4 Button -->
          <button
            type="button"
            :disabled="isDownloading"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-black bg-sword-accent hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all cursor-pointer disabled:opacity-50"
            @click="handleDownloadMp4"
          >
            <Download class="w-4 h-4" :class="{ 'animate-bounce': isDownloading }" />
            <span>{{ downloadStatus || 'Скачать видео (.mp4)' }}</span>
          </button>

          <!-- Download MP3 Button -->
          <button
            type="button"
            :disabled="isDownloadingAudio"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600/90 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
            @click="handleDownloadMp3"
          >
            <Music class="w-4 h-4" :class="{ 'animate-bounce': isDownloadingAudio }" />
            <span>{{ audioDownloadStatus || 'Скачать звук (.mp3)' }}</span>
          </button>

          <!-- Original Platform Link -->
          <a
            :href="reel.originalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-white/90 bg-sword-card/90 hover:bg-sword-border/80 border border-sword-border transition-all"
          >
            <span>Оригинал на {{ isTikTok ? 'TikTok' : 'Instagram' }}</span>
            <ExternalLink class="w-3.5 h-3.5 text-sword-muted" />
          </a>
        </div>
      </div>

      <!-- Right Column: Analytics & Details -->
      <div class="md:col-span-7 flex flex-col gap-4">
        <!-- Author Profile -->
        <div class="flex items-center gap-3 p-3 bg-sword-card/80 border border-sword-border/60 rounded-xl">
          <img
            :src="reel.authorAvatar"
            :alt="reel.authorName"
            class="w-12 h-12 rounded-full object-cover border-2 border-sword-accent/50"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-sm text-sword-text truncate">{{ reel.authorName }}</span>
              <CheckCircle2 v-if="reel.authorVerified" class="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            </div>
            <span class="text-xs text-sword-muted block">{{ reel.authorUsername }} • {{ reel.countryFlag }} {{ reel.countryName }}</span>
            <span class="text-[11px] text-cyan-400 font-medium">
              {{ formatCompactNumber(reel.authorFollowers) }} подписчиков
            </span>
          </div>
        </div>

        <!-- Reel Title & Full Description -->
        <div>
          <h3 class="text-base font-extrabold text-sword-text leading-snug">
            {{ reel.title }}
          </h3>
          <p class="text-xs text-sword-muted mt-2 leading-relaxed whitespace-pre-line bg-sword-surface/50 p-3 rounded-xl border border-sword-border/40">
            {{ reel.description }}
          </p>
        </div>

        <!-- Sound & Music Track with Platform Discovery Action -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-sword-card/60 border border-sword-border/60 text-xs">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <div class="w-9 h-9 rounded-lg bg-tiktok-pink/20 flex items-center justify-center text-tiktok-pink flex-shrink-0">
              <Music class="w-4 h-4 animate-spin" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-sword-text truncate">{{ reel.soundTitle }}</span>
                <span v-if="reel.soundIsTrending" class="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-500/10 rounded">TREND</span>
              </div>
              <span class="text-[11px] text-sword-muted block truncate">{{ reel.soundAuthor }}</span>
            </div>
          </div>

          <button
            type="button"
            class="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-sm"
            title="Найти трек на Spotify, Apple Music, YouTube Music, TikTok, SoundCloud"
            @click="handleOpenMusicDiscovery"
          >
            <Search class="w-3.5 h-3.5 text-cyan-400" />
            <span>Найти на площадках</span>
          </button>
        </div>

        <!-- Viral Metrics Analytics Grid -->
        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold text-sword-text flex items-center gap-1.5">
            <Zap class="w-3.5 h-3.5 text-sword-accent" />
            <span>Метрики и виральность в реальном времени:</span>
          </span>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <!-- Views -->
            <div class="bg-sword-card/70 p-2.5 rounded-xl border border-sword-border/60">
              <div class="flex items-center gap-1 text-sword-muted text-[10px] mb-1">
                <Eye class="w-3 h-3 text-cyan-400" />
                <span>Просмотры</span>
              </div>
              <div class="font-extrabold text-sm text-cyan-400">{{ formatFullNumber(reel.metrics.views) }}</div>
              <div class="text-[10px] text-sword-muted mt-0.5">+{{ formatCompactNumber(reel.metrics.viewsGrowthLastHour) }} / час</div>
            </div>

            <!-- Engagement Rate -->
            <div class="bg-sword-card/70 p-2.5 rounded-xl border border-sword-border/60">
              <div class="flex items-center gap-1 text-sword-muted text-[10px] mb-1">
                <Sparkles class="w-3 h-3 text-emerald-400" />
                <span>Вовлеченность (ER)</span>
              </div>
              <div class="font-extrabold text-sm text-emerald-400">{{ reel.metrics.engagementRate }}%</div>
              <div class="text-[10px] text-emerald-300 mt-0.5">Высокий темп</div>
            </div>

            <!-- Velocity -->
            <div class="bg-sword-card/70 p-2.5 rounded-xl border border-sword-border/60">
              <div class="flex items-center gap-1 text-sword-muted text-[10px] mb-1">
                <TrendingUp class="w-3 h-3 text-amber-400" />
                <span>Velocity</span>
              </div>
              <div class="font-extrabold text-sm text-amber-400">{{ formatPercentage(reel.metrics.velocityScore) }}</div>
              <div class="text-[10px] text-sword-muted mt-0.5">Динамика прироста</div>
            </div>

            <!-- Likes -->
            <div class="bg-sword-card/70 p-2.5 rounded-xl border border-sword-border/60">
              <div class="flex items-center gap-1 text-sword-muted text-[10px] mb-1">
                <Heart class="w-3 h-3 text-rose-400" />
                <span>Лайки</span>
              </div>
              <div class="font-bold text-sword-text">{{ formatFullNumber(reel.metrics.likes) }}</div>
            </div>

            <!-- Comments -->
            <div class="bg-sword-card/70 p-2.5 rounded-xl border border-sword-border/60">
              <div class="flex items-center gap-1 text-sword-muted text-[10px] mb-1">
                <MessageCircle class="w-3 h-3 text-indigo-400" />
                <span>Комментарии</span>
              </div>
              <div class="font-bold text-sword-text">{{ formatFullNumber(reel.metrics.comments) }}</div>
            </div>

            <!-- Shares & Saves -->
            <div class="bg-sword-card/70 p-2.5 rounded-xl border border-sword-border/60">
              <div class="flex items-center gap-1 text-sword-muted text-[10px] mb-1">
                <Share2 class="w-3 h-3 text-sky-400" />
                <span>Репосты / Сейвы</span>
              </div>
              <div class="font-bold text-sword-text">{{ formatCompactNumber(reel.metrics.shares) }} / {{ formatCompactNumber(reel.metrics.saves) }}</div>
            </div>
          </div>
        </div>

        <!-- Tags and Date -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <span
            v-for="tag in reel.hashtags"
            :key="tag"
            class="text-[11px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/40"
          >
            {{ tag }}
          </span>
        </div>

        <div class="flex items-center gap-2 text-[11px] text-sword-muted pt-2 border-t border-sword-border/60">
          <Clock class="w-3.5 h-3.5" />
          <span>Опубликовано: {{ formatDate(reel.publishedAt) }}</span>
          <span>•</span>
          <span>Длительность: {{ displayDuration }} сек</span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
