import './FinalCta.css'

/**
 * JOIN THE BATTLE — closing call to action.
 * Copy verbatim from the original site.
 */
export default function FinalCta() {
  return (
    <section className="dsec dsec--alt finalcta" aria-label="Join the battle">
      <span className="finalcta__finish" data-announce="FINISH HIM" data-sound="ko">
        ★ FINISH HIM ★
      </span>
      <h2 className="finalcta__title">join the battle</h2>
      <p className="finalcta__body">
        Compare your skills, put yourself on the map, and find out who is the best marketer on
        the planet. One battle. One leaderboard.
      </p>
      <button type="button" className="dcta finalcta__cta">
        ▶ REGISTRATION
      </button>
      <span className="finalcta__press">▮ PRESS ANY KEY TO CONTINUE ▮</span>
    </section>
  )
}
