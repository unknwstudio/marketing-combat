'use client'

import MaskHead from '@/components/classic-motion/MaskHead'
import { useCountUp } from '@/components/classic-motion/useCountUp'
import './ClassicBattle.css'

/**
 * THE BATTLE — the manifesto + the four headline figures, plus the
 * "powered by" sponsor strip. Editorial split: lede left, giant weight-400
 * numerals in a hairline-divided row below. One figure ($100M+) carries the
 * blue accent; the rest stay black. Numbers count up on view.
 */

const STATS = [
  { target: 1, suffix: 'st', label: 'International hackathon' },
  { target: 300, suffix: '+', label: 'Participants' },
  { prefix: '$', target: 100, suffix: 'M+', label: 'Budget under management', accent: true },
  { target: 30, label: 'Finalists in Barcelona' },
]

const SPONSORS = [
  { src: '/assets/classic/sponsors/plurio.webp', alt: 'Plurio' },
  { src: '/assets/classic/sponsors/meta.svg', alt: 'Meta' },
  { src: '/assets/classic/sponsors/google.svg', alt: 'Google' },
  { src: '/assets/classic/sponsors/tiktok.svg', alt: 'TikTok' },
]

function Stat({ prefix, target, suffix, label, accent, index }) {
  const [ref, text] = useCountUp({ target, prefix, suffix })
  return (
    <div className="c-stat c-reveal" style={{ '--i': index }}>
      <span
        ref={ref}
        className={`c-stat__num cap-trim${accent ? ' c-stat__num--accent' : ''}`}
      >
        {text}
      </span>
      <span className="c-stat__label cap-trim">{label}</span>
    </div>
  )
}

export default function ClassicBattle() {
  return (
    <section className="c-sec acc-blue" id="c-battle" aria-label="The battle">
      <div className="c-wrap c-battle">
        <div className="c-battle__intro">
          <p className="c-kicker">The battle</p>
          <MaskHead lines={['Who can use AI', 'without limits?']} className="c-battle__h2" />
          <p className="c-lede c-reveal c-battle__lede">
            The time has come to settle the legendary battle and find out who the best marketer in
            the world is. AI Marketing Kombat is the marketers&rsquo; battle that ranks the best
            specialists on planet Earth.
          </p>
        </div>

        <div className="c-battle__stats">
          {STATS.map((s, i) => (
            <Stat key={s.label} index={i} {...s} />
          ))}
        </div>

        <div className="c-battle__sponsors c-reveal">
          <p className="c-battle__sponsors-label cap-trim">Powered by leading platforms</p>
          <ul className="c-battle__logos">
            {SPONSORS.map((s) => (
              <li key={s.alt}>
                <img src={s.src} alt={s.alt} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
