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
