'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import JuiceProvider from '@/effects/juice/JuiceProvider'
import HitSparks from '@/effects/particles/HitSparks'
import PixelCursor from '@/effects/cursor/PixelCursor'

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
import Judges from '@/sections/Judges/Judges'
import Organizers from '@/sections/Organizers/Organizers'
import Faq from '@/sections/Faq/Faq'
import Sponsors from '@/sections/Sponsors/Sponsors'
import FinalCta from '@/sections/FinalCta/FinalCta'
import Footer from '@/sections/Footer/Footer'

/**
 * AI Marketing Kombat — /demo.
 * The FULL pixel-art landing: the existing developed sections (Hero →
 * Champion → Fighters, identical to `/`) followed by the continuation
 * (marquee → footer) that carries the rest of the original site's
 * content. Same fixed-1440px ScaleCanvas shell and visual language.
 * All copy is verbatim from the original site.
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
              <Judges />
              <Organizers />
              <Faq />
              <Sponsors />
              <FinalCta />
              <Footer />
            </ScaleCanvas>
          </PixelCursor>
        </HitSparks>
      </JuiceProvider>
      <ModeSwitcher active="ai" />
    </div>
  )
}
