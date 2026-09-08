import { useEffect, useState } from 'react'
import type { CurrentWeather } from '../lib/weather'
import { WeatherApiError, fetchWeather } from '../lib/weather'

export type WeatherStatus = 'loading' | 'ready' | 'error'

export function useWeather(lat: number, lon: number) {
  const [data, setData] = useState<CurrentWeather | null>(null)
  const [status, setStatus] = useState<WeatherStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError(null)
    fetchWeather(lat, lon)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof WeatherApiError ? err.message : 'Could not load weather.')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [lat, lon, reloadToken])

  const retry = () => setReloadToken((n) => n + 1)

  return { data, status, error, retry }
}
