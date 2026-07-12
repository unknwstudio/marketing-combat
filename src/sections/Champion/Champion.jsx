import './Champion.css';

// Ported pixel-faithfully from Figma "Frame 33" (node 35:4163), 1440x924.
// Graphics are exported PNGs; ticker, stats and CTA are live text/CSS.

const STATS = [
  { value: '$30K+', caption: 'in AI tool subscriptions' },
  { value: 'Intros', caption: 'to A16Z & YC growth partners' },
  { value: 'Offers', caption: 'from sponsoring companies' },
  { value: 'The title', caption: '#1 AI marketer of 2026' },
];

// Marquee row: the track scrolls -50% and loops, so the copies must fill at
// least twice the visible bar for a seamless loop.
const TICKER = Array.from({ length: 20 });

export default function Champion() {
  return (
    <section id="prizes" className="champion" aria-label="Champion prizes">
      <img
        className="champion__panel pixelated"
        src={`/assets/champion/panel.webp`}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <img
        className="champion__banner pixelated"
        src={`/assets/champion/banner.webp`}
        alt="Use AI or get finished"
        loading="lazy"
        decoding="async"
      />

      <div className="champion__topbox">
        <div className="champion__ticker" aria-hidden="true">
          <div className="champion__track">
            {TICKER.map((_, i) => (
              <span key={i} className="champion__tickerItem">
                CHAMPION GETS <span className="champion__dot">&bull;</span>
              </span>
            ))}
          </div>
        </div>

        <div className="champion__stats">
          {STATS.map((s) => (
            <div key={s.value} className="champion__cell">
              <span className="champion__value">{s.value}</span>
              <span className="champion__caption">{s.caption}</span>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="champion__cta" data-magnetic data-sfx="confirm">
        &gt;&gt;&gt; registration &lt;&lt;&lt;
      </button>
    </section>
  );
}
