export async function musicRoutes(fastify, options) {
  // GET /api/music/search - Search real platform music tracks with live audio previews
  fastify.get('/api/music/search', async (request, reply) => {
    const { q, limit = 10 } = request.query;

    if (!q || !q.trim()) {
      return { items: [] };
    }

    const host = request.headers.host || 'localhost:3001';
    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const serverOrigin = `${protocol}://${host}`;

    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        q.trim()
      )}&media=music&limit=${Math.min(25, parseInt(limit, 10) || 10)}`;

      const res = await fetch(itunesUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Sword-AI-Music-Discovery/3.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return { items: [] };
      }

      const data = await res.json();
      const tracks = (data.results || []).map((track, idx) => {
        const previewUrl = track.previewUrl
          ? `${serverOrigin}/api/proxy/audio?url=${encodeURIComponent(track.previewUrl)}`
          : '';

        return {
          id: `track-${track.trackId || idx}`,
          title: track.trackName || 'Viral Track',
          artist: track.artistName || 'Unknown Artist',
          album: track.collectionName || track.trackName || 'Single',
          coverUrl: track.artworkUrl100
            ? track.artworkUrl100.replace('100x100bb', '600x600bb')
            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
          duration: track.trackTimeMillis
            ? `${Math.floor(track.trackTimeMillis / 60000)}:${String(
                Math.floor((track.trackTimeMillis % 60000) / 1000)
              ).padStart(2, '0')}`
            : '00:30',
          platform: 'apple',
          matchScore: 95 - idx * 2,
          previewUrl,
          directPreviewUrl: track.previewUrl,
          externalUrl:
            track.trackViewUrl ||
            `https://open.spotify.com/search/${encodeURIComponent(
              `${track.trackName} ${track.artistName}`
            )}`,
        };
      });

      return { items: tracks };
    } catch (error) {
      request.log.warn(error, 'Music search error');
      return { items: [] };
    }
  });
}
