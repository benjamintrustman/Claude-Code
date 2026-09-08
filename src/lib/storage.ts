const PREFIX = 'fitcheck'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota) — fail silently, in-memory state still works
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}:${key}`)
  } catch {
    // ignore
  }
}
