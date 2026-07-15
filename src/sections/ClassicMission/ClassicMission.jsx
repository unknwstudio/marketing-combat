import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicMission.css'

/**
 * MISSION — a left-aligned editorial manifesto (kicker → oversized statement
 * with one accent word → hairline → narrow supporting paragraph), sharing the
 * same hard left edge as every other section (was centered, which read as
 * generic and off-system, #14).
 */
export default function ClassicMission() {
  return (
    <section className="c-sec acc-blue c-mission" id="c-mission" aria-label="Mission">
      <div className="c-wrap c-mission__wrap">
        <p className="c-mission__kicker cap-trim">The manifesto</p>
        <MaskHead
          className="c-mission__stmt"
          lines={[
            'Bring together the people',
            <>
              reshaping <span className="c-mission__hl">marketing</span>
            </>,
          ]}
        />
        <hr className="c-mission__rule c-reveal" />
        <p className="c-lede c-reveal c-mission__sub">
          {typeset(
            'Change happens in many places at once. We create a point of contact — connecting the strongest practitioners with open-minded companies that have real marketing challenges. At the intersection of practice and discussion, knowledge is gained.'
          )}
        </p>
      </div>
    </section>
  )
}
