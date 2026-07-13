'use client'

import { useState } from 'react'
import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicFaq.css'

/**
 * FAQ — a two-part split: sticky heading left, accordion right. Hairline rules
 * (no cards/shadows), one row open at a time, the open row turns green and its
 * "+" rotates to "×". Answers grow via grid-template-rows 0fr -> 1fr (no height
 * measuring). Reduced motion snaps them (global transition-zero gate).
 */

const FAQS = [
  { q: 'What do I actually win?', a: 'The title that doesn’t expire — #1 AI Marketer of 2026. Annual subscriptions to top AI tools. Direct hiring offers from sponsoring companies. Your case study featured on GitHub. Cash purses announced sprint-by-sprint by partners.' },
  { q: 'Who actually competes?', a: 'Senior performance marketers. Fractional CMOs to YC & A16Z portfolios. Solo operators behind 8-figure DTC brands. AI-native creative leads. Combined budget under management: $100M+.' },
  { q: 'Do I need to be a developer?', a: 'No. We pick marketers using AI — not engineers using marketing tools. If you can prompt, orchestrate AI agents, and read a dashboard, you’re in.' },
  { q: 'Can I use any AI tools and models?', a: 'Yes. Any model, any stack, any agent — bring your sharpest weapons. Use of AI isn’t recommended, it’s mandatory.' },
  { q: 'Solo or with a team?', a: 'Solo combat. One marketer, one AI stack, one client brief. Individual ranking, individual prizes. No team to hide behind — and no team to share the win with.' },
  { q: 'Do I get sponsor credits and tool access?', a: 'Yes. Sponsor credits and trial keys for top AI services drop before and during the hackathon — part of the prize vault, distributed only to confirmed participants.' },
  { q: 'What happens if I don’t make the final?', a: 'You still get the observer subscription — full hackathon access, every brief, every solution, every jury verdict. Every loss ships you intel for next season.' },
  { q: 'Can I do the Barcelona final remotely?', a: 'No. The final is offline only — jury presentation in person at Harbour.Space University. Qualification and main tour run online.' },
]

export default function ClassicFaq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="c-sec acc-green" id="c-faq" aria-label="Frequently asked questions">
      <div className="c-wrap c-faq">
        <aside className="c-faq__aside">
          <p className="c-kicker">FAQ</p>
          <MaskHead lines={['Frequently', 'asked questions']} />
          <p className="c-lede c-reveal c-faq__note">Still have questions? Everything below.</p>
        </aside>

        <ul className="c-faq__list">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <li className={`c-faq__item${isOpen ? ' is-open' : ''}`} key={item.q}>
                <button
                  className="c-faq__q"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="c-faq__q-text cap-trim">{item.q}</span>
                  <span className="c-faq__toggle" aria-hidden="true" />
                </button>
                <div className="c-faq__answer">
                  <p className="c-faq__answer-inner">{item.a}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
