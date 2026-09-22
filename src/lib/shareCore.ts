export interface ShareMetadata {
  success: boolean;
  videoId: string;
  type?: 'song' | 'album' | 'playlist' | 'artist';
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  description: string;
  sourceUrl: string;
  deepLink: string;
}

// 24-Hour Cache configuration: 86400 seconds
export const revalidate = 86400;

interface CacheEntry {
  data: ShareMetadata;
  expiresAt: number;
}

// In-memory 24-hour cache map
const metadataCache = new Map<string, CacheEntry>();

/**
 * Clean up title & artist suffixes (e.g., "(Official Music Video)")
 */
export function cleanTitleAndArtist(rawTitle: string, rawArtist: string): { title: string; artist: string } {
  let title = rawTitle || 'Unknown Track';
  let artist = rawArtist || 'GEN Music Artist';

  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else if (title.includes(' – ')) {
    const parts = title.split(' – ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' – ').trim();
  }

  const cleanSuffixes = (str: string) => {
    return str
      .replace(/\s*[([].*?official.*?[\])]/gi, '')
      .replace(/\s*[([].*?music video.*?[\])]/gi, '')
      .replace(/\s*[([].*?video.*?[\])]/gi, '')
      .replace(/\s*[([].*?audio.*?[\])]/gi, '')
      .replace(/\s*[([].*?lyrics.*?[\])]/gi, '')
      .replace(/\s*[([].*?hd.*?[\])]/gi, '')
      .replace(/\s*[([].*?4k.*?[\])]/gi, '')
      .replace(/\s*[([].*?remastered.*?[\])]/gi, '')
      .trim();
  };

  return {
    title: cleanSuffixes(title) || rawTitle,
    artist: cleanSuffixes(artist) || rawArtist
  };
}

/**
 * Validate a Video ID or Content ID
 */
export function isValidContentId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  // YouTube video IDs are 11 chars (alphanumeric, -, _); general content IDs min 3 chars
  return /^[a-zA-Z0-9_-]{3,64}$/.test(id.trim());
}

/**
 * Constructs the deep link URI for GEN Music
 */
export function buildDeepLink(id: string, type: 'song' | 'album' | 'playlist' | 'artist' = 'song'): string {
  if (type === 'song') {
    return `genmusic://play?videoId=${encodeURIComponent(id)}`;
  }
  return `genmusic://${type}?id=${encodeURIComponent(id)}`;
}

/**
 * Constructs the Android Intent URI for GEN Music app
 */
export function buildAndroidIntentUri(id: string, type: 'song' | 'album' | 'playlist' | 'artist' = 'song'): string {
  if (type === 'song') {
    return `intent://play?videoId=${encodeURIComponent(id)}#Intent;scheme=genmusic;package=in.gen.agrigence;end`;
  }
  return `intent://${type}?id=${encodeURIComponent(id)}#Intent;scheme=genmusic;package=in.gen.agrigence;end`;
}

/**
 * Fetches and caches song metadata dynamically without a dedicated database
 */
export async function fetchShareMetadata(
  id: string, 
  type: 'song' | 'album' | 'playlist' | 'artist' = 'song'
): Promise<ShareMetadata | null> {
  const cleanId = id.trim();
  if (!isValidContentId(cleanId)) {
    return null;
  }

  const cacheKey = `${type}:${cleanId}`;
  const now = Date.now();

  // Check 24-hour memory cache
  const cached = metadataCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const deepLink = buildDeepLink(cleanId, type);
  const sourceUrl = `https://music.youtube.com/watch?v=${cleanId}`;

  try {
    // Dynamically fetch from YouTube oEmbed
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'GEN-Music-Share/2.0' }
    });

    if (response.ok) {
      const data = await response.json();
      const { title, artist } = cleanTitleAndArtist(data.title, data.author_name);

      const metadata: ShareMetadata = {
        success: true,
        videoId: cleanId,
        type,
        title,
        artist,
        thumbnail: `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`,
        duration: '3:45',
        description: `Listen to ${title} by ${artist} on GEN Music. Experience immersive 3D spatial Dolby audio with offline downloads.`,
        sourceUrl,
        deepLink
      };

      // Store in 24-hour cache (86,400,000 ms)
      metadataCache.set(cacheKey, {
        data: metadata,
        expiresAt: now + revalidate * 1000
      });

      return metadata;
    }
  } catch (err) {
    console.warn(`[ShareCore] Metadata lookup failed for ${cleanId}:`, err);
  }

  // Graceful fallback for known preview IDs if oEmbed fails
  if (cleanId === 'B8uJqlSiJQ4') {
    const fallbackData: ShareMetadata = {
      success: true,
      videoId: cleanId,
      type,
      title: 'Sanson Ki Mala (From “Mirzapur The Movie”)',
      artist: 'Madhur Sharma',
      thumbnail: `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`,
      duration: '3:45',
      description: 'Listen to Sanson Ki Mala (From “Mirzapur The Movie”) on GEN Music.',
      sourceUrl,
      deepLink
    };
    metadataCache.set(cacheKey, { data: fallbackData, expiresAt: now + revalidate * 1000 });
    return fallbackData;
  }

  // If YouTube doesn't recognize it and it's invalid, return null to trigger Content Not Available
  return null;
}
