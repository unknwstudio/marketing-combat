// Single source of truth for the demo registration modal: field spec, consent
// spec, user-facing copy, the open-event bus, and the demo persistence helper.
// Pure module — window/localStorage access is guarded and only happens at call
// time, so it is safe under the SSR / static-export pass. The open-event mirrors
// the openGameTakeover() pattern in src/lib/game.js.

// CustomEvent that opens the registration modal. The sole listener is RegisterModal.
export const REGISTER_OPEN = 'amk:register-open'

// Fire-and-forget open request (programmatic entry point). The delegated
// [data-register] click listener in RegisterModal also routes through this.
export function openRegister() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(REGISTER_OPEN))
}

// Field spec — the form is generated from this list, never hand-written per input.
// validate() returns '' when valid, otherwise the message to show.
export const FIELDS = [
  {
    id: 'name',
    type: 'text',
    label: 'Fighter name',
    autoComplete: 'name',
    required: true,
    validate: (v) => (v.trim().length >= 2 ? '' : 'Enter your name'),
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    autoComplete: 'email',
    required: true,
    validate: (v) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? '' : 'Enter a valid email'),
  },
  {
    id: 'password',
    type: 'password',
    label: 'Password',
    autoComplete: 'new-password',
    required: true,
    validate: (v) => (v.length >= 8 ? '' : 'At least 8 characters'),
  },
]

// Consent spec. `terms` gates submit; `marketing` is optional, unticked, and a
// SEPARATE checkbox (ePrivacy/GDPR unbundled consent). Links open in a new tab.
export const CONSENTS = [
  {
    id: 'terms',
    required: true,
    text: 'I accept the',
    links: [
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
    ],
  },
  {
    id: 'marketing',
    required: false,
    text: 'Send me tournament updates by email',
    links: [],
  },
]

// Theme-neutral copy. Casing (lowercase on AI, sentence-case on classic) is a
// CSS concern (text-transform), so the same strings serve both skins.
export const COPY = {
  title: 'Create account',
  sub: 'One account. One leaderboard. Enter the arena.',
  submit: 'Create account',
  close: 'Close',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  demoNotice: 'Demo mode — nothing leaves your browser.',
  successTitle: 'Player 1 — ready',
  successBody: 'Your account is set. Check your email to confirm (demo).',
  termsError: 'Please accept the Terms & Privacy Policy',
}

export const STORAGE_KEY = 'amk:registration-demo'

// Persist a demo record. Password is intentionally NOT included. `ts` is passed
// in by the caller so this module performs no Date.now() at import (SSR-safe).
export function saveRegistrationDemo({ name, email, marketing, ts }) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name, email, marketing: !!marketing, ts })
    )
  } catch {
    /* storage unavailable (private mode / quota) — the demo still shows success */
  }
}
