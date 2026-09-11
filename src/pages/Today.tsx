import { useState } from 'react'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'
import { useOutfits } from '../hooks/useOutfits'
import { useApp } from '../context/AppContext'
import { WeatherCard } from '../components/WeatherCard'
import { LocationModal } from '../components/LocationModal'
import { OutfitCard } from '../components/OutfitCard'
import { AlertIcon } from '../components/icons'
import { OCCASIONS } from '../data/occasions'

export function Today() {
  const { closet, profile } = useApp()
  const [occasion, setOccasion] = useState(OCCASIONS[0].label)
  const [editingLocation, setEditingLocation] = useState(false)
  const { location, status: locationStatus, notice, setManualLocation, useDeviceLocationInstead } =
    useLocation()
  const { data: weather, status: weatherStatus, error: weatherError, retry } = useWeather(
    location.lat,
    location.lon,
  )
  const {
    outfits,
    bottomsOffered,
    status: outfitsStatus,
    error: outfitsError,
    generate,
  } = useOutfits()

  const canSuggest = weatherStatus === 'ready' && weather != null

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
      />

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

      <button
        type="button"
        disabled={!canSuggest || outfitsStatus === 'loading'}
        onClick={() => weather && generate(closet, profile, weather, occasion)}
        className="w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {outfitsStatus === 'loading' ? 'Thinking…' : 'Suggest outfits'}
      </button>

      {outfitsStatus === 'error' && outfitsError && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-clay">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {outfitsError}
        </p>
      )}

      {outfitsStatus === 'ready' && (
        <div className="mt-5 flex flex-col gap-3">
          {outfits.map((outfit, i) => (
            <OutfitCard key={i} outfit={outfit} />
          ))}
          {bottomsOffered.length > 0 && (
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
