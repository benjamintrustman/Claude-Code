import type { Category } from '../types'
import { CATEGORIES } from '../types'
import type { DraftItem } from '../lib/onboarding'
import { CloseIcon } from './icons'

export function DraftReview({
  drafts,
  onChange,
  onSave,
  onBack,
  saveLabel,
  backLabel,
}: {
  drafts: DraftItem[]
  onChange: (rows: DraftItem[]) => void
  onSave: () => void
  onBack: () => void
  saveLabel: (n: number) => string
  backLabel: string
}) {
  const patch = (i: number, p: Partial<DraftItem>) =>
    onChange(drafts.map((d, n) => (n === i ? { ...d, ...p } : d)))
  const uncertain = drafts.filter((d) => d.colorUncertain).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-ink-soft">
          {drafts.length} piece{drafts.length === 1 ? '' : 's'}
        </p>
        {uncertain > 0 && (
          <p className="text-xs text-clay">{uncertain} colour{uncertain === 1 ? '' : 's'} to check</p>
        )}
      </div>

      {uncertain > 0 && (
        <p className="rounded-lg bg-clay-bg/40 px-3 py-2 text-xs leading-relaxed text-ink-soft">
          Colours marked below were inferred rather than stated. Worth fixing — how light or dark a
          piece is drives most of what you'll be shown.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {drafts.map((d, i) => (
          <li key={i} className="rounded-xl border border-line bg-card p-3">
            <div className="mb-2 flex items-start gap-2">
              <input
                value={d.name}
                onChange={(e) => patch(i, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-tobacco focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onChange(drafts.filter((_, n) => n !== i))}
                aria-label={`Remove ${d.name}`}
                className="mt-1.5 shrink-0 text-ink-soft hover:text-clay"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={d.category}
                onChange={(e) => patch(i, { category: e.target.value as Category })}
                className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-2 py-1.5 text-xs text-ink focus:border-tobacco focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                value={d.color}
                placeholder="colour"
                onChange={(e) => patch(i, { color: e.target.value, colorUncertain: false })}
                className={`min-w-0 flex-1 rounded-lg border bg-paper px-2.5 py-1.5 text-xs focus:outline-none ${
                  d.colorUncertain
                    ? 'border-clay/50 bg-clay-bg/30 text-clay'
                    : 'border-line text-ink focus:border-tobacco'
                }`}
              />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={drafts.length === 0}
        onClick={onSave}
        className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {saveLabel(drafts.length)}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="text-center text-xs text-ink-soft underline decoration-line underline-offset-2 hover:text-ink"
      >
        {backLabel}
      </button>
    </div>
  )
}
