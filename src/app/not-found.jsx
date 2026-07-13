import './not-found.css'

export const metadata = {
  title: 'Game Over',
  // Next.js already emits <meta name="robots" content="noindex"> for not-found
  // routes automatically — declaring robots here too produced a SECOND,
  // conflicting robots tag (2026-07-13 audit). Let Next's automatic one stand.
}

/**
 * Next.js renders this in place of its generic default 404 whenever a route
 * doesn't match (App Router `not-found.js` convention). Themed as an in-world
 * "GAME OVER -> CONTINUE?" screen so a lost visitor stays inside the arcade
 * brand instead of hitting a plain white Next.js page.
 */
export default function NotFound() {
  return (
    <main className="notfound">
      <div className="notfound__center">
        <span className="notfound__kicker">ERROR 404</span>
        <h1 className="notfound__title">GAME OVER</h1>
        <p className="notfound__sub">This stage doesn&rsquo;t exist. Continue?</p>
        <a className="notfound__link" href="/">
          &larr; RETURN TO ARENA
        </a>
      </div>
    </main>
  )
}
