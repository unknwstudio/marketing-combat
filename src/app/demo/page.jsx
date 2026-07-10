'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import JuiceProvider from '@/effects/juice/JuiceProvider'
import HitSparks from '@/effects/particles/HitSparks'
import PixelCursor from '@/effects/cursor/PixelCursor'

import './demo.css'

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
 * Continuation of the pixel-art landing: carries the original site's
 * sections after the roster (stats → footer) in the same fixed-1440px
 * ScaleCanvas shell and visual language as `/`. All copy is verbatim
 * from the original site; imagery is generated pixel art.
 */
export default function Page() {
  return (
    <div className="app">
      <JuiceProvider>
        <HitSparks>
          <PixelCursor enabled>
            <ScaleCanvas width={1440}>
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
