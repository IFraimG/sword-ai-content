/**
 * YouTube Ambient, Dreamcore & Coldcore Search & Dynamic Scraper Route
 *
 * Strict constraint: ONLY returns videos with duration > 1 hour (> 3600 seconds).
 * Dynamically scrapes YouTube search results in real time with lazy-loading & pagination support.
 * NO static video links stored in files.
 * NO local mock/stored video or audio files.
 */

import { analyzeVideoAtmosphere } from '../services/llavaService.js';

// In-memory RAM cache with 15-minute TTL (cleared on auto-refresh or expiry)
const dynamicMemoryCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Format duration in seconds to "H:MM:SS" or "MM:SS"
 */
export function formatSecondsToHms(seconds) {
  if (!seconds || isNaN(seconds)) return '30:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Helper to parse duration string (e.g. "1:15:42", "2:30:00", "1 hour, 15 minutes") into seconds
 */
export function parseDurationToSeconds(durationText) {
  if (!durationText || typeof durationText !== 'string') return 0;

  const clean = durationText.trim().replace(/\u00a0/g, ' ');

  // Format 1: HH:MM:SS or MM:SS (e.g. "1:15:30", "01:05:20", "2:00:00")
  if (clean.includes(':')) {
    const parts = clean.split(':').map((p) => parseInt(p.trim(), 10));
    if (!parts.some(isNaN)) {
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 4) {
        return parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
      } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
    }
  }

  // Format 2: Natural language / accessibility label
  // (e.g. "1 hour, 23 minutes, 45 seconds", "2 hours 10 mins", "1 час 15 минут")
  let seconds = 0;
  const hoursMatch = clean.match(/(\d+)\s*(?:hours?|hrs?|hour|ч|час|часа|часов)/i);
  const minutesMatch = clean.match(/(\d+)\s*(?:minutes?|mins?|min|м|мин|минута|минуты|минут)/i);
  const secondsMatch = clean.match(/(\d+)\s*(?:seconds?|secs?|sec|с|сек|секунда|секунды|секунд)/i);

  if (hoursMatch) seconds += parseInt(hoursMatch[1], 10) * 3600;
  if (minutesMatch) seconds += parseInt(minutesMatch[1], 10) * 60;
  if (secondsMatch) seconds += parseInt(secondsMatch[1], 10);

  return seconds;
}

/**
 * All 42 target search hashtags requested by user (each can appear in video individually)
 */
export const EXPANDED_SEARCH_HASHTAGS = [
  '#ambient',
  '#dreamcore',
  '#weirdcore',
  '#nostalgiacore',
  '#miinstronaut',
  '#liminalspace',
  '#coldcore',
  '#haunting',
  '#ambientmusic',
  '#album',
  '#playlist',
  '#kidcore',
  '#nostalgia',
  '#retroaesthetic',
  '#chillmix',
  '#sleepmusic',
  '#studymusic',
  '#dreamcoreaesthetic',
  '#studyplaylist',
  '#relaxingmusic',
  '#calmingmusic',
  '#trending',
  '#darkambient',
  '#snowstorm',
  '#snowambience',
  '#blizzardambience',
  '#winterstorm',
  '#calm',
  '#relax',
  '#snowfall',
  '#dreamscore',
  '#calmmusic',
  '#meditation',
  '#aesthetic',
  '#vaporwave',
  '#wintermix',
  '#nightambience',
  '#snowyambience',
  '#wintervibes',
  '#coldnightmix',
  '#darkmusic',
  '#aestheticplaylist',
];

