import { useCallback, useEffect, useState } from 'react'
import type { Location } from '../types'
import { readJSON, removeKey, writeJSON } from '../lib/storage'
import { GeoError, geocodeLocation, getDevicePosition } from '../lib/weather'

const DEFAULT_LOCATION: Location = {
  label: 'New York, NY',
  lat: 40.7128,
  lon: -74.006,
  source: 'default',
}

export type LocationStatus = 'locating' | 'ready'

export function useLocation() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION)
  const [status, setStatus] = useState<LocationStatus>('locating')
  const [notice, setNotice] = useState<string | null>(null)

  const loadDeviceLocation = useCallback(async () => {
    setStatus('locating')
    setNotice(null)
    try {
      const pos = await getDevicePosition()
      setLocation({ label: 'Current location', lat: pos.lat, lon: pos.lon, source: 'geolocation' })
      setStatus('ready')
    } catch (err) {
      const message = err instanceof GeoError ? err.message : 'Could not determine your location.'
      const saved = readJSON<Location | null>('location', null)
      if (saved) {
        setLocation(saved)
        setNotice(`${message} Using your saved location instead.`)
      } else {
        setLocation(DEFAULT_LOCATION)
        setNotice(`${message} Showing New York, NY for now.`)
      }
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    const saved = readJSON<Location | null>('location', null)
    if (saved) {
      setLocation(saved)
      setStatus('ready')
    } else {
      loadDeviceLocation()
    }
  }, [loadDeviceLocation])

  const setManualLocation = useCallback(async (query: string) => {
    const result = await geocodeLocation(query)
    const loc: Location = { ...result, source: 'manual' }
    writeJSON('location', loc)
    setLocation(loc)
    setNotice(null)
    return loc
  }, [])

  const useDeviceLocationInstead = useCallback(() => {
    removeKey('location')
    loadDeviceLocation()
  }, [loadDeviceLocation])

  return { location, status, notice, setManualLocation, useDeviceLocationInstead, retryDeviceLocation: loadDeviceLocation }
}
