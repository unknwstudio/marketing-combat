/**
 * Partner / sponsor logo roster — the interim wall (owner 2026-07-22): logos
 * get added / replaced as deals close, so both skins render from THIS list —
 * edit here, not in the sections. Order = the owner's list.
 *
 * All SVGs in public/assets/logos/ picked here are the light-background
 * variants (both skins put logos on white). `src: null` → the tile renders
 * the name as a plain wordmark until an SVG is sourced.
 */
export const PARTNERS = [
  // -2: viewBox trimmed to the artwork (the source had 10.5 units of dead
  // space at the bottom, floating the logo ~5px above the tile centre)
  { name: 'Allformance', src: '/assets/logos/allformance-2.svg' },
  { name: 'Alibaba Cloud', src: '/assets/logos/alibaba-cloud.svg' },
  { name: 'TikTok', src: '/assets/logos/tiktok.svg' },
  { name: 'ByteDance', src: '/assets/logos/bytedance.svg' },
  { name: 'Google', src: '/assets/logos/google.svg' },
  { name: 'Google Cloud', src: '/assets/logos/google-cloud.svg' },
  { name: 'AppsFlyer', src: '/assets/logos/appsflyer.svg' },
  { name: 'Web2wavy', src: '/assets/logos/web2wavy-black.svg' },
]
