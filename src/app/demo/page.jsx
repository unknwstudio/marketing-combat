'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import JuiceProvider from '@/effects/juice/JuiceProvider'
import HitSparks from '@/effects/particles/HitSparks'
import PixelCursor from '@/effects/cursor/PixelCursor'
import CRTOverlay from '@/effects/crt/CRTOverlay'

import './demo.css'

// existing landing sections (same as `/`) — reused so /demo is the full page
import Hero from '@/sections/Hero/Hero'
import Champion from '@/sections/Champion/Champion'
import Fighters from '@/sections/Fighters/Fighters'

import Marquee from '@/sections/Marquee/Marquee'
import Stats from '@/sections/Stats/Stats'
import WhyJoin from '@/sections/WhyJoin/WhyJoin'
import Tracks from '@/sections/Tracks/Tracks'
import Arenas from '@/sections/Arenas/Arenas'
import Stages from '@/sections/Stages/Stages'
import ArcadeCabinet from '@/sections/ArcadeCabinet/ArcadeCabinet'
import Judges from '@/sections/Judges/Judges'
import Organizers from '@/sections/Organizers/Organizers'
import Faq from '@/sections/Faq/Faq'
import Sponsors from '@/sections/Sponsors/Sponsors'
import FinalCta from '@/sections/FinalCta/FinalCta'
import Footer from '@/sections/Footer/Footer'

// interactive arcade layer
import ScrollHealth from '@/components/ScrollHealth/ScrollHealth'
import Announcer from '@/components/Announcer/Announcer'
import KonamiFatality from '@/components/KonamiFatality/KonamiFatality'
import SoundToggle from '@/components/SoundToggle/SoundToggle'
import MagneticCTA from '@/components/MagneticCTA/MagneticCTA'

/**
 * AI Marketing Kombat — /demo.
 * The FULL pixel-art landing (Hero → Footer, copy verbatim from the original)
 * plus the interactive arcade layer: a page-wide CRT, a health-bar scroll
 * indicator, MK announcer call-outs on section-enter, a PLAY arcade cabinet
 * that boots the game, and a Konami-code FATALITY easter egg.
 */
export default function Page() {
  return (
    <div className="app">
      <JuiceProvider>
        <HitSparks>
          <PixelCursor enabled>
            <ScaleCanvas width={1440}>
              <Hero />
              <Champion />
              <Fighters />

              <Marquee />
              <Stats />
              <WhyJoin />
              <Tracks />
              <Arenas />
              <Stages />
              <ArcadeCabinet />
              <Judges />
              <Organizers />
              <Faq />
              <Sponsors />
              <FinalCta />
              <Footer />
            </ScaleCanvas>
          </PixelCursor>
        </HitSparks>

        {/* inside the provider so it can trigger screen-shake; its overlay is
            portalled to <body> so the fixed positioning stays viewport-correct */}
        <Announcer />
      </JuiceProvider>

      {/* fixed overlays live OUTSIDE JuiceProvider — its `will-change: transform`
          wrapper would otherwise pin position:fixed to the page, not the viewport */}
      <CRTOverlay intensity={0.1} flicker powerOn={false} />
      <ScrollHealth />
      <KonamiFatality />
      <SoundToggle />
      <MagneticCTA />
      <ModeSwitcher active="ai" />
    </div>
  )
}
