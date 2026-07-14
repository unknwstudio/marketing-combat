// Single source of truth for the legal pages. Both the AI and classic route
// twins, and every entry point (register modal + both footers), render from
// this one object so the wording never forks between skins.
//
// Structure: LEGAL[kind] = { title, badge, intro, sections: [{ h, body }] }.
// A section's `body` is an ordered list of BLOCKS — a plain string renders as a
// paragraph, and `{ list: [...] }` renders as a bullet list. LegalDoc walks
// these; there is no per-skin markup here, only content.
//
// PLACEHOLDERS to fill before real (non-demo) launch — search for the brackets:
//   [OPERATOR]           legal name of the operating entity / person
//   [ADDRESS]            geographic (postal) address
//   [EMAIL]              contact address for legal + data-rights requests
//   [VAT/COMPANY NO.]    VAT or company registration number (if a company)
//   [JURISDICTION]       governing-law country (the operator's seat)
//   [EFFECTIVE DATE]     the "last updated" date once published
//
// STATUS: the site is in preview and the register form stores entries only in
// the browser (see src/lib/register.js) — nothing is transmitted. The privacy
// and legal-information docs say so plainly; the rest describe how the
// tournament will operate once live registration opens.

export const LEGAL = {
  // ---- Legal information / imprint (footer "Legal information") ------------
  legal: {
    title: 'Legal information',
    badge: 'Last updated [EFFECTIVE DATE].',
    intro:
      'This page identifies who runs AI Marketing Kombat and links to the documents that govern the site and your participation in the tournament.',
    sections: [
      {
        h: 'Who runs this site',
        body: [
          'AI Marketing Kombat ("the tournament", "we", "us") is operated by [OPERATOR], [ADDRESS].',
          {
            list: [
              'Contact: [EMAIL]',
              'Company / VAT number: [VAT/COMPANY NO.] (if applicable)',
              'Responsible for content: [OPERATOR]',
            ],
          },
        ],
      },
      {
        h: 'The event',
        body: [
          'AI Marketing Kombat is a skills tournament for marketing professionals, held in Barcelona in July 2026. This site lets you learn about the event and register to take part.',
        ],
      },
      {
        h: 'Documents that apply',
        body: [
          'Your participation is governed by the documents below. By registering you agree to the Terms of Participation and confirm you have read the Privacy Policy.',
          {
            list: [
              'Terms of Participation — the rules of the event.',
              'Code of Conduct — how participants are expected to behave.',
              'Privacy Policy — how we handle your personal data.',
            ],
          },
        ],
      },
      {
        h: 'Preview status',
        body: [
          'While the site is in preview, registration is a demonstration: what you enter is stored only in your own browser and is not sent to us. These documents describe how the tournament will operate once live registration opens.',
        ],
      },
      {
        h: 'Governing law',
        body: [
          'These documents and your participation are governed by the laws of [JURISDICTION], without prejudice to the mandatory consumer-protection rights you have under the law of your EU country of residence.',
        ],
      },
    ],
  },

  // ---- Terms of Participation (register modal "Terms") --------------------
  terms: {
    title: 'Terms of Participation',
    badge: 'Last updated [EFFECTIVE DATE].',
    intro:
      'These terms govern your registration for and participation in the AI Marketing Kombat tournament. Please read them before you register — by registering you agree to them.',
    sections: [
      {
        h: 'Who we are',
        body: [
          'AI Marketing Kombat is operated by [OPERATOR], [ADDRESS] ([EMAIL]). Full details are on the Legal information page.',
        ],
      },
      {
        h: 'The tournament',
        body: [
          'AI Marketing Kombat is a skills competition for marketing professionals, held in Barcelona in July 2026. Participants compete on a public leaderboard. The exact format, schedule and scoring are described on the event page and may be refined before the event.',
        ],
      },
      {
        h: 'Eligibility',
        body: [
          'To register you must:',
          {
            list: [
              'be at least 18 years old;',
              'be a marketing professional, or otherwise fall within the audience described on the event page;',
              'give accurate registration details and not impersonate anyone else;',
              'register only once — one entry per person.',
            ],
          },
          'We may refuse or cancel a registration that does not meet these conditions.',
        ],
      },
      {
        h: 'Registering',
        body: [
          'Registration asks for your name and email address. You are responsible for keeping your details accurate. Registration does not create a user account and needs no password.',
        ],
      },
      {
        h: 'Rules of play and fair competition',
        body: [
          'The tournament is scored on a leaderboard. To keep the competition fair, you agree not to:',
          {
            list: [
              'use bots, scripts or other automation to influence your score;',
              'exploit bugs, or interfere with the site, the leaderboard or other participants;',
              'collude with others, or use multiple identities to gain an advantage.',
            ],
          },
          'Full competition rules are published on the event page and form part of these terms. Our decisions on scoring and results are final.',
        ],
      },
      {
        h: 'Prizes',
        body: [
          'If the tournament offers prizes, they will be described on the event page, along with how and when they are awarded. Where prizes are offered they are non-transferable, there is no cash alternative unless we say otherwise, any taxes or charges on a prize are the winner’s responsibility, and the offer is void where prohibited by law.',
        ],
      },
      {
        h: 'Conduct and disqualification',
        body: [
          'All participants must follow the Code of Conduct. We may issue a warning, remove entries or scores, or disqualify and ban a participant who breaches these terms or the Code of Conduct, cheats, or behaves abusively.',
        ],
      },
      {
        h: 'Intellectual property',
        body: [
          'The site, its content and our branding belong to us or our licensors. You keep ownership of anything you submit as part of the tournament, but grant us a non-exclusive licence to use it to run and promote the event. Do not use our name or branding without permission.',
        ],
      },
      {
        h: 'Changes and cancellation',
        body: [
          'We may update, postpone, reschedule or cancel the event or these terms. If we make material changes we will post them on this page with a new date. Continuing to take part after a change means you accept it.',
        ],
      },
      {
        h: 'Disclaimers and liability',
        body: [
          'The site and the tournament are provided "as is". To the fullest extent permitted by law we exclude implied warranties and are not liable for indirect or unforeseeable loss. Nothing in these terms limits liability that cannot be limited by law, including your mandatory consumer rights under EU law.',
        ],
      },
      {
        h: 'Governing law',
        body: [
          'These terms are governed by the laws of [JURISDICTION]. The mandatory consumer-protection rules of your EU country of residence still apply.',
        ],
      },
      {
        h: 'Contact',
        body: ['Questions about these terms: [EMAIL].'],
      },
    ],
  },

  // ---- Code of Conduct (footer "Code of conduct") ------------------------
  conduct: {
    title: 'Code of Conduct',
    badge: 'Last updated [EFFECTIVE DATE].',
    intro:
      'AI Marketing Kombat should be competitive, fair and welcoming. This Code applies to everyone who takes part.',
    sections: [
      {
        h: 'Where this applies',
        body: [
          'This Code applies to the tournament, the leaderboard, and any related communications or community channels we run — whether online or in person in Barcelona.',
        ],
      },
      {
        h: 'What we expect',
        body: [
          {
            list: [
              'Treat other participants, organizers and staff with respect.',
              'Compete honestly and accept the results.',
              'Keep communications professional.',
              'Follow the reasonable instructions of the organizers.',
            ],
          },
        ],
      },
      {
        h: 'Unacceptable behaviour',
        body: [
          'We do not tolerate:',
          {
            list: [
              'harassment, bullying, threats or intimidation;',
              'hate speech or discrimination based on who someone is;',
              'sharing other people’s private information without consent;',
              'impersonation, or claiming someone else’s work or entry as your own;',
              'spam, scams or disruptive self-promotion.',
            ],
          },
        ],
      },
      {
        h: 'Fair play',
        body: [
          'To keep the competition fair, do not:',
          {
            list: [
              'use bots, scripts or automation to influence scores;',
              'exploit bugs or vulnerabilities;',
              'use multiple accounts or identities;',
              'collude to manipulate the leaderboard.',
            ],
          },
        ],
      },
      {
        h: 'Reporting a problem',
        body: [
          'If you see or experience a breach of this Code, contact us at [EMAIL]. Tell us what happened, when, and who was involved. We handle reports discreetly and process any personal data in line with the Privacy Policy.',
        ],
      },
      {
        h: 'Consequences',
        body: [
          'Depending on the severity, a breach may lead to a warning, removal of entries or scores, disqualification, or a ban from this and future events. The organizers decide what is appropriate.',
        ],
      },
    ],
  },

  // ---- Privacy Policy (register modal "Privacy Policy" + footer "Privacy") -
  privacy: {
    title: 'Privacy Policy',
    badge: 'Last updated [EFFECTIVE DATE].',
    intro:
      'This policy explains what personal data AI Marketing Kombat collects when you register, why, and the rights you have under the EU General Data Protection Regulation (GDPR).',
    sections: [
      {
        h: 'Preview status',
        body: [
          'While the site is in preview, registration is a demonstration only: the name and email you type are stored in your own browser and are not sent to us or anyone else. Clearing your browser storage erases them. The rest of this policy describes how your data will be handled once live registration opens.',
        ],
      },
      {
        h: 'Who is responsible (data controller)',
        body: [
          'The controller of your personal data is:',
          {
            list: [
              '[OPERATOR], [ADDRESS]',
              'Contact: [EMAIL]',
              'Company / VAT number: [VAT/COMPANY NO.] (if applicable)',
            ],
          },
          'We are a small operator and are not required to appoint a Data Protection Officer or an EU representative.',
        ],
      },
      {
        h: 'What we collect',
        body: [
          'When you register we collect only:',
          {
            list: [
              'your name (the "fighter name" you enter);',
              'your email address;',
              'whether you opted in to tournament email updates.',
            ],
          },
          'If we later add analytics or security logging, we will collect limited technical data (such as approximate, aggregated usage statistics) as described below. We do not ask for sensitive data, and we do not knowingly collect data from anyone under 18.',
        ],
      },
      {
        h: 'Why we use it, and our legal basis',
        body: [
          'We use your data for the purposes below, each with its own legal basis under GDPR Article 6:',
          {
            list: [
              'Registering you and running the tournament — including placing you on the leaderboard and emailing you about your entry. Basis: performance of a contract (Art. 6(1)(b)).',
              'Sending you tournament news and updates by email — only if you tick the optional box. Basis: your consent (Art. 6(1)(a)), which you can withdraw at any time.',
              'Keeping the site secure and understanding, in aggregate, how it is used. Basis: our legitimate interests (Art. 6(1)(f)), balanced against your privacy.',
            ],
          },
          'We never use your registration data for marketing unless you have separately opted in.',
        ],
      },
      {
        h: 'Who we share it with',
        body: [
          'We do not sell your data. We share it only with service providers that help us run the tournament and act on our instructions, such as:',
          {
            list: [
              'our website hosting provider;',
              'our email delivery provider (to send confirmations and, if you opted in, updates);',
              'a privacy-friendly analytics provider, if we add one.',
            ],
          },
          'A current list of these providers is available on request at [EMAIL].',
        ],
      },
      {
        h: 'Where your data is held',
        body: [
          'We keep your data within the EU/EEA wherever possible. If a provider processes data outside the EU (for example in the United States), we rely on an approved transfer mechanism — the EU–US Data Privacy Framework and/or the European Commission’s Standard Contractual Clauses — to protect it.',
        ],
      },
      {
        h: 'How long we keep it',
        body: [
          {
            list: [
              'Registration data (name, email): kept for the tournament and up to 12 months afterwards — so we can follow up and tell you about the next edition — then deleted.',
              'Marketing opt-in: kept until you unsubscribe or withdraw consent.',
              'You can ask us to delete your data sooner (see your rights).',
            ],
          },
        ],
      },
      {
        h: 'Your rights',
        body: [
          'Under the GDPR you have the right to:',
          {
            list: [
              'access the data we hold about you;',
              'have inaccurate data corrected;',
              'have your data deleted;',
              'restrict or object to certain processing;',
              'receive your data in a portable, machine-readable format;',
              'withdraw marketing consent at any time — without affecting your registration.',
            ],
          },
          'To exercise any of these, email [EMAIL]. We respond within one month and do not charge a fee. If you are not satisfied, you can complain to your local EU data-protection authority (for example, the AEPD in Spain or the APD/GBA in Belgium).',
        ],
      },
      {
        h: 'Cookies and tracking',
        body: [
          'The site does not use non-essential or advertising cookies, so no cookie banner is required. If we ever add third-party tools that set such cookies, we will ask for your consent first.',
        ],
      },
      {
        h: 'Automated decisions',
        body: [
          'We do not make decisions about you by purely automated means, and we do not profile you.',
        ],
      },
      {
        h: 'Changes to this policy',
        body: [
          'If we change this policy we will post the new version here with an updated date. Significant changes affecting your data will be communicated where appropriate.',
        ],
      },
      {
        h: 'Contact',
        body: ['Questions about your privacy: [EMAIL].'],
      },
    ],
  },
}
