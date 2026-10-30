import type { Item } from '../types'

/** Same flattening the outfit resolver uses, so "Berner Kuhl" finds "Kühl". */
function flatten(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Ranked matches for a part-typed name. Deliberately looser than the resolver
 * used on model output: there, a weak match must fail so an invented item is
 * still reported. Here a person is typing a shorthand for something they own
 * and will pick from what comes back, so "jacques" should find the hiker.
 */
export function searchCloset(query: string, closet: Item[], limit = 8): Item[] {
  const terms = flatten(query).split(' ').filter(Boolean)
  if (!terms.length) return []

  const scored: { item: Item; score: number }[] = []
  for (const item of closet) {
    const hay = `${flatten(item.name)} ${flatten(item.category)} ${flatten(item.color)}`
    // Every term has to appear somewhere, so adding a word narrows rather than
    // widens — the behaviour a search box is expected to have.
    if (!terms.every((t) => hay.includes(t))) continue
    const name = flatten(item.name)
    // Prefer matches in the name, and earlier in it, over ones that only hit
    // the category or colour.
    const inName = terms.filter((t) => name.includes(t)).length
    const position = Math.min(...terms.map((t) => (name.indexOf(t) + 1 || 999)))
    scored.push({ item, score: inName * 1000 - position })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item)
}

/** `yyyy-mm-dd` from a date input, read in local time. Parsing the string
 *  directly gives UTC midnight, which is the day before in any western
 *  timezone — noon sidesteps that and every daylight-saving edge with it. */
export function localDate(value: string): number | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12).getTime()
}

/** Today as `yyyy-mm-dd` in local time, for a date input's value and max. */
export function todayValue(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
