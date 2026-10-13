/**
 * YouTube ambient, dreamcore and coldcore entities & types
 */

export type YouTubeNiche = 'all' | 'ambient' | 'dreamcore' | 'coldcore';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  duration: string; // e.g. "1:24:18"
  durationSeconds: number; // MUST BE > 3600
  thumbnailUrl: string;
  embedUrl: string; // https://www.youtube.com/embed/{id}
  youtubeUrl: string; // https://www.youtube.com/watch?v={id}
  views: string;
  publishedAt: string;
  niche: 'ambient' | 'dreamcore' | 'coldcore';
  tags: string[];
}

export interface YouTubeAnalyticsSummary {
  totalVideos: number;
  strictConstraint: string;
  totalDurationFormatted: string;
  avgDurationFormatted: string;
  nichesCount: {
    ambient: number;
    dreamcore: number;
    coldcore: number;
  };
  source: string;
}

export interface YouTubeSearchResponse {
  query: string;
  niche: YouTubeNiche;
  page?: number;
  hasMore?: boolean;
  count: number;
  analytics: YouTubeAnalyticsSummary;
  items: YouTubeVideo[];
}
