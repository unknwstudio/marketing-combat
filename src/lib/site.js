// Single source of truth for the deployed origin — layout metadata, robots.js
// and sitemap.js all need the exact same URL; redeclaring it per-file let them
// drift silently if the domain ever changes.
export const SITE_URL = 'https://marketing-combat.vercel.app'

// Shared event blurb — used by the root metadata description AND the JSON-LD
// Event schema, so they can't drift.
export const EVENT_DESCRIPTION =
  'The first international hackathon for senior marketers of the AI era. Two days, real cases — use AI or get finished. Round 01 · July 2026 · Final in Barcelona.'

// Shared OpenGraph/Twitter share image — the pixel-art hero. Exported so every
// route's per-page metadata points at the SAME asset + dimensions instead of
// re-declaring it and drifting (2026-07-18 audit).
export const OG_IMAGE = {
  url: '/assets/hero/hero-bg.jpg',
  width: 1440,
  height: 804,
  alt: 'Two pixel-art fighters facing off — AI Marketing Kombat',
}
