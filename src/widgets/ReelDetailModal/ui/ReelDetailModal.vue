<script setup lang="ts">
import { computed } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import BaseModal from '@/shared/ui/BaseModal.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
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
  Zap
} from 'lucide-vue-next';

const store = useReelsStore();

const reel = computed(() => store.activeReelDetail);
const isTikTok = computed(() => reel.value?.platform === 'tiktok');
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
        <div class="relative w-full aspect-[9/16] max-h-[480px] rounded-2xl overflow-hidden bg-black border border-sword-border/80 shadow-2xl flex items-center justify-center">
          <video
            v-if="reel.videoUrl"
            :src="reel.videoUrl"
            :poster="reel.thumbnailUrl"
            controls
            autoplay
            muted
            loop
            playsinline
            class="w-full h-full object-cover"
          ></video>
          <img
            v-else
            :src="reel.thumbnailUrl"
            :alt="reel.title"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="w-full mt-3">
          <a
            :href="reel.originalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-lg"
            :class="isTikTok ? 'bg-tiktok-pink hover:bg-rose-600' : 'bg-gradient-to-r from-insta-purple via-insta-pink to-insta-orange hover:opacity-90'"
          >
            <span>Смотреть оригинал на {{ isTikTok ? 'TikTok' : 'Instagram' }}</span>
            <ExternalLink class="w-3.5 h-3.5" />
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
            <span class="text-xs text-sword-muted block">{{ reel.authorUsername }}</span>
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

        <!-- Sound & Music Track -->
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-sword-card/60 border border-sword-border/60 text-xs">
          <div class="w-8 h-8 rounded-lg bg-tiktok-pink/20 flex items-center justify-center text-tiktok-pink">
            <Music class="w-4 h-4 animate-spin" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1">
              <span class="font-bold text-sword-text truncate">{{ reel.soundTitle }}</span>
              <span v-if="reel.soundIsTrending" class="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-500/10 rounded">TREND</span>
            </div>
            <span class="text-[11px] text-sword-muted block truncate">{{ reel.soundAuthor }}</span>
          </div>
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
          <span>Длительность: {{ reel.durationSeconds }} сек</span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
