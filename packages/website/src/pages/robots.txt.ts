import type { APIRoute } from 'astro'

export const GET: APIRoute = function GET({ site }) {
  const isProduction = import.meta.env.PROD
  const isVercel = import.meta.env.VERCEL === 'true'

  const allowCrawling = !isVercel && isProduction

  const robotsTxt = `# www.robotstxt.org${allowCrawling ? '\n# Allow crawling of all content' : ''}
User-agent: *
Disallow: ${allowCrawling ? '' : '/'}
Sitemap: ${new URL('sitemap-index.xml', site)}
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
