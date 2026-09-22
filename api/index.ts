import app from '../server';

// Vercel Serverless Function entry point
export default function handler(req: any, res: any) {
  try {
    const rawUrl = req.url || '/';
    const queryIdx = rawUrl.indexOf('?');
    const pathOnly = queryIdx !== -1 ? rawUrl.slice(0, queryIdx) : rawUrl;
    const queryString = queryIdx !== -1 ? rawUrl.slice(queryIdx + 1) : '';
    
    // Parse query string for origPath injected by vercel.json rewrites
    const searchParams = new URLSearchParams(queryString);
    const origPath = searchParams.get('origPath');
    
    // Check fallback headers provided by edge reverse proxies
    const forwardedUrl = req.headers['x-forwarded-url'] || req.headers['x-vercel-original-url'];

    if (origPath && typeof origPath === 'string' && origPath.startsWith('/')) {
      searchParams.delete('origPath');
      const rest = searchParams.toString();
      req.url = rest ? `${origPath}?${rest}` : origPath;
    } else if (forwardedUrl && typeof forwardedUrl === 'string' && forwardedUrl.startsWith('/') && !forwardedUrl.startsWith('/api?')) {
      req.url = forwardedUrl;
    } else if (req.headers['x-invoke-path'] && typeof req.headers['x-invoke-path'] === 'string' && req.headers['x-invoke-path'] !== '/api') {
      req.url = req.headers['x-invoke-path'];
    }

    return app(req, res);
  } catch (err: any) {
    console.error('Fatal error in Vercel function handler:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Serverless invocation failure', message: err?.message || String(err) });
    }
  }
}

