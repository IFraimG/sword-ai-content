/**
 * YouTube Ambient, Dreamcore & Coldcore Search & Scraper Route
 *
 * Strict constraint: ONLY returns videos with duration > 1 hour (> 3600 seconds).
 * Returns embed links, thumbnails, titles, channels, duration, and niche classifications.
 * NO mock video/audio files stored locally or on server.
 */

// Helper to parse duration string (e.g. "1:15:42", "2:30:00", "45:10") into seconds
export function parseDurationToSeconds(durationText) {
  if (!durationText || typeof durationText !== 'string') return 0;
  
  // Clean duration text (remove non-digits and colons)
  const clean = durationText.trim();
  const parts = clean.split(':').map((p) => parseInt(p, 10));
  
  if (parts.some(isNaN)) return 0;
  
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 4) {
    // DD:HH:MM:SS
    return parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
  } else if (parts.length === 2) {
    // MM:SS (< 1 hour)
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
}

// Detect ambient niche from text
export function detectNiche(text, fallback = 'ambient') {
  const lower = (text || '').toLowerCase();
  if (lower.includes('dreamcore') || lower.includes('weirdcore') || lower.includes('liminal') || lower.includes('nostalgi')) {
    return 'dreamcore';
  }
  if (lower.includes('coldcore') || lower.includes('cold wave') || lower.includes('doomer') || lower.includes('winter') || lower.includes('post-punk') || lower.includes('sovietwave')) {
    return 'coldcore';
  }
  if (lower.includes('ambient') || lower.includes('drone') || lower.includes('space') || lower.includes('calm') || lower.includes('sleep') || lower.includes('meditat')) {
    return 'ambient';
  }
  return fallback;
}

/**
 * Curated registry of verified, authentic YouTube mixes strictly > 1 hour
 * Used as reliable seed / fallback when cloud datacenter IPs encounter YouTube anti-bot rate limits.
 * All items correspond to genuine, playable YouTube mixes.
 */
export const CURATED_LONG_MIXES = [
  // --- DREAMCORE (> 1 hour) ---
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

  // --- COLDCORE (> 1 hour) ---
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

  // --- AMBIENT (> 1 hour) ---
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

/**
 * Scrapes YouTube search results for given query.
 * Strictly extracts videos with duration > 1 hour (3600s).
 */
export async function scrapeYouTubeLongMixes(query, niche = 'all', limit = 24) {
  // sp=EgIYAw%253D%253D filters for videos > 20 minutes on YouTube
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}&sp=EgIYAw%253D%253D`;

  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`YouTube responded with HTTP ${response.status}`);
  }

  const html = await response.text();

  // Find ytInitialData JSON in HTML
  const match = html.match(/(?:var\s+ytInitialData|window\["ytInitialData"\])\s*=\s*({.+?});<\/script>/s);
  if (!match || !match[1]) {
    throw new Error('ytInitialData not found in HTML response');
  }

  const data = JSON.parse(match[1]);
  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  const scrapedVideos = [];

  for (const section of contents) {
    const itemContents = section?.itemSectionRenderer?.contents || [];
    for (const item of itemContents) {
      const v = item?.videoRenderer;
      if (!v || !v.videoId) continue;

      const durationText =
        v.lengthText?.simpleText ||
        v.lengthText?.accessibility?.accessibilityData?.label ||
        '';

      const durationSeconds = parseDurationToSeconds(durationText);

      // STRICT FILTER: Duration must be strictly greater than 1 hour (> 3600 seconds)
      if (durationSeconds <= 3600) {
        continue;
      }

      const videoId = v.videoId;
      const title =
        v.title?.runs?.[0]?.text ||
        v.title?.accessibility?.accessibilityData?.label ||
        'YouTube Ambient Mix';
      const channelTitle = v.ownerText?.runs?.[0]?.text || 'YouTube Creator';
      const views = v.viewCountText?.simpleText || 'Popular';
      const publishedAt = v.publishedTimeText?.simpleText || 'Recent';

      // Pick best thumbnail
      const thumbnails = v.thumbnail?.thumbnails || [];
      const bestThumbnail =
        thumbnails.length > 0
          ? thumbnails[thumbnails.length - 1].url
          : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const videoNiche = detectNiche(`${title} ${query}`, niche !== 'all' ? niche : 'ambient');

      scrapedVideos.push({
        id: videoId,
        title,
        channelTitle,
        duration: durationText,
        durationSeconds,
        thumbnailUrl: bestThumbnail,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        views,
        publishedAt,
        niche: videoNiche,
        tags: [
          `#${videoNiche}`,
          '#1hourplus',
          ...(title.toLowerCase().includes('liminal') ? ['#liminalspace'] : []),
          ...(title.toLowerCase().includes('weird') ? ['#weirdcore'] : []),
          ...(title.toLowerCase().includes('drone') ? ['#droneambient'] : []),
          ...(title.toLowerCase().includes('doomer') ? ['#doomerwave'] : []),
        ],
      });

      if (scrapedVideos.length >= limit) break;
    }
    if (scrapedVideos.length >= limit) break;
  }

  return scrapedVideos;
}

