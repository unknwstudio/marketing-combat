// Single source of truth for the deployed origin — layout metadata, robots.js
// and sitemap.js all need the exact same URL; redeclaring it per-file let them
// drift silently if the domain ever changes.
export const SITE_URL = 'https://marketing-combat.vercel.app'

// Shared event blurb — used by the root metadata description AND the JSON-LD
// Event schema, so they can't drift.
export const EVENT_DESCRIPTION =
  'The first international hackathon for senior marketers of the AI era. Two days, real cases — use AI or get finished. Round 01 · July 2026 · Final in Barcelona.'
