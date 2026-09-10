import Anthropic from '@anthropic-ai/sdk'
import type { Category, Item, ProfileConfig } from '../types'
import type { CurrentWeather } from './weather'
import { weatherCodeInfo } from './weatherCodes'
import { MissingApiKeyError, getClient } from './anthropicClient'
import type { RecentOutfit } from './outfitHistory'
import { loadRecentOutfits, recentlyUsedNames, recordOutfits } from './outfitHistory'

const MODEL = 'claude-sonnet-5'

export type OutfitPiece = { category: string; item: string }
export type OutfitSuggestion = { title: string; pieces: OutfitPiece[]; why: string }
export type ValidatedPiece = OutfitPiece & { valid: boolean }
export type ValidatedOutfit = { title: string; why: string; pieces: ValidatedPiece[] }

export class OutfitApiError extends Error {}

// The order pieces are read in: bottoms, base layer, shirt, knit, shoes,
// jacket, accessories. Sorted here rather than asked for in the prompt, so
// every card reads the same way no matter what order the model returns.
const CATEGORY_ORDER: Category[] = [
  'Trousers',
  'Skirt',
  'Basics/Tee',
  'Shirt',
  'Dress/Top',
  'Knitwear',
  'Footwear',
  'Overshirt',
  'Outerwear',
  'Belt',
  'Bag',
]

function orderPieces(pieces: ValidatedPiece[], closet: Item[]): ValidatedPiece[] {
  const rank = new Map(CATEGORY_ORDER.map((c, i) => [c as string, i]))
  const byName = new Map(closet.map((it) => [it.name, it]))
  // Prefer the closet's own category over whatever the model labelled it.
  const categoryOf = (p: ValidatedPiece) => byName.get(p.item)?.category ?? p.category
  return [...pieces]
    .map((p) => ({ ...p, category: categoryOf(p) }))
    .sort((a, b) => (rank.get(a.category) ?? 99) - (rank.get(b.category) ?? 99))
}

// Anything in the closet is fair game — owning it means it already works. The
// rise minimum is a buying rule, applied by the find checker, not here.
// Functional pieces stay out: they're chosen for utility, not for a look.
export function eligibleCloset(closet: Item[]): Item[] {
  return closet.filter((it) => !it.functional)
}

function buildSystemPrompt(profile: ProfileConfig): string {
  const rules = profile.hardRules.length
    ? `\n\nHard rules (never violate these):\n${profile.hardRules.map((r) => `- ${r}`).join('\n')}`
    : ''
  const palette = profile.colorPalette
    ? `\n\nPreferred color palette: ${profile.colorPalette.join(', ')}`
    : ''
  return `You are a personal styling assistant for a wardrobe app called Fit Check. Suggest outfits built ONLY from clothes the user already owns — never invent or substitute items.

User's aesthetic: ${profile.aesthetic}${rules}${palette}

Every piece in this closet already meets the user's standards for fit, rise, and silhouette — they own it, so it passed. Never skip a piece because you cannot tell from its name whether it complies with some rule, and never limit yourself to the items whose names happen to state their cut. Treat the whole closet as equally wearable and judge only on colour, texture, formality, and weather.

Respond with ONLY a JSON array of exactly 3 outfits — no prose before or after, no markdown code fences. Each outfit object must have this exact shape:
{"title": "short punchy name", "pieces": [{"category": "Outerwear", "item": "exact item name from the closet list"}], "why": "one sentence on why this works for today's conditions"}

The "item" value must be copied verbatim from the closet list below — do not paraphrase, abbreviate, or invent items. Each of the 3 outfits should be a complete, wearable look appropriate for the occasion and today's weather.

The three must be genuinely different, not variations on one idea: all three must use a DIFFERENT bottom (trouser or skirt), no two may share more than one piece, and they must not all use the same outerwear. Reach for different silhouettes and different corners of the closet. A wardrobe this size has many workable answers — a correct-but-predictable set of three is a worse response than three that each open up a different piece.`
}

// The local clock where the weather is, not where the browser is — a manually
// set location can sit in another timezone.
function localNow(timezone: string): { label: string; hour: number } {
  const now = new Date()
  try {
    const label = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now)
    const hour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        hourCycle: 'h23',
      }).format(now),
    )
    return { label, hour: Number.isFinite(hour) ? hour : now.getHours() }
  } catch {
    return {
      label: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      hour: now.getHours(),
    }
  }
}

