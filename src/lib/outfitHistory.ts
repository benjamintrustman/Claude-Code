import type { ProfileId } from '../types'
import { readJSON, writeJSON } from './storage'

/** An outfit the user actually wore. Suggestions are not recorded — only this
 *  is, so the history describes the wardrobe rather than the model's output. */
export type WornOutfit = {
  title: string
  pieces: string[]
  occasion: string
  at: number
}

// Two separate appetites. Rotation only cares about the last week or so, but
// the record itself is evidence of what this person actually reaches for, and
// that is worth keeping long after it stops affecting today's suggestions.
const WORN_LIMIT = 60
const ROTATION_WINDOW = 9

function key(profileId: ProfileId) {
  return `wornOutfits:${profileId}`
}

export function loadWorn(profileId: ProfileId): WornOutfit[] {
  return readJSON<WornOutfit[]>(key(profileId), [])
}

export function recordWorn(profileId: ProfileId, outfit: Omit<WornOutfit, 'at'>): void {
  const entry: WornOutfit = { ...outfit, at: Date.now() }
  writeJSON(key(profileId), [entry, ...loadWorn(profileId)].slice(0, WORN_LIMIT))
}

/** Undo. Matched on timestamp, which is unique enough at human tapping speed. */
export function removeWorn(profileId: ProfileId, at: number): void {
  writeJSON(
    key(profileId),
    loadWorn(profileId).filter((o) => o.at !== at),
  )
}

/** The slice that feeds the prompt — recent enough to be worth avoiding. */
export function rotationWindow(worn: WornOutfit[]): WornOutfit[] {
  return worn.slice(0, ROTATION_WINDOW)
}

export function recentlyUsedNames(worn: WornOutfit[]): Set<string> {
  return new Set(worn.flatMap((o) => o.pieces))
}
