/**
 * GET /api/meta?id=<videoId>
 *
 * Fetches video metadata via YouTube's public oEmbed endpoint.
 * No API key, token, or authentication required.
 *
 * Cache-Control: Cached at Vercel's edge network for 24h, stale-while-revalidate 12h.
 */
export default async function handler(req, res) {
  // Extract video ID from query param (?id=... or ?v=...)
  const rawId = req.query.id || req.query.v || '';
  const id = Array.isArray(rawId) ? rawId[0] : String(rawId).trim();

  // CDN Cache headers: 24-hour edge cache with stale-while-revalidate
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=43200'
  );

  // Standard public YouTube thumbnail CDN (works even if oEmbed fails)
  const thumbnail = id
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : 'https://genmusics.vercel.app/logo.png';

  // Graceful fallback object if oEmbed fails or ID is missing
  const fallback = {
    id: id || '',
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnail
  };

  // Validate YouTube video ID format (alphanumeric, dashes, underscores, typically 11 chars)
  if (!id || !/^[a-zA-Z0-9_-]{6,15}$/.test(id)) {
    return res.status(200).json(fallback);
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(id)}&format=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GenMusic-SmartLink/1.0 (+https://genmusics.vercel.app)'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json(fallback);
    }

    const data = await response.json();

    return res.status(200).json({
      id,
      title: data.title || fallback.title,
      author: data.author_name || fallback.author,
      thumbnail
    });
  } catch (err) {
    // Return graceful fallback without throwing errors or 500s
    return res.status(200).json(fallback);
  }
}
