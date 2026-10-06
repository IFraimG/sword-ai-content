<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import BaseModal from '@/shared/ui/BaseModal.vue';
import { getMatchedTracksForReel } from '@/entities/reel/model/mockData';
import type { MatchedMusicTrack } from '@/entities/reel/model/types';
import { downloadReelAudio } from '@/shared/lib/export/audioExporter';
import {
  Music,
  Play,
  Pause,
  Download,
  ExternalLink,
  Sparkles,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  Radio,
  Disc3
} from 'lucide-vue-next';

const store = useReelsStore();
const reel = computed(() => store.activeMusicSearchReel);

// Audio playback state for original audio
const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isMuted = ref(false);

// Platform tracks state
const matchedTracks = ref<MatchedMusicTrack[]>([]);
const searchQuery = ref('');
const downloadingTrackId = ref<string | null>(null);
const downloadStatusText = ref<string>('');

// Currently playing preview track (if any)
const activePreviewTrackId = ref<string | null>(null);
const previewAudioElement = ref<HTMLAudioElement | null>(null);

// Watch active reel change
watch(
  () => reel.value,
  (newReel) => {
    stopAllAudio();
    if (newReel) {
      matchedTracks.value = getMatchedTracksForReel(newReel);
      searchQuery.value = '';
    } else {
      matchedTracks.value = [];
    }
  },
  { immediate: true }
);

function stopAllAudio() {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.currentTime = 0;
  }
  if (previewAudioElement.value) {
    previewAudioElement.value.pause();
    previewAudioElement.value.currentTime = 0;
  }
  isPlaying.value = false;
  activePreviewTrackId.value = null;
  currentTime.value = 0;
}

onUnmounted(() => {
  stopAllAudio();
});

// Audio events
function togglePlayOriginal() {
  if (!audioElement.value) return;

  if (activePreviewTrackId.value && previewAudioElement.value) {
    previewAudioElement.value.pause();
    activePreviewTrackId.value = null;
  }

  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  } else {
    audioElement.value.play().then(() => {
      isPlaying.value = true;
    }).catch((err) => {
      console.warn('Audio play error:', err);
    });
  }
}

function togglePlayPreview(track: MatchedMusicTrack) {
  if (isPlaying.value && audioElement.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  }

  if (activePreviewTrackId.value === track.id) {
    if (previewAudioElement.value) {
      previewAudioElement.value.pause();
    }
    activePreviewTrackId.value = null;
    return;
  }

  activePreviewTrackId.value = track.id;
  if (!previewAudioElement.value) {
    previewAudioElement.value = new Audio();
    previewAudioElement.value.onended = () => {
      activePreviewTrackId.value = null;
    };
  }

  previewAudioElement.value.src = track.previewUrl;
  previewAudioElement.value.play().catch((err) => {
    console.warn('Preview play error:', err);
    activePreviewTrackId.value = null;
  });
}

function handleTimeUpdate() {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
}

function handleLoadedMetadata() {
  if (audioElement.value) {
    duration.value = audioElement.value.duration || reel.value?.durationSeconds || 30;
  }
}

function handleSeek(e: Event) {
  const target = e.target as HTMLInputElement;
  const time = parseFloat(target.value);
  if (audioElement.value) {
    audioElement.value.currentTime = time;
    currentTime.value = time;
  }
}

function toggleMute() {
  if (audioElement.value) {
    audioElement.value.muted = !audioElement.value.muted;
    isMuted.value = audioElement.value.muted;
  }
}

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '00:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Download Audio
async function handleDownloadOriginal() {
  if (!reel.value) return;
  downloadingTrackId.value = 'original';
  try {
    await downloadReelAudio(reel.value, (status: string) => {
      downloadStatusText.value = status;
    });
  } catch (err) {
    console.error('Ошибка скачивания аудио:', err);
  } finally {
    setTimeout(() => {
      downloadingTrackId.value = null;
      downloadStatusText.value = '';
    }, 1500);
  }
}

