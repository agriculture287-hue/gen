import { fetchShareMetadata, isValidContentId, revalidate as cacheDuration } from '../../src/lib/shareCore';

export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    // Extract videoId from URL path /api/share/XYZ or query parameter
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const videoId = pathSegments[pathSegments.length - 1] || url.searchParams.get('videoId') || '';

    if (!videoId || !isValidContentId(videoId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid videoId provided',
          videoId: videoId || null
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const metadata = await fetchShareMetadata(videoId, 'song');

    if (!metadata) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content Not Available',
          videoId
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoId: metadata.videoId,
        title: metadata.title,
        artist: metadata.artist,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration,
        description: metadata.description,
        sourceUrl: metadata.sourceUrl,
        deepLink: metadata.deepLink
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}, stale-while-revalidate=43200`
        }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: error?.message || 'Failed to process request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
