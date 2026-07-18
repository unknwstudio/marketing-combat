import '@/styles/index.css'
import '@/styles/App.css'
import { SITE_URL, EVENT_DESCRIPTION, OG_IMAGE } from '@/lib/site'

// Press Start 2P is self-hosted (index.css @font-face, preloaded below) — the
// old next/font/google import shipped a SECOND copy of the same face plus a
// redundant high-priority preload (2026-07-14 perf audit). Dropped; --k-font
// now points straight at the self-hosted 'Press Start 2P'.

const DESCRIPTION = EVENT_DESCRIPTION

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Marketing Kombat — hackathon for senior AI marketers',
    template: '%s · AI Marketing Kombat',
  },
  description: DESCRIPTION,
  keywords: [
    'AI marketing',
    'marketing hackathon',
    'AI marketers',
    'CMO',
    'growth',
    'performance marketing',
    'Barcelona',
    'AI Marketing Kombat',
  ],
  applicationName: 'AI Marketing Kombat',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'AI Marketing Kombat',
    title: 'AI Marketing Kombat — use AI or get finished',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Marketing Kombat — use AI or get finished',
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
  // index+follow is the default; declaring it here would also emit a positive
  // robots tag that competes with not-found.jsx's `noindex` on the 404 route.
  // Pages that must NOT be indexed (/play, 404) opt out with their own robots.
  icons: { icon: '/favicon.svg' },
}

// mobile browser-chrome color. Dark to match the permanently-dark arcade
// (/, /demo, /play); the white /classic & /mcp pages override this to light.
// (meta theme-color can't read CSS vars — the raw hex mirrors --k-bg)
export const viewport = {
  themeColor: '#0b0221',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* both are used on the very first paint (Platform in section
            titles, GT Pressura Mono as the body/UI font) — preloading
            avoids a flash of fallback-font text on slow connections */}
        <link rel="preload" href="/fonts/Platform-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/GT-Pressura-Mono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* self-hosted Press Start 2P (hero PLAY button) — preloaded so the
            real pixel glyphs paint immediately, no next/font-fallback flash */}
        <link
          rel="preload"
          href="/fonts/PressStart2P-Latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
