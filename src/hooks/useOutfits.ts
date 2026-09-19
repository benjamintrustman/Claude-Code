import { useCallback, useEffect, useRef, useState } from 'react'
import type { Item, ProfileConfig } from '../types'
import type { CurrentWeather } from '../lib/weather'
import type { ValidatedOutfit } from '../lib/outfits'
import { OutfitAbortedError, OutfitApiError, suggestOutfits } from '../lib/outfits'

export type OutfitsStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useOutfits() {
  const [outfits, setOutfits] = useState<ValidatedOutfit[]>([])
  const [bottomsOffered, setBottomsOffered] = useState<string[]>([])
  const [status, setStatus] = useState<OutfitsStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // A request that is no longer the current one must not write its result,
  // whether it was stopped or simply superseded by a newer press.
  const runIdRef = useRef(0)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  // Leaving Today mid-request should not leave a fetch running against a
  // component that is gone.
  useEffect(() => cancel, [cancel])

  const generate = useCallback(
    async (
      closet: Item[],
      profile: ProfileConfig,
      weather: CurrentWeather,
      occasion: string,
      anchors: Item[] = [],
    ) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const runId = ++runIdRef.current

      setStatus('loading')
      setError(null)
      try {
        const result = await suggestOutfits(
          closet,
          profile,
          weather,
          occasion,
          anchors,
          controller.signal,
        )
        if (runId !== runIdRef.current) return
        setOutfits(result.outfits)
        setBottomsOffered(result.bottomsOffered)
        setStatus('ready')
      } catch (err) {
        if (runId !== runIdRef.current) return
        if (err instanceof OutfitAbortedError) {
          // Stopping is a choice, not a failure. Keep whatever was on screen
          // before, so pressing Stop never costs the user their last set.
          setStatus(outfits.length ? 'ready' : 'idle')
          return
        }
        setError(
          err instanceof OutfitApiError ? err.message : 'Could not generate outfit suggestions.',
        )
        setStatus('error')
      }
    },
    [outfits.length],
  )

  return { outfits, bottomsOffered, status, error, generate, cancel }
}