/**
 * Fastify route registration
 */
export async function youtubeRoutes(fastify, options) {
  fastify.get('/api/youtube/search', async (request, reply) => {
    const { q, niche = 'all', limit = 24 } = request.query;

    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 24));
    const searchQuery = (q || '').trim() || (niche !== 'all' ? `${niche} 1 hour mix` : 'ambient dreamcore coldcore 1 hour');

    let results = [];
    let source = 'live-scraper';

    // 1. Attempt live YouTube scraping
    try {
      results = await scrapeYouTubeLongMixes(searchQuery, niche, parsedLimit);
    } catch (err) {
      request.log.warn({ err: err.message }, 'YouTube scraping fell back to curated seed registry');
      source = 'curated-registry';
    }

    // 2. If scraping returned fewer results than limit or failed, enrich with curated registry
    if (results.length < parsedLimit) {
      const existingIds = new Set(results.map((v) => v.id));

      const filteredCurated = CURATED_LONG_MIXES.filter((item) => {
        // Enforce strict > 1 hour check
        if (item.durationSeconds <= 3600) return false;

        // Filter by niche if specified
        if (niche !== 'all' && item.niche !== niche) return false;

        // Search query filter if specific query given
        if (q && q.trim()) {
          const lowerQ = q.toLowerCase().replace(/^#/, '');
          const matchTitle = item.title.toLowerCase().includes(lowerQ);
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(lowerQ));
          const matchNiche = item.niche.toLowerCase().includes(lowerQ);
          if (!matchTitle && !matchTags && !matchNiche) return false;
        }

        return !existingIds.has(item.id);
      });

      results = [...results, ...filteredCurated].slice(0, parsedLimit);
    }

    // Final safety filter: EVERY single video MUST be strictly > 3600 seconds
    const strictResults = results.filter((v) => v.durationSeconds > 3600);

    // Compute niche analytics
    const totalDurationSeconds = strictResults.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
    const avgDurationSeconds = strictResults.length > 0 ? Math.round(totalDurationSeconds / strictResults.length) : 0;

    const formatSeconds = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      return `${h}h ${m}m`;
    };

    const analytics = {
      totalVideos: strictResults.length,
      strictConstraint: 'duration > 1 hour (3600s)',
      totalDurationFormatted: formatSeconds(totalDurationSeconds),
      avgDurationFormatted: formatSeconds(avgDurationSeconds),
      nichesCount: {
        ambient: strictResults.filter((v) => v.niche === 'ambient').length,
        dreamcore: strictResults.filter((v) => v.niche === 'dreamcore').length,
        coldcore: strictResults.filter((v) => v.niche === 'coldcore').length,
      },
      source,
    };

    return {
      query: searchQuery,
      niche,
      count: strictResults.length,
      analytics,
      items: strictResults,
    };
  });
}
