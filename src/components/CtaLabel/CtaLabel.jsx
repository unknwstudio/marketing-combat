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
      <span aria-hidden="true">{'>>> '}</span>
      {children}
      <span aria-hidden="true">{' <<<'}</span>
    </>
  )
}
