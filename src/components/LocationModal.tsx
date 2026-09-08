import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Location } from '../types'
import { CloseIcon, SearchIcon } from './icons'

export function LocationModal({
  currentLabel,
  onClose,
  onSubmit,
  onUseDeviceLocation,
}: {
  currentLabel: string
  onClose: () => void
  onSubmit: (query: string) => Promise<Location>
  onUseDeviceLocation: () => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('loading')
    setError(null)
    try {
      await onSubmit(query)
      onClose()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not find that place.')
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-ink">Set location</h3>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 text-sm text-ink-soft">Currently: {currentLabel}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, state or country"
              className="w-full rounded-lg border border-line bg-card py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-tobacco"
            />
          </div>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? 'Searching…' : 'Save location'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            onUseDeviceLocation()
            onClose()
          }}
          className="mt-3 w-full rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:text-ink"
        >
          Use my current location instead
        </button>
      </div>
    </div>
  )
}
