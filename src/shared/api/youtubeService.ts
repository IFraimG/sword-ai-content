import { getApiBaseUrl } from './reelsApi';
import type { YouTubeNiche, YouTubeSearchResponse } from '@/entities/youtube/model/types';

/**
 * YouTube Service - Dynamic Client API
 *
 * Strict constraint:
 * 1. ZERO static/hardcoded video arrays stored in files.
 * 2. Videos are exclusively fetched dynamically from the Fastify server.
 * 3. Client validates that every video satisfies durationSeconds > 3600.
 */

export interface FetchYouTubeVideosParams {
  query?: string;
  niche?: YouTubeNiche;
  limit?: number;
  page?: number;
  refresh?: boolean;
}

export async function fetchYouTubeVideos(
  params: FetchYouTubeVideosParams = {}
): Promise<YouTubeSearchResponse> {
  const { query = '', niche = 'all', limit = 24, page = 1, refresh = false } = params;
  const base = getApiBaseUrl();

  if (!base) {
    throw new Error('API-сервер не настроен. Укажите адрес сервера в настройках.');
  }

  const qParams = new URLSearchParams();
  if (query && query.trim()) qParams.set('q', query.trim());
  if (niche && niche !== 'all') qParams.set('niche', niche);
  if (limit) qParams.set('limit', String(limit));
  if (page && page > 1) qParams.set('page', String(page));
  if (refresh) qParams.set('refresh', 'true');

  const url = `${base}/api/youtube/search?${qParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(18000), // generous timeout for live scraper on cold start
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Сервер вернул ошибку HTTP ${response.status}${errorText ? `: ${errorText.slice(0, 100)}` : ''}`
    );
  }

  const data: YouTubeSearchResponse = await response.json();

  if (!data || !Array.isArray(data.items)) {
    throw new Error('Некорректный формат ответа от сервера YouTube API');
  }

  // Client-side strict filter enforcement: ensure every single returned item has duration > 3600s
  const strictlyLongItems = data.items.filter((item) => item.durationSeconds > 3600);

  return {
    ...data,
    page,
    hasMore: data.hasMore !== undefined ? data.hasMore : strictlyLongItems.length > 0,
    count: strictlyLongItems.length,
    items: strictlyLongItems,
  };
}
