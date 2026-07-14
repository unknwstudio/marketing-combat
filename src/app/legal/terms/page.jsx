export const metadata = {
  title: 'Terms — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Placeholder terms for the demo registration flow. Replace with the real terms
// before launch.
export default function TermsPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
      <h1>Terms &amp; Conditions</h1>
      <p>
        <strong>Demo placeholder.</strong> This page stands in for the full terms while AI Marketing
        Kombat is in demo mode. Registration currently creates no real account and sends no data to
        any server.
      </p>
      <h2>Eligibility</h2>
      <p>The tournament is intended for marketing professionals. Full eligibility rules will be published before launch.</p>
      <h2>Demo status</h2>
      <p>Nothing on this site constitutes a binding offer while it is in demo mode.</p>
      <p>
        <a href="/">← Back to AI Marketing Kombat</a>
      </p>
    </main>
  )
}
