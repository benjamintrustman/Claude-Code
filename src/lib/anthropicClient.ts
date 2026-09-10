import Anthropic from '@anthropic-ai/sdk'

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Anthropic API key set. Add VITE_ANTHROPIC_API_KEY to .env and restart the dev server.')
  }
}

let client: Anthropic | null = null

export function getClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (!apiKey) {
    throw new MissingApiKeyError()
  }
  if (!client) {
    // An org-level key has to name the workspace to bill against; a
    // workspace-scoped key carries its own and needs no header. Optional, so
    // it stays out of the way for the common case.
    const workspaceId = import.meta.env.VITE_ANTHROPIC_WORKSPACE_ID as string | undefined
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
      ...(workspaceId ? { defaultHeaders: { 'anthropic-workspace-id': workspaceId } } : {}),
    })
  }
  return client
}
