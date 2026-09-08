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
    client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  }
  return client
}
