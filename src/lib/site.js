// Single source of truth for the deployed origin — layout metadata, robots.js
// and sitemap.js all need the exact same URL; redeclaring it per-file let them
// drift silently if the domain ever changes.
export const SITE_URL = 'https://marketing-combat.vercel.app'
