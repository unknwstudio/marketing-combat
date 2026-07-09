import './styles/App.css'

import ScaleCanvas from './components/ScaleCanvas/ScaleCanvas.jsx'
import JuiceProvider from './effects/juice/JuiceProvider.jsx'
import HitSparks from './effects/particles/HitSparks.jsx'
import PixelCursor from './effects/cursor/PixelCursor.jsx'
import CRTOverlay from './effects/crt/CRTOverlay.jsx'

import Hero from './sections/Hero/Hero.jsx'
import Champion from './sections/Champion/Champion.jsx'
import Fighters from './sections/Fighters/Fighters.jsx'

/**
 * AI Marketing Kombat — pixel-art landing.
 * Sections are ported pixel-faithfully from Figma Frame 17 at a fixed 1440px
 * design width; ScaleCanvas fits that canvas to the viewport. The effect
 * providers wrap the scene (screen-shake, hit-sparks, pixel cursor) and the
 * CRT overlay sits on top of everything.
 */
export default function App() {
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
      <CRTOverlay />
    </div>
  )
}
