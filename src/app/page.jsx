'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import JuiceProvider from '@/effects/juice/JuiceProvider'
import HitSparks from '@/effects/particles/HitSparks'
import PixelCursor from '@/effects/cursor/PixelCursor'
import CRTOverlay from '@/effects/crt/CRTOverlay'
import RegisterModal from '@/components/RegisterModal/RegisterModal'

import './demo.css'

import EventJsonLd from '@/components/EventJsonLd/EventJsonLd'

// landing sections (Hero → Footer)
import HeroStage from '@/components/HeroDisplay3D/HeroStage'
import RegCountdown from '@/sections/RegCountdown/RegCountdown'
import Champion from '@/sections/Champion/Champion'
import Fighters from '@/sections/Fighters/Fighters'

import Marquee from '@/sections/Marquee/Marquee'
import Stats from '@/sections/Stats/Stats'
import WhyJoin from '@/sections/WhyJoin/WhyJoin'
import Tracks from '@/sections/Tracks/Tracks'
import Arenas from '@/sections/Arenas/Arenas'
import Stages from '@/sections/Stages/Stages'
// Judges, Organizers, Leaderboard, Sponsors: hidden for now (not ready yet) —
// components untouched, just unmounted from the page. Re-add the imports +
// JSX below to bring them back.
import Faq from '@/sections/Faq/Faq'
import FinalCta from '@/sections/FinalCta/FinalCta'
import Footer from '@/sections/Footer/Footer'

// interactive arcade layer
import ScrollHealth from '@/components/ScrollHealth/ScrollHealth'
import DemoNav from '@/components/DemoNav/DemoNav'
import Announcer from '@/components/Announcer/Announcer'
import KonamiFatality from '@/components/KonamiFatality/KonamiFatality'
import SoundToggle from '@/components/SoundToggle/SoundToggle'
import MotionToggle from '@/components/MotionToggle/MotionToggle'
import PlayFab from '@/components/PlayFab/PlayFab'
import MagneticCTA from '@/components/MagneticCTA/MagneticCTA'
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal'
import RGBSplitFilter from '@/components/RGBSplitFilter/RGBSplitFilter'
import SelectSfx from '@/components/SelectSfx/SelectSfx'
import GlitchTitles from '@/components/GlitchTitles/GlitchTitles'
// RoundMoments: a full-viewport (mix-blend-mode: screen) "STAGE 0X" placard
// that pins over WHATEVER is on screen while its section is in the scroll
// range — it doesn't stay confined to its own section, so it was bleeding
// over the arcade cabinet and other neighbors, obscuring their content
// with a giant number that isn't tied to anything the visitor can act on.
// Unmounted; component untouched if this is worth revisiting later.
import AttractTitle from '@/components/AttractTitle/AttractTitle'
import AttractMode from '@/components/AttractMode/AttractMode'
import VsSplash from '@/components/VsSplash/VsSplash'
import ClickBurst from '@/components/ClickBurst/ClickBurst'
import GameTakeover from '@/components/GameTakeover/GameTakeover'

/**
 * AI Marketing Kombat — home ("/").
 * The FULL pixel-art landing (Hero → Footer) plus the interactive arcade
 * layer: a page-wide CRT, a health-bar scroll indicator, MK announcer
 * call-outs on section-enter, a PLAY arcade cabinet that boots the game
 * (plus a floating PLAY link, intercepted by VsSplash), and a Konami-code
 * FATALITY easter egg. Rendered on the server for SEO, hydrated on the client.
 * (Formerly served at /demo; that route now redirects here — see vercel.json.)
 */
export default function Page() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {/* mounted here (not near ScrollHealth/KonamiFatality below) so keyboard
          users reach its jump-links right after the skip-link, not after
          tabbing through the whole ~16 400px page — position: fixed means
          this move doesn't change where it renders */}
      <DemoNav />
      <RGBSplitFilter />
      <JuiceProvider>
        <HitSparks>
          {/* delegated [data-burst] pixel-shard bursts — needs useSparks(),
              so it must sit INSIDE the HitSparks provider (outside it the
              hook returns the no-op fallback and taps silently do nothing) */}
          <ClickBurst />
          {/* also needs useSparks() for its own opt-in data-announce-burst
              flash burst (the footer's end-of-tour payoff); its overlay is
              portalled to <body>, so where it sits in this tree only affects
              which providers it can read from, not where it renders */}
          <Announcer />
          <PixelCursor enabled>
            {/* zoom (not transform) so scroll math + GSAP ScrollTrigger pins
                stay layout-accurate; transform:scale drifts pinned elements.
                Same engine /classic already ships. */}
            <ScaleCanvas width={1440} mode="zoom">
              <main id="main">
                <HeroStage />
                {/* AI-mode only: countdown to the end of open registration +
                    the fighters tally (fake curve — src/config/registration.js) */}
                <RegCountdown />
                <Champion />
                <Fighters />

                <Marquee />
                <Stats />
                <WhyJoin />
                <Tracks />
                <Arenas />
                <Stages />
                <Faq />
                <FinalCta />
              </main>
              <Footer />
            </ScaleCanvas>
          </PixelCursor>
        </HitSparks>
      </JuiceProvider>

      {/* fixed overlays live OUTSIDE JuiceProvider — its `will-change: transform`
          wrapper would otherwise pin position:fixed to the page, not the viewport */}
      <CRTOverlay intensity={0.09} flicker powerOn />
      <RegisterModal variant="ai" />
      <ScrollHealth />
      <KonamiFatality />
      <SoundToggle />
      {/* universal auto-motion pause (WCAG 2.2.2) — docked above SoundToggle */}
      <MotionToggle />
      {/* hero-styled PLAY launcher, bottom-right — mirrors SoundToggle bottom-left */}
      <PlayFab />
      <MagneticCTA />
      <SelectSfx />
      <ScrollReveal />
      <GlitchTitles />
      <AttractTitle />
      <AttractMode />
      <VsSplash />
      <GameTakeover />
      <ModeSwitcher active="ai" />
      <EventJsonLd />
    </div>
  )
}
