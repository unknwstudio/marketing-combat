/**
 * Partner / sponsor logo roster — the interim wall (owner 2026-07-22): logos
 * get added / replaced as deals close, so both skins render from THIS list —
 * edit here, not in the sections. Order = the owner's list.
 *
 * All SVGs in public/assets/logos/ picked here are the light-background
 * variants (the AI skin recolors them to white with a CSS filter). `src:
 * null` → the tile renders the name as a plain wordmark until an SVG is
 * sourced.
 *
 * `h` is the OPTICAL display height (design px at the 1440 canvas, classic
 * base — the AI skin renders at 0.8×). A uniform height made the wall lumpy
 * (Alibaba's wordmark is ~3.8× the ink mass of AppsFlyer's), so each logo is
 * sized by measured ink mass — h ≈ 40 × (M_geomean / M_logo)^0.35, canvas
 * alpha-scan 2026-07-22 — then hand-rounded. Tune by eye from here, don't
 * reset them all to one number.
 */
export const PARTNERS = [
  // -2: viewBox trimmed to the artwork (the source had 10.5 units of dead
  // space at the bottom, floating the logo ~5px above the tile centre)
  // owner-tuned 2026-07-22 (2nd pass): Allformance/Alibaba a touch down,
  // AppsFlyer/web2wave a touch up vs the computed baseline
  { name: 'Allformance', src: '/assets/logos/allformance-2.svg', h: 36 },
  { name: 'Alibaba Cloud', src: '/assets/logos/alibaba-cloud.svg', h: 27 },
  { name: 'TikTok', src: '/assets/logos/tiktok.svg', h: 42 },
  { name: 'ByteDance', src: '/assets/logos/bytedance.svg', h: 38 },
  { name: 'Google', src: '/assets/logos/google.svg', h: 42 },
  { name: 'Google Cloud', src: '/assets/logos/google-cloud.svg', h: 36 },
  { name: 'AppsFlyer', src: '/assets/logos/appsflyer.svg', h: 47 },
  { name: 'Web2wavy', src: '/assets/logos/web2wavy-black.svg', h: 43 },
]
