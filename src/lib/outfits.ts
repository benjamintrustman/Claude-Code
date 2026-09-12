import Anthropic from '@anthropic-ai/sdk'
import type { Category, Item, ProfileConfig } from '../types'
import type { CurrentWeather } from './weather'
import { weatherCodeInfo } from './weatherCodes'
import { occasionDescription } from '../data/occasions'
import { MissingApiKeyError, getClient } from './anthropicClient'
import type { RecentOutfit } from './outfitHistory'
import { loadRecentOutfits, recentlyUsedNames, recordOutfits } from './outfitHistory'

const MODEL = 'claude-sonnet-5'

export type OutfitPiece = { category: string; item: string }
/** An alternative for one slot of an outfit — the shirt, knit, jacket or shoes. */
export type OutfitSwap = { replaces: string; item: string; note: string }
export type OutfitSuggestion = {
  title: string
  pieces: OutfitPiece[]
  why: string
  swaps?: OutfitSwap[]
}
export type ValidatedPiece = OutfitPiece & { valid: boolean }
export type ValidatedSwap = { replaces: string; item: string; note: string; category: string }
export type ValidatedOutfit = {
  title: string
  why: string
  pieces: ValidatedPiece[]
  swaps: ValidatedSwap[]
}
/** `bottomsOffered` is surfaced in the UI so the rotation is visible, not a claim. */
export type OutfitResult = { outfits: ValidatedOutfit[]; bottomsOffered: string[] }

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

// Punctuation, case and spacing vary in what comes back — "Toast sand/khaki
// wide-leg trouser" is the same garment as "Toast sand/khaki pleated wide-leg
// trouser". Compare on a flattened form so a cosmetic difference doesn't get
// reported to the user as an invented item.
function nameKey(name: string): string {
  return (
    name
      .normalize('NFD')
      // Strip accents, so "Berner Kuhl" still finds "Berner Kühl".
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  )
}

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'with', 'in', 'of'])

function tokens(key: string): string[] {
  return key.split(' ').filter((t) => t && !STOPWORDS.has(t))
}

/**
 * How much of the shorter name is present in the longer one. Catches a dropped
 * or added descriptor anywhere in the string — "Toast sand/khaki wide-leg
 * trouser" against "Toast sand/khaki pleated wide-leg trouser" — which plain
 * containment misses because the omission is in the middle.
 */
function overlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0
  const setB = new Set(b)
  const shared = a.filter((t) => setB.has(t)).length
  return shared / Math.min(a.length, b.length)
}

const MATCH_THRESHOLD = 0.8
const MIN_SHARED_TOKENS = 2

/**
 * Resolves a returned name to a real closet item, tolerating the cosmetic
 * differences that come back — case, punctuation, accents, a missing
 * adjective. Returns null only when nothing plausibly matches, so a genuine
 * invention is still reported rather than silently mapped onto something real.
 */
function resolveItem(name: string, closet: Item[]): Item | null {
  const key = nameKey(name)
  if (!key) return null

  const exact = closet.find((it) => nameKey(it.name) === key)
  if (exact) return exact

  const wanted = tokens(key)
  let best: { item: Item; score: number } | null = null

  for (const it of closet) {
    const candidate = tokens(nameKey(it.name))
    const shared = candidate.filter((t) => wanted.includes(t)).length
    if (shared < MIN_SHARED_TOKENS) continue
    const score = overlap(wanted, candidate)
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) {
      best = { item: it, score }
    }
  }

  return best?.item ?? null
}

function resolvePieces(pieces: OutfitPiece[], closet: Item[]): ValidatedPiece[] {
  const rank = new Map(CATEGORY_ORDER.map((c, i) => [c as string, i]))
  return pieces
    .map((p) => {
      const match = resolveItem(p.item, closet)
      return match
        ? // Use the closet's own name and category, so the card shows the real
          // item and the rotation history records a name it can match later.
          { item: match.name, category: match.category as string, valid: true }
        : { ...p, valid: false }
    })
    .sort((a, b) => (rank.get(a.category) ?? 99) - (rank.get(b.category) ?? 99))
}

