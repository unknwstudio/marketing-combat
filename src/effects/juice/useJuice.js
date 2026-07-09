import { createContext, useContext } from 'react'

// Shared context for the imperative "game feel" actions. It lives in this leaf
// file (not in JuiceProvider) so both the provider and the hook can import it
// without a circular dependency.
export const JuiceContext = createContext(null)

const NOOP = () => {}

// Returned before the provider has mounted (or outside it) so any effect can
// call shake/hitstop/impact without a crash or a null check.
const FALLBACK = { shake: NOOP, hitstop: NOOP, impact: NOOP }

/**
 * Access the juice actions.
 * @returns {{ shake: (strength?: number) => void,
 *             hitstop: (ms?: number) => Promise<void>,
 *             impact: (strength?: number) => void }}
 */
export function useJuice() {
  return useContext(JuiceContext) ?? FALLBACK
}
