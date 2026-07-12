import '@/styles/index.css'
import '@/styles/App.css'
import { Press_Start_2P } from 'next/font/google'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ps',
  display: 'swap',
})

const SITE = 'https://marketing-combat.vercel.app'
const DESCRIPTION =
  'The first international hackathon for senior marketers of the AI era. Two days, real cases — use AI or get finished. Round 01 · July 2026 · Final in Barcelona.'

export const metadata = {
  metadataBase: new URL(SITE),
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
    url: SITE,
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
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
}

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'AI Marketing Kombat — Round 01',
  description: DESCRIPTION,
  startDate: '2026-07',
  eventStatus: 'https://schema.org/EventScheduled',
  // the final is in-person in Barcelona, but qualifying + the main tour run
  // online (see Faq.jsx) — Mixed is the honest attendance mode, not Offline
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Barcelona',
    address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
  },
  organizer: { '@type': 'Organization', name: 'AI Marketing Kombat', url: SITE },
  image: [`${SITE}/assets/hero/hero-bg.png`],
  url: SITE,
  // exact day, ticket price/availability and an endDate aren't settled yet
  // (the hero copy says "two days", the /mcp prompt says "45 min + 2 hours" —
  // those two accounts of the format actively disagree) — Rich Results wants
  // real values for `offers`/`endDate`, and a guessed one would be worse than
  // omitting the field, so both stay out until the format is locked.
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pressStart.variable}>
      <head>
        {/* both are used on the very first paint (Platform in section
            titles, GT Pressura Mono as the body/UI font) — preloading
            avoids a flash of fallback-font text on slow connections */}
        <link rel="preload" href="/fonts/Platform-Medium.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/GT-Pressura-Mono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          // belt-and-braces: the object above is a static literal today (no
          // exploitable path), but escaping '<' means a future dynamic field
          // can never accidentally close the <script> tag early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  )
}
