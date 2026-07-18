'use client'

import ScaleCanvas from '@/components/ScaleCanvas/ScaleCanvas'
import ClassicMenu from '@/components/ClassicMenu/ClassicMenu'
import ModeSwitcher from '@/components/ModeSwitcher/ModeSwitcher'
import ClassicReveal from '@/components/classic-motion/ClassicReveal'
import RegisterModal from '@/components/RegisterModal/RegisterModal'
import EventJsonLd from '@/components/EventJsonLd/EventJsonLd'
import ClassicHero from '@/sections/ClassicHero/ClassicHero'
import ClassicBattle from '@/sections/ClassicBattle/ClassicBattle'
import ClassicHow from '@/sections/ClassicHow/ClassicHow'
import ClassicTracks from '@/sections/ClassicTracks/ClassicTracks'
import ClassicArenas from '@/sections/ClassicArenas/ClassicArenas'
import ClassicChampionFor from '@/sections/ClassicChampionFor/ClassicChampionFor'
import ClassicFloor from '@/sections/ClassicFloor/ClassicFloor'
import ClassicWhy from '@/sections/ClassicWhy/ClassicWhy'
import ClassicMission from '@/sections/ClassicMission/ClassicMission'
// import ClassicJury from '@/sections/ClassicJury/ClassicJury'
// import ClassicOrganizers from '@/sections/ClassicOrganizers/ClassicOrganizers'
import ClassicFaq from '@/sections/ClassicFaq/ClassicFaq'
import ClassicFinalCta from '@/sections/ClassicFinalCta/ClassicFinalCta'
import ClassicFooter from '@/sections/ClassicFooter/ClassicFooter'
import './classic.css'

/**
 * Classic mode root. The hero and the champion/who block are pixel-faithful
 * Figma ports; the remaining sections are built on the classic design tokens
 * (see docs/superpowers/specs/2026-07-14-classic-page-buildout-design.md).
 * ScaleCanvas fits the 1440px canvas to the viewport; the orange menu card
 * stays fixed top-right and the mode switcher is pinned to the bottom.
 * ClassicReveal drives the editorial scroll reveals (no-JS / reduced-motion safe).
 */
export default function ClassicApp() {
  return (
    <div className="classic">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScaleCanvas width={1440} mode="zoom">
        <main id="main">
          <ClassicHero />
          <ClassicBattle />
          <ClassicHow />
          <ClassicTracks />
          <ClassicArenas />
          <ClassicChampionFor />
          <ClassicFloor />
          <ClassicWhy />
          <ClassicMission />
          {/* Judges & Organizers temporarily hidden */}
          {/* <ClassicJury /> */}
          {/* <ClassicOrganizers /> */}
          <ClassicFaq />
          <ClassicFinalCta />
          <ClassicFooter />
        </main>
      </ScaleCanvas>
      <RegisterModal variant="classic" />
      <ClassicReveal />
      <ClassicMenu />
      {/* the WCAG 2.2.2 pause control lives in the hero chips row
          (ClassicMotionChip) — the floating pill read as arcade chrome on this
          skin and collided with the footer base row */}
      <ModeSwitcher active="classic" />
      {/* /classic is an indexable event page too — emit the same Event graph
          the home page does (2026-07-18 audit: it was shipping none) */}
      <EventJsonLd />
    </div>
  )
}
