import type { APIRoute } from 'astro'

export const GET: APIRoute = function GET({ site }) {
  // Only allow crawling on the real production deployment.
  // Vercel sets VERCEL_ENV to 'production' | 'preview' | 'development'.
  // Staging deployments run with VERCEL_ENV=preview, so they must be disallowed.
  const vercelEnv = process.env.VERCEL_ENV
  const allowCrawling = import.meta.env.PROD && (!vercelEnv || vercelEnv === 'production')

  const robotsTxt = `# www.robotstxt.org${allowCrawling ? '\n# Allow crawling of all content' : ''}
User-agent: *
Disallow: ${allowCrawling ? '' : '/'}
${allowCrawling ? `Sitemap: ${new URL('sitemap-index.xml', site)}\n` : ''}`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
