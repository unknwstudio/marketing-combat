import Hero from '@/sections/Hero/Hero'
import './HeroStage.css'

/**
 * HeroStage — renders the flat pixel Hero. It used to progressively enhance to a
 * live WebGL "CRT DISPLAY" over the hero on desktop; that CRT effect has been
 * removed, so the hero is now the clean flat pixel scene at every breakpoint.
 * The `.herostage` wrapper is kept because hero CSS scopes a few rules to it.
 */
export default function HeroStage() {
  return (
    <div className="herostage">
      <div className="herostage__flat">
        <Hero />
      </div>
    </div>
  )
}
