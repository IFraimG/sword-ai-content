import { Readable } from 'node:stream';

/**
 * Handles proxying media streams (video/audio) from external platform CDNs.
 * Prevents 403 Forbidden errors by supplying required User-Agent and Referer headers.
 * Fully supports HTTP 206 Partial Content (Range requests) for seeking and scrubbing.
 */
export async function handleStreamProxy(request, reply, mediaType = 'video') {
  const { url, download, filename } = request.query;

  if (!url) {
    return reply.status(400).send({ error: 'Missing required "url" query parameter' });
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch (err) {
    return reply.status(400).send({ error: 'Invalid URL provided', details: err.message });
  }

  // Determine appropriate platform headers based on hostname
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': mediaType === 'video'
      ? 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
      : 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,*/*;q=0.5',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  const hostname = targetUrl.hostname.toLowerCase();
  if (hostname.includes('tiktok.com') || hostname.includes('ttwstatic.com') || hostname.includes('byteoversea.com')) {
    headers['Referer'] = 'https://www.tiktok.com/';
    headers['Origin'] = 'https://www.tiktok.com';
  } else if (hostname.includes('instagram.com') || hostname.includes('cdninstagram.com') || hostname.includes('fbcdn.net')) {
    headers['Referer'] = 'https://www.instagram.com/';
    headers['Origin'] = 'https://www.instagram.com';
  } else {
    headers['Referer'] = `${targetUrl.protocol}//${targetUrl.host}/`;
  }

  // Forward client Range request header if present (crucial for HTML5 video player scrubbing)
  if (request.headers.range) {
    headers['Range'] = request.headers.range;
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      redirect: 'follow'
    });

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      // If upstream failed with 403 or 404, report error
      return reply.status(upstreamResponse.status).send({
        error: `Upstream CDN returned ${upstreamResponse.status} ${upstreamResponse.statusText}`,
        upstreamUrl: targetUrl.toString()
      });
    }

    // Set CORS and streaming headers
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
    reply.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    reply.header('Cross-Origin-Resource-Policy', 'cross-origin');
    reply.header('Accept-Ranges', 'bytes');

    // Forward upstream Content-Type or default
    const contentType =
      upstreamResponse.headers.get('content-type') ||
      (mediaType === 'video' ? 'video/mp4' : 'audio/mpeg');
    reply.header('Content-Type', contentType);

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      reply.header('Content-Length', contentLength);
    }

    const contentRange = upstreamResponse.headers.get('content-range');
    if (contentRange) {
      reply.header('Content-Range', contentRange);
    }

    // Handle download/export attachment disposition
    if (download === 'true' || download === '1') {
      const exportName = filename || (mediaType === 'video' ? 'reel-export.mp4' : 'audio-export.mp3');
      reply.header('Content-Disposition', `attachment; filename="${exportName}"`);
    } else {
      reply.header('Content-Disposition', 'inline');
    }

    // Reply status: 206 if Range was served, otherwise 200
    reply.status(upstreamResponse.status);

    // Stream upstream body directly to reply
    if (upstreamResponse.body) {
      const nodeStream = Readable.fromWeb(upstreamResponse.body);
      
      // Cleanly handle client aborted requests without crash
      request.raw.on('close', () => {
        if (!nodeStream.destroyed) {
          nodeStream.destroy();
        }
      });

      return reply.send(nodeStream);
    } else {
      return reply.send('');
    }
  } catch (error) {
    request.log.error(error, 'Stream proxy error');
    return reply.status(502).send({
      error: 'Failed to proxy media stream from upstream platform',
      message: error.message
    });
  }
}
