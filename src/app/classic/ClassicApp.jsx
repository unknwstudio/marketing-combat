'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import ClassicMenu from '@/components/ClassicMenu/ClassicMenu'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import ClassicHero from '@/sections/ClassicHero/ClassicHero'
import ClassicChampionFor from '@/sections/ClassicChampionFor/ClassicChampionFor'
import './classic.css'

/**
 * Classic mode root. Sections are ported pixel-faithfully from Figma
 * "Frame 53" (node 38:4331) at a fixed 1440px design width; ScaleCanvas
 * fits the canvas to the viewport. The orange menu card (Figma 36:4312)
 * stays fixed at the top-right through the whole page, and the mode
 * switcher is pinned to the bottom of the viewport.
 */
export default function ClassicApp() {
  return (
    <div className="classic">
      <ScaleCanvas width={1440}>
        <ClassicHero />
        <ClassicChampionFor />
      </ScaleCanvas>
      <ClassicMenu />
      <ModeSwitcher active="classic" />
    </div>
  )
}
