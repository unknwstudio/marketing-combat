'use client'

import { useEffect, useState } from 'react'
import './Leaderboard.css'

/**
 * HALL OF FAME — HIGH SCORES. Classic arcade leaderboard as social proof:
 * rank / 3-letter initials / 6-digit score / title. The fiction: THE
 * ALGORITHM (the game's final boss) permanently owns slot 01 at 999999,
 * followed by human-ish champions named after the landing's own fighter
 * classes (CMOs, Heads of Growth, AI Creators… — see ROSTER in
 * src/game/fight/createFight.js). Fake scores sit in the 1-5k band on
 * purpose: the real game scores rungs-cleared * 1000 + remaining HP, so an
 * actual good run lands MID-TABLE instead of embarrassingly last.
 *
 * Real scores: the game persists its top-10 under localStorage
 * 'kombat_scores' ({ initials, score, date }). If present, the single best
 * real entry is spliced into the board with a "YOU?" tag. Read DEFENSIVELY —
 * storage can be blocked (private mode), the JSON hand-edited garbage,
 * entries malformed; any failure just leaves the board fictional. Read in an
 * effect (client-only) so the SSR/static HTML and first client render agree.
 *
 * Last row is the hook: a blinking "YOUR NAME HERE" linking to the
 * registration CTA (/demo#register). data-magnetic + data-sfx follow the
 * MagneticCTA contract (confirm blip on click), same as the FinalCta button.
 *
 * No images, no motion beyond the steps(1) blink (static under
 * reduced-motion) — the table IS the aesthetic.
 */

// Same key the game writes (SCORES_KEY in createFight.js) — string kept
// local so the landing chunk never imports Phaser-adjacent game code.
const SCORES_KEY = 'kombat_scores'

// Fictional champions, sorted by score. `boss: true` = the machine's row.
const BOARD = [
  { initials: 'AAA', score: 999999, title: 'THE ALGORITHM', boss: true },
  { initials: 'GRW', score: 4980, title: 'Head of Growth — rushdown' },
  { initials: 'CMO', score: 4310, title: 'Fractional CMO — zoner' },
  { initials: 'AIC', score: 3700, title: 'AI Creator — heavy' },
  { initials: 'CDX', score: 2950, title: 'Creative Director — combo god' },
  { initials: 'PLG', score: 2140, title: 'Performance Lead — all-round' },
  { initials: 'LGD', score: 1260, title: 'Future Legend — assassin' },
]

export default function Leaderboard() {
  const [you, setYou] = useState(null)

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]')
      if (!Array.isArray(raw)) return
      const best = raw
        .filter((e) => e && Number.isFinite(e.score) && e.score > 0)
        .sort((a, b) => b.score - a.score)[0]
      if (!best) return
      setYou({
        // 3 uppercase alphanumerics, arcade-style; anything unusable → 'YOU'
        initials:
          (String(best.initials || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 3) || 'YOU').toUpperCase(),
        // clamp: floor + cap one point under the boss — nobody outranks the machine
        score: Math.min(Math.floor(best.score), 999998),
        title: 'Challenger — gauntlet run',
        you: true,
      })
    } catch (e) {
      /* no storage / bad JSON — the fictional board stands */
    }
  }, [])

  // splice the real entry into rank order; ranks derive from the final order
  const rows = you ? [...BOARD, you].sort((a, b) => b.score - a.score) : BOARD

  return (
    <section className="dsec leaderboard" aria-label="High scores">
      <div className="dsec__head">
        <span className="dsec__round">Hall of fame — battery-backed RAM</span>
        <h2 className="dsec__title">high scores</h2>
        <p className="dsec__sub">
          Every cabinet keeps a board. The Algorithm holds slot 01 — beat the game above and put
          a human back in the rankings.
        </p>
      </div>

      {/* .dcard: joins the shared ScrollReveal fade + pixel-dissolve for free */}
      <div className="dcard leaderboard__board">
        <table className="leaderboard__table">
          <thead>
            <tr>
              <th scope="col">rank</th>
              <th scope="col">name</th>
              <th scope="col" className="leaderboard__score">
                score
              </th>
              <th scope="col">title</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                // 'you' discriminator: the real entry may coincide with a
                // fictional row's initials+score — keys must still be unique
                key={`${r.you ? 'you' : 'npc'}-${r.initials}-${r.score}`}
                className={
                  r.boss ? 'leaderboard__row--boss' : r.you ? 'leaderboard__row--you' : undefined
                }
              >
                <td className="leaderboard__rank">{String(i + 1).padStart(2, '0')}</td>
                <td className="leaderboard__name">{r.initials}</td>
                <td className="leaderboard__score">{String(r.score).padStart(6, '0')}</td>
                <td className="leaderboard__title">
                  {r.title}
                  {r.you && <span className="leaderboard__youtag"> YOU?</span>}
                </td>
              </tr>
            ))}

            {/* the open slot — the section's actual CTA */}
            <tr className="leaderboard__row--enter">
              <td className="leaderboard__rank">{String(rows.length + 1).padStart(2, '0')}</td>
              <td className="leaderboard__name">???</td>
              <td className="leaderboard__score">??????</td>
              <td className="leaderboard__title">
                <a
                  className="leaderboard__enter"
                  href="/demo#register"
                  data-magnetic
                  data-sfx="confirm"
                >
                  YOUR NAME HERE
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
