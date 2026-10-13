/**
 * YouTube Ambient, Dreamcore & Coldcore Search & Dynamic Scraper Route
 *
 * Strict constraint: ONLY returns videos with duration > 1 hour (> 3600 seconds).
 * Dynamically scrapes YouTube search results in real time with lazy-loading & pagination support.
 * NO static video links stored in files.
 * NO local mock/stored video or audio files.
 */

// In-memory RAM cache with 15-minute TTL (cleared on auto-refresh or expiry)
const dynamicMemoryCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Helper to parse duration string (e.g. "1:15:42", "2:30:00", "1:00:05") into seconds
 */
export function parseDurationToSeconds(durationText) {
  if (!durationText || typeof durationText !== 'string') return 0;

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

/**
 * Detect ambient niche from text
 */
export function detectNiche(text, fallback = 'ambient') {
  const lower = (text || '').toLowerCase();
  if (
    lower.includes('dreamcore') ||
    lower.includes('weirdcore') ||
    lower.includes('liminal') ||
    lower.includes('nostalgi') ||
    lower.includes('backrooms') ||
    lower.includes('poolrooms')
  ) {
    return 'dreamcore';
  }
  if (
    lower.includes('coldcore') ||
    lower.includes('cold wave') ||
    lower.includes('doomer') ||
    lower.includes('winter') ||
    lower.includes('post-punk') ||
    lower.includes('sovietwave') ||
    lower.includes('stalker')
  ) {
    return 'coldcore';
  }
  if (
    lower.includes('ambient') ||
    lower.includes('drone') ||
    lower.includes('space') ||
    lower.includes('calm') ||
    lower.includes('sleep') ||
    lower.includes('meditat') ||
    lower.includes('weightless')
  ) {
    return 'ambient';
  }
  return fallback;
}

/**
 * Extracts duration text from diverse YouTube videoRenderer formats
 * (handles lengthText, thumbnailOverlays, accessibility labels)
 */
function extractDurationText(v) {
  if (!v) return '';

  if (v.lengthText?.simpleText) {
    return v.lengthText.simpleText;
  }
  if (Array.isArray(v.lengthText?.runs) && v.lengthText.runs.length > 0) {
    return v.lengthText.runs.map((r) => r.text).join('');
  }

  // Modern YouTube web stores duration inside thumbnailOverlays
  if (Array.isArray(v.thumbnailOverlays)) {
    for (const overlay of v.thumbnailOverlays) {
      const timeRenderer = overlay?.thumbnailOverlayTimeStatusRenderer;
      if (timeRenderer?.text?.simpleText) {
        return timeRenderer.text.simpleText;
      }
      if (Array.isArray(timeRenderer?.text?.runs)) {
        return timeRenderer.text.runs.map((r) => r.text).join('');
      }
    }
  }

  return '';
}

/**
 * Parses search contents JSON from YouTube (works for both Innertube JSON & ytInitialData)
 */
function parseSearchResults(contents, query, niche = 'all', limit = 24) {
  const scrapedVideos = [];
  const seenIds = new Set();

  function processVideoRenderer(v) {
    if (!v || !v.videoId || seenIds.has(v.videoId)) return;

    // Reject live streams or badges
    if (v.badges?.some((b) => b?.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW')) {
      return;
    }

    const durationText = extractDurationText(v);
    const durationSeconds = parseDurationToSeconds(durationText);

    // STRICT CONSTRAINT: Duration must be strictly greater than 1 hour (> 3600 seconds)
    if (durationSeconds <= 3600) {
      return;
    }

    const videoId = v.videoId;
    seenIds.add(videoId);

    const title =
      v.title?.runs?.map((r) => r.text).join('') ||
      v.title?.simpleText ||
      v.headline?.simpleText ||
      'Ambient 1 Hour Mix';

    const channelTitle =
      v.ownerText?.runs?.map((r) => r.text).join('') ||
      v.shortBylineText?.runs?.map((r) => r.text).join('') ||
      'YouTube Creator';

    const views =
      v.viewCountText?.simpleText ||
      v.viewCountText?.runs?.map((r) => r.text).join('') ||
      v.shortViewCountText?.simpleText ||
      'Popular';

    const publishedAt =
      v.publishedTimeText?.simpleText ||
      v.publishedTimeText?.runs?.map((r) => r.text).join('') ||
      '';

    const thumbnails = v.thumbnail?.thumbnails || [];
    const bestThumb =
      thumbnails.length > 0
        ? thumbnails[thumbnails.length - 1].url.replace(/^http:/, 'https:')
        : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const videoNiche = detectNiche(`${title} ${query}`, niche !== 'all' ? niche : 'ambient');

    scrapedVideos.push({
      id: videoId,
      title,
      channelTitle,
      duration: durationText,
      durationSeconds,
      thumbnailUrl: bestThumb,
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
        ...(title.toLowerCase().includes('winter') ? ['#winterwave'] : []),
      ],
    });
  }

  // Traverse through section lists, item sections, and contents
  if (Array.isArray(contents)) {
    for (const section of contents) {
      const items = section?.itemSectionRenderer?.contents || section?.shelfRenderer?.content?.verticalListRenderer?.items || [];
      for (const item of items) {
        if (item?.videoRenderer) {
          processVideoRenderer(item.videoRenderer);
        }
        if (scrapedVideos.length >= limit) break;
      }
      if (scrapedVideos.length >= limit) break;
    }
  }

  return scrapedVideos;
}

/**
 * Strategy 1: YouTube Innertube API request (fast, structured JSON, cloud IP friendly)
 */
async function searchViaInnertube(query, niche = 'all', limit = 24) {
  const response = await fetch('https://www.youtube.com/youtubei/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'X-YouTube-Client-Name': '1',
      'X-YouTube-Client-Version': '2.20240210.01.00',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240210.01.00',
          hl: 'en',
          gl: 'US',
        },
      },
      query,
      params: 'EgIYAw%3D%3D', // sp=EgIYAw%3D%3D filter for > 20 min videos on YouTube
    }),
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`Innertube responded with HTTP ${response.status}`);
  }

  const data = await response.json();
  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  return parseSearchResults(contents, query, niche, limit);
}

