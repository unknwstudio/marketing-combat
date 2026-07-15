import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicMission.css'

/**
 * MISSION — the one inverted, full-bleed black band on the page: an oversized
 * left-aligned statement with a single accent word, and a quiet supporting line.
 * It is the page's gravitas beat / rhythm break — deliberately loud and dark, no
 * kicker or decorative rule (those read as generic filler).
 */
export default function ClassicMission() {
  return (
    <section className="c-sec acc-blue c-mission" id="c-mission" aria-label="Mission">
      <div className="c-wrap c-mission__wrap">
        <MaskHead
          className="c-mission__stmt"
          lines={[
            'Bring together',
            'the people reshaping',
            <span className="c-mission__hl" key="hl">marketing</span>,
          ]}
        />
        <p className="c-lede c-reveal c-mission__sub">
          {typeset(
            'Change happens in many places at once. We create a point of contact — connecting the strongest practitioners with open-minded companies that have real marketing challenges. At the intersection of practice and discussion, knowledge is gained.'
          )}
        </p>
      </div>
    </section>
  )
}
