import { fetchShareMetadata, isValidContentId, revalidate as cacheDuration } from '../../../../src/lib/shareCore';

export const runtime = 'edge';
export const revalidate = 86400;

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> | { videoId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const videoId = resolvedParams?.videoId;

    if (!videoId || !isValidContentId(videoId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid videoId provided',
          videoId: videoId || null
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
          }
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
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300, s-maxage=300'
          }
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
        message: error?.message || 'Failed to fetch share metadata'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
