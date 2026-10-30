import { useMemo, useState } from 'react'
import type { Item } from '../types'
import { searchCloset, todayValue } from '../lib/closetSearch'
import { OCCASIONS } from '../data/occasions'
import { CloseIcon, PlusIcon } from './icons'

/**
 * Logging an outfit the app did not suggest. Pieces are picked rather than
 * typed free-form: the record feeds the rotation and, in time, the evidence of
 * what this person actually wears, so it has to name real closet items.
 */
export function LogOutfitModal({
  closet,
  occasion,
  onClose,
  onSave,
}: {
  closet: Item[]
  occasion: string
  onClose: () => void
  onSave: (pieces: string[], occasion: string, date: string) => void
}) {
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Item[]>([])
  const [when, setWhen] = useState(occasion)
  const today = todayValue()
  const [date, setDate] = useState(today)

  const pickedIds = useMemo(() => new Set(picked.map((p) => p.id)), [picked])
  const results = useMemo(
    () => searchCloset(query, closet).filter((it) => !pickedIds.has(it.id)),
    [query, closet, pickedIds],
  )

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink">What you wore</h3>
          <button type="button" onClick={onClose} className="shrink-0 text-ink-soft hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          Your own outfit, not one of the suggestions. It counts the same — the rotation learns from
          it either way.
        </p>

        {picked.length > 0 && (
          <ul className="mb-3 flex flex-col gap-1.5">
            {picked.map((it) => (
              <li key={it.id} className="flex items-start gap-2">
                <span className="w-20 shrink-0 text-xs text-ink-soft">{it.category}</span>
                <span className="min-w-0 flex-1 text-sm text-ink">{it.name}</span>
                <button
                  type="button"
                  onClick={() => setPicked((p) => p.filter((x) => x.id !== it.id))}
                  aria-label={`Remove ${it.name}`}
                  className="shrink-0 text-ink-soft hover:text-clay"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing a piece — “wax plaid”, “jacques”"
          className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-tobacco focus:outline-none"
        />

        {query.trim() !== '' && (
          <ul className="mt-2 flex flex-col gap-1">
            {results.length === 0 ? (
              <li className="px-1 py-2 text-xs text-ink-soft">
                Nothing in your closet matches that.
              </li>
            ) : (
              results.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked((p) => [...p, it])
                      setQuery('')
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-paper-dim"
                  >
                    <PlusIcon className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{it.name}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{it.category}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        <h4 className="mt-5 mb-2 text-sm font-medium text-ink-soft">When</h4>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value || today)}
          className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink focus:border-tobacco focus:outline-none"
        />
        {date !== today && (
          <p className="mt-1 text-xs text-ink-soft">
            Catching up. It slots into the history by date, not by when you entered it.
          </p>
        )}

        <h4 className="mt-5 mb-2 text-sm font-medium text-ink-soft">Occasion</h4>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setWhen(o.label)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                when === o.label
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-tobacco/50 hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={picked.length === 0}
          onClick={() => onSave(picked.map((p) => p.name), when, date)}
          className="mt-5 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {picked.length === 0
            ? 'Add a piece or two first'
            : `Log these ${picked.length} as worn`}
        </button>
      </div>
    </div>
  )
}
