import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { YouTubeVideo } from './types';
import { showToast } from '@/shared/lib/toast/toastService';
import { saveAs } from 'file-saver';

const STORAGE_KEY = 'sword_youtube_favorites_v1';

export interface FavoriteVideoRecord extends YouTubeVideo {
  savedAt: string;
}

export const useYouTubeFavoritesStore = defineStore('youtubeFavorites', () => {
  // Load initial list from localStorage safely
  const favorites = ref<FavoriteVideoRecord[]>(loadFromStorage());
  const selectedIds = ref<Set<string>>(new Set());

  function loadFromStorage(): FavoriteVideoRecord[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Guarantee each video is valid and has duration >= 1800 (30 mins)
        return parsed.filter((item) => item && item.id && item.durationSeconds >= 1800);
      }
    } catch (e) {
      console.warn('Could not parse youtube favorites from localStorage', e);
    }
    return [];
  }

  function persist() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value));
    } catch (e) {
      console.error('Failed to persist favorites to localStorage', e);
    }
  }

  const count = computed(() => favorites.value.length);
  const selectedCount = computed(() => selectedIds.value.size);
  const isAllSelected = computed(
    () => favorites.value.length > 0 && selectedIds.value.size === favorites.value.length
  );

  function isFavorite(videoId: string): boolean {
    if (!videoId) return false;
    return favorites.value.some((item) => item.id === videoId);
  }

  function addToFavorites(video: YouTubeVideo) {
    if (!video || !video.id) return;
    if (isFavorite(video.id)) return;

    const record: FavoriteVideoRecord = {
      ...video,
      savedAt: new Date().toISOString(),
    };

    favorites.value.unshift(record);
    persist();

    showToast({
      message: `«${video.title.slice(0, 35)}...» добавлено в избранное`,
      type: 'success',
    });
  }

  function removeFromFavorites(videoId: string) {
    const idx = favorites.value.findIndex((item) => item.id === videoId);
    if (idx !== -1) {
      const removed = favorites.value[idx];
      favorites.value.splice(idx, 1);
      selectedIds.value.delete(videoId);
      persist();

      showToast({
        message: `Видео «${removed.title.slice(0, 30)}...» удалено из избранного`,
        type: 'info',
      });
    }
  }

  function toggleFavorite(video: YouTubeVideo): boolean {
    if (isFavorite(video.id)) {
      removeFromFavorites(video.id);
      return false;
    } else {
      addToFavorites(video);
      return true;
    }
  }

  function removeSelected() {
    if (selectedIds.value.size === 0) return;
    const countToRemove = selectedIds.value.size;
    favorites.value = favorites.value.filter((item) => !selectedIds.value.has(item.id));
    selectedIds.value.clear();
    persist();

    showToast({
      message: `Удалено ${countToRemove} видео из избранного`,
      type: 'info',
    });
  }

  function clearAll() {
    favorites.value = [];
    selectedIds.value.clear();
    persist();
    showToast({
      message: 'Список избранного очищен',
      type: 'info',
    });
  }

  // Selection actions
  function toggleSelect(videoId: string) {
    const next = new Set(selectedIds.value);
    if (next.has(videoId)) {
      next.delete(videoId);
    } else {
      next.add(videoId);
    }
    selectedIds.value = next;
  }

  function selectAll() {
    selectedIds.value = new Set(favorites.value.map((v) => v.id));
  }

  function deselectAll() {
    selectedIds.value = new Set();
  }

  // Export metadata in JSON format
  function exportToJSON(selectedOnly = false) {
    const targetList = selectedOnly && selectedIds.value.size > 0
      ? favorites.value.filter((v) => selectedIds.value.has(v.id))
      : favorites.value;

    if (targetList.length === 0) {
      showToast({
        message: 'Нет видео для экспорта',
        type: 'warning',
      });
      return;
    }

    const exportData = targetList.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      channelTitle: item.channelTitle,
      youtubeUrl: item.youtubeUrl || `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: item.embedUrl || `https://www.youtube.com/embed/${item.id}`,
      views: item.views,
      duration: item.duration,
      durationSeconds: item.durationSeconds,
      niche: item.niche,
      tags: item.tags || [],
      savedAt: item.savedAt || new Date().toISOString(),
    }));

    try {
      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `sword-youtube-favorites-${dateStr}.json`;
      saveAs(blob, filename);

      showToast({
        message: `Экспортировано ${exportData.length} видео в файл ${filename}`,
        type: 'success',
      });
    } catch (e: any) {
      showToast({
        message: `Ошибка при экспорте JSON: ${e?.message || 'Не удалось сохранить файл'}`,
        type: 'error',
      });
    }
  }

  return {
    favorites,
    selectedIds,
    count,
    selectedCount,
    isAllSelected,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    removeSelected,
    clearAll,
    toggleSelect,
    selectAll,
    deselectAll,
    exportToJSON,
  };
});
