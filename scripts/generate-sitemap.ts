import fs from 'fs';
import path from 'path';

/**
 * Sitemap Generator Script
 * Generates valid XML sitemap with absolute URLs for Google Search Console compliance.
 * Routes included: root (/), /download, and /admin.
 */

const DEFAULT_BASE_URL = 'https://ais-pre-l3oufanucpgycv3hl2qrl5-712504858875.asia-southeast1.run.app';

function getBaseUrl(): string {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

export function generateSitemapXml(baseUrl: string = getBaseUrl()): string {
  const today = new Date().toISOString().split('T')[0];
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  const routes = [
    {
      path: '/',
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      path: '/download',
      changefreq: 'weekly',
      priority: '0.9',
    },
  ];

  const xmlEntries = routes.map((route) => {
    const fullUrl = `${cleanBaseUrl}${route.path}`;
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}
</urlset>
`;
}

function run() {
  const baseUrl = getBaseUrl();
  const sitemapContent = generateSitemapXml(baseUrl);

  // 1. Write to public/sitemap.xml
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemapContent, 'utf-8');
  console.log(`[sitemap-generator] Successfully wrote valid sitemap to ${publicSitemapPath}`);

  // 2. Write to dist/sitemap.xml if dist directory exists
  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distSitemapPath, sitemapContent, 'utf-8');
    console.log(`[sitemap-generator] Successfully synced sitemap to ${distSitemapPath}`);
  }

  // 3. Ensure robots.txt references the absolute sitemap URL
  const robotsTxtPath = path.join(publicDir, 'robots.txt');
  const robotsContent = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  fs.writeFileSync(robotsTxtPath, robotsContent, 'utf-8');
  console.log(`[sitemap-generator] Successfully wrote robots.txt to ${robotsTxtPath}`);
}

// Execute generator
run();
