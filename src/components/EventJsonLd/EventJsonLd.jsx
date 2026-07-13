import { SITE_URL, EVENT_DESCRIPTION } from '@/lib/site'

/**
 * JSON-LD Event schema, rendered ONLY on the pages that represent the event
 * (/, /demo, /classic) — NOT on /play (the game), /mcp (the prompt tool) or the
 * 404, where an Event graph is semantically wrong. Previously lived in the root
 * layout and leaked onto every route.
 *
 * Kept deliberately minimal: the final is in-person in Barcelona but qualifying
 * + the main tour run online (see Faq.jsx), so Mixed is the honest attendance
 * mode. Exact day, ticket price/availability and an endDate aren't settled yet
 * (the "two days" vs /mcp "45 min + 2 hours" copy still disagrees), and a guessed
 * `offers`/`endDate` would be worse for Rich Results than omitting it.
 */
const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'AI Marketing Kombat — Round 01',
  description: EVENT_DESCRIPTION,
  startDate: '2026-07',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Barcelona',
    address: { '@type': 'PostalAddress', addressLocality: 'Barcelona', addressCountry: 'ES' },
  },
  organizer: { '@type': 'Organization', name: 'AI Marketing Kombat', url: SITE_URL },
  image: [`${SITE_URL}/assets/hero/hero-bg.png`],
  url: SITE_URL,
}

export default function EventJsonLd() {
  return (
    <script
      type="application/ld+json"
      // escaping '<' means a future dynamic field can never close the <script> early
      dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c') }}
    />
  )
}
