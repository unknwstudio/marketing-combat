# Registration Modal (demo) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the dead "registration" CTAs a real destination — a simple demo-mode account sign-up rendered as a themed modal that adopts the look of whichever site version (`/` AI or `/classic`) it was opened from.

**Architecture:** One shared, config-driven `RegisterModal` client component, mounted once per site version with a `variant` prop (`ai` | `classic`). All field/consent/copy data lives in a pure `src/lib/register.js` module (no hardcoding at call sites). CTAs are wired by a single delegated `[data-register]` click listener (mirroring the existing `[data-burst]` pattern), so server-rendered CTAs need no `onClick`/client conversion. Theme comes entirely from existing global design tokens via a `reg--{variant}` root class. Demo submit writes a record (no password) to `localStorage` and swaps in a success screen — no network.

**Tech Stack:** Next.js 14 App Router, React 18, plain CSS with the project's `--k-*` design tokens.

## Global Constraints

- **No raw hex colors** anywhere outside `src/styles/index.css` — stylelint `color-no-hex` is an **error**. Use `--k-*` / `--k-classic-*` tokens or `color-mix()` / `rgb()`/`rgba()`.
- Raw `px` in `margin`/`padding`/`gap` is an **advisory warning** only (repo policy) — prefer `--k-1 … --k-15` (8px scale: `--k-1`=8px … `--k-15`=120px) but warnings do not fail the gate.
- **No hardcoding**: field labels, consent text, copy, storage key, and the open-event name all come from `src/lib/register.js`. The two CTA/site themes reuse existing tokens/classes; never introduce one-off colors or duplicated copy.
- **No real backend**: no network calls, no auth, **password is never persisted**.
- Fixed-overlay components mount **outside** `ScaleCanvas`/`JuiceProvider` (a `will-change: transform` wrapper would pin `position: fixed` to the page, not the viewport) — same placement as `CRTOverlay`.
- No unit-test runner exists. Per-task verification = `npm run build`, `npm run lint`, `npm run lint:css`, `npm run typecheck`. Behavioral verification uses Playwright (Task 6). "Write the failing test" steps are replaced by "run the gate and confirm the failure/clean" steps, per this codebase's conventions.
- Commit after each task.

---

### Task 1: Config module — single source of truth

**Files:**
- Create: `src/lib/register.js`

**Interfaces:**
- Produces:
  - `REGISTER_OPEN: string` — CustomEvent name.
  - `openRegister(): void` — dispatches `REGISTER_OPEN` (guarded for SSR).
  - `FIELDS: Array<{ id, type, label, autoComplete, required, validate(value:string):string }>` — `validate` returns `''` when valid, else an error message.
  - `CONSENTS: Array<{ id, required, text, links: Array<{label, href}> }>`.
  - `COPY: Record<string,string>`.
  - `STORAGE_KEY: string`.
  - `saveRegistrationDemo({ name, email, marketing, ts }): void` — writes to `localStorage`; password intentionally absent.

- [ ] **Step 1: Create the module**

Create `src/lib/register.js`:

```js
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
```

- [ ] **Step 2: Verify syntax + lint**

Run: `node --check src/lib/register.js && npx eslint src/lib/register.js`
Expected: no output / no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/register.js
git commit -m "feat(register): config module (fields, consents, copy, event bus, demo store)"
```

---

### Task 2: RegisterModal component (behavior + a11y)

**Files:**
- Create: `src/components/RegisterModal/RegisterModal.jsx`

**Interfaces:**
- Consumes: `REGISTER_OPEN`, `openRegister`, `FIELDS`, `CONSENTS`, `COPY`, `saveRegistrationDemo` from `@/lib/register`; `./RegisterModal.css` (created in Task 3 — import now, file added next task).
- Produces: `default export RegisterModal({ variant?: 'ai' | 'classic' })` — renders `null` until opened.

**Notes:** Unstyled/rough until Task 3 lands the CSS; that is expected. The `import './RegisterModal.css'` line will fail the build until Task 3, so this task's build gate is deferred — run only `eslint` here, and the full build gate at the end of Task 3.

- [ ] **Step 1: Create the component**

Create `src/components/RegisterModal/RegisterModal.jsx`:

```jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { REGISTER_OPEN, openRegister, FIELDS, CONSENTS, COPY, saveRegistrationDemo } from '@/lib/register'
import './RegisterModal.css'

