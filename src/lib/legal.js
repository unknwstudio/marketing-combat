// Copy for the demo legal stub pages (Terms + Privacy). Single source so both
// routes and both theme skins render identical text. Placeholder content —
// replace with the real policy/terms before collecting any real personal data.
export const LEGAL = {
  terms: {
    title: 'Terms & Conditions',
    badge: 'Demo placeholder.',
    intro:
      'This page stands in for the full terms while AI Marketing Kombat is in demo mode. Registering for the event creates no real account and sends no data to any server.',
    sections: [
      {
        h: 'Eligibility',
        p: 'The tournament is intended for marketing professionals. Full eligibility rules will be published before launch.',
      },
      {
        h: 'Demo status',
        p: 'Nothing on this site constitutes a binding offer while it is in demo mode.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    badge: 'Demo placeholder.',
    intro:
      'This page stands in for the full privacy notice while AI Marketing Kombat is in demo mode. No real personal data is collected or transmitted — the registration form stores what you type only in your own browser.',
    sections: [
      {
        h: 'What we would collect',
        p: 'Your name, email address, and marketing preference — the minimum needed to register you for the event.',
      },
      {
        h: 'Your rights',
        p: 'Under the GDPR you have the right to access, correct, export, and delete your data, and to withdraw marketing consent at any time. In this demo, clearing your browser storage removes everything.',
      },
    ],
  },
}