async function handleDownloadTrack(track: MatchedMusicTrack) {
  if (!reel.value) return;
  downloadingTrackId.value = track.id;
  try {
    const customReel = {
      ...reel.value,
      soundTitle: track.title,
      soundAuthor: track.artist,
      audioUrl: track.previewUrl,
    };
    await downloadReelAudio(customReel, (status: string) => {
      downloadStatusText.value = status;
    });
  } catch (err) {
    console.error('Ошибка скачивания трека:', err);
  } finally {
    setTimeout(() => {
      downloadingTrackId.value = null;
      downloadStatusText.value = '';
    }, 1500);
  }
}

// Filter tracks by in-modal search
const filteredTracks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return matchedTracks.value;
  return matchedTracks.value.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.platform.toLowerCase().includes(q)
  );
});

// Platform helpers
function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'spotify':
      return 'border-[#1DB954]/50 bg-[#1DB954]/10 text-[#1DB954]';
    case 'youtube':
      return 'border-[#FF0000]/50 bg-[#FF0000]/10 text-[#FF4E45]';
    case 'apple':
      return 'border-[#FA243C]/50 bg-[#FA243C]/10 text-[#FA243C]';
    case 'tiktok':
      return 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300';
    case 'soundcloud':
      return 'border-[#FF5500]/50 bg-[#FF5500]/10 text-[#FF5500]';
    default:
      return 'border-sword-accent/50 bg-sword-accent/10 text-sword-accent';
  }
}

function getPlatformLabel(platform: string): string {
  switch (platform) {
    case 'spotify':
      return 'Spotify Music';
    case 'youtube':
      return 'YouTube Music';
    case 'apple':
      return 'Apple Music';
    case 'tiktok':
      return 'TikTok Audio';
    case 'soundcloud':
      return 'SoundCloud';
    default:
      return platform;
  }
}
</script>