/**
 * Strategy 2: YouTube Web HTML Scraper with consent bypass cookies
 */
async function searchViaHtml(query, niche = 'all', limit = 24) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query
  )}&sp=EgIYAw%253D%253D`;

  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie':
        'SOCS=CAESEwgDEgk2OTk2NTY1NDQaAmVuIAEaBgiA_LyaBg; CONSENT=PENDING+999; PREF=hl=en&gl=US',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`YouTube HTML responded with HTTP ${response.status}`);
  }

  const html = await response.text();

  // Find ytInitialData JSON in HTML
  const match = html.match(/(?:var\s+ytInitialData|window\["ytInitialData"\]|ytInitialData)\s*=\s*({.+?});<\/script>/s);
  if (!match || !match[1]) {
    throw new Error('ytInitialData not found in HTML response');
  }

  const data = JSON.parse(match[1]);
  const contents =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  return parseSearchResults(contents, query, niche, limit);
}

/**
 * Generates progressive search query variations for pagination & lazy-loading
 * Each page triggers unique long-mix queries to return continuous fresh streams of > 1h videos.
 */
function getProgressiveSearchQuery(userQuery, niche, page = 1) {
  if (userQuery && userQuery.trim()) {
    const q = userQuery.trim();
    const variations = [
      `${q} 1 hour mix`,
      `${q} 2 hours ambient playlist`,
      `${q} 3 hours continuous mix`,
      `${q} full album 1 hour`,
      `${q} relaxing deep session 2 hours`,
      `${q} long aesthetic mix 1 hour`,
    ];
    return variations[(page - 1) % variations.length];
  }

  if (niche === 'dreamcore') {
    const dreamcoreQueries = [
      'dreamcore 1 hour mix playlist',
      'dreamcore liminal space 2 hours ambient',
      'weirdcore dreamcore aesthetic mix 1 hour',
      'poolrooms dreamcore ambient music 1 hour',
      'dreamcore childhood nostalgia mix 3 hours',
      'dreamcore alone in empty world ambient 1 hour',
      'liminal spaces dreamcore music 2 hours',
      'dreamcore vhs aesthetic ambient 1 hour',
    ];
    return dreamcoreQueries[(page - 1) % dreamcoreQueries.length];
  }

  if (niche === 'coldcore') {
    const coldcoreQueries = [
      'coldcore 1 hour mix post punk',
      'russian doomer music 1 hour best mix',
      'coldcore doomer wave 2 hours post-punk',
      'atmospheric coldcore winter ambient 1 hour',
      'sovietwave coldcore night mix 2 hours',
      'cold wave post-punk gloomy 1 hour mix',
      'coldcore silent winter snowfall 1 hour',
      'doomer wave post punk melancholia 2 hours',
    ];
    return coldcoreQueries[(page - 1) % coldcoreQueries.length];
  }

  if (niche === 'ambient') {
    const ambientQueries = [
      'ambient 1 hour relaxation deep space',
      'dark ambient drone 2 hours sleep study',
      'brian eno ambient space journey 3 hours',
      'space ambient cosmic drone relaxation 2 hours',
      'ambient piano rain deep rest 1 hour',
      'marconi union weightless ambient 10 hours',
      'cryo chamber dark ambient 1 hour mix',
      'isolated forest ambient soundscape 2 hours',
    ];
    return ambientQueries[(page - 1) % ambientQueries.length];
  }

  // All niches general queries
  const allQueries = [
    'ambient dreamcore coldcore 1 hour mix',
    'dreamcore coldcore ambient 2 hours playlist',
    'liminal doomer deep ambient 1 hour',
    'space ambient weirdcore post-punk 2 hours',
    'dark ambient dreamcore nostalgia 1 hour',
    'atmospheric continuous aesthetic mix 2 hours',
  ];
  return allQueries[(page - 1) % allQueries.length];
}

/**
 * Unified scraper with multiple strategies (Innertube first, HTML fallback)
 */
export async function scrapeYouTubeLongMixes(query, niche = 'all', limit = 24) {
  let results = [];

  // Try Strategy 1: Innertube JSON API
  try {
    results = await searchViaInnertube(query, niche, limit);
  } catch (err) {
    // If Innertube failed, proceed to HTML scraper
  }

  // Try Strategy 2: HTML scraper if Innertube yielded few results
  if (results.length < limit) {
    try {
      const htmlResults = await searchViaHtml(query, niche, limit);
      const existingIds = new Set(results.map((v) => v.id));
      for (const item of htmlResults) {
        if (!existingIds.has(item.id)) {
          results.push(item);
          existingIds.add(item.id);
        }
      }
    } catch (err) {
      // Ignore fallback error if we already have some results
    }
  }

  return results.slice(0, limit);
}

/**
 * Fastify route registration
 */
export async function youtubeRoutes(fastify, options) {
  fastify.get('/api/youtube/search', async (request, reply) => {
    const { q, niche = 'all', limit = 24, page = 1, refresh = 'false' } = request.query;

    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 24));
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const isRefresh = refresh === 'true' || refresh === true;

    const searchQuery = getProgressiveSearchQuery(q, niche, parsedPage);
    const cacheKey = `${niche}_${(q || '').trim()}_p${parsedPage}`;

    // Check dynamic in-memory RAM cache (bypassed if auto-refresh or refresh=true)
    if (!isRefresh && dynamicMemoryCache.has(cacheKey)) {
      const cached = dynamicMemoryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    let results = [];
    let source = 'live-scraper';

    try {
      results = await scrapeYouTubeLongMixes(searchQuery, niche, parsedLimit);
    } catch (err) {
      request.log.error({ err: err.message, query: searchQuery }, 'YouTube live scraping failed');
    }

    // STRICT SAFETY FILTER: every single video MUST be strictly > 3600 seconds
    const strictResults = results.filter((v) => v.durationSeconds > 3600);

    // Compute niche analytics
    const totalDurationSeconds = strictResults.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
    const avgDurationSeconds =
      strictResults.length > 0 ? Math.round(totalDurationSeconds / strictResults.length) : 0;

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

    const responsePayload = {
      query: searchQuery,
      niche,
      page: parsedPage,
      hasMore: true, // Allows lazy loading for endless scroll
      count: strictResults.length,
      analytics,
      items: strictResults,
    };

    // Store in dynamic RAM cache
    if (strictResults.length > 0) {
      dynamicMemoryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responsePayload,
      });
    }

    return responsePayload;
  });
}
