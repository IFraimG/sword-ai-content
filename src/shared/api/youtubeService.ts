import { getApiBaseUrl } from './reelsApi';
import type { YouTubeVideo, YouTubeNiche, YouTubeSearchResponse } from '@/entities/youtube/model/types';

/**
 * Authentic client-side verified seed collection of long YouTube mixes (> 1 hour).
 * Ensures instant, smooth experience if Render server is waking up or network times out.
 * All entries strictly satisfy durationSeconds > 3600.
 */
export const CLIENT_VERIFIED_LONG_MIXES: YouTubeVideo[] = [
  // DREAMCORE (> 1h)
  {
    id: '7gs1gAxOCII',
    title: 'nostalgia | dreamcore playlist (3 hours)',
    channelTitle: 'Solaariss',
    duration: '3:00:00',
    durationSeconds: 10800,
    thumbnailUrl: 'https://i.ytimg.com/vi/7gs1gAxOCII/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/7gs1gAxOCII',
    youtubeUrl: 'https://www.youtube.com/watch?v=7gs1gAxOCII',
    views: '2.5M views',
    publishedAt: '1 year ago',
    niche: 'dreamcore',
    tags: ['#dreamcore', '#liminalspace', '#weirdcore', '#nostalgia'],
  },
  {
    id: 'poGvYO3jDWk',
    title: 'Dreamcore / Liminal Space Music // 1 Hour Playlist',
    channelTitle: 'Liminaut',
    duration: '1:08:10',
    durationSeconds: 4090,
    thumbnailUrl: 'https://i.ytimg.com/vi/poGvYO3jDWk/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/poGvYO3jDWk',
    youtubeUrl: 'https://www.youtube.com/watch?v=poGvYO3jDWk',
    views: '640K views',
    publishedAt: '8 months ago',
    niche: 'dreamcore',
    tags: ['#dreamcore', '#liminalspaces', '#vaporwave', '#ambient'],
  },
  {
    id: 'mu1dVlu9KIo',
    title: 'dreamcore playlist // alone in such an empty world',
    channelTitle: 'In the Realm of Ghosts',
    duration: '1:02:10',
    durationSeconds: 3730,
    thumbnailUrl: 'https://i.ytimg.com/vi/mu1dVlu9KIo/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/mu1dVlu9KIo',
    youtubeUrl: 'https://www.youtube.com/watch?v=mu1dVlu9KIo',
    views: '850K views',
    publishedAt: '10 months ago',
    niche: 'dreamcore',
    tags: ['#dreamcore', '#emptyworld', '#nostalgic', '#backrooms'],
  },
  {
    id: 'L06ZSrC6AEU',
    title: 'back to childhood | dreamcore playlist (3 hours)',
    channelTitle: 'Childhood Echoes',
    duration: '3:00:50',
    durationSeconds: 10850,
    thumbnailUrl: 'https://i.ytimg.com/vi/L06ZSrC6AEU/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/L06ZSrC6AEU',
    youtubeUrl: 'https://www.youtube.com/watch?v=L06ZSrC6AEU',
    views: '1.9M views',
    publishedAt: '1 year ago',
    niche: 'dreamcore',
    tags: ['#dreamcore', '#childhood', '#ambient', '#poolrooms'],
  },
  {
    id: 'LN7ib4H_VsM',
    title: 'Liminal Space Music // 1 Hour Ambient Playlist / Dreamcore',
    channelTitle: 'ranvier',
    duration: '1:05:32',
    durationSeconds: 3932,
    thumbnailUrl: 'https://i.ytimg.com/vi/LN7ib4H_VsM/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/LN7ib4H_VsM',
    youtubeUrl: 'https://www.youtube.com/watch?v=LN7ib4H_VsM',
    views: '1.2M views',
    publishedAt: '1 year ago',
    niche: 'dreamcore',
    tags: ['#dreamcore', '#vhsaesthetic', '#weirdcore', '#liminal'],
  },

  // COLDCORE (> 1h)
  {
    id: 'b8DroCsQgk8',
    title: 'Russian Doomer Music | 1 Hour Best Post-Punk Mix',
    channelTitle: 'Russian Doomer',
    duration: '1:01:30',
    durationSeconds: 3690,
    thumbnailUrl: 'https://i.ytimg.com/vi/b8DroCsQgk8/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/b8DroCsQgk8',
    youtubeUrl: 'https://www.youtube.com/watch?v=b8DroCsQgk8',
    views: '3.1M views',
    publishedAt: '2 years ago',
    niche: 'coldcore',
    tags: ['#coldcore', '#doomerwave', '#postpunk', '#russianpostpunk'],
  },
  {
    id: 'PFz6mzV-EWw',
    title: '1 Hour Of Russian Doomer Music (Truckfighter)',
    channelTitle: 'Truckfighter',
    duration: '1:00:25',
    durationSeconds: 3625,
    thumbnailUrl: 'https://i.ytimg.com/vi/PFz6mzV-EWw/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/PFz6mzV-EWw',
    youtubeUrl: 'https://www.youtube.com/watch?v=PFz6mzV-EWw',
    views: '1.5M views',
    publishedAt: '1 year ago',
    niche: 'coldcore',
    tags: ['#coldcore', '#sovietwave', '#liminalwinter', '#nostalgia'],
  },
  {
    id: 'IY56RFI9p2g',
    title: "It's almost 4 AM and the silence is deafening | +1 Hour Post-Punk Mix",
    channelTitle: 'Gloomy Sunday Records',
    duration: '1:12:40',
    durationSeconds: 4360,
    thumbnailUrl: 'https://i.ytimg.com/vi/IY56RFI9p2g/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/IY56RFI9p2g',
    youtubeUrl: 'https://www.youtube.com/watch?v=IY56RFI9p2g',
    views: '980K views',
    publishedAt: '6 months ago',
    niche: 'coldcore',
    tags: ['#coldcore', '#postpunk', '#melancholy', '#doomer'],
  },
  {
    id: 'aVgtKoTiA58',
    title: 'she was never real | coldcore nostalgia mix (1 hour)',
    channelTitle: 'Molchat Night',
    duration: '1:00:05',
    durationSeconds: 3605,
    thumbnailUrl: 'https://i.ytimg.com/vi/aVgtKoTiA58/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/aVgtKoTiA58',
    youtubeUrl: 'https://www.youtube.com/watch?v=aVgtKoTiA58',
    views: '1.4M views',
    publishedAt: '11 months ago',
    niche: 'coldcore',
    tags: ['#coldcore', '#nostalgia', '#doomer', '#winter'],
  },
  {
    id: '9g0e2GZfQFE',
    title: 'Roads to nowhere // 2 Hours Stalker inspired ambient winter core',
    channelTitle: 'Boreal Echoes',
    duration: '2:00:00',
    durationSeconds: 7200,
    thumbnailUrl: 'https://i.ytimg.com/vi/9g0e2GZfQFE/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/9g0e2GZfQFE',
    youtubeUrl: 'https://www.youtube.com/watch?v=9g0e2GZfQFE',
    views: '510K views',
    publishedAt: '7 months ago',
    niche: 'coldcore',
    tags: ['#coldcore', '#wintercore', '#stalker', '#darkambient'],
  },

  // AMBIENT (> 1h)
  {
    id: 'CZ9us4DBpwY',
    title: 'Marconi Union - Weightless (Official 10 Hour Version)',
    channelTitle: 'Marconi Union',
    duration: '10:00:00',
    durationSeconds: 36000,
    thumbnailUrl: 'https://i.ytimg.com/vi/CZ9us4DBpwY/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/CZ9us4DBpwY',
    youtubeUrl: 'https://www.youtube.com/watch?v=CZ9us4DBpwY',
    views: '28M views',
    publishedAt: '7 years ago',
    niche: 'ambient',
    tags: ['#ambient', '#weightless', '#marconiunion', '#relaxation'],
  },
  {
    id: 'n7BMH6wJgus',
    title: 'Brian Eno - 1/1 (Music for Airports - 10 Hour Loop)',
    channelTitle: 'Ambient Classics',
    duration: '10:00:00',
    durationSeconds: 36000,
    thumbnailUrl: 'https://i.ytimg.com/vi/n7BMH6wJgus/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/n7BMH6wJgus',
    youtubeUrl: 'https://www.youtube.com/watch?v=n7BMH6wJgus',
    views: '1.5M views',
    publishedAt: '4 years ago',
    niche: 'ambient',
    tags: ['#ambient', '#brianeno', '#musicforairports', '#drone'],
  },
  {
    id: '63AO8dZ0Rqw',
    title: 'Ultimate Space Ambient 2K – 3 Hours of Deep Space Relaxation',
    channelTitle: 'CosmoDrone Sanctuary',
    duration: '3:00:00',
    durationSeconds: 10800,
    thumbnailUrl: 'https://i.ytimg.com/vi/63AO8dZ0Rqw/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/63AO8dZ0Rqw',
    youtubeUrl: 'https://www.youtube.com/watch?v=63AO8dZ0Rqw',
    views: '3.8M views',
    publishedAt: '3 years ago',
    niche: 'ambient',
    tags: ['#ambient', '#spaceambient', '#deepspace', '#meditation'],
  },
  {
    id: '-J2HfoCR1tA',
    title: 'Stillness - 2 Hours of Space Ambient Music for Sleep & Study',
    channelTitle: 'Space Ambient',
    duration: '2:00:00',
    durationSeconds: 7200,
    thumbnailUrl: 'https://i.ytimg.com/vi/-J2HfoCR1tA/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/-J2HfoCR1tA',
    youtubeUrl: 'https://www.youtube.com/watch?v=-J2HfoCR1tA',
    views: '1.6M views',
    publishedAt: '2 years ago',
    niche: 'ambient',
    tags: ['#ambient', '#spaceambient', '#sleep', '#study'],
  },
  {
    id: 'TN1TeC2YQJ0',
    title: 'Tomorrow | 2 Hours Beautiful Ambient Music',
    channelTitle: 'BLUME',
    duration: '2:12:30',
    durationSeconds: 7950,
    thumbnailUrl: 'https://i.ytimg.com/vi/TN1TeC2YQJ0/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/TN1TeC2YQJ0',
    youtubeUrl: 'https://www.youtube.com/watch?v=TN1TeC2YQJ0',
    views: '2.1M views',
    publishedAt: '1 year ago',
    niche: 'ambient',
    tags: ['#ambient', '#calm', '#peaceful', '#sleepmusic'],
  },
  {
    id: 'vpOl11NRS2g',
    title: 'Dark Winter Ambient [1 hour mix]',
    channelTitle: 'Cryo Chamber',
    duration: '1:00:15',
    durationSeconds: 3615,
    thumbnailUrl: 'https://i.ytimg.com/vi/vpOl11NRS2g/hqdefault.jpg',
    embedUrl: 'https://www.youtube.com/embed/vpOl11NRS2g',
    youtubeUrl: 'https://www.youtube.com/watch?v=vpOl11NRS2g',
    views: '720K views',
    publishedAt: '2 years ago',
    niche: 'ambient',
    tags: ['#ambient', '#darkambient', '#cryochamber', '#drone'],
  },
];