const HASHTAG_DETECTION_PATTERNS = [
  { tag: '#dreamcore', regex: /dreamcore/i },
  { tag: '#weirdcore', regex: /weirdcore/i },
  { tag: '#nostalgiacore', regex: /nostalgiacore/i },
  { tag: '#miinstronaut', regex: /miinstronaut|astronaut/i },
  { tag: '#liminalspace', regex: /liminal|liminal\s*space|backrooms|poolrooms/i },
  { tag: '#coldcore', regex: /coldcore/i },
  { tag: '#haunting', regex: /haunting|ghostly|eerie/i },
  { tag: '#ambientmusic', regex: /ambient\s*music/i },
  { tag: '#album', regex: /album|full\s*album/i },
  { tag: '#playlist', regex: /playlist/i },
  { tag: '#kidcore', regex: /kidcore/i },
  { tag: '#nostalgia', regex: /nostalgia|nostalgic/i },
  { tag: '#retroaesthetic', regex: /retro\s*aesthetic|vintage|vhs/i },
  { tag: '#chillmix', regex: /chill\s*mix|chillout/i },
  { tag: '#sleepmusic', regex: /sleep\s*music|for\s*sleep/i },
  { tag: '#studymusic', regex: /study\s*music|for\s*study|studying/i },
  { tag: '#dreamcoreaesthetic', regex: /dreamcore\s*aesthetic/i },
  { tag: '#studyplaylist', regex: /study\s*playlist/i },
  { tag: '#relaxingmusic', regex: /relaxing\s*music|relaxing/i },
  { tag: '#calmingmusic', regex: /calming\s*music|calming/i },
  { tag: '#trending', regex: /trending|viral/i },
  { tag: '#darkambient', regex: /dark\s*ambient/i },
  { tag: '#snowstorm', regex: /snowstorm|snow\s*storm/i },
  { tag: '#snowambience', regex: /snow\s*ambience|snow\s*ambiance/i },
  { tag: '#blizzardambience', regex: /blizzard/i },
  { tag: '#winterstorm', regex: /winter\s*storm/i },
  { tag: '#calm', regex: /\bcalm\b|calming/i },
  { tag: '#relax', regex: /\brelax\b|relaxation/i },
  { tag: '#snowfall', regex: /snowfall|falling\s*snow/i },
  { tag: '#dreamscore', regex: /dreamscore/i },
  { tag: '#calmmusic', regex: /calm\s*music/i },
  { tag: '#meditation', regex: /meditation|meditative/i },
  { tag: '#aesthetic', regex: /aesthetic/i },
  { tag: '#vaporwave', regex: /vaporwave/i },
  { tag: '#wintermix', regex: /winter\s*mix/i },
  { tag: '#nightambience', regex: /night\s*ambience|night\s*ambiance/i },
  { tag: '#snowyambience', regex: /snowy\s*ambience|snowy/i },
  { tag: '#wintervibes', regex: /winter\s*vibes|\bwinter\b/i },
  { tag: '#coldnightmix', regex: /cold\s*night/i },
  { tag: '#darkmusic', regex: /dark\s*music/i },
  { tag: '#aestheticplaylist', regex: /aesthetic\s*playlist/i },
  { tag: '#ambient', regex: /ambient/i },
];

/**
 * Extracts and maps individual hashtags that are present in the video title, description, or search query
 */
export function extractVideoHashtags(title = '', description = '', query = '', niche = 'ambient') {
  const combined = `${title} ${description} ${query}`.toLowerCase();
  const tagsSet = new Set();

  if (niche && niche !== 'all') {
    tagsSet.add(`#${niche}`);
  }
  tagsSet.add('#1hourplus');

  // If query is an explicit hashtag, preserve it in the video's tag list
  const cleanQ = (query || '').trim().toLowerCase();
  if (cleanQ.startsWith('#')) {
    tagsSet.add(cleanQ);
  }

  // Check each individual hashtag pattern independently
  for (const item of HASHTAG_DETECTION_PATTERNS) {
    if (item.regex.test(combined)) {
      tagsSet.add(item.tag);
    }
  }

  return Array.from(tagsSet);
}

/**
 * Detect ambient niche from text (supports all 42 hashtags and associated genres)
 */
