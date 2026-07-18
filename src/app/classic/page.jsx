import ClassicApp from './ClassicApp'
import { OG_IMAGE } from '@/lib/site'

const DESCRIPTION =
  'The first international hackathon for senior marketers of the AI era. Real client cases. Use AI — compare your skills. Round 01 · July 2026 · Final in Barcelona.'

export const metadata = {
  title: 'Classic view',
  description: DESCRIPTION,
  alternates: { canonical: '/classic' },
  // per-route OpenGraph/Twitter — without these the root layout's home-page
  // og:url/title/description leak onto /classic (2026-07-18 audit)
  openGraph: {
    type: 'website',
    url: '/classic',
    siteName: 'AI Marketing Kombat',
    title: 'AI Marketing Kombat — classic view',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Marketing Kombat — classic view',
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
}

/**
 * /classic — the "for normal people" mode: same content as the pixel-art
 * landing, laid out as a simple readable page (Figma Frame 53, node 38:4331).
 * Server component for metadata; all UI lives in the client ClassicApp.
 */
export default function ClassicPage() {
  return <ClassicApp />
}
