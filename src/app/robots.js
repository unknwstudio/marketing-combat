const SITE = 'https://marketing-combat.vercel.app'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /play is a WIP battle prototype — already noindex'd on the page itself
      // (see src/app/play/page.jsx); keeping it out of robots too is belt-and-braces.
      disallow: '/play',
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
