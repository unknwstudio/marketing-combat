import ClassicHeroMedia from './ClassicHeroMedia'
import { typeset } from '@/lib/typeset'
import './ClassicHero.css'

/**
 * CLASSIC HERO — pixel-faithful port of Figma "Frame 29" (node 35:4238).
 * Fixed 1440x804 stage: yellow left half (headline + lede + registration
 * pill), photo right half with the fact chips overlaid at the bottom.
 * The orange menu card from this frame is NOT here — it must stay fixed
 * through the whole page, so it lives in components/ClassicMenu.
 */
export default function ClassicHero() {
  return (
    <section className="c-hero" aria-label="AI Marketing Kombat — classic">
      <div className="c-hero__left">
        <div className="c-hero__head">
          <h1 className="c-hero__title cap-trim">
            {typeset('The best marketer on the planet, decided')}
          </h1>
          <p className="c-hero__lede cap-trim">
            {typeset(
              'The first international hackathon for senior marketers of the AI era. Real client cases. Use AI — compare your skills.'
            )}
          </p>
        </div>
        <button className="c-hero__cta" type="button" data-register>
          Registration
        </button>
      </div>

      <ClassicHeroMedia />

      <div className="c-hero__chips">
        <span className="c-hero__chip">round 01</span>
        <span className="c-hero__chip">july 2026</span>
        <span className="c-hero__chip">300+ fighters</span>
        <span className="c-hero__chip">final · Barcelona</span>
      </div>
    </section>
  )
}