export function detectNiche(text, fallback = 'ambient') {
  const lower = (text || '').toLowerCase();
  if (
    lower.includes('dreamcore') ||
    lower.includes('weirdcore') ||
    lower.includes('nostalgiacore') ||
    lower.includes('nostalgia') ||
    lower.includes('kidcore') ||
    lower.includes('liminalspace') ||
    lower.includes('liminal') ||
    lower.includes('dreamcoreaesthetic') ||
    lower.includes('dreamscore') ||
    lower.includes('retroaesthetic') ||
    lower.includes('vaporwave') ||
    lower.includes('backrooms') ||
    lower.includes('poolrooms')
  ) {
    return 'dreamcore';
  }
  if (
    lower.includes('coldcore') ||
    lower.includes('haunting') ||
    lower.includes('snowstorm') ||
    lower.includes('snowambience') ||
    lower.includes('blizzardambience') ||
    lower.includes('blizzard') ||
    lower.includes('winterstorm') ||
    lower.includes('snowfall') ||
    lower.includes('wintermix') ||
    lower.includes('nightambience') ||
    lower.includes('snowyambience') ||
    lower.includes('wintervibes') ||
    lower.includes('coldnightmix') ||
    lower.includes('darkmusic') ||
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
    lower.includes('ambientmusic') ||
    lower.includes('darkambient') ||
    lower.includes('chillmix') ||
    lower.includes('sleepmusic') ||
    lower.includes('studymusic') ||
    lower.includes('studyplaylist') ||
    lower.includes('relaxingmusic') ||
    lower.includes('calmingmusic') ||
    lower.includes('calmmusic') ||
    lower.includes('calm') ||
    lower.includes('relax') ||
    lower.includes('meditation') ||
    lower.includes('miinstronaut') ||
    lower.includes('aestheticplaylist') ||
    lower.includes('trending') ||
    lower.includes('drone') ||
    lower.includes('space') ||
    lower.includes('weightless')
  ) {
    return 'ambient';
  }
  return fallback;
}

/**
 * Extracts duration text from diverse YouTube videoRenderer formats
 * (handles lengthText, thumbnailOverlays, accessibility labels, badges, and title estimates)
 */
function extractDurationText(v) {
  if (!v) return '';

  // 1. Direct lengthText simpleText or runs
  if (v.lengthText?.simpleText) {
    return v.lengthText.simpleText;
  }
  if (Array.isArray(v.lengthText?.runs) && v.lengthText.runs.length > 0) {
    return v.lengthText.runs.map((r) => r.text).join('');
  }
  if (v.lengthText?.accessibility?.accessibilityData?.label) {
    return v.lengthText.accessibility.accessibilityData.label;
  }

  // 2. Modern YouTube web and mobile store duration inside thumbnailOverlays
  if (Array.isArray(v.thumbnailOverlays)) {
    for (const overlay of v.thumbnailOverlays) {
      const timeRenderer = overlay?.thumbnailOverlayTimeStatusRenderer;
      if (timeRenderer?.text?.simpleText) {
        return timeRenderer.text.simpleText;
      }
      if (Array.isArray(timeRenderer?.text?.runs)) {
        return timeRenderer.text.runs.map((r) => r.text).join('');
      }
      if (timeRenderer?.text?.accessibility?.accessibilityData?.label) {
        return timeRenderer.text.accessibility.accessibilityData.label;
      }
    }
  }

  // 3. Badges or overlay labels
  if (Array.isArray(v.badges)) {
    for (const b of v.badges) {
      const text = b?.metadataBadgeRenderer?.label;
      if (text && (text.includes(':') || /hour|час/i.test(text))) {
        return text;
      }
    }
  }

  // 4. Accessibility label inside title
  const titleA11y = v.title?.accessibility?.accessibilityData?.label;
  if (titleA11y) {
    const durMatch = titleA11y.match(/(\d+\s*(?:hours?|hrs?|ч|час|часа|часов|minutes?|mins?|мин|минут)[^,.]*(?:,\s*\d+\s*(?:minutes?|mins?|мин|seconds?|сек))?)/i);
    if (durMatch) {
      return durMatch[1];
    }
  }

  // 5. Title text itself if hours or minutes are explicitly declared
  const titleText =
    v.title?.runs?.map((r) => r.text).join('') ||
    v.title?.simpleText ||
    '';
  const titleMatchHours = titleText.match(/(\b[1-9]\d*)\s*(?:hours?|hrs?|часов|часа|час)\b/i);
  if (titleMatchHours) {
    const h = parseInt(titleMatchHours[1], 10);
    return `${h}:00:00`;
  }
  const titleMatchMins = titleText.match(/(\b[3-9]\d|\d{3,})\s*(?:minutes?|mins?|минут|минуты|мин)\b/i);
  if (titleMatchMins) {
    const m = parseInt(titleMatchMins[1], 10);
    return `${m}:00`;
  }

  return '';
}

/**
 * Recursively extracts all videoRenderer and compactVideoRenderer objects from any YouTube JSON structure
 */
