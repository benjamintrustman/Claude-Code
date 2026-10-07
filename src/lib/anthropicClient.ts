import Anthropic from '@anthropic-ai/sdk'
import { loadStoredKey } from './apiKey'

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Anthropic API key set. Add one under the settings icon, top right.')
  }
}

let client: Anthropic | null = null
let clientKey: string | null = null

/** A key entered in the app wins over the build-time one, so rotating it means
 *  pasting rather than editing a file and restarting the server. */
function currentKey(): string | undefined {
  return loadStoredKey() ?? (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined)
}

export function hasApiKey(): boolean {
  return Boolean(currentKey())
}

export function getClient(): Anthropic {
  const apiKey = currentKey()
  if (!apiKey) {
    throw new MissingApiKeyError()
  }
  // Rebuilt whenever the key changes. Without this the first key entered would
  // be cached for the life of the page and a replacement would silently do
  // nothing — the exact failure the settings screen exists to prevent.
  if (!client || clientKey !== apiKey) {
    // An org-level key has to name the workspace to bill against; a
    // workspace-scoped key carries its own and needs no header. Optional, so
    // it stays out of the way for the common case.
    const workspaceId = import.meta.env.VITE_ANTHROPIC_WORKSPACE_ID as string | undefined
    clientKey = apiKey
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
      ...(workspaceId ? { defaultHeaders: { 'anthropic-workspace-id': workspaceId } } : {}),
    })
  }
  return client
}
