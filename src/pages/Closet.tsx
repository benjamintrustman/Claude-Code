import { useMemo, useState } from 'react'
import type { Category, Item } from '../types'
import { CATEGORIES } from '../types'
import { useApp } from '../context/AppContext'
import { ItemForm } from '../components/ItemForm'
import { CloseIcon } from '../components/icons'

export function Closet() {
  const { closet, profile, deleteItem, updateItem, resetToSeed } = useApp()
  const [filter, setFilter] = useState<Category | 'All'>('All')
  const [editing, setEditing] = useState<Item | null>(null)

  const counts = useMemo(() => {
    const map = new Map<Category, number>()
    for (const it of closet) map.set(it.category, (map.get(it.category) ?? 0) + 1)
    return map
  }, [closet])

  const visible = useMemo(
    () => (filter === 'All' ? closet : closet.filter((it) => it.category === filter)),
    [closet, filter],
  )

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl font-semibold text-ink">Closet</h2>
        <span className="text-sm text-ink-soft">{closet.length} pieces</span>
      </div>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip label="All" active={filter === 'All'} onClick={() => setFilter('All')} />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            label={`${c}${counts.has(c) ? ` (${counts.get(c)})` : ''}`}
            active={filter === c}
            onClick={() => setFilter(c)}
            disabled={!counts.has(c)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visible.map((it) => {
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => setEditing(it)}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3 text-left transition-colors hover:border-tobacco/50"
                >
                  {it.photo ? (
                    <img
                      src={it.photo}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-paper-dim text-[10px] uppercase tracking-wide text-ink-soft">
                      {it.category.slice(0, 3)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {it.category} · {it.color}
                      {it.rise != null ? ` · ${it.rise}" rise` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {it.functional && (
                      <span className="rounded-full bg-paper-dim px-2 py-0.5 text-[11px] text-ink-soft">
                        Functional
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <EditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            updateItem(editing.id, values)
            setEditing(null)
          }}
          onDelete={() => {
            deleteItem(editing.id)
            setEditing(null)
          }}
        />
      )}

      <div className="mt-8 border-t border-line pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                `Restore ${profile.name}'s original closet and gap list?\n\nThis permanently discards every item you have added, edited or deleted since, and every change to the gap list. It cannot be undone.`,
              )
            ) {
              resetToSeed()
            }
          }}
          className="text-xs text-ink-soft underline decoration-line underline-offset-2 hover:text-clay"
        >
          Restore {profile.name}'s original closet &amp; gaps
        </button>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : disabled
            ? 'border-line text-ink-soft/40'
            : 'border-line text-ink-soft hover:border-tobacco/50 hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

function EditModal({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: Item
  onClose: () => void
  onSave: (values: Omit<Item, 'id'>) => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink">Edit item</h3>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <ItemForm initial={item} submitLabel="Save changes" onSubmit={onSave} onCancel={onClose} />
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Remove "${item.name}" from your closet?`)) onDelete()
          }}
          className="mt-3 w-full rounded-full border border-clay/30 px-4 py-2.5 text-sm text-clay hover:bg-clay-bg/40"
        >
          Delete item
        </button>
      </div>
    </div>
  )
}
