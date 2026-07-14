import LegalDoc from '@/components/LegalDoc/LegalDoc'

export const metadata = {
  title: 'Code of Conduct — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Classic-skin twin of /legal/conduct, linked from the /classic footer so the
// page matches the classic look. Same content (src/lib/legal.js).
export default function ClassicConductPage() {
  return <LegalDoc kind="conduct" variant="classic" />
}
