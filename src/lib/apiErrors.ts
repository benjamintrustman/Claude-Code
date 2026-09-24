import Anthropic from '@anthropic-ai/sdk'
import { MissingApiKeyError } from './anthropicClient'

// The SDK puts the status and the whole JSON body into `message`, so showing it
// raw hands the user a wall of braces. Pull out the sentence meant for humans.
function apiMessage(err: { message: string }): string {
  const body = err.message.match(/\{[\s\S]*\}/)
  if (body) {
    try {
      const parsed = JSON.parse(body[0]) as { error?: { message?: string } }
      if (parsed.error?.message) return parsed.error.message
    } catch {
      // Not JSON after all — fall through to the raw message.
    }
  }
  return err.message
}

/**
 * A readable message for anything the Anthropic client can throw, or null when
 * the error is not one of its own — callers rethrow on null rather than
 * swallowing a bug as an API failure.
 *
 * Callers that support cancellation must check APIUserAbortError *before*
 * calling this: it extends APIError, so it would otherwise be reported as a
 * failure rather than a deliberate stop.
 */
export function apiErrorMessage(err: unknown): string | null {
  if (err instanceof MissingApiKeyError) return err.message
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Anthropic API key was rejected. Check VITE_ANTHROPIC_API_KEY in .env.'
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited by the Anthropic API. Try again in a moment.'
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Network error — could not reach the Anthropic API. Check your connection.'
  }
  if (err instanceof Anthropic.BadRequestError) {
    // The SDK has no class for an exhausted balance — a 400 covers every
    // malformed request too, and the distinction lives only in the prose. So
    // the type gets us here and the text gets us the rest of the way.
    if (/credit balance/i.test(err.message)) {
      return 'Your Anthropic API account is out of credit. Add credits at console.anthropic.com under Plans & Billing. This is the account the API key belongs to — a Claude subscription is billed separately and does not cover it.'
    }
    return `Anthropic rejected the request: ${apiMessage(err)}`
  }
  if (err instanceof Anthropic.APIError) {
    return `Anthropic API error (HTTP ${err.status}): ${apiMessage(err)}`
  }
  return null
}

/** Shared handling for the ways a response can arrive unusable. */
export function responseProblem(response: Anthropic.Message): string | null {
  if (response.stop_reason === 'refusal') return 'The model declined to respond to this request.'
  if (response.stop_reason === 'max_tokens') {
    return 'The response was cut off before it finished. Try again.'
  }
  if (!response.content.some((b) => b.type === 'text')) {
    return 'The model did not return a text response.'
  }
  return null
}
