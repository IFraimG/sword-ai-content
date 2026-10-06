export type Platform = 'tiktok' | 'instagram';

export type Niche =
  | 'all'
  | 'ai_tech'
  | 'humor_memes'
  | 'business_finance'
  | 'fitness_sport'
  | 'dance_music'
  | 'food_cooking'
  | 'travel'
  | 'fashion_beauty'
  | 'lifestyle';

export interface NicheInfo {
  id: Niche;
  label: string;
  icon: string;
  color: string;
}

export interface ReelMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number; // e.g. 8.4 (%)
  velocityScore: number;  // Growth velocity e.g. +24% per hour
  viewsGrowthLastHour: number;
}

export interface Reel {
  id: string;
  platform: Platform;
  title: string;
  description: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified: boolean;
  authorFollowers: number;
  niche: Niche;
  hashtags: string[];
  soundTitle: string;
  soundAuthor: string;
  soundIsTrending: boolean;
  publishedAt: string;
  trendingRank: number;
  rankChange: 'up' | 'down' | 'same' | 'new';
  rankChangeDelta: number;
  thumbnailUrl: string;
  videoUrl?: string;
  originalUrl: string;
  durationSeconds: number;
  metrics: ReelMetrics;
  createdAt: string;
  updatedAt: string;
}

export type SortBy = 'rank' | 'views' | 'velocity' | 'engagement' | 'recent';

export interface FilterState {
  searchQuery: string;
  selectedNiche: Niche;
  sortBy: SortBy;
  platform?: Platform | 'all';
}

export type ExportFormat = 'docx' | 'pdf' | 'txt';

export interface ExportConfig {
  format: ExportFormat;
  platformScope: 'both' | 'tiktok' | 'instagram';
  includeMetrics: {
    views: boolean;
    likes: boolean;
    shares: boolean;
    engagement: boolean;
    velocity: boolean;
    soundInfo: boolean;
    hashtags: boolean;
  };
  filterNiche?: Niche;
}
