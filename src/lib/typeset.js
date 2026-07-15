/**
 * typeset — English micro-typography: glue short function words to the word
 * that follows them with a non-breaking space (U+00A0) so they can never be left
 * hanging at the end of a line. Fixes the "lone preposition / 2-letter word at
 * line end" defect (e.g. "AI", "of", "to", "in") without any layout code.
 *
 * Glued:
 *   - every 1–2 letter word (catches AI, of, to, in, on, at, by, is, it, or, an,
 *     up, we, and number↔unit pairs like "45 minutes")
 *   - the common multi-letter articles / conjunctions / prepositions below
 *   - the space BEFORE an em/en dash, so the dash can't start a line
 *
 * Idempotent (existing U+00A0 is preserved; the split is on plain spaces only)
 * and safe on plain strings — the ONE place this rule lives, reused everywhere.
 */
const GLUE = new Set([
  'the', 'and', 'for', 'but', 'nor', 'yet', 'per', 'via', 'off', 'out',
  'with', 'from', 'into', 'onto', 'upon', 'over', 'under', 'than', 'that',
])

const NBSP = '\u00A0'

export function typeset(input) {
  if (typeof input !== 'string' || input.indexOf(' ') === -1) return input
  const parts = input.split(' ')
  let out = ''
  for (let i = 0; i < parts.length; i++) {
    out += parts[i]
    if (i === parts.length - 1) break
    const bare = parts[i].replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
    const glueThis = bare.length > 0 && (bare.length <= 2 || GLUE.has(bare))
    const nextIsDash = parts[i + 1] === '—' || parts[i + 1] === '–'
    out += glueThis || nextIsDash ? NBSP : ' '
  }
  return out
}