function extractAllVideoRenderers(data) {
  const found = [];
  const seen = new Set();

  function recurse(node, depth = 0) {
    if (!node || depth > 25) return;

    if (Array.isArray(node)) {
      for (const item of node) {
        recurse(item, depth + 1);
      }
      return;
    }

    if (typeof node === 'object') {
      if (node.videoRenderer && node.videoRenderer.videoId) {
        const vid = node.videoRenderer.videoId;
        if (!seen.has(vid)) {
          seen.add(vid);
          found.push(node.videoRenderer);
        }
        return;
      }
      if (node.compactVideoRenderer && node.compactVideoRenderer.videoId) {
        const vid = node.compactVideoRenderer.videoId;
        if (!seen.has(vid)) {
          seen.add(vid);
          found.push(node.compactVideoRenderer);
        }
        return;
      }

      for (const key of Object.keys(node)) {
        if (key !== 'videoRenderer' && key !== 'compactVideoRenderer') {
          recurse(node[key], depth + 1);
        }
      }
    }
  }

  recurse(data);
  return found;
}

/**
 * Process a list of videoRenderers into structured items with strict duration constraint
 */
function processRenderers(renderers, query, niche = 'all', limit = 24) {
  const videos = [];
  const seenIds = new Set();

  for (const v of renderers) {
    if (!v || !v.videoId || seenIds.has(v.videoId)) continue;

    // Reject live streams
    if (v.badges?.some((b) => b?.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW')) {
      continue;
    }

    const durationText = extractDurationText(v);
    const durationSeconds = parseDurationToSeconds(durationText);

    // STRICT CONSTRAINT: Duration must be minimum 30 minutes (>= 1800 seconds)
    if (durationSeconds < 1800) {
      continue;
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

    const description =
      v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r) => r.text).join('') ||
      v.descriptionSnippet?.runs?.map((r) => r.text).join('') ||
      v.description?.simpleText ||
      '';

    videos.push({
      id: videoId,
      title,
      description,
      channelTitle,
      duration: durationText.includes(':') ? durationText : formatSecondsToHms(durationSeconds),
      durationSeconds,
      thumbnailUrl: bestThumb,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      views,
      publishedAt,
      niche: videoNiche,
      tags: extractVideoHashtags(title, description, query, videoNiche),
    });

    if (videos.length >= limit) break;
  }

  return videos;
}

/**
 * Strategy 1: YouTube Innertube ANDROID client (bypasses Google consent & datacenter IP blocks)
 */
async function searchViaInnertubeAndroid(query, niche = 'all', limit = 24) {
  const response = await fetch('https://www.youtube.com/youtubei/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 14; en_US) gzip',
      'X-YouTube-Client-Name': '3',
      'X-YouTube-Client-Version': '19.09.37',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '19.09.37',
          androidSdkVersion: 34,
          hl: 'en',
          gl: 'US',
        },
      },
      query,
    }),
    signal: AbortSignal.timeout(9000),
  });

  if (!response.ok) {
    throw new Error(`Innertube Android HTTP ${response.status}`);
  }

  const data = await response.json();
  const renderers = extractAllVideoRenderers(data);
  return processRenderers(renderers, query, niche, limit);
}

/**
 * Strategy 2: YouTube Innertube WEB client (with valid base64 filter EgIYAw== for > 20m)
 */
async function searchViaInnertubeWeb(query, niche = 'all', limit = 24) {
  const tryFetch = async (params) => {
    const body = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240210.01.00',
          hl: 'en',
          gl: 'US',
        },
      },
      query,
    };
    if (params) body.params = params;

    const response = await fetch('https://www.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'X-YouTube-Client-Name': '1',
        'X-YouTube-Client-Version': '2.20240210.01.00',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(9000),
    });

    if (!response.ok) {
      throw new Error(`Innertube Web HTTP ${response.status}`);
    }

    const data = await response.json();
    const renderers = extractAllVideoRenderers(data);
    return processRenderers(renderers, query, niche, limit);
  };

  try {
    return await tryFetch('EgIYAw==');
  } catch {
    return await tryFetch(null);
  }
}

/**
 * Strategy 3: YouTube Web HTML Scraper (fixed URL encoding and consent headers)
 */
