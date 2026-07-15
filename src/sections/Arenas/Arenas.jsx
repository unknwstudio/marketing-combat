'use client'

import { useEffect, useRef } from 'react'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
import { typeset } from '@/lib/typeset'
import './Arenas.css'

/**
 * STAGE 04 — BATTLE ARENAS. Four example case tracks (real client briefs).
 * Copy, stat tags and difficulty star counts verbatim from the original site.
 */
const ARENAS = [
  {
    n: '01',
    img: 'healthcare.webp',
    name: 'HEALTHCARE',
    body: 'Complex funnel. Long cycle. High LTV. Mission: cut CAC and speed up first-purchase conversion.',
    tags: ['CYCLE LONG', 'LTV HIGH'],
    difficulty: 4,
  },
  {
    n: '02',
    img: 'b2b-saas.webp',
    name: 'B2B SAAS',
    body: 'Long sales cycles. Many stakeholders. Mission: turn PQLs into pipeline with AI-driven demand gen.',
    tags: ['MOTION PLG', 'ACV HIGH'],
    difficulty: 3,
  },
  {
    n: '03',
    img: 'e-commerce.webp',
    name: 'E-COMMERCE',
    body: 'High volume. Thin margins. ROAS pressure. Mission: scale creative and squeeze CAC with AI.',
    tags: ['VOLUME HIGH', 'MARGIN THIN'],
    difficulty: 3,
  },
  {
    n: '04',
    img: 'enterprise.webp',
    name: 'ENTERPRISE',
    body: 'Six-figure deals. Long procurement. Mission: run AI-powered ABM that lands target accounts.',
    tags: ['DEAL 6-FIG', 'CYCLE LONG'],
    difficulty: 4,
  },
]

const MAX_STARS = 5

export default function Arenas() {
  const gridRef = useRef(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const stars = gridRef.current?.querySelectorAll('.arenas__stars') ?? []
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('arenas__stars--revealed')
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.5 }
    )
    stars.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="dsec dsec--alt arenas" aria-label="Battle arenas">
      <div className="dsec__head">
        <span className="dsec__round">{typeset('Stage 04 — select your arena')}</span>
        <h2 className="dsec__title">battle arenas</h2>
        <p className="dsec__sub">
          {typeset(
            'Example case directions — real client briefs across industries. Win, and the prize is funded by the client.'
          )}
        </p>
      </div>

      <ul className="arenas__grid" ref={gridRef}>
        {ARENAS.map((a) => (
          <li key={a.n} className="dcard arenas__card">
            <img
              className="arenas__art pixelated"
              src={`/assets/demo/arenas/${a.img}`}
              alt={`${a.name} arena`}
              loading="lazy"
              decoding="async"
            />
            <div className="arenas__top">
              <span className="arenas__track">CASE TRACK · {a.n}</span>
              <h3 className="arenas__name">{a.name}</h3>
            </div>

            <p className="arenas__body">{a.body}</p>

            <div className="arenas__meta">
              <div className="arenas__tags">
                {a.tags.map((t) => (
                  <span key={t} className="dpill">
                    {t}
                  </span>
                ))}
              </div>
              <div className="arenas__difficulty">
                <span className="arenas__difLabel">DIFFICULTY</span>
                <span className="arenas__stars" aria-label={`Difficulty ${a.difficulty} of ${MAX_STARS}`}>
                  {Array.from({ length: MAX_STARS }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        'arenas__star' + (i < a.difficulty ? ' arenas__star--on' : '')
                      }
                      aria-hidden="true"
                    >
                      <PixelIcon name="star" size="1em" />
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
