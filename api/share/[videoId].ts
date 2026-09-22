export const config = {
  runtime: 'edge'
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const id = pathSegments[pathSegments.length - 1] || url.searchParams.get('id') || url.searchParams.get('videoId') || '';
    const cleanId = encodeURIComponent(id);
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
        message: error?.message || 'Failed to process request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
