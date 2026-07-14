import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicMission.css'

/**
 * MISSION — the one centered, air-heavy statement on the page. Inverted to a
 * black band as a deliberate pause between the list-dense sections; two words
 * carry the blue accent. Supporting line sits quietly below.
 */
export default function ClassicMission() {
  return (
    <section className="c-sec acc-blue c-mission" id="c-mission" aria-label="Mission">
      <div className="c-wrap c-mission__wrap">
        <MaskHead
          className="c-mission__stmt"
          lines={[
            'Bring together the people',
            <>
              reshaping <span className="c-mission__hl">marketing</span>
            </>,
          ]}
        />
        <p className="c-lede c-reveal c-mission__sub">
          Change happens in many places at once. We create a point of contact — connecting the
          strongest practitioners with open-minded companies that have real marketing challenges. At
          the intersection of practice and discussion, knowledge is gained.
        </p>
      </div>
    </section>
  )
}