// A 22° swing and a 4° swing call for completely different outfits even at the
// same current temperature, so say which way the day is heading.
function dayArcGuidance(weather: CurrentWeather, hour: number): string {
  const swing = Math.round(weather.high - weather.low)
  // Daily highs land mid-afternoon; past that the day is heading for the low.
  const warmingAhead = hour < 15

  if (swing >= 15) {
    return warmingAhead
      ? `It climbs roughly ${Math.round(weather.high - weather.temp)}° from here, so favor layers that come off cleanly and avoid committing to the heaviest outerwear.`
      : `It falls toward ${Math.round(weather.low)}° from here, so include a layer for the evening cool-down.`
  }
  if (swing <= 8) {
    return 'Conditions hold close to this all day, so dress for what it is right now.'
  }
  return warmingAhead
    ? 'It warms moderately from here, so a light sheddable layer beats a heavy one.'
    : 'It cools moderately from here, so keep a layer available for later.'
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const isBottom = (it: Item) => it.category === 'Trousers' || it.category === 'Skirt'

function pickNeglected(items: Item[], recentlyUsed: Set<string>, count: number): Item[] {
  const neglected = items.filter((it) => !recentlyUsed.has(it.name))
  const chosen = shuffle(neglected).slice(0, count)
  if (chosen.length < count) {
    const used = new Set(chosen.map((c) => c.id))
    chosen.push(...shuffle(items.filter((it) => !used.has(it.id))).slice(0, count - chosen.length))
  }
  return chosen
}

// Asking nicely for variety didn't work: the model kept returning its two or
// three favourite trousers. So the app now picks the bottoms itself, rotating
// through the ones it hasn't shown lately, and the model styles around them.
function assignBottoms(closet: Item[], recentlyUsed: Set<string>): Item[] {
  return pickNeglected(closet.filter(isBottom), recentlyUsed, 3)
}

// The prompt is otherwise byte-identical run to run, and this model takes no
// temperature, so the spotlight is where run-to-run variation comes from.
function spotlightPieces(closet: Item[], recentlyUsed: Set<string>): Item[] {
  return pickNeglected(closet.filter((it) => !isBottom(it)), recentlyUsed, 6)
}

function buildUserPrompt(
  closet: Item[],
  weather: CurrentWeather,
  occasion: string,
  recent: RecentOutfit[],
): string {
  const closetLines = closet
    .map((it) => `- [${it.category}] ${it.name} (${it.color}${it.brand ? `, ${it.brand}` : ''})`)
    .join('\n')
  const recentlyUsed = recentlyUsedNames(recent)
  const bottoms = assignBottoms(closet, recentlyUsed)
    .map((it, i) => `- Outfit ${i + 1}: ${it.name}`)
    .join('\n')
  const spotlight = spotlightPieces(closet, recentlyUsed)
    .map((it) => `- ${it.name}`)
    .join('\n')
  const recentBlock = recent.length
    ? `\nAlready suggested in the last few days — do not repeat these combinations, and don't lean on the same hero pieces again:\n${recent
        .map((o) => `- ${o.pieces.join(' + ')}`)
        .join('\n')}\n`
    : ''
  const condition = weatherCodeInfo(weather.code).label
  const { label: timeLabel, hour } = localNow(weather.timezone)
  const swing = Math.round(weather.high - weather.low)
  const precip = weather.precipitation > 0 ? `, ${weather.precipitation}" precipitation` : ''

  return `Closet (only these items are available to use):
${closetLines}

Right now (${timeLabel}): ${Math.round(weather.temp)}°F, feels like ${Math.round(weather.feelsLike)}°F, ${condition}, wind ${Math.round(weather.windSpeed)} mph${precip}.
Today's range: low ${Math.round(weather.low)}°F to high ${Math.round(weather.high)}°F — a ${swing}° swing.

Dress for the rest of the day, not just this moment. ${dayArcGuidance(weather, hour)}

Occasion: ${occasion}
${recentBlock}
Bottoms are assigned — build each outfit around the one named here, rotating the wardrobe rather than reaching for favourites:
${bottoms}
If an assigned bottom genuinely cannot work today (too warm, too formal, wrong for rain), substitute the nearest alternative and say why in that outfit's "why". Do that at most once across the three.

Other pieces that haven't come up recently — work at least two of them in, unless they truly don't suit today:
${spotlight}

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
  const eligible = eligibleCloset(closet)
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
      output_config: { effort: 'medium' },
      system: buildSystemPrompt(profile),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(eligible, weather, occasion, loadRecentOutfits(profile.id)),
        },
      ],
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
  const validated = parsed.map((outfit) => ({
    title: outfit.title,
    why: outfit.why,
    pieces: orderPieces(
      outfit.pieces.map((p) => ({ ...p, valid: closetNames.has(p.item) })),
      closet,
    ),
  }))

  recordOutfits(profile.id, validated)
  return validated
}
