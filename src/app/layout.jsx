import '@/styles/index.css'
import '@/styles/App.css'
import { Press_Start_2P } from 'next/font/google'
import { SITE_URL, EVENT_DESCRIPTION } from '@/lib/site'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ps',
  display: 'swap',
})

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
    images: [
      {
        url: '/assets/hero/hero-bg.png',
        width: 1440,
        height: 804,
        alt: 'Two pixel-art fighters facing off — AI Marketing Kombat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Marketing Kombat — use AI or get finished',
    description: DESCRIPTION,
    images: ['/assets/hero/hero-bg.png'],
  },
  // index+follow is the default; declaring it here would also emit a positive
  // robots tag that competes with not-found.jsx's `noindex` on the 404 route.
  // Pages that must NOT be indexed (/play, 404) opt out with their own robots.
  icons: { icon: '/favicon.svg' },
}

// mobile browser-chrome color. Dark to match the permanently-dark arcade
// (/, /demo, /play); the white /classic & /mcp pages override this to light.
export const viewport = {
  themeColor: '#0b0221',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pressStart.variable}>
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
