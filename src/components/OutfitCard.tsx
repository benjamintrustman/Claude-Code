import type { ValidatedOutfit } from '../lib/outfits'
import { AlertIcon } from './icons'

export function OutfitCard({ outfit }: { outfit: ValidatedOutfit }) {
  const hasHallucination = outfit.pieces.some((p) => !p.valid)

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <h3 className="mb-2 font-serif text-lg font-semibold text-ink">{outfit.title}</h3>
      <ul className="mb-3 flex flex-col gap-1.5">
        {outfit.pieces.map((piece, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="w-20 shrink-0 text-ink-soft">{piece.category}</span>
            <span className={piece.valid ? 'text-ink' : 'text-clay'}>
              {piece.item}
              {!piece.valid && (
                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-clay-bg px-1.5 py-0.5 text-[10px] font-medium">
                  <AlertIcon className="h-2.5 w-2.5" />
                  not in your closet
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-soft">{outfit.why}</p>
      {hasHallucination && (
        <p className="mt-2 text-xs text-clay">
          This suggestion referenced an item that doesn't match anything in your closet.
        </p>
      )}
    </div>
  )
}
