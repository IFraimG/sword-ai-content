import { saveAs } from 'file-saver';
import type { Reel } from '@/entities/reel/model/types';

/**
 * Downloads the Reel audio track as .mp3
 */
export async function downloadReelAudio(
  reel: Reel,
  onProgress?: (status: string) => void,
  customAudioUrl?: string
): Promise<void> {
  const cleanTitle = (reel.soundTitle || reel.title)
    .replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_')
    .slice(0, 30);
  const cleanArtist = (reel.soundAuthor || reel.authorName)
    .replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_')
    .slice(0, 20);

  const fileName = `Sword_Audio_${cleanArtist}_${cleanTitle}.mp3`;

  onProgress?.('Подготовка MP3 аудио...');

  const audioUrl = customAudioUrl || reel.audioUrl;

  if (!audioUrl) {
    throw new Error('Аудиодорожка временно недоступна для скачивания на платформе');
  }

  try {
    onProgress?.('Загрузка MP3 дорожки...');
    const response = await fetch(audioUrl, {
      method: 'GET',
      referrerPolicy: 'no-referrer',
    });

    if (response.ok) {
      const blob = await response.blob();
      const mp3Blob = new Blob([blob], { type: 'audio/mp3' });
      saveAs(mp3Blob, fileName);
      onProgress?.('Аудио сохранено!');
      return;
    }
  } catch (err) {
    console.warn('Blob fetch для аудио ограничен, переключение на резервный поток:', err);
  }

  // Fallback: direct anchor download
  onProgress?.('Инициализация прямого скачивания MP3...');
  const anchor = document.createElement('a');
  anchor.href = audioUrl;
  anchor.target = '_blank';
  anchor.download = fileName;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  onProgress?.('Скачивание запущено!');
}
