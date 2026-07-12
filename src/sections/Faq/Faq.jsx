'use client'

import { useEffect, useRef } from 'react'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
import './Faq.css'

/**
 * FIGHTER'S MANUAL — FREQUENTLY ASKED QUESTIONS.
 * Questions and full answers verbatim from the original site.
 * Native <details> so expand/collapse works with no JS (static export safe).
 *
 * JS layer (pure progressive enhancement on top of the native behaviour):
 * the FIRST time an item opens, its answer "decodes" — a quick ~0.5s GSAP
 * ScrambleText pass, lazy-imported on first open so gsap never lands in the
 * base bundle (same pattern as RoundMoments). First-open only (WeakSet), so
 * re-opening to re-read is never blocked by the effect.
 *
 * A11y: each answer renders TWICE — an aria-hidden visual copy that gets
 * scrambled, and an intact visually-hidden twin (.faq__a-sr) that screen
 * readers announce. AT never hears glyph noise, and the scramble always ends
 * on the exact original string. Reduced-motion: no listeners are attached at
 * all — answers appear instantly, zero scramble.
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
  const listRef = useRef(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    // Reduced-motion: attach nothing — native <details> shows answers instantly.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    const tweens = []
    const decoded = new WeakSet() // first open per item only

    const onToggle = (e) => {
      const details = e.target
      if (!details.open || decoded.has(details)) return
      decoded.add(details)
      const visual = details.querySelector('.faq__a-visual')
      if (!visual) return
      const original = visual.textContent
      ;(async () => {
        const { gsap } = await import('gsap')
        const { ScrambleTextPlugin } = await import('gsap/ScrambleTextPlugin')
        if (cancelled) return
        gsap.registerPlugin(ScrambleTextPlugin)
        tweens.push(
          gsap.to(visual, {
            duration: 0.5, // quick — decode, don't gate reading
            ease: 'none', // char swaps ARE the quantization — no easing on top
            scrambleText: { text: original, chars: '▓▒░<>/0123456789', speed: 0.4 },
          })
        )
      })()
    }

    // 'toggle' does not bubble — one listener per <details>.
    const items = Array.from(list.querySelectorAll('details'))
    items.forEach((d) => d.addEventListener('toggle', onToggle))

    return () => {
      cancelled = true
      items.forEach((d) => d.removeEventListener('toggle', onToggle))
      tweens.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section className="dsec faq" aria-label="Frequently asked questions">
      <div className="dsec__head">
        <span className="dsec__round">Menu — fighter’s manual</span>
        <h2 className="dsec__title">frequently asked questions</h2>
      </div>

      <div className="faq__list" ref={listRef}>
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
            {/* visual copy scrambles (aria-hidden); the .faq__a-sr twin is what
                screen readers read — always the intact original string */}
            <p className="faq__a">
              <span className="faq__a-visual" aria-hidden="true">
                {item.a}
              </span>
              <span className="faq__a-sr">{item.a}</span>
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
