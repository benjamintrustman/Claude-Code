import { useState } from 'react'
import { LocationIcon, SunIcon } from '../components/icons'

const OCCASIONS = ['Work', 'Weekend', 'Errands', 'Dinner out', 'Travel', 'Outdoors']

export function Today() {
  const [occasion, setOccasion] = useState(OCCASIONS[0])

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <h2 className="mb-5 font-serif text-2xl font-semibold text-ink">Today</h2>

      <section className="mb-6 rounded-xl border border-line bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            <LocationIcon className="h-4 w-4" />
            Set location
          </button>
          <SunIcon className="h-8 w-8 text-tobacco" />
        </div>
        <p className="text-sm text-ink-soft">
          Weather will appear here once the location and forecast are wired up.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-ink-soft">Occasion</h3>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOccasion(o)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                occasion === o
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-tobacco/50 hover:text-ink'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled
        className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper opacity-40"
      >
        Suggest outfits (coming soon)
      </button>
    </div>
  )
}
