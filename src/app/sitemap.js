const SITE = 'https://marketing-combat.vercel.app'

// Static export can't read a build timestamp from the request, and there is
// no per-page "last edited" data to draw from — an honest fixed date beats a
// fabricated one that silently drifts from reality.
const LAST_MODIFIED = '2026-07-12'

export default function sitemap() {
  return [
    { url: `${SITE}/`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/demo`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/classic`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/mcp`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.3 },
    // /play intentionally excluded — noindex'd (WIP battle prototype)
  ]
}
