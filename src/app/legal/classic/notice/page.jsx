import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Legal information — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Classic-skin twin of /legal/notice, linked from the /classic footer so the
// page matches the classic look. Same content (src/lib/legal.js `legal` key).
export default function ClassicNoticePage() {
  return <LegalDoc kind="legal" variant="classic" />
}
