import { useCallback, useState } from 'react'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'
import { useOutfits } from '../hooks/useOutfits'
import { useApp } from '../context/AppContext'
import { WeatherCard } from '../components/WeatherCard'
import { LocationModal } from '../components/LocationModal'
import { OutfitCard } from '../components/OutfitCard'
import { AlertIcon, CloseIcon } from '../components/icons'
import { OCCASIONS } from '../data/occasions'
import type { Item } from '../types'
import type { ValidatedOutfit } from '../lib/outfits'
import { loadWorn, recordWorn, removeWorn } from '../lib/outfitHistory'

export function Today({
  anchors,
  onRemoveAnchor,
  onClearAnchors,
}: {
  anchors: Item[]
  onRemoveAnchor: (id: string) => void
  onClearAnchors: () => void
}) {
  const { closet, profile } = useApp()
  const [occasion, setOccasion] = useState(OCCASIONS[0].label)
  const [editingLocation, setEditingLocation] = useState(false)
  // Outfits held back through a re-run. Session-only: a shortlist while
  // deciding, not a record of anything.
  const [kept, setKept] = useState<ValidatedOutfit[]>([])
  // Timestamps of what has been marked worn, so the mark can be undone.
  const [wornAt, setWornAt] = useState<Record<string, number>>({})
  const {
    location,
    status: locationStatus,
    notice,
    setManualLocation,
    useDeviceLocationInstead,
    retryDeviceLocation,
  } = useLocation()
  const {
    data: weather,
    status: weatherStatus,
    error: weatherError,
    retry,
    ensureFresh,
  } = useWeather(location.lat, location.lon)
  const {
    outfits,
    bottomsOffered,
    status: outfitsStatus,
    error: outfitsError,
    generate,
    cancel,
  } = useOutfits()

  const canSuggest = weatherStatus === 'ready' && weather != null
  const signature = (o: ValidatedOutfit) => `${o.title}|${o.pieces.map((p) => p.item).join('|')}`

  const toggleKeep = useCallback((outfit: ValidatedOutfit) => {
    setKept((prev) => {
      const sig = `${outfit.title}|${outfit.pieces.map((p) => p.item).join('|')}`
      const without = prev.filter((o) => `${o.title}|${o.pieces.map((p) => p.item).join('|')}` !== sig)
      return without.length === prev.length ? [...prev, outfit] : without
    })
  }, [])

  // The write happens outside the state updater on purpose. React invokes
  // updaters twice in development, which would record the outfit twice and
  // leave the undo removing only one of them.
  const toggleWorn = useCallback(
    (outfit: ValidatedOutfit, pieces: string[]) => {
      const sig = `${outfit.title}|${outfit.pieces.map((p) => p.item).join('|')}`
      const existing = wornAt[sig]
      if (existing != null) {
        removeWorn(profile.id, existing)
        setWornAt((prev) => {
          const next = { ...prev }
          delete next[sig]
          return next
        })
        return
      }
      recordWorn(profile.id, { title: outfit.title, pieces, occasion })
      const at = loadWorn(profile.id)[0]?.at
      if (at != null) setWornAt((prev) => ({ ...prev, [sig]: at }))
    },
    [wornAt, profile.id, occasion],
  )

  // Kept outfits are shown above the new ones, and the same card never appears
  // in both lists.
  const keptSignatures = new Set(kept.map(signature))
  const fresh = outfits.filter((o) => !keptSignatures.has(signature(o)))

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-5">
      <h2 className="mb-5 font-serif text-2xl font-semibold text-ink">Today</h2>

      <WeatherCard
        location={location}
        locationStatus={locationStatus}
        locationNotice={notice}
        weather={weather}
        weatherStatus={weatherStatus}
        weatherError={weatherError}
        onEditLocation={() => setEditingLocation(true)}
        onRetryWeather={retry}
        onRetryLocation={retryDeviceLocation}
      />

      {anchors.length > 0 && (
        <div className="mb-6 rounded-xl border border-tobacco/40 bg-tobacco/5 px-3.5 py-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-xs font-medium tracking-wide text-tobacco-dark uppercase">
              Building around
            </p>
            <button
              type="button"
              onClick={onClearAnchors}
              className="shrink-0 text-xs text-ink-soft underline decoration-line underline-offset-2 hover:text-ink"
            >
              Clear all
            </button>
          </div>
          <ul className="flex flex-col gap-1.5">
            {anchors.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="w-20 shrink-0 text-xs text-ink-soft">{item.category}</span>
                <span className="min-w-0 flex-1 text-sm text-ink">{item.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAnchor(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="shrink-0 text-ink-soft hover:text-clay"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-ink-soft">Occasion</h3>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setOccasion(o.label)}
              title={o.description}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                occasion === o.label
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-tobacco/50 hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {outfitsStatus === 'loading' ? (
        // The same slot, not an extra control: one full-width tap target, so
        // a change of mind mid-request costs nothing on a phone.
        <button
          type="button"
          onClick={cancel}
          className="w-full rounded-full border border-ink px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
        >
          Thinking… — tap to stop
        </button>
      ) : (
        <button
          type="button"
          disabled={!canSuggest}
          onClick={async () => {
            // Never build on what's on screen — it may be days old if the app
            // has been sitting open. Refetch first if the reading has aged out.
            const current = await ensureFresh()
            if (current) generate(closet, profile, current, occasion, anchors, kept)
          }}
          className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {anchors.length
            ? `Build outfits around ${anchors.length === 1 ? 'this' : `these ${anchors.length}`}`
            : 'Suggest outfits'}
        </button>
      )}

      {outfitsStatus === 'error' && outfitsError && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-clay">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {outfitsError}
        </p>
      )}

      {(outfitsStatus === 'ready' || kept.length > 0) && (
        <div className="mt-5 flex flex-col gap-3">
          {[...kept, ...fresh].map((outfit) => {
            const sig = signature(outfit)
            return (
              <OutfitCard
                key={sig}
                outfit={outfit}
                kept={keptSignatures.has(sig)}
                worn={wornAt[sig] != null}
                onToggleKeep={() => toggleKeep(outfit)}
                onToggleWorn={(pieces) => toggleWorn(outfit, pieces)}
              />
            )
          })}
          {/* Meaningless when a pinned piece is the bottom — nothing rotated. */}
          {outfitsStatus === 'ready' &&
            bottomsOffered.length > 0 &&
            !anchors.some((a) => a.category === 'Trousers' || a.category === 'Skirt') && (
              <p className="px-1 pt-1 text-xs leading-relaxed text-ink-soft">
                <span className="font-medium">Today's rotation:</span> {bottomsOffered.join(' · ')}
              </p>
            )}
        </div>
      )}

      {editingLocation && (
        <LocationModal
          currentLabel={location.label}
          onClose={() => setEditingLocation(false)}
          onSubmit={setManualLocation}
          onUseDeviceLocation={useDeviceLocationInstead}
        />
      )}
    </div>
  )
}
