import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Terms — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Demo terms, AI skin (linked from the / registration modal). The classic-skin
// twin lives at /legal/classic/terms — the site is a static export, so the two
// themes are separate prerendered routes rather than one query-param page.
export default function TermsPage() {
  return <LegalDoc kind="terms" variant="ai" />
}
