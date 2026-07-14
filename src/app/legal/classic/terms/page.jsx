import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Terms — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Classic-skin twin of /legal/terms, linked from the /classic registration
// modal so the Terms page matches the classic look. Same content (src/lib/legal.js).
export default function ClassicTermsPage() {
  return <LegalDoc kind="terms" variant="classic" />
}
