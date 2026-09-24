import type { ProfileConfig, ProfileId } from '../types'
import { PROFILES, PROFILE_ORDER } from '../data/profiles'
import { readJSON, removeKey, writeJSON } from './storage'

const CUSTOM_KEY = 'customProfiles'

export function closetKey(id: ProfileId) {
  return `closet:${id}`
}
export function gapsKey(id: ProfileId) {
  return `gaps:${id}`
}
export function wornKey(id: ProfileId) {
  return `wornOutfits:${id}`
}

const builtIns = (): ProfileConfig[] => PROFILE_ORDER.map((id) => ({ ...PROFILES[id], builtIn: true }))

export function loadCustomProfiles(): ProfileConfig[] {
  return readJSON<ProfileConfig[]>(CUSTOM_KEY, [])
}

/** Built-ins first, then whoever has been added since. */
export function allProfiles(): ProfileConfig[] {
  return [...builtIns(), ...loadCustomProfiles()]
}

export function findProfile(id: ProfileId): ProfileConfig | null {
  return allProfiles().find((p) => p.id === id) ?? null
}

function slug(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'profile'
  )
}

export function createProfile(name: string): ProfileConfig {
  const taken = new Set(allProfiles().map((p) => p.id))
  const base = slug(name)
  let id = base
  for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`

  // Deliberately bare. The setup interview fills this in, and an invented
  // aesthetic would be worse than none — the model would style someone who
  // does not exist.
  const profile: ProfileConfig = { id, name: name.trim(), aesthetic: '', hardRules: [] }
  writeJSON(CUSTOM_KEY, [...loadCustomProfiles(), profile])
  return profile
}

export function updateProfile(id: ProfileId, patch: Partial<ProfileConfig>): ProfileConfig | null {
  const custom = loadCustomProfiles()
  const i = custom.findIndex((p) => p.id === id)
  // Built-ins are code, not data. Editing one here would be silently undone by
  // the next pull, so it is refused rather than half-honoured.
  if (i === -1) return null
  const next = { ...custom[i], ...patch, id: custom[i].id }
  writeJSON(CUSTOM_KEY, custom.map((p, n) => (n === i ? next : p)))
  return next
}

export function deleteProfile(id: ProfileId): boolean {
  const custom = loadCustomProfiles()
  if (!custom.some((p) => p.id === id)) return false
  writeJSON(
    CUSTOM_KEY,
    custom.filter((p) => p.id !== id),
  )
  // Everything keyed to that person goes with them.
  removeKey(closetKey(id))
  removeKey(gapsKey(id))
  removeKey(wornKey(id))
  return true
}
