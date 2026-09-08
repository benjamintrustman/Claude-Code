import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Gap, GapPriority } from '../types'
import { useApp } from '../context/AppContext'
import { CloseIcon } from '../components/icons'

const PRIORITY_ORDER: GapPriority[] = ['high', 'medium', 'low']

const PRIORITY_STYLES: Record<GapPriority, string> = {
  high: 'bg-clay-bg text-clay',
  medium: 'bg-paper-dim text-tobacco-dark',
  low: 'bg-paper-dim text-ink-soft',
}

export function Gaps() {
  const { gaps, addGap, updateGap, deleteGap } = useApp()
  const [adding, setAdding] = useState(false)

  const sorted = [...gaps].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  )

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl font-semibold text-ink">Gaps</h2>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm font-medium text-tobacco-dark hover:opacity-80"
        >
          + Add gap
        </button>
      </div>
      <p className="mb-5 text-sm text-ink-soft">What you're hunting for.</p>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No open gaps. Nice.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {sorted.map((g) => (
            <GapCard key={g.id} gap={g} onUpdate={updateGap} onDelete={deleteGap} />
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-xl border border-line bg-card p-4">
        <h3 className="mb-1 font-serif text-lg font-semibold text-ink">Check this find</h3>
        <p className="text-sm text-ink-soft">
          Describe something you're looking at in a store and get a blunt verdict against your
          gap list and hard rules. Coming once outfit suggestions are wired up.
        </p>
      </div>

      {adding && <AddGapModal onClose={() => setAdding(false)} onAdd={addGap} />}
    </div>
  )
}

function GapCard({
  gap,
  onUpdate,
  onDelete,
}: {
  gap: Gap
  onUpdate: (id: string, patch: Partial<Gap>) => void
  onDelete: (id: string) => void
}) {
  return (
    <li className="rounded-xl border border-line bg-card px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{gap.title}</p>
          {gap.note && <p className="mt-0.5 text-xs text-ink-soft">{gap.note}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Remove "${gap.title}" from your gap list?`)) onDelete(gap.id)
          }}
          className="shrink-0 text-ink-soft hover:text-clay"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex gap-1.5">
        {PRIORITY_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onUpdate(gap.id, { priority: p })}
            className={`rounded-full px-2.5 py-1 text-[11px] capitalize transition-opacity ${
              PRIORITY_STYLES[p]
            } ${gap.priority === p ? 'opacity-100 font-medium' : 'opacity-40 hover:opacity-70'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </li>
  )
}

function AddGapModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (gap: Omit<Gap, 'id'>) => void
}) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [priority, setPriority] = useState<GapPriority>('medium')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), note: note.trim() || undefined, priority })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink">Add gap</h3>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">What are you after?</span>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Camel wide-leg high-rise trouser"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-tobacco"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Note (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Benchmark, size, lead candidate…"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-tobacco"
            />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Priority</span>
            <div className="flex gap-1.5">
              {PRIORITY_ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-full px-3 py-1.5 text-xs capitalize transition-opacity ${
                    PRIORITY_STYLES[p]
                  } ${priority === p ? 'opacity-100 font-medium' : 'opacity-40 hover:opacity-70'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="mt-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Add to gap list
          </button>
        </form>
      </div>
    </div>
  )
}
