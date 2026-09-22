/**
 * Serverless function: /api/meta
 * Fetches YouTube oEmbed data server-side using the public YouTube oEmbed endpoint
 * and public i.ytimg.com CDN thumbnail without requiring any API keys or OAuth.
 */
export default async function handler(req, res) {
  const videoId = (req.query.v || req.query.id || '').toString().trim();

  // Cache headers: 24-hour edge cache, 12-hour stale-while-revalidate
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=43200'
  );

  const fallback = {
    title: 'Shared Song',
    author: 'GenMusic',
    thumbnailHQ: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : 'https://genmusics.vercel.app/logo.png'
  };

  if (!videoId || !/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
    return res.status(200).json(fallback);
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GenMusic-LinkBot/1.0 (+https://genmusics.vercel.app)'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json(fallback);
    }

    const data = await response.json();
    return res.status(200).json({
      title: data.title || fallback.title,
      author: data.author_name || fallback.author,
      thumbnailHQ: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    });
  } catch (err) {
    return res.status(200).json(fallback);
  }
}
