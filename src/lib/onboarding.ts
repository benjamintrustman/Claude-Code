import Anthropic from '@anthropic-ai/sdk'
import type { Category, Item, ProfileConfig } from '../types'
import { CATEGORIES } from '../types'
import { getClient } from './anthropicClient'
import { apiErrorMessage, responseProblem } from './apiErrors'

const MODEL = 'claude-sonnet-5'

export class OnboardingError extends Error {}

export type SetupAnswers = {
  style: string
  neverWear: string
  fitNotes: string
  colorNotes: string
}

/** A closet row as drafted, before anyone has checked it. */
export type DraftItem = {
  name: string
  category: Category
  color: string
  note?: string
  /** Colour is the field a description is most likely to get wrong, and a wrong
   *  colour quietly poisons the value bands. Flagged so review can foreground it. */
  colorUncertain?: boolean
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

async function ask(system: string, user: string, effort: 'low' | 'medium'): Promise<unknown> {
  let response: Anthropic.Message
  try {
    const client = getClient()
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort },
      system,
      messages: [{ role: 'user', content: user }],
    })
  } catch (err) {
    const message = apiErrorMessage(err)
    if (message) throw new OnboardingError(message)
    throw err
  }
  const problem = responseProblem(response)
  if (problem) throw new OnboardingError(problem)
  const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')!.text
  try {
    return extractJson(text)
  } catch {
    throw new OnboardingError("Could not read the model's response. Try again.")
  }
}

const PROFILE_SYSTEM = `You turn a few sentences about how someone dresses into a structured style profile for a wardrobe app.

Respond with ONLY a JSON object, no prose and no code fences:
{"aesthetic": "...", "hardRules": ["..."], "purchaseRules": ["..."], "colorPalette": ["..."]}

- "aesthetic" is two or three sentences in the third person describing how this person dresses — the overall feel, the colours they lean on, the silhouettes. Write what they told you, richer and more specific, but never invent a designer, a body measurement, or a preference they did not express.
- "hardRules" govern what they wear: things they will not put on, and anything about contrast or colour vision that affects how an outfit reads. Leave it empty rather than inventing rules.
- "purchaseRules" govern buying only — fit, rise, cut, heel height. Rules about what to acquire, not what to wear today.
- "colorPalette" lists the colour families they actually wear, grouped as short comma-separated strings. Omit the field entirely if they said nothing useful about colour.

Be conservative. An empty array is far better than a rule this person never stated — a wrong rule silently distorts every outfit they are shown.`

export async function buildProfileFromAnswers(
  name: string,
  answers: SetupAnswers,
): Promise<Partial<ProfileConfig>> {
  const parts = [
    `Name: ${name}`,
    `How they describe their style: ${answers.style.trim() || '(nothing said)'}`,
    `Things they never wear: ${answers.neverWear.trim() || '(nothing said)'}`,
    `Fit and cut they care about: ${answers.fitNotes.trim() || '(nothing said)'}`,
    `Colour notes, including any colour vision considerations: ${answers.colorNotes.trim() || '(nothing said)'}`,
  ]
  const parsed = await ask(PROFILE_SYSTEM, parts.join('\n'), 'medium')
  if (!parsed || typeof parsed !== 'object') {
    throw new OnboardingError('The model returned an unexpected response shape.')
  }
  const v = parsed as Record<string, unknown>
  const strings = (x: unknown): string[] =>
    Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : []
  if (typeof v.aesthetic !== 'string' || !v.aesthetic.trim()) {
    throw new OnboardingError('The model did not describe a style. Try saying a little more.')
  }
  const palette = strings(v.colorPalette)
  return {
    aesthetic: v.aesthetic.trim(),
    hardRules: strings(v.hardRules),
    purchaseRules: strings(v.purchaseRules),
    ...(palette.length ? { colorPalette: palette } : {}),
  }
}

const CLOSET_SYSTEM = `You turn someone's description of their wardrobe into structured closet rows for an app.

Respond with ONLY a JSON array, no prose and no code fences. Each row:
{"name": "...", "category": "...", "color": "...", "note": "...", "colorUncertain": true}

- "category" MUST be exactly one of: ${CATEGORIES.join(', ')}.
- "name" is how this person would recognise the piece — the words they used, tidied. Do not invent brands, and do not pad a plain description into a fake product name. "Black jeans" is a good name.
- "color" is an ordinary colour word, not a marketing name. Where they say how dark something is, keep that: "dark brown" and "tan" are different pieces of information and the app relies on the difference.
- "colorUncertain" is true whenever you inferred the colour rather than being told it. Be honest here; a guessed colour that looks confident is worse than one marked uncertain.
- "note" only when they said something about how a piece is worn or what it is for. Omit it otherwise.

When they give a count — "four white tees", "a couple of black jeans" — produce that many separate rows, numbered only if they are genuinely different. When a count is vague ("a bunch of"), produce three and mark the colour uncertain.

Never invent a piece they did not mention. It is better to return five accurate rows than fifteen with ten guesses.`

export async function draftClosetFromText(description: string): Promise<DraftItem[]> {
  if (!description.trim()) throw new OnboardingError('Describe what you own first.')
  const parsed = await ask(CLOSET_SYSTEM, description.trim(), 'low')
  if (!Array.isArray(parsed)) {
    throw new OnboardingError('The model returned an unexpected response shape.')
  }
  const valid = new Set<string>(CATEGORIES)
  const rows: DraftItem[] = []
  for (const row of parsed) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    // A category outside the list would render as an unfilterable item, so the
    // row is kept and parked rather than dropped — the reviewer can fix it.
    const category = (typeof r.category === 'string' && valid.has(r.category) ? r.category : 'Shirt') as Category
    if (typeof r.name !== 'string' || !r.name.trim()) continue
    rows.push({
      name: r.name.trim(),
      category,
      color: typeof r.color === 'string' ? r.color.trim() : '',
      ...(typeof r.note === 'string' && r.note.trim() ? { note: r.note.trim() } : {}),
      colorUncertain:
        r.colorUncertain === true ||
        typeof r.color !== 'string' ||
        !r.color.trim() ||
        !(typeof r.category === 'string' && valid.has(r.category)),
    })
  }
  if (rows.length === 0) {
    throw new OnboardingError('Nothing usable came back. Try describing a few pieces more plainly.')
  }
  return rows
}

/** Rows the closet already holds, matched loosely on name. */
export function dedupe(rows: DraftItem[], closet: Item[]): DraftItem[] {
  const have = new Set(closet.map((it) => it.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()))
  return rows.filter((r) => !have.has(r.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()))
}
