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
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Barcelona',
    address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
  },
  organizer: { '@type': 'Organization', name: 'AI Marketing Kombat', url: SITE },
  url: SITE,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pressStart.variable}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      </body>
    </html>
  )
}