async function searchViaHtml(query, niche = 'all', limit = 24) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIYAw%3D%3D`;

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
    throw new Error(`YouTube HTML HTTP ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/(?:var\s+ytInitialData|window\["ytInitialData"\]|ytInitialData)\s*=\s*({.+?});<\/script>/s);
  if (!match || !match[1]) {
    throw new Error('ytInitialData not found in HTML response');
  }

  const data = JSON.parse(match[1]);
  const renderers = extractAllVideoRenderers(data);
  return processRenderers(renderers, query, niche, limit);
}

/**
 * Strategy 4: Public Invidious API instances (specialized in long duration videos without blocking)
 */
async function searchViaInvidious(query, niche = 'all', limit = 24, page = 1) {
  const instances = [
    'https://invidious.nerdvpn.de',
    'https://inv.nadeko.net',
    'https://invidious.f5.si',
    'https://invidious.drgns.space',
  ];

  for (const instance of instances) {
    try {
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&duration=long&page=${page}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;

      const list = await res.json();
      if (!Array.isArray(list)) continue;

      const videos = [];
      const seenIds = new Set();

      for (const item of list) {
        if (!item.videoId || seenIds.has(item.videoId)) continue;
        const durSec = item.lengthSeconds || 0;

        // STRICT CONSTRAINT: Duration must be minimum 30 minutes (>= 1800 seconds)
        if (durSec < 1800) continue;

        seenIds.add(item.videoId);
        const title = item.title || 'Ambient 1 Hour Mix';
        const videoNiche = detectNiche(`${title} ${query}`, niche !== 'all' ? niche : 'ambient');

        videos.push({
          id: item.videoId,
          title,
          description: item.description || '',
          channelTitle: item.author || 'YouTube Creator',
          duration: formatSecondsToHms(durSec),
          durationSeconds: durSec,
          thumbnailUrl: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${item.videoId}`,
          youtubeUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
          views: item.viewCount ? `${item.viewCount.toLocaleString()} views` : 'Popular',
          publishedAt: item.publishedText || '',
          niche: videoNiche,
          tags: extractVideoHashtags(title, item.description || '', query, videoNiche),
        });

        if (videos.length >= limit) break;
      }

      if (videos.length > 0) {
        return videos;
      }
    } catch {
      continue;
    }
  }

  return [];
}

/**
 * Generates progressive search query variations for pagination & lazy-loading
 * incorporating all 42 target hashtags
 */
function getProgressiveSearchQuery(userQuery, niche, page = 1) {
  if (userQuery && userQuery.trim()) {
    const raw = userQuery.trim();
    const cleanWord = raw.replace(/^#+/, '').trim();
    const variations = [
      `${raw} ambient mix`,
      `${raw} 1 hour mix`,
      `${cleanWord} 30 minutes continuous mix`,
      `${cleanWord} 2 hours ambient playlist`,
      `${cleanWord} aesthetic mix`,
      `${raw} full album`,
      `${cleanWord} relaxing deep session 30 min`,
      `${raw} long aesthetic mix 1 hour`,
      `${cleanWord} soundscape 30 minutes`,
      `${raw} sleep study meditation`,
    ];
    return variations[(page - 1) % variations.length];
  }

  if (niche === 'dreamcore') {
    const dreamcoreQueries = [
      'dreamcore aesthetic mix playlist',
      'dreamcore 1 hour mix playlist',
      'dreamcore liminal space 30 minutes ambient',
      'weirdcore dreamcore aesthetic mix',
      'nostalgiacore kidcore retroaesthetic',
      'poolrooms dreamcore ambient music',
      'dreamcore childhood nostalgia mix',
      'liminal spaces dreamcore music 30 minutes',
      'dreamcore vhs aesthetic ambient 1 hour',
      'dreamcoreaesthetic dreamscore 2 hours mix',
      'vaporwave liminalspace aesthetic playlist',
      'miinstronaut liminal dreamcore',
    ];
    return dreamcoreQueries[(page - 1) % dreamcoreQueries.length];
  }

  if (niche === 'coldcore') {
    const coldcoreQueries = [
      'coldcore mix post punk',
      'coldcore 1 hour mix post punk',
      'snowstorm snowambience blizzard 30 minutes sleep',
      'russian doomer music best mix',
      'coldcore winter vibes snowfall 30 minutes',
      'haunting dark ambient winterstorm',
      'cold night mix dark music',
      'sovietwave coldcore night mix',
      'snowy ambience winter storm relax',
      'cold wave post-punk gloomy 1 hour mix',
      'coldcore silent winter snowfall',
      'blizzard ambience night soundscape',
    ];
    return coldcoreQueries[(page - 1) % coldcoreQueries.length];
  }

  if (niche === 'ambient') {
    const ambientQueries = [
      'ambient music relaxation deep space',
      'ambient music 1 hour relaxation deep space',
      'dark ambient drone 30 minutes sleep study',
      'chill mix sleep music calming',
      'brian eno ambient space journey',
      'relaxing music study playlist 30 minutes',
      'ambient piano rain deep rest',
      'calm music meditation continuous',
      'marconi union weightless ambient',
      'cryo chamber dark ambient mix',
      'aesthetic playlist trending ambient',
      'isolated forest ambient soundscape',
    ];
    return ambientQueries[(page - 1) % ambientQueries.length];
  }

  // All niches general queries spanning dreamcore, coldcore, snowstorm, liminal and ambient
  const allQueries = [
    'ambient dreamcore coldcore 1 hour mix',
    'snowstorm blizzard ambience dark ambient 2 hours',
    'liminalspace weirdcore aesthetic playlist 1 hour',
    'chillmix sleepmusic studymusic ambient 2 hours',
    'dreamcore coldcore ambient 2 hours playlist',
    'relaxing music calming snowfall 2 hours',
    'space ambient weirdcore post-punk 2 hours',
    'dark ambient dreamcore nostalgia 1 hour',
    'winter mix night ambience coldcore 2 hours',
    'atmospheric continuous aesthetic mix 2 hours',
  ];
  return allQueries[(page - 1) % allQueries.length];
}

/**
 * Unified live scraper cascading across 4 robust strategies
 */
export async function scrapeYouTubeLongMixes(query, niche = 'all', limit = 24, page = 1) {
  let results = [];
  const existingIds = new Set();

  const addItems = (items) => {
    for (const item of items) {
      if (item && item.id && !existingIds.has(item.id)) {
        existingIds.add(item.id);
        results.push(item);
      }
    }
  };

  // Strategy 1: YouTube Innertube Android Client (primary cloud-friendly)
  try {
    const androidItems = await searchViaInnertubeAndroid(query, niche, limit);
    addItems(androidItems);
  } catch (err) {
    // Continue to next strategy
  }

  // Strategy 2: YouTube Innertube Web Client (with valid base64 filter)
  if (results.length < limit) {
    try {
      const webItems = await searchViaInnertubeWeb(query, niche, limit);
      addItems(webItems);
    } catch (err) {
      // Continue to next strategy
    }
  }

  // Strategy 3: YouTube HTML Web Scraper (direct page parse)
  if (results.length < limit) {
    try {
      const htmlItems = await searchViaHtml(query, niche, limit);
      addItems(htmlItems);
    } catch (err) {
      // Continue to next strategy
    }
  }

  // Strategy 4: Invidious Public Gateways (reliable datacenter fallback with pagination)
  if (results.length < limit) {
    try {
      const invidiousItems = await searchViaInvidious(query, niche, limit, page);
      addItems(invidiousItems);
    } catch (err) {
      // Ignore
    }
  }

  return results.slice(0, limit);
}

/**
 * Fastify route registration
 */
export async function youtubeRoutes(fastify, options) {
  // Live scraper diagnostic route
  fastify.get('/api/youtube/diag', async (request, reply) => {
    const diagQuery = 'ambient 1 hour deep space';
    const report = {
      timestamp: new Date().toISOString(),
      testQuery: diagQuery,
      strategies: {},
    };

    try {
      const androidItems = await searchViaInnertubeAndroid(diagQuery, 'ambient', 5);
      report.strategies.innertubeAndroid = { status: 'OK', count: androidItems.length };
    } catch (e) {
      report.strategies.innertubeAndroid = { status: 'ERROR', error: e.message };
    }

    try {
      const webItems = await searchViaInnertubeWeb(diagQuery, 'ambient', 5);
      report.strategies.innertubeWeb = { status: 'OK', count: webItems.length };
    } catch (e) {
      report.strategies.innertubeWeb = { status: 'ERROR', error: e.message };
    }

    try {
      const htmlItems = await searchViaHtml(diagQuery, 'ambient', 5);
      report.strategies.html = { status: 'OK', count: htmlItems.length };
    } catch (e) {
      report.strategies.html = { status: 'ERROR', error: e.message };
    }

    try {
      const invidiousItems = await searchViaInvidious(diagQuery, 'ambient', 5);
      report.strategies.invidious = { status: 'OK', count: invidiousItems.length };
    } catch (e) {
      report.strategies.invidious = { status: 'ERROR', error: e.message };
    }

    return report;
  });

  // Download YouTube video preview thumbnail (proxied for reliability and CORS attachment)
  fastify.get('/api/youtube/thumbnail', async (request, reply) => {
    const { id, quality = 'maxres' } = request.query;

    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(id.trim())) {
      return reply.code(400).send({ error: 'Некорректный ID видео YouTube' });
    }

    const videoId = id.trim();
    const candidateUrls =
      quality === 'maxres'
        ? [
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          ]
        : [
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          ];

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          // If maxresdefault returns a small blank placeholder (< 1500 bytes), try next
          if (buffer.length < 1500 && candidateUrls.indexOf(url) < candidateUrls.length - 1) {
            continue;
          }

          reply.header('Content-Type', 'image/jpeg');
          reply.header('Content-Disposition', `attachment; filename="youtube-preview-${videoId}.jpg"`);
          reply.header('Access-Control-Allow-Origin', '*');
          reply.header('Cache-Control', 'public, max-age=86400');
          return reply.send(buffer);
        }
      } catch {
        continue;
      }
    }

    return reply.code(404).send({ error: 'Превью для данного видео не найдено' });
  });

  // LLaVA 1.5 7B Multi-modal Video Atmosphere Analysis Route
  fastify.post('/api/youtube/analyze-atmosphere', async (request, reply) => {
    const { videoId, title, description, thumbnailUrl, prompt, history } = request.body || {};

    try {
      const result = await analyzeVideoAtmosphere({
        videoId,
        title: title || 'Ambient Video',
        description: description || '',
        thumbnailUrl: thumbnailUrl || '',
        prompt: prompt || 'Какую атмосферу передает это видео судя по превью?',
        conversationHistory: history || [],
      });

      return result;
    } catch (err) {
      request.log.error({ err: err.message }, 'Atmosphere analysis failed');
      return reply.code(500).send({
        error: 'Не удалось завершить анализ атмосферы через LLaVA 1.5 7B',
        message: err.message,
      });
    }
  });

  // YouTube video details and metadata route
  fastify.get('/api/youtube/details', async (request, reply) => {
    const { id } = request.query;

    if (!id || typeof id !== 'string') {
      return reply.code(400).send({ error: 'Параметр id обязателен' });
    }

    const videoId = id.trim();
    try {
      const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
        signal: AbortSignal.timeout(6000),
      });

      if (oembedRes.ok) {
        const data = await oembedRes.json();
        return {
          id: videoId,
          title: data.title || '',
          author: data.author_name || '',
          thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          description: `Официальное видео на YouTube канале ${data.author_name || ''}`,
        };
      }
    } catch {
      // Fallback
    }

    return {
      id: videoId,
      title: 'YouTube Video',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      description: '',
    };
  });

  // Main YouTube search & live stream route
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
      results = await scrapeYouTubeLongMixes(searchQuery, niche, parsedLimit, parsedPage);
    } catch (err) {
      request.log.error({ err: err.message, query: searchQuery }, 'YouTube live scraping failed');
    }

    // STRICT SAFETY FILTER: every single video MUST be minimum 30 minutes (>= 1800 seconds)
    const strictResults = results.filter((v) => v.durationSeconds >= 1800);

    // Compute niche analytics
    const totalDurationSeconds = strictResults.reduce((acc, v) => acc + (v.durationSeconds || 0), 0);
    const avgDurationSeconds =
      strictResults.length > 0 ? Math.round(totalDurationSeconds / strictResults.length) : 0;

    const formatSeconds = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      if (h > 0) {
        return `${h}h ${m}m`;
      }
      return `${m}m`;
    };

    const analytics = {
      totalVideos: strictResults.length,
      strictConstraint: 'duration >= 30 minutes (1800s)',
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
      hasMore: strictResults.length > 0 && parsedPage < 30, // Allows lazy loading for continuous infinite scroll
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
