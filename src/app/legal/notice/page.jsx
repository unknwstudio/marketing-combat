import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Legal information — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Legal information / imprint, AI skin (footer "Legal information"). The
// classic-skin twin lives at /legal/classic/notice. Content: src/lib/legal.js
// under the `legal` key.
export default function NoticePage() {
  return <LegalDoc kind="legal" variant="ai" />
}
