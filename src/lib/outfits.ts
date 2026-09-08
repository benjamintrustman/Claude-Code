import Anthropic from '@anthropic-ai/sdk'
import type { Item, ProfileConfig } from '../types'
import type { CurrentWeather } from './weather'
import { weatherCodeInfo } from './weatherCodes'
import { MissingApiKeyError, getClient } from './anthropicClient'

const MODEL = 'claude-sonnet-5'

export type OutfitPiece = { category: string; item: string }
export type OutfitSuggestion = { title: string; pieces: OutfitPiece[]; why: string }
export type ValidatedPiece = OutfitPiece & { valid: boolean }
export type ValidatedOutfit = { title: string; why: string; pieces: ValidatedPiece[] }

export class OutfitApiError extends Error {}

export function eligibleCloset(closet: Item[], profile: ProfileConfig): Item[] {
  return closet.filter((it) => {
    if (it.functional) return false
    if (
      it.category === 'Trousers' &&
      profile.minRise != null &&
      it.rise != null &&
      it.rise < profile.minRise
    ) {
      return false
    }
    return true
  })
}

function buildSystemPrompt(profile: ProfileConfig): string {
  const rules = profile.hardRules.map((r) => `- ${r}`).join('\n')
  const palette = profile.colorPalette
    ? `\n\nPreferred color palette: ${profile.colorPalette.join(', ')}`
    : ''
  return `You are a personal styling assistant for a wardrobe app called Fit Check. Suggest outfits built ONLY from clothes the user already owns — never invent or substitute items.

User's aesthetic: ${profile.aesthetic}

Hard rules (never violate these):
${rules}${palette}

Respond with ONLY a JSON array of exactly 3 outfits — no prose before or after, no markdown code fences. Each outfit object must have this exact shape:
{"title": "short punchy name", "pieces": [{"category": "Outerwear", "item": "exact item name from the closet list"}], "why": "one sentence on why this works for today's conditions"}

The "item" value must be copied verbatim from the closet list below — do not paraphrase, abbreviate, or invent items. Each of the 3 outfits should be a complete, wearable, visually distinct look appropriate for the occasion and today's weather.`
}

function buildUserPrompt(closet: Item[], weather: CurrentWeather, occasion: string): string {
  const closetLines = closet
    .map((it) => `- [${it.category}] ${it.name} (${it.color}${it.brand ? `, ${it.brand}` : ''})`)
    .join('\n')
  const condition = weatherCodeInfo(weather.code).label
  return `Closet (only these items are available to use):
${closetLines}

Today's weather: ${Math.round(weather.temp)}°F, feels like ${Math.round(weather.feelsLike)}°F, ${condition}, wind ${Math.round(weather.windSpeed)} mph, high ${Math.round(weather.high)}° / low ${Math.round(weather.low)}°.

Occasion: ${occasion}

Suggest 3 outfits.`
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

function isOutfitSuggestion(value: unknown): value is OutfitSuggestion {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (typeof v.title !== 'string' || typeof v.why !== 'string' || !Array.isArray(v.pieces)) {
    return false
  }
  return v.pieces.every((p) => {
    if (!p || typeof p !== 'object') return false
    const piece = p as Record<string, unknown>
    return typeof piece.category === 'string' && typeof piece.item === 'string'
  })
}

export async function suggestOutfits(
  closet: Item[],
  profile: ProfileConfig,
  weather: CurrentWeather,
  occasion: string,
): Promise<ValidatedOutfit[]> {
  const eligible = eligibleCloset(closet, profile)
  if (eligible.length === 0) {
    throw new OutfitApiError(
      "Your closet doesn't have any eligible pieces to suggest from yet — add some items first.",
    )
  }

  let response: Anthropic.Message
  try {
    const client = getClient()
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'low' },
      system: buildSystemPrompt(profile),
      messages: [{ role: 'user', content: buildUserPrompt(eligible, weather, occasion) }],
    })
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      throw new OutfitApiError(err.message)
    }
    if (err instanceof Anthropic.AuthenticationError) {
      throw new OutfitApiError('Anthropic API key was rejected. Check VITE_ANTHROPIC_API_KEY in .env.')
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new OutfitApiError('Rate limited by the Anthropic API. Try again in a moment.')
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new OutfitApiError('Network error — could not reach the Anthropic API. Check your connection.')
    }
    if (err instanceof Anthropic.APIError) {
      throw new OutfitApiError(`Anthropic API error (HTTP ${err.status}): ${err.message}`)
    }
    throw err
  }

  if (response.stop_reason === 'refusal') {
    throw new OutfitApiError('The model declined to respond to this request.')
  }

  if (response.stop_reason === 'max_tokens') {
    throw new OutfitApiError('The response was cut off before it finished. Try again.')
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text',
  )
  if (!textBlock) {
    throw new OutfitApiError('The model did not return a text response.')
  }

  let parsed: unknown
  try {
    parsed = extractJson(textBlock.text)
  } catch {
    throw new OutfitApiError("Could not parse the model's response as JSON.")
  }

  if (!Array.isArray(parsed) || !parsed.every(isOutfitSuggestion)) {
    throw new OutfitApiError('The model returned an unexpected response shape.')
  }

  const closetNames = new Set(closet.map((it) => it.name))
  return parsed.map((outfit) => ({
    title: outfit.title,
    why: outfit.why,
    pieces: outfit.pieces.map((p) => ({ ...p, valid: closetNames.has(p.item) })),
  }))
}
