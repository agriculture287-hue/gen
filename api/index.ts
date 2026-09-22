import app from '../server';

// Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  // Normalize URL if rewritten by Vercel edge proxy
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-forwarded-url'];
  if (matchedPath && typeof matchedPath === 'string' && matchedPath.startsWith('/')) {
    // Preserve query parameters if present
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    req.url = matchedPath.includes('?') ? matchedPath : `${matchedPath}${query}`;
  }
  return app(req, res);
}

