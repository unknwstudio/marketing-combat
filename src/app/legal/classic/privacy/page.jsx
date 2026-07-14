import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Privacy Policy — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Classic-skin twin of /legal/privacy, linked from the /classic registration
// modal. Same content (src/lib/legal.js).
export default function ClassicPrivacyPage() {
  return <LegalDoc kind="privacy" variant="classic" />
}
