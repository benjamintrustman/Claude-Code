import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { CheckIcon, PlusIcon } from './icons'

export function Header() {
  const { profileId, profiles, setProfileId, createProfile } = useApp()
  const [open, setOpen] = useState(false)
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const wrap = useRef<HTMLDivElement>(null)
  const active = profiles.find((p) => p.id === profileId)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false)
        setNaming(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    createProfile(trimmed)
    setName('')
    setNaming(false)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper px-4 py-3">
      <h1 className="font-serif text-xl font-semibold tracking-tight text-ink">Fit Check</h1>

      <div ref={wrap} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-ink hover:border-tobacco/50"
        >
          {active?.name ?? 'Profile'}
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-xl border border-line bg-paper shadow-lg">
            <ul className="flex flex-col py-1">
              {profiles.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileId(p.id)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-ink hover:bg-paper-dim"
                  >
                    <CheckIcon
                      className={`h-3.5 w-3.5 shrink-0 ${p.id === profileId ? 'text-tobacco-dark' : 'invisible'}`}
                    />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    {!p.aesthetic && (
                      <span className="shrink-0 text-[10px] tracking-wide text-ink-soft uppercase">
                        set up
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t border-line p-1.5">
              {naming ? (
                <div className="flex gap-1.5">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submit()
                      if (e.key === 'Escape') setNaming(false)
                    }}
                    placeholder="Their name"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-tobacco focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={submit}
                    className="shrink-0 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-paper"
                  >
                    Create
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setNaming(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink-soft hover:bg-paper-dim hover:text-ink"
                >
                  <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                  Add someone
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