/** Both ends of a swap have to be real, or it's not offerable. */
function resolveSwaps(
  swaps: OutfitSwap[] | undefined,
  pieces: ValidatedPiece[],
  closet: Item[],
): ValidatedSwap[] {
  if (!Array.isArray(swaps)) return []
  const inOutfit = new Set(pieces.filter((p) => p.valid).map((p) => p.item))

  return swaps.flatMap((s) => {
    if (typeof s?.replaces !== 'string' || typeof s?.item !== 'string') return []
    const target = resolveItem(s.replaces, closet)
    const replacement = resolveItem(s.item, closet)
    if (!target || !replacement) return []
    // A swap for a slot this outfit doesn't have is meaningless.
    if (!inOutfit.has(target.name)) return []
    if (target.name === replacement.name) return []
    return [
      {
        replaces: target.name,
        item: replacement.name,
        category: replacement.category as string,
        note: typeof s.note === 'string' ? s.note : '',
      },
    ]
  })
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
  // Real combinations beat adjectives: they show how this person actually
  // balances proportion and colour. Framed as evidence, not templates, so the
  // model reasons from them rather than replaying them back.
  const looks = profile.knownGoodLooks?.length
    ? `\n\nCombinations this person is known to wear and like:\n${profile.knownGoodLooks
        .map((l) => `- ${l}`)
        .join(
          '\n',
        )}\nTreat these as evidence of what works for them — the proportions, the colour pairings, the level of polish. Do not simply repeat them back; use them to judge whether something new is in character.`
    : ''
  return `You are a personal styling assistant for a wardrobe app called Fit Check. Suggest outfits built ONLY from clothes the user already owns — never invent or substitute items.

User's aesthetic: ${profile.aesthetic}${rules}${palette}${looks}

Every piece in this closet already meets the user's standards for fit, rise, and silhouette — they own it, so it passed. Never skip a piece because you cannot tell from its name whether it complies with some rule, and never limit yourself to the items whose names happen to state their cut. Treat the whole closet as equally wearable and judge only on colour, texture, formality, and weather.

Respond with ONLY a JSON array of exactly 3 outfits — no prose before or after, no markdown code fences. Each outfit object must have this exact shape:
{"title": "short punchy name", "pieces": [{"category": "Outerwear", "item": "exact item name from the closet list"}], "why": "one sentence on why this works for today's conditions", "swaps": [{"replaces": "exact name of a piece in this outfit", "item": "exact name of the alternative from the closet", "note": "when you would choose it instead"}]}

The "item" value must be copied verbatim from the closet list below — do not paraphrase, abbreviate, or invent items. Each of the 3 outfits should be a complete, wearable look appropriate for the occasion and today's weather.

Give each outfit 2 to 4 swaps: single-piece alternatives that keep the look intact. Offer them for any slot EXCEPT the bottom — the trouser or skirt anchors the outfit and never changes. Tops, layers, outerwear, footwear and accessories are all fair game, and the top is usually the most useful one to offer. Each swap must name a piece actually used in that outfit as "replaces", and its "note" should be a short, concrete reason to reach for it instead ("warmer if it turns", "dressier for the evening", "quieter against the print") rather than a restatement of what it is.

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

// Instructing the model to vary its trousers did not work — it kept returning
// the same favourites whatever the prompt said. The only reliable lever is
// what reaches the request: it cannot wear a trouser it was never shown.
//
// So each run offers a rotating subset of the bottoms, drawn from the ones not
// suggested lately. Two are assigned to specific outfits; the third outfit
// picks freely from the same short list, which keeps some judgement with the
// model without letting it fall back on the same pair every time.
const BOTTOMS_OFFERED = 5
const BOTTOMS_ASSIGNED = 2

function rotatingBottoms(
  closet: Item[],
  recentlyUsed: Set<string>,
): { offered: Item[]; assigned: Item[] } {
  const bottoms = closet.filter(isBottom)
  const offered = pickNeglected(bottoms, recentlyUsed, Math.min(BOTTOMS_OFFERED, bottoms.length))
  return { offered, assigned: offered.slice(0, BOTTOMS_ASSIGNED) }
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
  offered: Item[],
  assigned: Item[],
): string {
  const recentlyUsed = recentlyUsedNames(recent)
  const offeredIds = new Set(offered.map((it) => it.id))

  // Bottoms outside today's rotation are withheld from the list entirely, so
  // reaching for a favourite is not an option the model has.
  const closetLines = closet
    .filter((it) => !isBottom(it) || offeredIds.has(it.id))
    .map(
      (it) =>
        `- [${it.category}] ${it.name} (${it.color}${it.brand ? `, ${it.brand}` : ''})${
          it.note ? ` — ${it.note}` : ''
        }`,
    )
    .join('\n')
  const bottoms = assigned.map((it, i) => `- Outfit ${i + 1}: ${it.name}`).join('\n')
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

Occasion: ${occasion}${occasionDescription(occasion) ? ` — ${occasionDescription(occasion)}` : ''}
${recentBlock}
Build these two outfits around the bottom named, so the wardrobe rotates rather than repeating:
${bottoms}
The third outfit takes whichever remaining bottom from the closet list above suits it best. All three must use a different bottom.

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
): Promise<OutfitResult> {
  const eligible = eligibleCloset(closet)
  if (eligible.length === 0) {
    throw new OutfitApiError(
      "Your closet doesn't have any eligible pieces to suggest from yet — add some items first.",
    )
  }

  const recent = loadRecentOutfits(profile.id)
  const { offered, assigned } = rotatingBottoms(eligible, recentlyUsedNames(recent))

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
          content: buildUserPrompt(eligible, weather, occasion, recent, offered, assigned),
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

  const validated = parsed.map((outfit) => {
    const pieces = resolvePieces(outfit.pieces, closet)
    return {
      title: outfit.title,
      why: outfit.why,
      pieces,
      swaps: resolveSwaps(outfit.swaps, pieces, closet),
    }
  })

  recordOutfits(profile.id, validated)
  return { outfits: validated, bottomsOffered: offered.map((it) => it.name) }
}
