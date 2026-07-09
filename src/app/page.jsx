'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import JuiceProvider from '@/effects/juice/JuiceProvider'
import HitSparks from '@/effects/particles/HitSparks'
import PixelCursor from '@/effects/cursor/PixelCursor'

import Hero from '@/sections/Hero/Hero'
import Champion from '@/sections/Champion/Champion'
import Fighters from '@/sections/Fighters/Fighters'

/**
 * AI Marketing Kombat — pixel-art landing.
 * Sections are ported pixel-faithfully from Figma Frame 17 at a fixed 1440px
 * design width; ScaleCanvas fits that canvas to the viewport. Effect providers
 * wrap the scene (screen-shake, hit-sparks, pixel cursor); the CRT overlay
 * sits on top. Rendered on the server for SEO, hydrated on the client.
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
            </ScaleCanvas>
          </PixelCursor>
        </HitSparks>
      </JuiceProvider>
    </div>
  )
}
