import { saveAs } from 'file-saver';
import type { Reel } from '@/entities/reel/model/types';
import { getApiBaseUrl } from '@/shared/api/reelsApi';
import { toast } from '@/shared/lib/toast/toastService';

export interface DownloadAudioOptions {
  customAudioUrl?: string;
  expectedDurationSeconds?: number;
  trackTitle?: string;
  trackArtist?: string;
  allowDurationMismatch?: boolean;
}

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '00:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function getAudioBlobDuration(blob: Blob): Promise<number> {
  // Method 1: Web Audio API (AudioContext)
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const arrayBuffer = await blob.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      const dur = decodedBuffer.duration;
      await ctx.close().catch(() => {});
      if (dur > 0 && !isNaN(dur)) {
        return dur;
      }
    }
  } catch (err) {
    console.warn('AudioContext decode failed, falling back to HTMLAudioElement:', err);
  }

  // Method 2: HTMLAudioElement with object URL
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.removeAttribute('src');
    };

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      cleanup();
      if (dur > 0 && !isNaN(dur)) {
        resolve(dur);
      } else {
        reject(new Error('Длительность полученного аудиофайла равна 0 секунд'));
      }
    };

    audio.onerror = () => {
      cleanup();
      reject(new Error('Поврежденный или неподдерживаемый аудиофайл'));
    };

    audio.src = objectUrl;

    setTimeout(() => {
      cleanup();
      reject(new Error('Превышено время ожидания проверки аудиофайла'));
    }, 6000);
  });
}

/**
 * Downloads the Reel audio track as .mp3 with full content and duration validation
 */
export async function downloadReelAudio(
  reel: Reel,
  onProgress?: (status: string) => void,
  optionsOrUrl?: string | DownloadAudioOptions
): Promise<void> {
  const options: DownloadAudioOptions =
    typeof optionsOrUrl === 'string'
      ? { customAudioUrl: optionsOrUrl }
      : optionsOrUrl || {};

  const title = options.trackTitle || reel.soundTitle || reel.title || 'Track';
  const artist = options.trackArtist || reel.soundAuthor || reel.authorName || 'Artist';

  const cleanTitle = title.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 30);
  const cleanArtist = artist.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_').slice(0, 20);
  const fileName = `Sword_Audio_${cleanArtist}_${cleanTitle}.mp3`;

  const audioUrl = options.customAudioUrl || reel.audioUrl;
  const expectedDuration = options.expectedDurationSeconds || reel.durationSeconds || 0;

  if (!audioUrl) {
    const err = new Error('Аудиодорожка отсутствует или защищена платформой');
    toast.error(err.message, { title: 'Скачивание недоступно' });
    throw err;
  }

  onProgress?.('Подключение к аудиопотоку...');

  // 1. Fetch audio safely
  let blob: Blob | null = null;
  const apiBase = getApiBaseUrl();

  const urlsToTry: string[] = [];
  if (apiBase && !audioUrl.includes('/api/proxy/audio')) {
    urlsToTry.push(`${apiBase}/api/proxy/audio?url=${encodeURIComponent(audioUrl)}&download=1`);
  }
  urlsToTry.push(audioUrl);

  let lastError: Error | null = null;

  for (const url of urlsToTry) {
    try {
      onProgress?.('Загрузка аудиоданных...');
      const response = await fetch(url, {
        method: 'GET',
        referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const candidateBlob = await response.blob();
        if (candidateBlob && candidateBlob.size >= 1024) {
          blob = candidateBlob;
          break;
        } else {
          lastError = new Error(`Файл пуст или содержит ошибку (размер: ${candidateBlob?.size || 0} байт)`);
        }
      } else {
        lastError = new Error(`Сервер вернул статус HTTP ${response.status}`);
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!blob) {
    const msg = lastError?.message || 'Не удалось получить аудиоданные: файл пуст или недоступен';
    toast.error(msg, { title: 'Ошибка загрузки аудио' });
    throw new Error(msg);
  }

  // 2. Validate audio content & measure actual duration
  onProgress?.('Проверка целостности и длительности...');

  let actualDuration = 0;
  try {
    actualDuration = await getAudioBlobDuration(blob);
  } catch (err: any) {
    const msg = `Файл поврежден или пуст: ${err.message || 'ошибка декодирования'}`;
    toast.error(msg, { title: 'Некорректный аудиофайл' });
    throw new Error(msg);
  }

  if (actualDuration < 1.0) {
    const msg = `Аудиофайл пуст: длительность равна 0 секунд (${blob.size} байт)`;
    toast.error(msg, { title: 'Пустой аудиофайл' });
    throw new Error(msg);
  }

  // 3. Compare with expected duration
  if (expectedDuration > 0 && !options.allowDurationMismatch) {
    // If difference is greater than 5 seconds and ratio differs significantly
    const diff = Math.abs(actualDuration - expectedDuration);
    if (diff > 5 && (actualDuration < expectedDuration * 0.85 || actualDuration > expectedDuration * 1.2)) {
      const msg = `Длительность аудиофайла (${formatDuration(actualDuration)}) не совпадает с треком (${formatDuration(expectedDuration)}). Скачивание отменено во избежание неполного файла.`;

      toast.error(msg, {
        title: 'Несоответствие длительности',
        duration: 9000,
        actionLabel: `Скачать фрагмент (${formatDuration(actualDuration)})`,
        onAction: () => {
          downloadReelAudio(reel, onProgress, {
            ...options,
            allowDurationMismatch: true,
          }).catch(console.warn);
        },
      });

      throw new Error(msg);
    }
  }

  // 4. Verification successful: save file
  onProgress?.('Сохранение MP3 файла...');
  const mp3Blob = new Blob([blob], { type: 'audio/mp3' });
  saveAs(mp3Blob, fileName);

  onProgress?.('Аудио успешно сохранено!');
  toast.success(
    `Трек «${title}» (${formatDuration(actualDuration)}) успешно проверен и сохранен!`,
    { title: 'Файл загружен' }
  );
}
