export const metadata = {
  title: 'Demo — the full arcade tour',
  description:
    'The complete AI Marketing Kombat tour: prizes, judges, tracks, arenas, stages, FAQ and the playable arcade cabinet. Round 01 · July 2026 · Final in Barcelona.',
  alternates: { canonical: '/demo' },
  openGraph: {
    url: 'https://marketing-combat.vercel.app/demo',
    title: 'AI Marketing Kombat — the full arcade tour',
    description:
      'The complete AI Marketing Kombat tour: prizes, judges, tracks, arenas, stages, FAQ and the playable arcade cabinet.',
  },
}

/**
 * /demo has no metadata of its own today — page.jsx is 'use client' (the
 * whole arcade scene needs client-only hooks), so it silently inherits the
 * root layout's title/description/canonical, meaning Google indexes this
 * ~16 400px flagship page as a duplicate of "/". A segment layout.jsx can
 * export metadata alongside a 'use client' page in the same route — this
 * file exists ONLY for that; it renders nothing of its own.
 */
export default function DemoLayout({ children }) {
  return children
}