<template>
  <BaseModal
    :model-value="!!reel"
    max-width="3xl"
    @update:model-value="store.closeMusicSearch"
  >
    <template #header>
      <div v-if="reel" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Disc3 class="w-5 h-5 animate-spin" style="animation-duration: 8s" />
        </div>
        <div>
          <h2 class="text-base font-extrabold text-white flex items-center gap-2">
            <span>Музыкальный поиск & Экспорт MP3</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
              Hi-Fi Audio
            </span>
          </h2>
          <p class="text-xs text-sword-muted">
            Поиск трека на 5 стриминговых платформах и мгновенная загрузка оригинального MP3
          </p>
        </div>
      </div>
    </template>

    <div v-if="reel" class="flex flex-col gap-6 pt-2">
      <!-- Original Audio Card with Player -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sword-surface via-sword-card to-slate-900 border border-sword-accent/30 p-4 sm:p-5 shadow-xl">
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <!-- Thumbnail / Sound Wave Icon -->
          <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-sword-border/80 shadow-md">
            <img
              :src="reel.thumbnailUrl"
              :alt="reel.soundTitle"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                type="button"
                class="w-10 h-10 rounded-full bg-sword-accent text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                :title="isPlaying ? 'Пауза' : 'Слушать оригинал'"
                @click="togglePlayOriginal"
              >
                <Pause v-if="isPlaying" class="w-5 h-5 fill-black" />
                <Play v-else class="w-5 h-5 fill-black ml-0.5" />
              </button>
            </div>
          </div>

          <!-- Metadata & Player Controls -->
          <div class="flex-1 w-full min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-tiktok-pink/20 text-tiktok-pink border border-tiktok-pink/30 flex items-center gap-1">
                <Music class="w-3 h-3 animate-bounce" />
                <span>Оригинал из ролика</span>
              </span>
              <span v-if="reel.soundIsTrending" class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles class="w-3 h-3 text-emerald-400" />
                <span>Трендовый хит</span>
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-extrabold text-white truncate">
              {{ reel.soundTitle }}
            </h3>
            <p class="text-xs text-sword-muted truncate mb-3">
              Исполнитель: <span class="text-slate-200 font-semibold">{{ reel.soundAuthor }}</span>
            </p>

            <!-- Custom Audio Scrubber Bar -->
            <div class="flex items-center gap-3 w-full">
              <span class="text-[11px] font-mono text-sword-muted w-10 text-right">
                {{ formatDuration(currentTime) }}
              </span>
              <input
                type="range"
                min="0"
                :max="duration || 30"
                step="0.1"
                :value="currentTime"
                class="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sword-accent"
                @input="handleSeek"
              />
              <span class="text-[11px] font-mono text-sword-muted w-10">
                {{ formatDuration(duration || reel.durationSeconds) }}
              </span>

              <button
                type="button"
                class="p-1.5 text-sword-muted hover:text-white rounded-lg transition-colors cursor-pointer"
                :title="isMuted ? 'Включить звук' : 'Без звука'"
                @click="toggleMute"
              >
                <VolumeX v-if="isMuted" class="w-4 h-4 text-rose-400" />
                <Volume2 v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Direct Download MP3 Action -->
          <div class="w-full sm:w-auto flex-shrink-0">
            <button
              type="button"
              :disabled="downloadingTrackId === 'original'"
              class="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-all cursor-pointer disabled:opacity-50"
              @click="handleDownloadOriginal"
            >
              <Download class="w-4 h-4" :class="{ 'animate-bounce': downloadingTrackId === 'original' }" />
              <span>
                {{ downloadingTrackId === 'original' ? (downloadStatusText || 'Экспорт MP3...') : 'Скачать MP3' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Hidden Audio Element -->
        <audio
          ref="audioElement"
          :src="reel.audioUrl"
          preload="metadata"
          @timeupdate="handleTimeUpdate"
          @loadedmetadata="handleLoadedMetadata"
          @ended="isPlaying = false"
        ></audio>
      </div>

      <!-- Platforms Search & Match Section -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Radio class="w-4 h-4 text-cyan-400 animate-pulse" />
            <h4 class="text-sm font-bold text-white">
              Доступно на стриминговых платформах
            </h4>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              5 сервисов
            </span>
          </div>

          <!-- Quick Filter Input -->
          <div class="relative w-full sm:w-64">
            <Search class="w-3.5 h-3.5 text-sword-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию..."
              class="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-sword-card border border-sword-border text-white placeholder-sword-muted focus:outline-none focus:border-sword-accent transition-colors"
            />
          </div>
        </div>

        <!-- Platforms Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="track in filteredTracks"
            :key="track.id"
            class="flex items-center justify-between gap-3 p-3 rounded-xl bg-sword-card/80 hover:bg-sword-card border border-sword-border/60 hover:border-sword-accent/40 transition-all shadow-sm"
          >
            <!-- Platform Info & Thumbnail -->
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-sword-border/60">
                <img
                  :src="track.coverUrl"
                  :alt="track.title"
                  class="w-full h-full object-cover"
                />
                <!-- Mini Preview Play Overlay -->
                <button
                  type="button"
                  class="absolute inset-0 bg-black/50 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                  :title="activePreviewTrackId === track.id ? 'Остановить' : 'Слушать превью'"
                  @click="togglePlayPreview(track)"
                >
                  <Pause v-if="activePreviewTrackId === track.id" class="w-4 h-4 fill-white" />
                  <Play v-else class="w-4 h-4 fill-white ml-0.5" />
                </button>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    :class="[
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      getPlatformColor(track.platform)
                    ]"
                  >
                    {{ getPlatformLabel(track.platform) }}
                  </span>
                  <span class="text-[10px] text-emerald-400 font-medium">
                    {{ track.matchScore }}% совпадение
                  </span>
                </div>
                <div class="font-bold text-xs text-white truncate">
                  {{ track.title }}
                </div>
                <div class="text-[11px] text-sword-muted truncate">
                  {{ track.artist }} • {{ track.duration }}
                </div>
              </div>
            </div>

            <!-- Action Buttons: Open Link & Download MP3 -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <!-- Download Track MP3 -->
              <button
                type="button"
                :disabled="downloadingTrackId === track.id"
                class="p-2 text-sword-muted hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer"
                :title="`Скачать MP3 трек (${track.title})`"
                @click="handleDownloadTrack(track)"
              >
                <Download
                  class="w-4 h-4"
                  :class="{ 'animate-bounce text-emerald-400': downloadingTrackId === track.id }"
                />
              </button>

              <!-- External Service Link -->
              <a
                :href="track.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 text-sword-muted hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg border border-transparent hover:border-cyan-500/30 transition-all"
                :title="`Открыть на ${getPlatformLabel(track.platform)}`"
              >
                <ExternalLink class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
