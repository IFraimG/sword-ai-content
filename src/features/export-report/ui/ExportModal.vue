<script setup lang="ts">
import { ref } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import BaseModal from '@/shared/ui/BaseModal.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import { exportToDocx } from '@/shared/lib/export/docxExporter';
import { exportToPdf } from '@/shared/lib/export/pdfExporter';
import { exportToTxt } from '@/shared/lib/export/txtExporter';
import type { ExportFormat, ExportConfig } from '@/entities/reel/model/types';
import { FileText, FileSpreadsheet, Download, Check, Sparkles } from 'lucide-vue-next';

const store = useReelsStore();

const selectedFormat = ref<ExportFormat>('docx');
const platformScope = ref<'both' | 'tiktok' | 'instagram'>('both');
const isExporting = ref(false);
const exportSuccess = ref(false);

const includeMetrics = ref({
  views: true,
  likes: true,
  shares: true,
  engagement: true,
  velocity: true,
  soundInfo: true,
  hashtags: true,
});

async function handleExport() {
  isExporting.value = true;
  exportSuccess.value = false;

  const config: ExportConfig = {
    format: selectedFormat.value,
    platformScope: platformScope.value,
    includeMetrics: includeMetrics.value,
    filterNiche: store.selectedNiche,
  };

  try {
    if (selectedFormat.value === 'docx') {
      await exportToDocx(store.reels, config);
    } else if (selectedFormat.value === 'pdf') {
      exportToPdf(store.reels, config);
    } else {
      exportToTxt(store.reels, config);
    }

    exportSuccess.value = true;
    setTimeout(() => {
      exportSuccess.value = false;
      store.closeExport();
    }, 1200);
  } catch (err) {
    console.error('Ошибка экспорта отчета:', err);
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <BaseModal
    :model-value="store.isExportModalOpen"
    title="Экспорт аналитического отчета по трендам"
    max-width="lg"
    @update:model-value="store.closeExport"
  >
    <div class="flex flex-col gap-5 py-1">
      <p class="text-xs text-sword-muted leading-relaxed">
        Сформируйте комплексный аналитический срез трендов с текущими показателями просмотров, вовлеченности (ER%) и темпом роста (Velocity).
      </p>

      <!-- 1. Format Selection -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold uppercase tracking-wider text-sword-text">
          1. Выберите формат файла
        </label>
        <div class="grid grid-cols-3 gap-3">
          <!-- DOCX -->
          <button
            type="button"
            :class="[
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 cursor-pointer',
              selectedFormat === 'docx'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-sword-card/70 border-sword-border/60 text-sword-muted hover:border-sword-accent/40'
            ]"
            @click="selectedFormat = 'docx'"
          >
            <FileText class="w-6 h-6 text-blue-400" />
            <span class="text-xs font-bold text-sword-text">.DOCX</span>
            <span class="text-[10px] text-sword-muted">Word документ</span>
          </button>

          <!-- PDF -->
          <button
            type="button"
            :class="[
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 cursor-pointer',
              selectedFormat === 'pdf'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-sword-card/70 border-sword-border/60 text-sword-muted hover:border-sword-accent/40'
            ]"
            @click="selectedFormat = 'pdf'"
          >
            <FileSpreadsheet class="w-6 h-6 text-rose-400" />
            <span class="text-xs font-bold text-sword-text">.PDF</span>
            <span class="text-[10px] text-sword-muted">Презентабельный отчет</span>
          </button>

          <!-- TXT -->
          <button
            type="button"
            :class="[
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 cursor-pointer',
              selectedFormat === 'txt'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-sword-card/70 border-sword-border/60 text-sword-muted hover:border-sword-accent/40'
            ]"
            @click="selectedFormat = 'txt'"
          >
            <FileText class="w-6 h-6 text-emerald-400" />
            <span class="text-xs font-bold text-sword-text">.TXT</span>
            <span class="text-[10px] text-sword-muted">Текстовый формат</span>
          </button>
        </div>
      </div>

      <!-- 2. Platform Scope -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold uppercase tracking-wider text-sword-text">
          2. Выборка платформ
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
              platformScope === 'both'
                ? 'bg-sword-accent text-black font-bold border-cyan-300 shadow-md'
                : 'bg-sword-card border-sword-border text-sword-muted hover:text-sword-text'
            ]"
            @click="platformScope = 'both'"
          >
            TikTok + Instagram
          </button>
          <button
            type="button"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
              platformScope === 'tiktok'
                ? 'bg-tiktok-pink text-white font-bold border-pink-400 shadow-md'
                : 'bg-sword-card border-sword-border text-sword-muted hover:text-sword-text'
            ]"
            @click="platformScope = 'tiktok'"
          >
            Только TikTok
          </button>
          <button
            type="button"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
              platformScope === 'instagram'
                ? 'bg-gradient-to-r from-insta-purple to-insta-pink text-white font-bold border-pink-400 shadow-md'
                : 'bg-sword-card border-sword-border text-sword-muted hover:text-sword-text'
            ]"
            @click="platformScope = 'instagram'"
          >
            Только Instagram
          </button>
        </div>
      </div>

      <!-- 3. Metrics Inclusions -->
      <div class="flex flex-col gap-2 bg-sword-card/50 p-3 rounded-xl border border-sword-border/60">
        <span class="text-xs font-bold text-sword-text">Включаемые метрики отчета:</span>
        <div class="grid grid-cols-2 gap-2 text-xs text-sword-muted">
          <label class="flex items-center gap-2 cursor-pointer hover:text-sword-text select-none">
            <input type="checkbox" v-model="includeMetrics.views" class="rounded accent-cyan-400" />
            <span>Количество просмотров</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-sword-text select-none">
            <input type="checkbox" v-model="includeMetrics.engagement" class="rounded accent-cyan-400" />
            <span>Вовлеченность (ER %)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-sword-text select-none">
            <input type="checkbox" v-model="includeMetrics.velocity" class="rounded accent-cyan-400" />
            <span>Скорость роста (Velocity/ч)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-sword-text select-none">
            <input type="checkbox" v-model="includeMetrics.likes" class="rounded accent-cyan-400" />
            <span>Лайки и репосты</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-sword-text select-none">
            <input type="checkbox" v-model="includeMetrics.soundInfo" class="rounded accent-cyan-400" />
            <span>Трендовое аудио / звук</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer hover:text-sword-text select-none">
            <input type="checkbox" v-model="includeMetrics.hashtags" class="rounded accent-cyan-400" />
            <span>Хештеги и ссылки</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <BaseButton variant="ghost" @click="store.closeExport">
        Отмена
      </BaseButton>
      <BaseButton
        variant="primary"
        :loading="isExporting"
        @click="handleExport"
      >
        <Check v-if="exportSuccess" class="w-4 h-4 mr-1 text-black" />
        <Download v-else class="w-4 h-4 mr-1 text-black" />
        <span>{{ exportSuccess ? 'Отчет готов!' : 'Сформировать и скачать' }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
