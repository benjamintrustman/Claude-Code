import { useCallback, useEffect, useRef, useState } from 'react'
import type { CurrentWeather } from '../lib/weather'
import { WeatherApiError, fetchWeather } from '../lib/weather'

export type WeatherStatus = 'loading' | 'ready' | 'error'

/** Conditions drift within the hour; the daily high and low do not. */
const STALE_AFTER_MS = 10 * 60 * 1000

function dayIn(timezone: string, at: Date): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(at)
  } catch {
    return at.toDateString()
  }
}

export function useWeather(lat: number, lon: number) {
  const [data, setData] = useState<CurrentWeather | null>(null)
  const [status, setStatus] = useState<WeatherStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  // Refs so the staleness check doesn't have to be a dependency of anything.
  const dataRef = useRef<CurrentWeather | null>(null)
  const fetchedAtRef = useRef<number>(0)
  const inFlightRef = useRef<Promise<CurrentWeather | null> | null>(null)

  const load = useCallback(
    async (showLoading: boolean): Promise<CurrentWeather | null> => {
      // A visibility change landing on top of a tap shouldn't fire two requests.
      if (inFlightRef.current) return inFlightRef.current

      if (showLoading) setStatus('loading')
      setError(null)

      const request = fetchWeather(lat, lon)
        .then((result) => {
          dataRef.current = result
          fetchedAtRef.current = Date.now()
          setData(result)
          setStatus('ready')
          return result
        })
        .catch((err) => {
          setError(err instanceof WeatherApiError ? err.message : 'Could not load weather.')
          // Keep showing the last good reading rather than blanking the card.
          setStatus(dataRef.current ? 'ready' : 'error')
          return null
        })
        .finally(() => {
          inFlightRef.current = null
        })

      inFlightRef.current = request
      return request
    },
    [lat, lon],
  )

  const isStale = useCallback(() => {
    const current = dataRef.current
    if (!current) return true
    if (Date.now() - fetchedAtRef.current > STALE_AFTER_MS) return true
    // A new local day means a new high and low, however recently we fetched.
    const now = new Date()
    return dayIn(current.timezone, now) !== dayIn(current.timezone, new Date(fetchedAtRef.current))
  }, [])

  useEffect(() => {
    dataRef.current = null
    fetchedAtRef.current = 0
    load(true)
  }, [load])

  // The app lives on a phone home screen and can sit suspended for days.
  // Coming back to the foreground is the moment the reading is most likely
  // to be wrong, and the moment the user is about to look at it.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && isStale()) load(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [isStale, load])

  /** Fresh enough to build an outfit on. Refetches first if it isn't. */
  const ensureFresh = useCallback(async (): Promise<CurrentWeather | null> => {
    if (!isStale()) return dataRef.current
    return (await load(false)) ?? dataRef.current
  }, [isStale, load])

  const retry = useCallback(() => {
    load(true)
  }, [load])

  return { data, status, error, retry, ensureFresh }
}
