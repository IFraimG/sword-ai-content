export type Platform = 'tiktok' | 'instagram';

export type ContinentId = 'all' | 'na' | 'eu' | 'asia' | 'latam' | 'cis' | 'mena';

export type CountryId =
  | 'all'
  | 'us'
  | 'ca'
  | 'gb'
  | 'de'
  | 'fr'
  | 'it'
  | 'es'
  | 'jp'
  | 'kr'
  | 'in'
  | 'br'
  | 'mx'
  | 'ru'
  | 'kz'
  | 'ae'
  | 'tr';

export interface ContinentInfo {
  id: ContinentId;
  label: string;
  icon: string;
}

export interface CountryInfo {
  id: CountryId;
  label: string;
  continent: ContinentId;
  flag: string;
  code: string;
}

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
  | 'lifestyle'
  | 'gaming_anime'
  | 'auto_tech';

export interface NicheInfo {
  id: Niche;
  label: string;
  icon: string;
  color: string;
  isPopularInRegion?: boolean;
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
  continent: ContinentId;
  country: CountryId;
  countryFlag: string;
  countryName: string;
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
  backupVideoUrl?: string;
  originalUrl: string;
  durationSeconds: number;
  metrics: ReelMetrics;
  createdAt: string;
  updatedAt: string;
}

export type SortBy = 'rank' | 'views' | 'velocity' | 'engagement' | 'recent';

export interface FilterState {
  searchQuery: string;
  selectedContinent: ContinentId;
  selectedCountry: CountryId;
  selectedNiche: Niche;
  sortBy: SortBy;
  platform?: Platform | 'all';
}

export type ExportFormat = 'docx' | 'pdf' | 'txt';

export interface ExportConfig {
  format: ExportFormat;
  platformScope: 'both' | 'tiktok' | 'instagram';
  continentScope: ContinentId;
  countryScope: CountryId;
  includeMetrics: {
    views: boolean;
    likes: boolean;
    shares: boolean;
    engagement: boolean;
    velocity: boolean;
    soundInfo: boolean;
    hashtags: boolean;
    geoInfo: boolean;
  };
  filterNiche?: Niche;
}
