import { getApiBaseUrl } from '@/shared/api/reelsApi';
import type { AtmosphereAnalysisResponse } from '../model/types';
import type { YouTubeVideo } from '@/entities/youtube/model/types';

export interface AnalyzeAtmosphereParams {
  video: YouTubeVideo;
  prompt: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

/**
 * Sends a multi-modal analysis request to the Fastify backend LLaVA 1.5 7B service
 */
export async function analyzeAtmosphereWithLLaVA(
  params: AnalyzeAtmosphereParams
): Promise<AtmosphereAnalysisResponse> {
  const { video, prompt, history = [] } = params;
  const base = getApiBaseUrl();

  if (!base) {
    throw new Error('API сервер не настроен');
  }

  const payload = {
    videoId: video.id,
    title: video.title,
    description: video.description || '',
    thumbnailUrl: video.thumbnailUrl,
    prompt,
    history: history.slice(-6), // keep last 6 turns for context
  };

  const response = await fetch(`${base}/api/youtube/analyze-atmosphere`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(18000), // generous timeout for vision model
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `Ошибка сервера LLaVA (${response.status}): ${errorBody.slice(0, 100) || 'Попробуйте позже'}`
    );
  }

  const data: AtmosphereAnalysisResponse = await response.json();
  return data;
}
