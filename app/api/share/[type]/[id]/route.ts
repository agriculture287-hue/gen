import { fetchShareMetadata, isValidContentId, revalidate as cacheDuration } from '../../../../../src/lib/shareCore';

export const runtime = 'edge';
export const revalidate = 86400;

export async function GET(
  request: Request,
  context: { params: Promise<{ type: string; id: string }> | { type: string; id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const type = (resolvedParams?.type as 'song' | 'album' | 'playlist' | 'artist') || 'song';
    const id = resolvedParams?.id;

    if (!id || !isValidContentId(id)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid content ID provided',
          id: id || null
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const metadata = await fetchShareMetadata(id, type);

    if (!metadata) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content Not Available',
          type,
          id
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
        type: metadata.type,
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
