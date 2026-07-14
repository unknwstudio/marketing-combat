import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Code of Conduct — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Code of Conduct, AI skin (linked from the / footer). The classic-skin twin
// lives at /legal/classic/conduct — the site is a static export, so the two
// themes are separate prerendered routes. Content: src/lib/legal.js.
export default function ConductPage() {
  return <LegalDoc kind="conduct" variant="ai" />
}