const emptyValues = () => Object.fromEntries(FIELDS.map((f) => [f.id, '']))
const emptyConsents = () => Object.fromEntries(CONSENTS.map((c) => [c.id, false]))

/**
 * Demo registration modal. Mounted once per site version with a `variant`
 * ('ai' | 'classic') that skins it to the surrounding page. Opens on the
 * REGISTER_OPEN event OR a click on any [data-register] element (delegated,
 * mirroring the [data-burst] pattern) so server-rendered CTAs need no onClick.
 * Accessible dialog: focus trap, Esc, backdrop-close, scroll-lock, focus return.
 * Demo submit persists a record (no password) to localStorage and swaps in a
 * success screen — no network.
 */
export default function RegisterModal({ variant = 'ai' }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [values, setValues] = useState(emptyValues)
  const [consents, setConsents] = useState(emptyConsents)
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)

  const dialogRef = useRef(null)
  const firstFieldRef = useRef(null)
  const triggerRef = useRef(null) // element focused before opening, for focus return

  // Open sources: the REGISTER_OPEN event and delegated [data-register] clicks.
  useEffect(() => {
    const doOpen = () => {
      triggerRef.current = document.activeElement
      setDone(false)
      setValues(emptyValues())
      setConsents(emptyConsents())
      setErrors({})
      setShowPw(false)
      setOpen(true)
    }
    const onDocClick = (e) => {
      const trigger = e.target.closest && e.target.closest('[data-register]')
      if (!trigger) return
      e.preventDefault()
      openRegister() // funnel every entry point through the event → doOpen
    }
    window.addEventListener(REGISTER_OPEN, doOpen)
    document.addEventListener('click', onDocClick)
    return () => {
      window.removeEventListener(REGISTER_OPEN, doOpen)
      document.removeEventListener('click', onDocClick)
    }
  }, [])

  const close = () => {
    setOpen(false)
    const t = triggerRef.current
    if (t && typeof t.focus === 'function') t.focus()
  }

  // While open: body scroll-lock, Esc-to-close, Tab focus-trap, initial focus.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const toFocus = firstFieldRef.current || dialogRef.current
    if (toFocus) toFocus.focus()

    const trapTab = (e) => {
      const root = dialogRef.current
      if (!root) return
      const f = root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      } else if (e.key === 'Tab') {
        trapTab(e)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const setValue = (id, v) => setValues((s) => ({ ...s, [id]: v }))
  const setConsent = (id, v) => setConsents((s) => ({ ...s, [id]: v }))
  const fieldError = (f, v) => (f.required || v ? f.validate(v) : '')

  const onSubmit = (e) => {
    e.preventDefault()
    const next = {}
    for (const f of FIELDS) {
      const msg = fieldError(f, values[f.id])
      if (msg) next[f.id] = msg
    }
    if (!consents.terms) next.terms = COPY.termsError
    setErrors(next)
    if (Object.keys(next).length) {
      const firstBad = FIELDS.find((f) => next[f.id])
      const el = firstBad && dialogRef.current && dialogRef.current.querySelector(`#reg-${firstBad.id}`)
      if (el) el.focus()
      return
    }
    saveRegistrationDemo({
      name: values.name,
      email: values.email,
      marketing: consents.marketing,
      ts: Date.now(),
    })
    setDone(true)
  }

  if (!open) return null

  const titleId = 'reg-title'

  return (
    <div className={`reg reg--${variant}`} role="presentation">
      <div className="reg__backdrop" onClick={close} aria-hidden="true" />
      <div
        className="reg__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button type="button" className="reg__close" onClick={close} aria-label={COPY.close}>
          ×
        </button>

        {done ? (
          <div className="reg__success">
            <h2 className="reg__title" id={titleId}>
              {COPY.successTitle}
            </h2>
            <p className="reg__sub">{COPY.successBody}</p>
            <p className="reg__demo">{COPY.demoNotice}</p>
          </div>
        ) : (
          <form className="reg__form" onSubmit={onSubmit} noValidate>
            <h2 className="reg__title" id={titleId}>
              {COPY.title}
            </h2>
            <p className="reg__sub">{COPY.sub}</p>

            {FIELDS.map((f, i) => {
              const errId = `reg-${f.id}-err`
              const isPw = f.type === 'password'
              const inputType = isPw && showPw ? 'text' : f.type
              return (
                <div className="reg__field" key={f.id}>
                  <label className="reg__label" htmlFor={`reg-${f.id}`}>
                    {f.label}
                  </label>
                  <div className="reg__input-wrap">
                    <input
                      id={`reg-${f.id}`}
                      className="reg__input"
                      type={inputType}
                      autoComplete={f.autoComplete}
                      required={f.required}
                      value={values[f.id]}
                      ref={i === 0 ? firstFieldRef : undefined}
                      aria-invalid={errors[f.id] ? 'true' : undefined}
                      aria-describedby={errors[f.id] ? errId : undefined}
                      onChange={(e) => setValue(f.id, e.target.value)}
                      onBlur={() => setErrors((s) => ({ ...s, [f.id]: fieldError(f, values[f.id]) }))}
                    />
                    {isPw && (
                      <button
                        type="button"
                        className="reg__pw-toggle"
                        aria-pressed={showPw}
                        aria-label={showPw ? COPY.hidePassword : COPY.showPassword}
                        onClick={() => setShowPw((s) => !s)}
                      >
                        {showPw ? 'hide' : 'show'}
                      </button>
                    )}
                  </div>
                  {errors[f.id] && (
                    <p className="reg__error" id={errId}>
                      {errors[f.id]}
                    </p>
                  )}
                </div>
              )
            })}

            {CONSENTS.map((c) => {
              const errId = `reg-${c.id}-err`
              return (
                <div className="reg__consent" key={c.id}>
                  <label className="reg__check">
                    <input
                      type="checkbox"
                      checked={consents[c.id]}
                      aria-describedby={errors[c.id] ? errId : undefined}
                      onChange={(e) => setConsent(c.id, e.target.checked)}
                    />
                    <span>
                      {c.text}
                      {c.links.map((l, li) => (
                        <span key={l.href}>
                          {' '}
                          <a href={l.href} target="_blank" rel="noopener noreferrer">
                            {l.label}
                          </a>
                          {li < c.links.length - 1 ? ' &' : ''}
                        </span>
                      ))}
                    </span>
                  </label>
                  {errors[c.id] && (
                    <p className="reg__error" id={errId}>
                      {errors[c.id]}
                    </p>
                  )}
                </div>
              )
            })}

            <button type="submit" className="reg__submit">
              {COPY.submit}
            </button>
            <p className="reg__demo">{COPY.demoNotice}</p>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Lint the component (build gate deferred to Task 3)**

Run: `npx eslint src/components/RegisterModal/RegisterModal.jsx`
Expected: no errors (the missing `RegisterModal.css` does not affect eslint; it is created next task).

- [ ] **Step 3: Commit**

```bash
git add src/components/RegisterModal/RegisterModal.jsx
git commit -m "feat(register): accessible, config-driven RegisterModal component"
```

---

### Task 3: Two-skin CSS

**Files:**
- Create: `src/components/RegisterModal/RegisterModal.css`

**Interfaces:**
- Consumes: global tokens from `src/styles/index.css` (`--k-*`, `--k-classic-*`, `--k-font-mono`, `--k-focus-ring`). The `.reg--classic` skin also reads `--c-font` (defined in `classic.css`, always present on `/classic` where the classic variant renders) with a system fallback.
- Produces: `.reg`, `.reg--ai`, `.reg--classic` and child classes consumed by Task 2's markup.

- [ ] **Step 1: Create the stylesheet**

Create `src/components/RegisterModal/RegisterModal.css`:

```css
/* Registration modal — shared structure + two skins (AI / classic). Themed by
   the root variant class; every color is a design token or color-mix (stylelint
   color-no-hex is an error). Some raw px remain for fine control (advisory). */

.reg {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--k-2);
}

.reg__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--k-shadow) 78%, transparent);
}

.reg__dialog {
  position: relative;
  width: min(440px, 100%);
  max-height: calc(100dvh - var(--k-4, 32px));
  overflow-y: auto;
  padding: var(--k-3);
  animation: reg-in 0.16s ease-out;
}

.reg__close {
  position: absolute;
  top: var(--k-1);
  right: var(--k-1);
  width: 32px;
  height: 32px;
  background: transparent;
  border: 0;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.reg__title {
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.1;
}

.reg__sub {
  margin: 0 0 var(--k-2);
  font-size: 13px;
  opacity: 0.8;
}

.reg__field {
  margin-bottom: 14px;
}

.reg__label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.reg__input-wrap {
  position: relative;
  display: flex;
}

.reg__input {
  flex: 1;
  width: 100%;
  padding: 10px 12px;
  font: inherit;
  font-size: 15px;
}

.reg__pw-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  font-size: 12px;
  text-transform: uppercase;
  cursor: pointer;
}

.reg__error {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--k-red);
}

.reg__consent {
  margin-bottom: 10px;
}

.reg__check {
  display: flex;
  gap: var(--k-1);
  align-items: flex-start;
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
}

.reg__check input {
  flex: 0 0 auto;
  margin-top: 2px;
}

.reg__check a {
  text-decoration: underline;
}

.reg__submit {
  width: 100%;
  margin-top: var(--k-2);
  padding: 12px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
}

.reg__demo {
  margin: 12px 0 0;
  font-size: 11px;
  text-align: center;
  opacity: 0.6;
}

.reg__success {
  padding: var(--k-2) 0;
  text-align: center;
}

.reg :focus-visible {
  outline: 3px solid var(--k-focus-ring);
  outline-offset: 2px;
}

@keyframes reg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reg__dialog {
    animation: none;
  }
}

/* ---------------- AI / demo skin ---------------- */
.reg--ai {
  font-family: var(--k-font-mono);
  color: var(--k-ink);
}

.reg--ai .reg__dialog {
  background: var(--k-panel);
  border: 2px solid var(--k-cyan);
}

.reg--ai .reg__title {
  color: var(--k-cyan);
  text-transform: lowercase;
}

.reg--ai .reg__close {
  color: var(--k-ink);
}

.reg--ai .reg__label,
.reg--ai .reg__pw-toggle {
  color: var(--k-accent-green);
}

.reg--ai .reg__input {
  background: var(--k-bg-deep);
  border: 1px solid var(--k-line);
  color: var(--k-ink);
}

.reg--ai .reg__input:focus {
  border-color: var(--k-cyan);
  outline: none;
}

.reg--ai .reg__submit {
  background: var(--k-black);
  border: 1px solid var(--k-white);
  color: var(--k-white);
  text-transform: lowercase;
  transition: background 0.12s, color 0.12s;
}

.reg--ai .reg__submit:hover {
  background: var(--k-white);
  color: var(--k-black);
}

.reg--ai .reg__check a {
  color: var(--k-cyan);
}

/* ---------------- Classic skin ---------------- */
.reg--classic {
  font-family: var(--c-font, 'Helvetica Neue', Helvetica, Arial, sans-serif);
  color: var(--k-classic-ink);
}

.reg--classic .reg__dialog {
  background: var(--k-white);
  border: 3px solid var(--k-black);
}

.reg--classic .reg__title {
  color: var(--k-classic-ink);
  font-weight: 800;
}

.reg--classic .reg__close {
  color: var(--k-black);
}

.reg--classic .reg__label {
  color: var(--k-classic-ink);
  font-weight: 700;
}

.reg--classic .reg__pw-toggle {
  color: var(--k-classic-blue);
}

.reg--classic .reg__input {
  background: var(--k-white);
  border: 2px solid var(--k-classic-ink);
  color: var(--k-classic-ink);
}

.reg--classic .reg__input:focus {
  border-color: var(--k-classic-blue);
  outline: none;
}

.reg--classic .reg__submit {
  border: 0;
  border-radius: 999px;
  background: var(--k-black);
  color: var(--k-white);
  font-weight: 700;
  transition: opacity 0.12s;
}

.reg--classic .reg__submit:hover {
  opacity: 0.85;
}

.reg--classic .reg__check a {
  color: var(--k-classic-blue);
}
```

- [ ] **Step 2: CSS lint gate**

Run: `npx stylelint src/components/RegisterModal/RegisterModal.css`
Expected: **0 errors** (advisory px warnings on `margin`/`padding` are acceptable per repo policy).

- [ ] **Step 3: Build + typecheck gate (component now compiles)**

Run: `npm run typecheck && npm run build`
Expected: build succeeds (the `RegisterModal.css` import now resolves). The modal is not yet mounted anywhere, so no visual change yet.

- [ ] **Step 4: Commit**

```bash
git add src/components/RegisterModal/RegisterModal.css
git commit -m "feat(register): two-skin (ai/classic) modal CSS from design tokens"
```

---

### Task 4: Mount on both site versions + wire all CTAs

**Files:**
- Modify: `src/app/page.jsx` (home, AI version) — add `<RegisterModal variant="ai" />` with the fixed overlays.
- Modify: `src/app/classic/ClassicApp.jsx` — add `<RegisterModal variant="classic" />` near the other route-level overlays.
- Modify: `src/sections/FinalCta/FinalCta.jsx:` — add `data-register` to the `.finalcta__cta` button.
- Modify: `src/sections/ClassicFinalCta/ClassicFinalCta.jsx:` — add `data-register` to the `.c-cta__pill` button.
- Modify: `src/sections/Hero/Hero.jsx:40` — add `data-register` to the `.hero__badge` link (keeps `href="/#register"` as the no-JS fallback; the delegated listener `preventDefault`s and opens the modal).
- Modify: `src/sections/Champion/Champion.jsx:56` — add `data-register` to the `.champion__cta` button.

**Interfaces:**
- Consumes: `RegisterModal` default export (Task 2/3); the delegated `[data-register]` contract implemented inside `RegisterModal` (Task 2).

- [ ] **Step 1: Mount on the AI home page**

In `src/app/page.jsx`, add the import near the other component imports:

```jsx
import RegisterModal from '@/components/RegisterModal/RegisterModal'
```

Then, in the fixed-overlays block (the one containing `<CRTOverlay ... />`, `<ScrollHealth />`, etc. — **outside** `JuiceProvider`/`ScaleCanvas`), add:

```jsx
      <RegisterModal variant="ai" />
```

Place it right after `<CRTOverlay intensity={0.09} flicker powerOn />`.

- [ ] **Step 2: Mount on the classic page**

In `src/app/classic/ClassicApp.jsx`, add the import with the other imports:

```jsx
import RegisterModal from '@/components/RegisterModal/RegisterModal'
```

Then add the mount right after `<ScaleCanvas>…</ScaleCanvas>` closes, next to `<ClassicReveal />` (outside the ScaleCanvas transform wrapper):

```jsx
      <RegisterModal variant="classic" />
```

- [ ] **Step 3: Tag the four CTAs with `data-register`**

`src/sections/FinalCta/FinalCta.jsx` — the button currently reads:

```jsx
      <button
        type="button"
        className="d-btn finalcta__cta"
        data-magnetic
        data-sfx="confirm"
        data-burst
      >
```

Add `data-register` (keep everything else):

```jsx
      <button
        type="button"
        className="d-btn finalcta__cta"
        data-magnetic
        data-sfx="confirm"
        data-burst
        data-register
      >
```

`src/sections/ClassicFinalCta/ClassicFinalCta.jsx` — add `data-register` to the pill (keep `ref`, `onMouseMove`, `onMouseLeave`):

```jsx
        <button
          className="c-cta__pill"
          type="button"
          ref={pillRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          data-register
        >
          Registration →
        </button>
```

`src/sections/Hero/Hero.jsx:40` — add `data-register` to the badge link (keep `href`):

```jsx
        <a href="/#register" className="hero__badge" data-sfx="confirm" data-burst data-register>
          {'>>> registration <<<'}
        </a>
```

`src/sections/Champion/Champion.jsx:56` — add `data-register` to the CTA button:

```jsx
      <button type="button" className="champion__cta" data-magnetic data-sfx="confirm" data-register>
        &gt;&gt;&gt; registration &lt;&lt;&lt;
      </button>
```

- [ ] **Step 4: Full gate**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all clean; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.jsx src/app/classic/ClassicApp.jsx src/sections/FinalCta/FinalCta.jsx src/sections/ClassicFinalCta/ClassicFinalCta.jsx src/sections/Hero/Hero.jsx src/sections/Champion/Champion.jsx
git commit -m "feat(register): mount modal on / and /classic, wire all registration CTAs"
```

---

### Task 5: Legal stub pages

**Files:**
- Create: `src/app/legal/privacy/page.jsx`
- Create: `src/app/legal/terms/page.jsx`

**Interfaces:**
- Consumes: nothing app-specific. These are the hrefs referenced by `CONSENTS` in `src/lib/register.js` (`/legal/terms`, `/legal/privacy`).

**Notes:** Minimal readable placeholder legal text so the consent links are not dead. Server components (no `'use client'`). Plain, theme-neutral, centered text — they open in a new tab from the modal.

- [ ] **Step 1: Create the privacy stub**

Create `src/app/legal/privacy/page.jsx`:

```jsx
export const metadata = {
  title: 'Privacy Policy — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Placeholder privacy notice for the demo registration flow. Replace with the
// real policy before collecting any real personal data.
export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
      <h1>Privacy Policy</h1>
      <p>
        <strong>Demo placeholder.</strong> This page stands in for the full privacy notice while
        AI Marketing Kombat is in demo mode. No real personal data is collected or transmitted —
        the registration form stores what you type only in your own browser.
      </p>
      <h2>What we would collect</h2>
      <p>Your name, email address, and marketing preference — the minimum needed to create an account.</p>
      <h2>Your rights</h2>
      <p>
        Under the GDPR you have the right to access, correct, export, and delete your data, and to
        withdraw marketing consent at any time. In this demo, clearing your browser storage removes
        everything.
      </p>
      <p>
        <a href="/">← Back to AI Marketing Kombat</a>
      </p>
    </main>
  )
}
```

- [ ] **Step 2: Create the terms stub**

Create `src/app/legal/terms/page.jsx`:

```jsx
export const metadata = {
  title: 'Terms — AI Marketing Kombat',
  robots: { index: false, follow: false },
}

// Placeholder terms for the demo registration flow. Replace with the real terms
// before launch.
export default function TermsPage() {
  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
      <h1>Terms &amp; Conditions</h1>
      <p>
        <strong>Demo placeholder.</strong> This page stands in for the full terms while AI Marketing
        Kombat is in demo mode. Registration currently creates no real account and sends no data to
        any server.
      </p>
      <h2>Eligibility</h2>
      <p>The tournament is intended for marketing professionals. Full eligibility rules will be published before launch.</p>
      <h2>Demo status</h2>
      <p>Nothing on this site constitutes a binding offer while it is in demo mode.</p>
      <p>
        <a href="/">← Back to AI Marketing Kombat</a>
      </p>
    </main>
  )
}
```

- [ ] **Step 3: Gate**

Run: `npm run lint && npm run build`
Expected: clean; two new routes `/legal/privacy` and `/legal/terms` build.

- [ ] **Step 4: Commit**

```bash
git add src/app/legal/privacy/page.jsx src/app/legal/terms/page.jsx
git commit -m "feat(register): add demo Privacy Policy and Terms stub pages"
```

---

### Task 6: End-to-end verification (both skins)

**Files:** none (verification only).

**Interfaces:** exercises everything built in Tasks 1–5.

- [ ] **Step 1: Start the dev server**

Run (background): `npm run dev`
Wait for `Local: http://localhost:3000`.

- [ ] **Step 2: Verify the AI skin from `/`**

Using Playwright MCP:
1. `browser_navigate` to `http://localhost:3000/`.
2. Click the FinalCta `>>> registration <<<` button (scroll to it first). Confirm the modal opens with the **AI skin** (dark panel, cyan title, mono font).
3. Click **Create account** with empty fields → confirm inline errors appear and focus lands on the name field; the Terms error shows.
4. Fill name, a valid email, an 8+ char password; check **Terms**; leave marketing unchecked. Submit.
5. Confirm the success screen ("Player 1 — ready") replaces the form.
6. In the console, run `localStorage.getItem('amk:registration-demo')` and confirm it contains `name`, `email`, `marketing:false`, `ts` — and **no password**.
7. Reopen the modal, press `Escape` → confirm it closes and focus returns to the trigger.

- [ ] **Step 3: Verify the classic skin from `/classic`**

1. `browser_navigate` to `http://localhost:3000/classic`.
2. Click the `Registration →` pill. Confirm the modal opens with the **classic skin** (white panel, black pill submit, Helvetica) — visually distinct from the AI skin, proving it adopts the page's CSS.
3. Repeat the validation → success → localStorage checks from Step 2.

- [ ] **Step 4: Verify remaining CTAs + legal links**

1. On `/`, confirm the Hero badge and the Champion CTA also open the modal.
2. In the open modal, click **Terms** and **Privacy Policy** → confirm each opens its stub page in a new tab and the modal state is preserved in the original tab.

- [ ] **Step 5: Final full gate**

Run: `npm run lint && npm run lint:css && npm run typecheck && npm run build`
Expected: all clean (0 stylelint errors; advisory px warnings acceptable).

- [ ] **Step 6: Stop the dev server.**

---

## Self-Review

**Spec coverage:**
- Two themed skins mounted per version → Tasks 3, 4. ✅
- Modal (dialog, a11y, focus trap, Esc, backdrop, scroll-lock, focus return) → Task 2. ✅
- Config-driven, no hardcoding (fields/consents/copy/event/storage) → Task 1. ✅
- Minimal GDPR fields + unbundled marketing consent + T&C gate → Tasks 1, 2. ✅
- Demo submit to localStorage, no password, no network → Tasks 1, 2. ✅
- CTA wiring for all four CTAs (FinalCta, ClassicFinalCta, Hero, Champion) → Task 4. ✅
- Legal stubs, links open in new tab → Tasks 1 (hrefs/target), 5 (pages). ✅
- Tokens-only / no hex, fixed overlays outside ScaleCanvas → Global Constraints + Tasks 3, 4. ✅
- Verification both skins → Task 6. ✅

**Placeholder scan:** No TBD/TODO in code steps; all code is complete. The legal pages are intentionally labelled "Demo placeholder" content (that is the deliverable), not a plan placeholder.

**Type/name consistency:** `openRegister`, `REGISTER_OPEN`, `FIELDS`, `CONSENTS`, `COPY`, `STORAGE_KEY`, `saveRegistrationDemo`, `data-register`, `reg--{variant}`, and all `.reg__*` classes are used identically across the config module (T1), component (T2), CSS (T3), and wiring (T4). Consent link hrefs `/legal/terms` + `/legal/privacy` match the routes created in T5.
