import type { Location } from '../types'
import type { CurrentWeather } from '../lib/weather'
import { prettifyTimezone } from '../lib/weather'
import { weatherCodeInfo } from '../lib/weatherCodes'
import { AlertIcon, LocationIcon, RefreshIcon } from './icons'

export function WeatherCard({
  location,
  locationStatus,
  locationNotice,
  weather,
  weatherStatus,
  weatherError,
  onEditLocation,
  onRetryWeather,
}: {
  location: Location
  locationStatus: 'locating' | 'ready'
  locationNotice: string | null
  weather: CurrentWeather | null
  weatherStatus: 'loading' | 'ready' | 'error'
  weatherError: string | null
  onEditLocation: () => void
  onRetryWeather: () => void
}) {
  const displayLabel =
    location.source === 'geolocation' && weather ? prettifyTimezone(weather.timezone) : location.label

  return (
    <section className="mb-6 rounded-xl border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onEditLocation}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <LocationIcon className="h-4 w-4" />
          {locationStatus === 'locating' ? 'Finding you…' : displayLabel}
        </button>
        {weatherStatus === 'ready' && weather && (
          <WeatherIcon code={weather.code} className="h-8 w-8 text-tobacco" />
        )}
      </div>

      {locationNotice && (
        <p className="mb-3 flex items-start gap-1.5 rounded-lg bg-clay-bg/50 px-2.5 py-2 text-xs text-clay">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {locationNotice}
        </p>
      )}

      {weatherStatus === 'loading' && <p className="text-sm text-ink-soft">Loading weather…</p>}

      {weatherStatus === 'error' && (
        <div>
          <p className="mb-2 flex items-start gap-1.5 text-sm text-clay">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {weatherError}
          </p>
          <button
            type="button"
            onClick={onRetryWeather}
            className="flex items-center gap-1.5 text-sm font-medium text-tobacco-dark hover:opacity-80"
          >
            <RefreshIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {weatherStatus === 'ready' && weather && (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-4xl font-semibold text-ink">{Math.round(weather.temp)}°</span>
            <span className="text-sm text-ink-soft">
              feels like {Math.round(weather.feelsLike)}° · {weatherCodeInfo(weather.code).label}
            </span>
          </div>
          <div className="mt-2 flex gap-4 text-sm text-ink-soft">
            <span>H {Math.round(weather.high)}° / L {Math.round(weather.low)}°</span>
            <span>Wind {Math.round(weather.windSpeed)} mph</span>
            {weather.precipitation > 0 && <span>Precip {weather.precipitation}"</span>}
          </div>
        </div>
      )}
    </section>
  )
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const { Icon } = weatherCodeInfo(code)
  return <Icon className={className} />
}
