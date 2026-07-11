import './Organizers.css'

/**
 * THE CREW — THE ORGANIZERS. Five real crew members.
 * Names and bios verbatim from the original site; portraits are generated
 * pixel-art fighter busts (one per organizer).
 */
const CREW = [
  {
    n: '01',
    img: 'crew-01.webp',
    name: 'VLADISLAV FEDOSEEV',
    bio: 'Managing Partner at Allformance, Founder of AI-Formance; performance marketing and AdTech operator.',
  },
  {
    n: '02',
    img: 'crew-02.webp',
    name: 'ROMAN KUMAR VYAS',
    bio: 'Serial IT entrepreneur, marketing expert, founder / co-founder of Refocus, Qlean and Qmarketing.',
  },
  {
    n: '03',
    img: 'crew-03.webp',
    name: 'ALEXANDER SOLOVYOV',
    bio: 'IT entrepreneur and growth operator; ex Co-founder of Qmarketing Academy, Co-founder of Refocus; performance, EdTech and AI-in-sales expert.',
  },
  {
    n: '04',
    img: 'crew-04.webp',
    name: 'MARIA KULIKOVSKAIA',
    bio: 'AI HealthTech Product & Digital Transformation Strategist; 10+ years in tech, MedTech and AI-enabled products.',
  },
  {
    n: '05',
    img: 'crew-05.webp',
    name: 'ANNA SHOLINA',
    bio: 'VC partner & serial entrepreneur; SOULS agency founder; exited founder of EMERGE Global Tech Conference.',
  },
]

export default function Organizers() {
  return (
    <section className="dsec dsec--alt organizers" aria-label="The organizers">
      <div className="dsec__head">
        <span className="dsec__round">The crew — game masters</span>
        <h2 className="dsec__title">the organizers</h2>
        <p className="dsec__sub">The operators who built the arena.</p>
      </div>

      <ul className="organizers__grid">
        {CREW.map((c) => (
          <li key={c.n} className="dcard organizers__card" data-select-sfx="hit">
            <div className="organizers__frame">
              <img
                className="organizers__portrait pixelated"
                src={`/assets/demo/organizers/${c.img}`}
                alt={`${c.name} portrait`}
              />
              <span className="organizers__sweep" aria-hidden="true" />
            </div>
            <span className="organizers__tag">CREW · {c.n}</span>
            <h3 className="organizers__name">{c.name}</h3>
            <p className="organizers__bio">{c.bio}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
