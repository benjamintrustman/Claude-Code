import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'apiKey'

/** The key entered in the app, if any. Browser-only — it never leaves this
 *  device, and it is no more exposed than the build-time one it replaces. */
export function loadStoredKey(): string | null {
  const stored = readJSON<string | null>(KEY, null)
  return stored && stored.trim() ? stored.trim() : null
}

export function saveStoredKey(key: string): void {
  writeJSON(KEY, key.trim())
}

export function clearStoredKey(): void {
  removeKey(KEY)
}

/** Enough to recognise which key is in use without printing it. */
export function maskKey(key: string): string {
  return key.length <= 10 ? '••••' : `${key.slice(0, 7)}…${key.slice(-4)}`
}

/** Pasting from a terminal routinely drags in neighbouring text — one key
 *  arrived 324 characters long. Worth saying before a request fails. */
export function keyWarning(key: string): string | null {
  const k = key.trim()
  if (!k) return null
  if (/\s/.test(k)) return 'That contains a space or line break — it looks like more than just the key got copied.'
  if (!k.startsWith('sk-ant-')) return "Anthropic keys start with “sk-ant-”. This may be truncated or from somewhere else."
  if (k.length > 200) return `That is ${k.length} characters, which is longer than a key. Check nothing extra came along with it.`
  return null
}
