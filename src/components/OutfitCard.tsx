import { useMemo, useState } from 'react'
import type { ValidatedOutfit } from '../lib/outfits'
import { AlertIcon, CheckIcon } from './icons'

export function OutfitCard({
  outfit,
  kept,
  worn,
  onToggleKeep,
  onToggleWorn,
}: {
  outfit: ValidatedOutfit
  kept: boolean
  worn: boolean
  onToggleKeep: () => void
  /** Receives what is on screen, not what was suggested — a swapped slot is
   *  part of the outfit the user actually put on. */
  onToggleWorn: (pieces: string[]) => void
}) {
  // Which slot each piece currently shows. Keyed by the originally suggested
  // item so a swapped slot can always be put back.
  const [swapped, setSwapped] = useState<Record<string, string>>({})
  const [openSlot, setOpenSlot] = useState<string | null>(null)

  const alternativesFor = useMemo(() => {
    const map = new Map<string, ValidatedOutfit['swaps']>()
    for (const s of outfit.swaps) {
      map.set(s.replaces, [...(map.get(s.replaces) ?? []), s])
    }
    return map
  }, [outfit.swaps])

  const hasHallucination = outfit.pieces.some((p) => !p.valid)

  const shownPieces = outfit.pieces.map((p) => swapped[p.item] ?? p.item)

  return (
    <div
      className={`rounded-xl border bg-card p-4 ${
        kept ? 'border-tobacco/50 ring-1 ring-tobacco/20' : 'border-line'
      }`}
    >
      {kept && (
        <p className="mb-2 text-[11px] font-medium tracking-wide text-tobacco-dark uppercase">
          Kept
        </p>
      )}
      <h3 className="mb-2 font-serif text-lg font-semibold text-ink">{outfit.title}</h3>
      <ul className="mb-3 flex flex-col gap-1.5">
        {outfit.pieces.map((piece, i) => {
          const alternatives = alternativesFor.get(piece.item) ?? []
          const shown = swapped[piece.item] ?? piece.item
          const isSwapped = shown !== piece.item
          const isOpen = openSlot === piece.item

          return (
            <li key={i} className="text-sm">
              <div className="flex items-start gap-2">
                <span className="w-20 shrink-0 text-ink-soft">{piece.category}</span>
                <div className="min-w-0 flex-1">
                  <span className={piece.valid ? 'text-ink' : 'text-clay'}>
                    {shown}
                    {!piece.valid && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-clay-bg px-1.5 py-0.5 text-[10px] font-medium">
                        <AlertIcon className="h-2.5 w-2.5" />
                        not in your closet
                      </span>
                    )}
                  </span>
                  {alternatives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOpenSlot(isOpen ? null : piece.item)}
                      className="ml-2 whitespace-nowrap text-xs text-tobacco-dark underline decoration-line underline-offset-2 hover:opacity-80"
                    >
                      {isOpen ? 'hide' : `${alternatives.length} swap${alternatives.length > 1 ? 's' : ''}`}
                    </button>
                  )}

                  {isOpen && (
                    <ul className="mt-1.5 flex flex-col gap-1 border-l border-line pl-2.5">
                      {isSwapped && (
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setSwapped((prev) => {
                                const next = { ...prev }
                                delete next[piece.item]
                                return next
                              })
                              setOpenSlot(null)
                            }}
                            className="text-left text-xs text-ink-soft hover:text-ink"
                          >
                            ← back to {piece.item}
                          </button>
                        </li>
                      )}
                      {alternatives
                        .filter((alt) => alt.item !== shown)
                        .map((alt) => (
                          <li key={alt.item}>
                            <button
                              type="button"
                              onClick={() => {
                                setSwapped((prev) => ({ ...prev, [piece.item]: alt.item }))
                                setOpenSlot(null)
                              }}
                              className="text-left text-xs text-ink-soft hover:text-ink"
                            >
                              <span className="font-medium text-ink">{alt.item}</span>
                              {alt.note && <span className="text-ink-soft"> — {alt.note}</span>}
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="text-sm text-ink-soft">{outfit.why}</p>
      {hasHallucination && (
        <p className="mt-2 text-xs text-clay">
          This suggestion referenced an item that doesn't match anything in your closet.
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={onToggleKeep}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            kept
              ? 'border-tobacco bg-tobacco/10 text-tobacco-dark'
              : 'border-line text-ink-soft hover:border-tobacco/50 hover:text-ink'
          }`}
        >
          {kept ? 'Keeping this' : 'Keep for the next run'}
        </button>
        <button
          type="button"
          onClick={() => onToggleWorn(shownPieces)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
            worn
              ? 'bg-ink text-paper'
              : 'border border-line text-ink-soft hover:border-ink/40 hover:text-ink'
          }`}
        >
          <CheckIcon className="h-3 w-3" />
          {worn ? 'Worn today' : 'Wore this'}
        </button>
      </div>
    </div>
  )
}
