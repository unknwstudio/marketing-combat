/**
 * Registration window + participants counter — the hand-tunable knobs.
 *
 * The counter is FAKE for now (no registration backend yet): a deterministic
 * curve that climbs from REG_COUNT_AT_START (at REG_CURVE_START) to REG_TARGET
 * (at REG_DEADLINE), so every visitor sees the same number and it grows a
 * little every day. To nudge the shown number by hand, edit REG_BOOST — it is
 * added to the computed value as-is (can be negative). When real registration
 * data exists, make regCount() return the API value and keep REG_BOOST as the
 * fudge knob.
 */
export const REG_DEADLINE = '2026-09-20T23:59:59+02:00' // open registration closes (Barcelona time)
export const REG_TARGET = 300 // registrations expected in total
export const REG_CURVE_START = '2026-07-01T00:00:00+02:00' // where the fake curve starts
export const REG_COUNT_AT_START = 52 // fighters already "in" at curve start
export const REG_BOOST = 0 // hand tweak: added on top of the computed number

export function regCount(now = Date.now()) {
  const t0 = Date.parse(REG_CURVE_START)
  const t1 = Date.parse(REG_DEADLINE)
  const p = Math.min(1, Math.max(0, (now - t0) / (t1 - t0)))
  const n = Math.round(REG_COUNT_AT_START + p * (REG_TARGET - REG_COUNT_AT_START)) + REG_BOOST
  return Math.max(0, Math.min(REG_TARGET, n))
}
