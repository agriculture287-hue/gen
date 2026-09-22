export const runtime = 'edge';
export const revalidate = 86400;

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> | { videoId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const videoId = resolvedParams?.videoId || '';
    const cleanId = encodeURIComponent(videoId);
    const deepLink = `genmusic://play?id=${cleanId}`;

    return new Response(
      JSON.stringify({
        success: true,
        id: cleanId,
        deepLink,
        message: 'This content was shared using GEN Music. Open the app to start listening.'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200'
        }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: error?.message || 'Failed to process share'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
