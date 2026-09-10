import type { ProfileId } from '../types'
import { readJSON, writeJSON } from './storage'

export type RecentOutfit = { pieces: string[]; at: number }

// Three runs' worth. Enough to break repetition without pinning the model
// away from good combinations forever.
const LIMIT = 9

function key(profileId: ProfileId) {
  return `recentOutfits:${profileId}`
}

export function loadRecentOutfits(profileId: ProfileId): RecentOutfit[] {
  return readJSON<RecentOutfit[]>(key(profileId), [])
}

export function recordOutfits(
  profileId: ProfileId,
  outfits: { pieces: { item: string }[] }[],
): void {
  const fresh: RecentOutfit[] = outfits.map((o) => ({
    pieces: o.pieces.map((p) => p.item),
    at: Date.now(),
  }))
  writeJSON(key(profileId), [...fresh, ...loadRecentOutfits(profileId)].slice(0, LIMIT))
}

export function recentlyUsedNames(recent: RecentOutfit[]): Set<string> {
  return new Set(recent.flatMap((o) => o.pieces))
}
