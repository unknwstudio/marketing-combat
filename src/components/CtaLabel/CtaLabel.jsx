/**
 * CtaLabel — the ">>> label <<<" terminal-CTA motif with the chevrons marked
 * decorative (aria-hidden), so the button/link's accessible name is just the
 * label ("registration"), not "greater greater greater registration less…".
 * Keeps WCAG 2.5.3 (Label in Name) happy: the visible label IS the accessible
 * name, since the chevrons are no longer part of the label. Visual output is
 * byte-identical to the old inline ">>> registration <<<" text.
 */
export default function CtaLabel({ children }) {
  return (
    <>
      {/* NBSP, not a plain space: the chevron spans are FLEX ITEMS inside the
          inline-flex buttons, and a trailing/leading plain space at a flex-item
          edge is collapsed — the buttons rendered ">>>registration<<<" while
          the Figma comp (33:3912) spaces the chevrons (owner 2026-07-17) */}
      <span aria-hidden="true">{'>>>\u00A0'}</span>
      {children}
      <span aria-hidden="true">{'\u00A0<<<'}</span>
    </>
  )
}
