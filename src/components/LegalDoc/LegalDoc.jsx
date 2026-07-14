import { LEGAL } from '@/lib/legal'
import './LegalDoc.css'

/**
 * Themed legal document (Terms / Privacy). Server component — no client JS.
 * `variant` ('ai' | 'classic') skins the page to match the site version the
 * reader came from, so the Terms/Privacy links inside the registration modal
 * open a page that looks like the page the modal was opened on. Content comes
 * from src/lib/legal.js (single source; both routes + both skins share it).
 */
export default function LegalDoc({ kind, variant = 'ai' }) {
  const doc = LEGAL[kind]
  const home = variant === 'classic' ? '/classic' : '/'

  return (
    <main className={`legal legal--${variant}`}>
      <article className="legal__doc">
        <h1 className="legal__title">{doc.title}</h1>
        <p className="legal__intro">
          <strong>{doc.badge}</strong> {doc.intro}
        </p>
        {doc.sections.map((s) => (
          <section className="legal__section" key={s.h}>
            <h2 className="legal__h">{s.h}</h2>
            {s.body.map((block, i) =>
              typeof block === 'string' ? (
                <p className="legal__p" key={i}>
                  {block}
                </p>
              ) : (
                <ul className="legal__list" key={i}>
                  {block.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )
            )}
          </section>
        ))}
        <p className="legal__back">
          <a href={home}>← Back to AI Marketing Kombat</a>
        </p>
      </article>
    </main>
  )
}
