import type { Reel, MatchedMusicTrack } from '@/entities/reel/model/types';

/**
 * Returns the currently active Fastify backend API URL.
 * Checks localStorage first, then environment variable, then dev fallback.
 * Returns empty string if no server is configured.
 */
export function getApiBaseUrl(): string {
  // 1. User-configured custom URL in browser storage
  const userConfigured = typeof window !== 'undefined' ? localStorage.getItem('sword_api_url') : null;
  if (userConfigured && userConfigured.trim()) {
    return userConfigured.trim().replace(/\/$/, '');
  }

  // 2. Vite environment variable (ignored if it's the uncreated placeholder domain)
  const envUrl = import.meta.env.VITE_API_URL;
  if (
    envUrl &&
    typeof envUrl === 'string' &&
    envUrl.trim() &&
    !envUrl.includes('sword-ai-content-api.onrender.com')
  ) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // 3. Localhost in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }

  // 4. In production (GitHub Pages) with no server configured yet, return empty
  return '';
}

export function setCustomApiUrl(url: string): void {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('sword_api_url');
  } else {
    localStorage.setItem('sword_api_url', url.trim().replace(/\/$/, ''));
  }
}

export function getCustomApiUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('sword_api_url') || '';
}

export interface FetchTrendsParams {
  platform?: string;
  continent?: string;
  country?: string;
  niche?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}

export interface TrendsResponse {
  items: Reel[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface ResolvedStream {
  available: boolean;
  platform?: string;
  videoUrl?: string | null;
  directVideoUrl?: string | null;
  audioUrl?: string | null;
  directAudioUrl?: string | null;
  duration?: number | null;
  reason?: string;
  author?: any;
  cover?: string;
}

/**
 * Checks if the Fastify backend is reachable
 */
export async function checkServerHealth(targetUrl?: string): Promise<boolean> {
  const base = (targetUrl !== undefined ? targetUrl : getApiBaseUrl()).replace(/\/$/, '');
  if (!base) return false;

  try {
    const res = await fetch(`${base}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches filtered platform trends with pagination.
 * If backend is not configured or offline, returns null to trigger fallback to master catalog.
 */
export async function fetchTrends(params: FetchTrendsParams = {}): Promise<TrendsResponse | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }

  try {
    const query = new URLSearchParams();
    if (params.platform) query.set('platform', params.platform);
    if (params.continent) query.set('continent', params.continent);
    if (params.country) query.set('country', params.country);
    if (params.niche) query.set('niche', params.niche);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));

    const url = `${base}/api/reels/trends?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Dynamically resolves direct video and audio streams for a reel from platform
 */
export async function resolveReelStream(
  platform: string,
  originalUrl: string
): Promise<ResolvedStream> {
  if (!originalUrl) {
    return {
      available: false,
      reason: 'Отсутствует ссылка на оригинальный рилс',
    };
  }

  const base = getApiBaseUrl();
  if (!base) {
    return {
      available: false,
      reason: 'Fastify бэкенд не подключен. Видео можно просмотреть напрямую на платформе.',
    };
  }

  try {
    const query = new URLSearchParams({
      platform,
      url: originalUrl,
    });
    const url = `${base}/api/reels/resolve?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return {
        available: false,
        reason: `Сервер вернул статус ${response.status}`,
      };
    }

    return response.json();
  } catch (err: any) {
    return {
      available: false,
      reason: err.message || 'Ошибка подключения к серверу разрешения потоков',
    };
  }
}

/**
 * Searches real music tracks with live audio previews via Fastify backend
 */
export async function searchMusic(q: string, limit = 10): Promise<{ items: MatchedMusicTrack[] }> {
  if (!q || !q.trim()) {
    return { items: [] };
  }

  const base = getApiBaseUrl();
  if (!base) {
    return { items: [] };
  }

  try {
    const url = `${base}/api/music/search?q=${encodeURIComponent(q.trim())}&limit=${limit}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return { items: [] };
    }

    return res.json();
  } catch {
    return { items: [] };
  }
}