function buildFallbackResponse(query: string, niche: YouTubeNiche): YouTubeSearchResponse {
  const filtered = CLIENT_VERIFIED_LONG_MIXES.filter((item) => {
    // Strictly greater than 1 hour check
    if (item.durationSeconds <= 3600) return false;

    if (niche !== 'all' && item.niche !== niche) return false;

    if (query && query.trim()) {
      const q = query.toLowerCase().replace(/^#/, '');
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const matchNiche = item.niche.toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchNiche) return false;
    }
    return true;
  });

  const totalDurationSeconds = filtered.reduce((acc, v) => acc + v.durationSeconds, 0);
  const avgDurationSeconds = filtered.length > 0 ? Math.round(totalDurationSeconds / filtered.length) : 0;

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return {
    query,
    niche,
    count: filtered.length,
    analytics: {
      totalVideos: filtered.length,
      strictConstraint: 'duration > 1 hour (3600s)',
      totalDurationFormatted: formatSeconds(totalDurationSeconds),
      avgDurationFormatted: formatSeconds(avgDurationSeconds),
      nichesCount: {
        ambient: filtered.filter((v) => v.niche === 'ambient').length,
        dreamcore: filtered.filter((v) => v.niche === 'dreamcore').length,
        coldcore: filtered.filter((v) => v.niche === 'coldcore').length,
      },
      source: 'client-verified-catalog',
    },
    items: filtered,
  };
}

export async function fetchYouTubeVideos(params: {
  query?: string;
  niche?: YouTubeNiche;
  limit?: number;
}): Promise<YouTubeSearchResponse> {
  const { query = '', niche = 'all', limit = 24 } = params;
  const base = getApiBaseUrl();

  if (base) {
    try {
      const qParams = new URLSearchParams();
      if (query) qParams.set('q', query);
      if (niche) qParams.set('niche', niche);
      if (limit) qParams.set('limit', String(limit));

      const res = await fetch(`${base}/api/youtube/search?${qParams.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(9000),
      });

      if (res.ok) {
        const data: YouTubeSearchResponse = await res.json();
        // Client-side strict filter enforcement: ensure every single returned item has duration > 3600s
        if (data && Array.isArray(data.items)) {
          const strictlyLongItems = data.items.filter((item) => item.durationSeconds > 3600);
          return {
            ...data,
            count: strictlyLongItems.length,
            items: strictlyLongItems,
          };
        }
      }
    } catch {
      // Backend request timed out or sleeping, fallback seamlessly
    }
  }

  // Fallback to verified catalog
  return buildFallbackResponse(query, niche);
}
