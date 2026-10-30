import { useCallback, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { WornOutfit } from '../lib/outfitHistory'
import { loadWorn, removeWorn } from '../lib/outfitHistory'
import { CloseIcon } from '../components/icons'

function dayLabel(at: number): string {
  const d = new Date(at)
  const today = new Date()
  const days = Math.round(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000,
  )
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function Worn() {
  const { profileId, closet } = useApp()
  const [worn, setWorn] = useState<WornOutfit[]>(() => loadWorn(profileId))

  const remove = useCallback(
    (at: number) => {
      removeWorn(profileId, at)
      setWorn(loadWorn(profileId))
    },
    [profileId],
  )

  // Both of these fall out of the record for nothing — no model call, no
  // stored counters to drift out of step with it.
  const { counts, neverWorn } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const o of worn) for (const p of o.pieces) counts.set(p, (counts.get(p) ?? 0) + 1)
    const eligible = closet.filter((it) => !it.functional)
    return {
      counts: [...counts.entries()].sort((a, b) => b[1] - a[1]),
      neverWorn: eligible.filter((it) => !counts.has(it.name)),
    }
  }, [worn, closet])

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl font-semibold text-ink">Worn</h2>
        <span className="text-sm text-ink-soft">
          {worn.length} outfit{worn.length === 1 ? '' : 's'}
        </span>
      </div>
      <p className="mb-5 text-sm text-ink-soft">
        What you actually wore. The suggestions reason from this, so a wrong entry is worth
        deleting.
      </p>

      {worn.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">
          Nothing logged yet. Mark a suggestion as worn, or log your own outfit from Today.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {worn.map((o) => (
            <li key={o.at} className="rounded-xl border border-line bg-card px-3.5 py-3">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">{dayLabel(o.at)}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-ink-soft">{o.occasion}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete this ${dayLabel(o.at).toLowerCase()} entry?`)) {
                        remove(o.at)
                      }
                    }}
                    aria-label="Delete entry"
                    className="text-ink-soft hover:text-clay"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{o.pieces.join(' · ')}</p>
            </li>
          ))}
        </ul>
      )}

      {counts.length > 0 && (
        <section className="mt-8 border-t border-line pt-5">
          <h3 className="mb-2 font-serif text-lg font-semibold text-ink">Reached for most</h3>
          <ul className="flex flex-col gap-1">
            {counts.slice(0, 8).map(([name, n]) => (
              <li key={name} className="flex items-baseline gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink">{name}</span>
                <span className="shrink-0 text-xs text-ink-soft">
                  {n}×
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {worn.length > 0 && neverWorn.length > 0 && (
        <section className="mt-6 border-t border-line pt-5">
          <h3 className="mb-1 font-serif text-lg font-semibold text-ink">Not worn yet</h3>
          <p className="mb-2 text-sm text-ink-soft">
            {neverWorn.length} of {closet.filter((it) => !it.functional).length} pieces haven't
            appeared in anything logged. Early on that just means the record is short.
          </p>
          <p className="text-sm leading-relaxed text-ink-soft">
            {neverWorn
              .slice(0, 12)
              .map((it) => it.name)
              .join(' · ')}
            {neverWorn.length > 12 ? ` … and ${neverWorn.length - 12} more` : ''}
          </p>
        </section>
      )}
    </div>
  )
}
