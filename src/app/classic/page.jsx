import ClassicApp from './ClassicApp'

export const metadata = {
  title: 'Classic',
  description:
    'The first international hackathon for senior marketers of the AI era. Real client cases. Use AI — compare your skills. Round 01 · July 2026 · Final in Barcelona.',
  alternates: { canonical: '/classic' },
}

// this page is white — override the root's dark browser-chrome color
export const viewport = { themeColor: '#ffffff' }

/**
 * /classic — the "for normal people" mode: same content as the pixel-art
 * landing, laid out as a simple readable page (Figma Frame 53, node 38:4331).
 * Server component for metadata; all UI lives in the client ClassicApp.
 */
export default function ClassicPage() {
  return <ClassicApp />
}
