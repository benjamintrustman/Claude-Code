import type { FindVerdict, FindVerdictType } from '../lib/findChecker'
import { AlertIcon, BanIcon, CheckIcon, CopyIcon } from './icons'

const VERDICT_META: Record<
  FindVerdictType,
  { label: string; className: string; Icon: typeof CheckIcon }
> = {
  fills_gap: { label: 'Fills a gap', className: 'text-tobacco-dark', Icon: CheckIcon },
  redundant: { label: 'Redundant', className: 'text-clay', Icon: CopyIcon },
  violates_rule: { label: 'Violates a hard rule', className: 'text-clay', Icon: BanIcon },
  no_gap: { label: 'Not on your list', className: 'text-ink-soft', Icon: AlertIcon },
}

export function FindVerdictCard({ verdict }: { verdict: FindVerdict }) {
  const meta = VERDICT_META[verdict.verdict]
  const isPositive = verdict.verdict === 'fills_gap'

  return (
    <div
      className={`rounded-xl border p-4 ${
        isPositive ? 'border-tobacco/40 bg-tobacco/5' : 'border-line bg-card'
      }`}
    >
      <div className={`mb-2 flex items-center gap-1.5 text-sm font-medium ${meta.className}`}>
        <meta.Icon className="h-4 w-4" />
        {meta.label}
      </div>
      <p className="mb-1.5 font-serif text-lg font-semibold text-ink">{verdict.headline}</p>
      <p className="text-sm text-ink-soft">{verdict.reasoning}</p>
      {verdict.relatedGap && (
        <p className="mt-2 text-xs text-ink-soft">
          Matches gap: <span className="font-medium text-ink">{verdict.relatedGap}</span>
        </p>
      )}
    </div>
  )
}
