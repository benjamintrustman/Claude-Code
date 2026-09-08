import { useState } from 'react'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'
import { WeatherCard } from '../components/WeatherCard'
import { LocationModal } from '../components/LocationModal'

const OCCASIONS = ['Work', 'Weekend', 'Errands', 'Dinner out', 'Travel', 'Outdoors']

export function Today() {
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [editingLocation, setEditingLocation] = useState(false)
  const { location, status: locationStatus, notice, setManualLocation, useDeviceLocationInstead } =
    useLocation()
  const { data: weather, status: weatherStatus, error: weatherError, retry } = useWeather(
    location.lat,
    location.lon,
  )

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
