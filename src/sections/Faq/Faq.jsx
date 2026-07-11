import PixelIcon from '@/components/PixelIcon/PixelIcon'
import './Faq.css'

/**
 * FIGHTER'S MANUAL — FREQUENTLY ASKED QUESTIONS.
 * Questions and full answers verbatim from the original site.
 * Native <details> so expand/collapse works with no JS (static export safe).
 */
const FAQ = [
  {
    q: 'What do I actually win?',
    a: 'The title that doesn’t expire — #1 AI Marketer of 2026. Annual subscriptions to top AI tools. Direct hiring offers from sponsoring companies. Your case study featured on GitHub. Cash purses announced sprint-by-sprint by partners.',
  },
  {
    q: 'Who actually competes?',
    a: 'Senior performance marketers. Fractional CMOs to YC & A16Z portfolios. Solo operators behind 8-figure DTC brands. AI-native creative leads. Combined budget under management: $100M+.',
  },
  {
    q: 'Do I need to be a developer?',
    a: 'No. We pick marketers using AI — not engineers using marketing tools. If you can prompt, orchestrate AI agents, and read a dashboard, you’re in.',
  },
  {
    q: 'Can I use any AI tools and models?',
    a: 'Yes. Any model, any stack, any agent — bring your sharpest weapons. Use of AI isn’t recommended, it’s mandatory.',
  },
  {
    q: 'Solo or with a team?',
    a: 'Solo combat. One marketer, one AI stack, one client brief. Individual ranking, individual prizes. No team to hide behind — and no team to share the win with.',
  },
  {
    q: 'Do I get sponsor credits and tool access?',
    a: 'Yes. Sponsor credits and trial keys for top AI services drop before and during the tournament — part of the prize vault, distributed only to confirmed participants.',
  },
  {
    q: 'What happens if I don’t make the final?',
    a: 'You still get the observer subscription — full hackathon access, every brief, every solution, every jury verdict. Every loss ships you intel for next season.',
  },
  {
    q: 'Can I do the Barcelona final remotely?',
    a: 'No. The final is offline only — jury presentation in person at Harbour.Space University. Qualification and main tour run online.',
  },
]

export default function Faq() {
  return (
    <section className="dsec faq" aria-label="Frequently asked questions">
      <div className="dsec__head">
        <span className="dsec__round">Menu — fighter’s manual</span>
        <h2 className="dsec__title">frequently asked questions</h2>
      </div>

      <div className="faq__list">
        {FAQ.map((item, i) => (
          <details key={i} className="faq__item">
            <summary className="faq__summary">
              <span className="faq__q">
                <span className="faq__caret" aria-hidden="true">
                  <PixelIcon name="play" size="0.75em" />
                </span>
                {item.q}
              </span>
              <span className="faq__combo" aria-hidden="true">
                <span className="faq__arrow" style={{ '--rot': '90deg' }}>
                  &#10148;
                </span>
                <span className="faq__arrow" style={{ '--rot': '45deg' }}>
                  &#10148;
                </span>
                <span className="faq__arrow" style={{ '--rot': '0deg' }}>
                  &#10148;
                </span>
              </span>
            </summary>
            <p className="faq__a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
