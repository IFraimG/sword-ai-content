/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;

  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_BASE_URL?: string;

  readonly VITE_TIKTOK_API_BASE_URL?: string;
  readonly VITE_TIKTOK_CLIENT_KEY?: string;
  readonly VITE_TIKTOK_CLIENT_SECRET?: string;
  readonly VITE_TIKTOK_ACCESS_TOKEN?: string;
  readonly VITE_TIKTOK_APP_ID?: string;
  readonly VITE_TIKTOK_ACCOUNT_USERNAME?: string;
  readonly VITE_TIKTOK_ACCOUNT_EMAIL?: string;

  readonly VITE_RAPIDAPI_TIKTOK_HOST?: string;
  readonly VITE_RAPIDAPI_TIKTOK_KEY?: string;
  readonly VITE_TIKTOK_TRENDING_ENDPOINT?: string;

  readonly VITE_MUSIC_SEARCH_API_URL?: string;
  readonly VITE_SPOTIFY_SEARCH_URL?: string;
  readonly VITE_YOUTUBE_MUSIC_SEARCH_URL?: string;
  readonly VITE_APPLE_MUSIC_SEARCH_URL?: string;
  readonly VITE_SOUNDCLOUD_SEARCH_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
