import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicOrganizers.css'

/**
 * ORGANIZERS — the team as stacked editorial rows (photo left, name/role/bio
 * right, hairline dividers) — handles the odd count of 5 gracefully and gives
 * the bios room. No photos exist yet, so each portrait is a monogram tile.
 */

const ORGANIZERS = [
  { name: 'Vladislav Fedoseev', role: 'Managing Partner, Allformance', bio: 'Founder of AI-Formance; performance marketing and AdTech operator.' },
  { name: 'Roman Kumar Vyas', role: 'Serial IT entrepreneur', bio: 'Marketing expert; founder / co-founder of Refocus, Qlean and Qmarketing.' },
  { name: 'Alexander Solovyov', role: 'IT entrepreneur & growth operator', bio: 'Ex Co-founder of Qmarketing Academy & Refocus; performance, EdTech and AI-in-sales expert.' },
  { name: 'Maria Kulikovskaia', role: 'AI HealthTech Product & Digital Transformation Strategist', bio: '10+ years in tech, MedTech and AI-enabled products.' },
  { name: 'Anna Sholina', role: 'VC partner & serial entrepreneur', bio: 'SOULS agency founder; exited founder of EMERGE Global Tech Conference.' },
]

const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export default function ClassicOrganizers() {
  return (
    <section className="c-sec acc-blue" id="c-organizers" aria-label="Organizers">
      <div className="c-wrap">
        <header className="c-org__head">
          <MaskHead lines={['Organizers']} />
          <p className="c-lede c-reveal c-org__intro">
            Operators across practice and many countries, building the point of contact.
          </p>
        </header>

        <ul className="c-org__list">
          {ORGANIZERS.map((o, i) => (
            <li className="c-org__row c-reveal" key={o.name} style={{ '--i': i }}>
              <span className="c-org__photo cap-trim" aria-hidden="true">
                {initials(o.name)}
              </span>
              <div className="c-org__meta">
                <h3 className="c-org__name cap-trim">{o.name}</h3>
                <p className="c-org__role cap-trim">{o.role}</p>
              </div>
              <p className="c-org__bio">{o.bio}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
