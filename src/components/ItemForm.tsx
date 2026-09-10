import { useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import type { Category, Item } from '../types'
import { CATEGORIES } from '../types'
import { readFileAsDataUrl } from '../lib/photo'
import { useApp } from '../context/AppContext'

type ItemFormValues = Omit<Item, 'id'>

const emptyValues: ItemFormValues = {
  name: '',
  category: 'Shirt',
  color: '',
  brand: '',
  rise: undefined,
  functional: false,
  photo: undefined,
}

export function ItemForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: {
  initial?: Item
  onSubmit: (values: ItemFormValues) => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const { profile } = useApp()
  const [values, setValues] = useState<ItemFormValues>(
    initial ? { ...initial } : { ...emptyValues },
  )
  const [photoLoading, setPhotoLoading] = useState(false)

  const isTrousers = values.category === 'Trousers'

  function set<K extends keyof ItemFormValues>(key: K, val: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      set('photo', dataUrl)
    } finally {
      setPhotoLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.name.trim() || !values.color.trim()) return
    onSubmit({
      ...values,
      name: values.name.trim(),
      color: values.color.trim(),
      brand: values.brand?.trim() || undefined,
      rise: isTrousers ? values.rise : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Name">
        <input
          type="text"
          required
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Wax London tan field jacket"
          className={inputClass}
        />
      </Field>

      <Field label="Category">
        <select
          value={values.category}
          onChange={(e) => set('category', e.target.value as Category)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Color">
        <input
          type="text"
          required
          value={values.color}
          onChange={(e) => set('color', e.target.value)}
          placeholder="e.g. tan, olive/mustard"
          className={inputClass}
        />
      </Field>

      <Field label="Brand (optional)">
        <input
          type="text"
          value={values.brand ?? ''}
          onChange={(e) => set('brand', e.target.value)}
          className={inputClass}
        />
      </Field>

      {isTrousers && (
        <Field label="Rise (inches)">
          <input
            type="number"
            step="0.5"
            min="0"
            value={values.rise ?? ''}
            onChange={(e) => set('rise', e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass}
          />
          {profile.minRise != null && (
            <p className="mt-1.5 text-sm text-ink-soft">
              Recorded for reference. Your {profile.minRise}" minimum applies when checking a new
              find, not to what you already own.
            </p>
          )}
        </Field>
      )}

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.functional ?? false}
          onChange={(e) => set('functional', e.target.checked)}
          className="h-4 w-4 rounded border-line accent-tobacco"
        />
        Functional piece (excluded from style suggestions)
      </label>

      <Field label="Photo (optional)">
        <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
        {photoLoading && <p className="mt-1 text-sm text-ink-soft">Loading photo…</p>}
        {values.photo && (
          <img
            src={values.photo}
            alt=""
            className="mt-2 h-24 w-24 rounded-lg border border-line object-cover"
          />
        )}
      </Field>

      <div className="mt-2 flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-tobacco'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  )
}
