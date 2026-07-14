export const metadata = {
  title: 'Privacy Policy — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Placeholder privacy notice for the demo registration flow. Replace with the
// real policy before collecting any real personal data.
export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>
        <strong>Demo placeholder.</strong> This page stands in for the full privacy notice while
        AI Marketing Kombat is in demo mode. No real personal data is collected or transmitted —
        the registration form stores what you type only in your own browser.
      </p>
      <h2>What we would collect</h2>
      <p>Your name, email address, and marketing preference — the minimum needed to create an account.</p>
      <h2>Your rights</h2>
      <p>
        Under the GDPR you have the right to access, correct, export, and delete your data, and to
        withdraw marketing consent at any time. In this demo, clearing your browser storage removes
        everything.
      </p>
      <p>
        <a href="/">← Back to AI Marketing Kombat</a>
      </p>
    </main>
  )
}
