import type { APIRoute } from 'astro'

export const GET: APIRoute = function GET({ site }) {
  // Only allow crawling on the real production deployment.
  // Vercel sets VERCEL_ENV to 'production' | 'preview' | 'development'.
  // Staging deployments run with VERCEL_ENV=preview, so they must be disallowed.
  const vercelEnv = process.env.VERCEL_ENV
  const allowCrawling = import.meta.env.PROD && (!vercelEnv || vercelEnv === 'production')

  // SEO crawlers bring no visitors and spend the edge requests of the Vercel plan.
  const blockedBots = ['barkrowler', 'AhrefsBot', 'SemrushBot']
  const blockedGroups = blockedBots.map((bot) => `User-agent: ${bot}\nDisallow: /\n`).join('\n')

  const robotsTxt = `# www.robotstxt.org${allowCrawling ? '\n# Allow crawling of all content but the SEO crawlers' : ''}
User-agent: *
Disallow: ${allowCrawling ? '' : '/'}
${allowCrawling ? `\n${blockedGroups}\nSitemap: ${new URL('sitemap-index.xml', site)}\n` : ''}`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}
