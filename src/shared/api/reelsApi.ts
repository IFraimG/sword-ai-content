import type { Reel, MatchedMusicTrack } from '@/entities/reel/model/types';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

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
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches filtered platform trends with pagination
 */
export async function fetchTrends(params: FetchTrendsParams = {}): Promise<TrendsResponse> {
  const query = new URLSearchParams();
  if (params.platform) query.set('platform', params.platform);
  if (params.continent) query.set('continent', params.continent);
  if (params.country) query.set('country', params.country);
  if (params.niche) query.set('niche', params.niche);
  if (params.search) query.set('search', params.search);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.offset !== undefined) query.set('offset', String(params.offset));

  const url = `${API_BASE_URL}/api/reels/trends?${query.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trends: HTTP ${response.status}`);
  }

  return response.json();
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

  try {
    const query = new URLSearchParams({
      platform,
      url: originalUrl,
    });
    const url = `${API_BASE_URL}/api/reels/resolve?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
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

  try {
    const url = `${API_BASE_URL}/api/music/search?q=${encodeURIComponent(q.trim())}&limit=${limit}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { items: [] };
    }

    return res.json();
  } catch {
    return { items: [] };
  }
}
