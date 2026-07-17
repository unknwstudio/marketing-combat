'use client'

import { useEffect, useRef, useState } from 'react'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import './McpPrompt.css'

/**
 * MCP PROMPT screen — port of Figma "Frame 29" (node 90:3).
 * White single-viewport page; the orange card (513px) is centered with a
 * caption above. The card previews the site-as-a-prompt in lowercase
 * GT Pressura Mono, clamped to 9 lines with an ellipsis; "Copy prompt"
 * puts the full text on the clipboard.
 */

// The whole site content as one prompt — mirrors the LIVE section copy
// (classic + arcade skins), not the Figma source: when section copy changes,
// this string must change with it. This exact string is what gets copied.
const PROMPT = `AI Marketing Kombat
How it works · Tracks · Case tracks · FAQ · Apply
First international hackathon · AI era

The best marketer on the planet, decided.
The first international hackathon for senior marketers of the AI era. Real client cases. Use AI — compare your skills.
Two days. Real cases. Use AI or get finished.
◆ July 2026 ◆ Final in Barcelona · Harbour.Space University ◆ Online qualifying · offline final
Registration → 5 min to apply · 3 questions · AI review · 48 hr response
AI MARKETING KOMBAT · JULY 2026 · BARCELONA · APPLY ↗

The battle
Who can use AI without limits? The time has come to settle the legendary battle and find out who the best marketer in the world is. AI Marketing Kombat is the marketers' battle that ranks the best specialists on planet Earth.
1st International hackathon · 300+ Participants · $100M+ Budget under management · 30 Finalists in Barcelona

How it works
Registration. Qualifying round. Final. A real task — a brief, a data room, Google / Meta / TikTok, a creative block, AI tools, and limited time.
STEP 01 — Qualifying round: 45 minutes online. A real case to solve under pressure, with the AI stack of your choice.
STEP 02 — Evaluation: A panel of judges + AI assesses every solution. The client gets the final word.
STEP 03 — The final: 2 hours in Barcelona at Harbour.Space University — in person. A closed networking event and a private closing party follow.

Hackathon stages
After qualification, participants are ranked according to their level of expertise.
Round 1 — Solo · open qualification: Self-applied participants only. Individual solutions for standardized cases. Those who fail receive an observer subscription with full hackathon access.
Round 2 — Invite · live main tour: Invited participants start here. Anonymized real-life case studies from startups and enterprise clients. Use of AI is mandatory, not recommended.
Final round — Offline · Barcelona: Individual case solutions and jury presentation. The jury evaluates — but the final word belongs to the client.

Hackathon tracks
Choose your fighting style. Two directions to compete in — pick the one that plays to your strengths.
Track 01 — AI-Creatives. Special: holographic banner maker. AI-automated generation of creative packs, and banner-pack verification via an AI-agent auditor.
Track 02 — AI-Performance. Special: zero-waste media split. Strategy, analytics, paid-media buying and media-split management.

Battle arenas
Case tracks. Example case directions — real client briefs across industries. Win and the client pays the prize.
Case track 01 — Healthcare: Complex funnel. Long cycle. High LTV. Mission: cut CAC and speed up first-purchase conversion.
Case track 02 — B2B SaaS: Long sales cycles. Many stakeholders. Mission: turn PQLs into pipeline with AI-driven demand gen.
Case track 03 — E-commerce: High volume. Thin margins. ROAS pressure. Mission: scale creative and squeeze CAC with AI.
Case track 04 — Enterprise: Six-figure deals. Long procurement. Mission: run AI-powered ABM that lands target accounts.

Who it's for
For senior marketers of the AI era. CMOs, Heads of growth, Performance lead gens, AI creators …& future legends.

Why join
Find out your real level of mastering AI tools for marketing alongside your peers.
01 Challenge — Compare yourself with other market leaders in real-world conditions.
02 Community — Get into a closed, professional community of senior practitioners.
03 Networking — Networking with the jury, sponsors, and market colleagues.
04 Opportunity — The best solutions on GitHub. Offers from sponsoring companies.
05 Portfolio case — A real AI marketing case study — with numbers — in your portfolio.
06 Prize vault — Annual subscriptions to AI services and individual sessions with experts.

The prize
What the champion gets: $30K+ in AI tool subscriptions · Intros to A16Z & YC growth partners · Offers from sponsoring companies · The title of #1 AI marketer of 2026.
Join the battle. Put yourself on the map. Registration →

Mission
Bring together the people reshaping marketing. Change happens in many places at once. We create a point of contact — connecting the strongest practitioners with open-minded companies that have real marketing challenges. At the intersection of practice and discussion, knowledge is gained.

FAQ
What do I actually win? The title that doesn't expire — #1 AI Marketer of 2026. Annual subscriptions to top AI tools. Direct hiring offers from sponsoring companies. Your case study featured on GitHub. Cash purses announced sprint-by-sprint by partners.
Who actually competes? Senior performance marketers. Fractional CMOs to YC & A16Z portfolios. Solo operators behind 8-figure DTC brands. AI-native creative leads. Combined budget under management: $100M+.
Do I need to be a developer? No. We pick marketers using AI — not engineers using marketing tools. If you can prompt, orchestrate AI agents, and read a dashboard, you're in.
Can I use any AI tools and models? Yes. Any model, any stack, any agent — bring your sharpest weapons. Use of AI isn't recommended, it's mandatory.
Solo or with a team? Solo combat. One marketer, one AI stack, one client brief. Individual ranking, individual prizes. No team to hide behind — and no team to share the win with.
Do I get sponsor credits and tool access? Yes. Sponsor credits and trial keys for top AI services drop before and during the hackathon — part of the prize vault, distributed only to confirmed participants.
What happens if I don't make the final? You still get the observer subscription — full hackathon access, every brief, every solution, every jury verdict. Every loss ships you intel for next season.
Can I do the Barcelona final remotely? No. The final is offline only — jury presentation in person at Harbour.Space University. Qualification and main tour run online.

Join the battle. Apply for the first round and put yourself on the map of the best AI marketers on the planet. Registration →
© 2026 AI Marketing Kombat · July 2026 · Barcelona`

export default function McpPrompt() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(0)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT)
    } catch {
      // clipboard API unavailable (http / old browser) — fall back
      const ta = document.createElement('textarea')
      ta.value = PROMPT
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="mcp">
      <div className="mcp__center">
        <h1 className="sr-only">AI Marketing Kombat — copy this prompt for your AI agent</h1>
        <p className="mcp__caption">
          don&rsquo;t really wanna read? copy this prompt and ask your ai agent any questions
        </p>
        <div className="mcp__card">
          <div className="mcp__card-border">
            <div className="mcp__card-inner">
              <div className="mcp__preview" aria-hidden="true">
                <span className="mcp__u">{PROMPT.split('\n')[0]}</span>
                {'\n'}
                <span className="mcp__u">{PROMPT.split('\n')[1]}</span>
                {'\n'}
                {PROMPT.split('\n').slice(2).join('\n')}
              </div>
              <button className="mcp__copy" type="button" onClick={copy} aria-live="polite">
                {copied ? 'copied ✓' : 'copy prompt'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ModeSwitcher active="mcp" />
    </main>
  )
}
