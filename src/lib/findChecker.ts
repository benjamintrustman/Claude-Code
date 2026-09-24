import Anthropic from '@anthropic-ai/sdk'
import type { Gap, Item, ProfileConfig } from '../types'
import { getClient } from './anthropicClient'
import { apiErrorMessage, responseProblem } from './apiErrors'

const MODEL = 'claude-sonnet-5'

export type FindVerdictType = 'fills_gap' | 'redundant' | 'violates_rule' | 'no_gap'

export type FindVerdict = {
  verdict: FindVerdictType
  headline: string
  reasoning: string
  relatedGap?: string
}

export class FindCheckError extends Error {}

const VERDICT_TYPES: FindVerdictType[] = ['fills_gap', 'redundant', 'violates_rule', 'no_gap']

function buildSystemPrompt(profile: ProfileConfig, gaps: Gap[], closet: Item[]): string {
  // Buying rules apply here and only here — the closet is already vetted.
  const rules = [...profile.hardRules, ...(profile.purchaseRules ?? [])]
    .map((r) => `- ${r}`)
    .join('\n')
  const palette = profile.colorPalette
    ? `\n\nPreferred color palette: ${profile.colorPalette.join(', ')}`
    : ''
  const gapList = gaps.length
    ? gaps.map((g) => `- ${g.title}${g.note ? ` (${g.note})` : ''} [${g.priority} priority]`).join('\n')
    : '(no open gaps)'
  const closetList = closet
    .map((it) => `- [${it.category}] ${it.name} (${it.color})${it.note ? ` — ${it.note}` : ''}`)
    .join('\n')

  return `You are a blunt personal shopping advisor for a wardrobe app called Fit Check. The user is standing in a store describing something they're considering buying. Your job is to give a decisive, unambiguous verdict — never wishy-washy, never "it depends."

User's aesthetic: ${profile.aesthetic}

Hard rules (an item that clearly violates one of these is an automatic "violates_rule", no exceptions):
${rules}${palette}

Open gap list (what they're actively hunting for):
${gapList}

Current closet (for checking redundancy):
${closetList}

Respond with ONLY a JSON object, no prose before or after, no markdown code fences, in this exact shape:
{"verdict": "fills_gap" | "redundant" | "violates_rule" | "no_gap", "headline": "one blunt sentence, the verdict itself", "reasoning": "1-2 sentences of specific reasoning tied to their gaps, rules, or closet", "relatedGap": "the exact title of the matching gap from the list above, or null"}

Rules for choosing verdict:
- "violates_rule": the item clearly breaks one of the hard rules above. State which rule.
- "fills_gap": the item matches something on the open gap list. Set relatedGap to that gap's exact title.
- "redundant": the item is very similar to something already in the closet, and isn't on the gap list.
- "no_gap": none of the above — it's a fine item but not something they're hunting for and not clearly redundant.
Be decisive. If it's a close call, pick the strongest applicable verdict and say so plainly.`
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

function isFindVerdict(value: unknown): value is FindVerdict {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (typeof v.verdict !== 'string' || !VERDICT_TYPES.includes(v.verdict as FindVerdictType)) {
    return false
  }
  if (typeof v.headline !== 'string' || typeof v.reasoning !== 'string') return false
  if (v.relatedGap != null && typeof v.relatedGap !== 'string') return false
  return true
}

export async function checkFind(
  description: string,
  profile: ProfileConfig,
  gaps: Gap[],
  closet: Item[],
): Promise<FindVerdict> {
  if (!description.trim()) {
    throw new FindCheckError('Describe what you found first.')
  }

  let response: Anthropic.Message
  try {
    const client = getClient()
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: 'low' },
      system: buildSystemPrompt(profile, gaps, closet),
      messages: [{ role: 'user', content: description.trim() }],
    })
  } catch (err) {
    const message = apiErrorMessage(err)
    if (message) throw new FindCheckError(message)
    throw err
  }

  const problem = responseProblem(response)
  if (problem) throw new FindCheckError(problem)
  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')!

  let parsed: unknown
  try {
    parsed = extractJson(textBlock.text)
  } catch {
    throw new FindCheckError("Could not parse the model's response as JSON.")
  }

  if (!isFindVerdict(parsed)) {
    throw new FindCheckError('The model returned an unexpected response shape.')
  }

  return parsed
}
