export type CurrentWeather = {
  temp: number
  feelsLike: number
  code: number
  windSpeed: number
  precipitation: number
  high: number
  low: number
  timezone: string
}

export class WeatherApiError extends Error {}

export type GeoErrorCode = 'denied' | 'timeout' | 'unavailable' | 'unsupported'

export class GeoError extends Error {
  code: GeoErrorCode
  constructor(code: GeoErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

async function parseJsonResponse(response: Response, serviceLabel: string): Promise<unknown> {
  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new WeatherApiError(
      `${serviceLabel} returned an unreadable response (HTTP ${response.status}).`,
    )
  }
  return data
}

function apiErrorReason(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'reason' in data) {
    const reason = (data as { reason?: unknown }).reason
    if (typeof reason === 'string') return reason
  }
  return undefined
}

export async function fetchWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
  )
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('timezone', 'auto')

  let response: Response
  try {
    response = await fetch(url.toString())
  } catch {
    throw new WeatherApiError(
      'Network error — could not reach the weather service. Check your connection.',
    )
  }

  const data = await parseJsonResponse(response, 'The weather service')

  if (!response.ok || (data && typeof data === 'object' && (data as { error?: boolean }).error)) {
    throw new WeatherApiError(apiErrorReason(data) ?? `Weather service error (HTTP ${response.status}).`)
  }

  const d = data as {
    current: {
      temperature_2m: number
      apparent_temperature: number
      weather_code: number
      wind_speed_10m: number
      precipitation: number
    }
    daily: { temperature_2m_max: number[]; temperature_2m_min: number[] }
    timezone: string
  }

  return {
    temp: d.current.temperature_2m,
    feelsLike: d.current.apparent_temperature,
    code: d.current.weather_code,
    windSpeed: d.current.wind_speed_10m,
    precipitation: d.current.precipitation,
    high: d.daily.temperature_2m_max[0],
    low: d.daily.temperature_2m_min[0],
    timezone: d.timezone,
  }
}

export type GeocodeResult = { label: string; lat: number; lon: number }

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim()
  if (!trimmed) {
    throw new WeatherApiError('Type a place name to search.')
  }

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', trimmed)
  url.searchParams.set('count', '1')

  let response: Response
  try {
    response = await fetch(url.toString())
  } catch {
    throw new WeatherApiError(
      'Network error — could not reach the location service. Check your connection.',
    )
  }

  const data = await parseJsonResponse(response, 'The location service')

  if (!response.ok || (data && typeof data === 'object' && (data as { error?: boolean }).error)) {
    throw new WeatherApiError(apiErrorReason(data) ?? `Location service error (HTTP ${response.status}).`)
  }

  const results = (data as { results?: Array<Record<string, unknown>> }).results
  const first = results?.[0]
  if (!first) {
    throw new WeatherApiError(`No place found matching "${trimmed}". Try a city and state or country.`)
  }

  const parts = [first.name, first.admin1, first.country].filter(
    (p): p is string => typeof p === 'string' && p.length > 0,
  )
  return {
    label: parts.join(', '),
    lat: first.latitude as number,
    lon: first.longitude as number,
  }
}

export function getDevicePosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new GeoError('unsupported', "This browser doesn't support geolocation."))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GeoError('denied', 'Location access was denied.'))
        } else if (err.code === err.TIMEOUT) {
          reject(new GeoError('timeout', 'Location request timed out.'))
        } else {
          reject(new GeoError('unavailable', 'Location is currently unavailable.'))
        }
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    )
  })
}

export function prettifyTimezone(timezone: string): string {
  const last = timezone.split('/').pop() ?? timezone
  return last.replace(/_/g, ' ')
}
