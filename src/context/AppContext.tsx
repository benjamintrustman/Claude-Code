import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Gap, Item, ProfileConfig, ProfileId } from '../types'
import { seedCloset, seedGaps } from '../data/seed'
import { readJSON, writeJSON } from '../lib/storage'
import {
  allProfiles,
  closetKey,
  createProfile as createProfileRecord,
  deleteProfile as deleteProfileRecord,
  findProfile,
  gapsKey,
  updateProfile as updateProfileRecord,
} from '../lib/profileStore'

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type AppState = {
  profileId: ProfileId
  setProfileId: (id: ProfileId) => void
  profile: ProfileConfig
  profiles: ProfileConfig[]
  createProfile: (name: string) => ProfileConfig
  updateProfile: (patch: Partial<ProfileConfig>) => void
  deleteProfile: (id: ProfileId) => void
  closet: Item[]
  addItem: (item: Omit<Item, 'id'>) => void
  updateItem: (id: string, patch: Partial<Item>) => void
  deleteItem: (id: string) => void
  gaps: Gap[]
  addGap: (gap: Omit<Gap, 'id'>) => void
  updateGap: (id: string, patch: Partial<Gap>) => void
  deleteGap: (id: string) => void
  replaceCloset: (items: Omit<Item, 'id'>[], gaps: Omit<Gap, 'id'>[]) => void
  resetToSeed: () => void
}

const AppContext = createContext<AppState | null>(null)

function loadCloset(profileId: ProfileId): Item[] {
  return readJSON<Item[] | null>(closetKey(profileId), null) ?? seedCloset(profileId)
}
function loadGaps(profileId: ProfileId): Gap[] {
  return readJSON<Gap[] | null>(gapsKey(profileId), null) ?? seedGaps(profileId)
}

type ProfileData = {
  profileId: ProfileId
  closet: Item[]
  gaps: Gap[]
}

/** Falls back to the first profile that exists, so a deleted or renamed active
 *  profile cannot leave the app pointing at nothing. */
function resolveActive(id: ProfileId): ProfileId {
  return findProfile(id) ? id : (allProfiles()[0]?.id ?? 'ben')
}

function loadProfileData(profileId: ProfileId): ProfileData {
  return { profileId, closet: loadCloset(profileId), gaps: loadGaps(profileId) }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProfileData>(() =>
    loadProfileData(resolveActive(readJSON<ProfileId>('activeProfile', 'ben'))),
  )
  const [profiles, setProfiles] = useState<ProfileConfig[]>(() => allProfiles())
  const { profileId, closet, gaps } = data

  const setProfileId = useCallback((id: ProfileId) => {
    writeJSON('activeProfile', id)
    setData(loadProfileData(id))
  }, [])

  const createProfile = useCallback((name: string) => {
    const created = createProfileRecord(name)
    setProfiles(allProfiles())
    writeJSON('activeProfile', created.id)
    setData(loadProfileData(created.id))
    return created
  }, [])

  const updateProfile = useCallback(
    (patch: Partial<ProfileConfig>) => {
      if (updateProfileRecord(profileId, patch)) setProfiles(allProfiles())
    },
    [profileId],
  )

  const deleteProfile = useCallback(
    (id: ProfileId) => {
      if (!deleteProfileRecord(id)) return
      const remaining = allProfiles()
      setProfiles(remaining)
      if (id === profileId) {
        const next = remaining[0]?.id ?? 'ben'
        writeJSON('activeProfile', next)
        setData(loadProfileData(next))
      }
    },
    [profileId],
  )

  useEffect(() => {
    writeJSON(closetKey(profileId), closet)
  }, [profileId, closet])

  useEffect(() => {
    writeJSON(gapsKey(profileId), gaps)
  }, [profileId, gaps])

  const setCloset = useCallback((updater: (prev: Item[]) => Item[]) => {
    setData((prev) => ({ ...prev, closet: updater(prev.closet) }))
  }, [])

  const setGaps = useCallback((updater: (prev: Gap[]) => Gap[]) => {
    setData((prev) => ({ ...prev, gaps: updater(prev.gaps) }))
  }, [])

  const addItem = useCallback(
    (item: Omit<Item, 'id'>) => {
      setCloset((prev) => [...prev, { ...item, id: newId() }])
    },
    [setCloset],
  )

  const updateItem = useCallback(
    (id: string, patch: Partial<Item>) => {
      setCloset((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    },
    [setCloset],
  )

  const deleteItem = useCallback(
    (id: string) => {
      setCloset((prev) => prev.filter((it) => it.id !== id))
    },
    [setCloset],
  )

  const addGap = useCallback(
    (g: Omit<Gap, 'id'>) => {
      setGaps((prev) => [...prev, { ...g, id: newId() }])
    },
    [setGaps],
  )

  const updateGap = useCallback(
    (id: string, patch: Partial<Gap>) => {
      setGaps((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
    },
    [setGaps],
  )

  const deleteGap = useCallback(
    (id: string) => {
      setGaps((prev) => prev.filter((g) => g.id !== id))
    },
    [setGaps],
  )

  const replaceCloset = useCallback(
    (items: Omit<Item, 'id'>[], incomingGaps: Omit<Gap, 'id'>[]) => {
      setData((prev) => ({
        ...prev,
        closet: items.map((it) => ({ ...it, id: newId() })),
        gaps: incomingGaps.map((g) => ({ ...g, id: newId() })),
      }))
    },
    [],
  )

  const resetToSeed = useCallback(() => {
    setData((prev) => ({
      ...prev,
      closet: seedCloset(prev.profileId),
      gaps: seedGaps(prev.profileId),
    }))
  }, [])

  const value = useMemo<AppState>(
    () => ({
      profileId,
      setProfileId,
      profile: profiles.find((p) => p.id === profileId) ?? profiles[0],
      profiles,
      createProfile,
      updateProfile,
      deleteProfile,
      closet,
      addItem,
      updateItem,
      deleteItem,
      gaps,
      addGap,
      updateGap,
      deleteGap,
      replaceCloset,
      resetToSeed,
    }),
    [profileId, profiles, closet, gaps, setProfileId, createProfile, updateProfile, deleteProfile, addItem, updateItem, deleteItem, addGap, updateGap, deleteGap, replaceCloset, resetToSeed],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
