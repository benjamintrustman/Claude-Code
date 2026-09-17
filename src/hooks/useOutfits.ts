import { useCallback, useState } from 'react'
import type { Item, ProfileConfig } from '../types'
import type { CurrentWeather } from '../lib/weather'
import type { ValidatedOutfit } from '../lib/outfits'
import { OutfitApiError, suggestOutfits } from '../lib/outfits'

export type OutfitsStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useOutfits() {
  const [outfits, setOutfits] = useState<ValidatedOutfit[]>([])
  const [bottomsOffered, setBottomsOffered] = useState<string[]>([])
  const [status, setStatus] = useState<OutfitsStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (
      closet: Item[],
      profile: ProfileConfig,
      weather: CurrentWeather,
      occasion: string,
      anchors: Item[] = [],
    ) => {
      setStatus('loading')
      setError(null)
      try {
        const result = await suggestOutfits(closet, profile, weather, occasion, anchors)
        setOutfits(result.outfits)
        setBottomsOffered(result.bottomsOffered)
        setStatus('ready')
      } catch (err) {
        setError(err instanceof OutfitApiError ? err.message : 'Could not generate outfit suggestions.')
        setStatus('error')
      }
    },
    [],
  )

  return { outfits, bottomsOffered, status, error, generate }
}
