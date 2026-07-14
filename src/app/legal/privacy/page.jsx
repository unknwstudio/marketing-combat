import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Privacy Policy — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Demo privacy notice, AI skin (linked from the / registration modal). The
// classic-skin twin lives at /legal/classic/privacy (separate static route).
export default function PrivacyPage() {
  return <LegalDoc kind="privacy" variant="ai" />
}
