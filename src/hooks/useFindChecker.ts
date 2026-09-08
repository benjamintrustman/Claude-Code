import { useCallback, useState } from 'react'
import type { Gap, Item, ProfileConfig } from '../types'
import type { FindVerdict } from '../lib/findChecker'
import { FindCheckError, checkFind } from '../lib/findChecker'

export type FindCheckStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useFindChecker() {
  const [verdict, setVerdict] = useState<FindVerdict | null>(null)
  const [status, setStatus] = useState<FindCheckStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(
    async (description: string, profile: ProfileConfig, gaps: Gap[], closet: Item[]) => {
      setStatus('loading')
      setError(null)
      try {
        const result = await checkFind(description, profile, gaps, closet)
        setVerdict(result)
        setStatus('ready')
      } catch (err) {
        setError(err instanceof FindCheckError ? err.message : 'Could not check this find.')
        setStatus('error')
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setVerdict(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { verdict, status, error, check, reset }
}
