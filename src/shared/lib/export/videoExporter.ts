import { saveAs } from 'file-saver';
import type { Reel } from '@/entities/reel/model/types';

/**
 * Downloads a Reel's video as .mp4
 */
export async function downloadReelVideo(
  reel: Reel,
  onProgress?: (status: string) => void
): Promise<void> {
  const cleanTitle = reel.title
    .replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_')
    .slice(0, 30);
  const fileName = `Sword_${reel.platform.toUpperCase()}_${reel.country.toUpperCase()}_${cleanTitle}.mp4`;

  onProgress?.('Подготовка к скачиванию...');

  const videoUrl = reel.videoUrl;

  if (!videoUrl) {
    throw new Error('Видеопоток временно недоступен для прямого скачивания на платформе');
  }

  try {
    onProgress?.('Загрузка видеопотока...');
    // Try fetching with no-referrer
    const response = await fetch(videoUrl, {
      method: 'GET',
      referrerPolicy: 'no-referrer',
      headers: {
        Accept: 'video/mp4,video/*;q=0.9,*/*;q=0.8',
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      // Ensure the blob is tagged as video/mp4
      const mp4Blob = new Blob([blob], { type: 'video/mp4' });
      saveAs(mp4Blob, fileName);
      onProgress?.('Готово!');
      return;
    }
  } catch (err) {
    console.warn('Прямой Blob fetch ограничен CORS, переключение на резервный метод скачивания:', err);
  }

  // Fallback 1: Direct anchor download
  onProgress?.('Инициализация прямого скачивания...');
  const anchor = document.createElement('a');
  anchor.href = videoUrl;
  anchor.target = '_blank';
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  onProgress?.('Скачивание запущено!');
}
