import type { Category, Gap, GapPriority, Item } from '../types'
import { CATEGORIES } from '../types'

export type TransferPayload = {
  version: 1
  profile: string
  exportedAt: string
  items: Omit<Item, 'id'>[]
  gaps: Omit<Gap, 'id'>[]
}

export type ParsedTransfer = {
  items: Omit<Item, 'id'>[]
  gaps: Omit<Gap, 'id'>[]
  /** Non-fatal problems, so a mostly-good paste still imports. */
  warnings: string[]
}

export class TransferError extends Error {}

export function exportPayload(profileName: string, items: Item[], gaps: Gap[]): string {
  const payload: TransferPayload = {
    version: 1,
    profile: profileName,
    exportedAt: new Date().toISOString(),
    // ids are per-device and meaningless elsewhere, so they're left out.
    items: items.map(({ id: _id, ...rest }) => rest),
    gaps: gaps.map(({ id: _id, ...rest }) => rest),
  }
  return JSON.stringify(payload, null, 2)
}

// Written by hand or by Claude from photos, so category names arrive in
// whatever form felt natural. Map the common ones rather than rejecting.
const CATEGORY_ALIASES: Record<string, Category> = {
  pants: 'Trousers',
  trouser: 'Trousers',
  jeans: 'Trousers',
  bottoms: 'Trousers',
  skirts: 'Skirt',
  top: 'Dress/Top',
  tops: 'Dress/Top',
  blouse: 'Dress/Top',
  dress: 'Dress/Top',
  shirts: 'Shirt',
  buttonup: 'Shirt',
  'button-up': 'Shirt',
  tee: 'Basics/Tee',
  't-shirt': 'Basics/Tee',
  tshirt: 'Basics/Tee',
  basics: 'Basics/Tee',
  sweater: 'Knitwear',
  knit: 'Knitwear',
  jumper: 'Knitwear',
  cardigan: 'Knitwear',
  jacket: 'Outerwear',
  coat: 'Outerwear',
  outer: 'Outerwear',
  overshirts: 'Overshirt',
  shacket: 'Overshirt',
  shoes: 'Footwear',
  shoe: 'Footwear',
  boots: 'Footwear',
  sneakers: 'Footwear',
  bags: 'Bag',
  belts: 'Belt',
}

function normalizeCategory(raw: unknown): Category | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  const exact = CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase())
  if (exact) return exact
  return CATEGORY_ALIASES[trimmed.toLowerCase()] ?? null
}

function normalizePriority(raw: unknown): GapPriority {
  const value = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return value === 'high' || value === 'low' ? value : 'medium'
}

function asNumber(raw: unknown): number | undefined {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

/**
 * Deliberately forgiving: accepts a full export, a bare array of items, or
 * `{items: []}`, and skips bad rows with a warning rather than failing the
 * whole paste. A wardrobe transcribed from photos will always have some mess
 * in it, and losing 40 good rows over one bad one is the wrong trade.
 */
export function parseTransfer(text: string): ParsedTransfer {
  const trimmed = text.trim()
  if (!trimmed) throw new TransferError('Nothing to import — paste your closet data first.')

  // Tolerate the ```json fences Claude wraps code blocks in.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  let data: unknown
  try {
    data = JSON.parse(fenced ? fenced[1] : trimmed)
  } catch {
    throw new TransferError(
      "That doesn't look like valid JSON. Paste the whole block, including the opening { or [.",
    )
  }

  const root = Array.isArray(data) ? { items: data } : (data as Record<string, unknown>)
  const rawItems = Array.isArray(root.items) ? root.items : []
  const rawGaps = Array.isArray(root.gaps) ? root.gaps : []

  if (!rawItems.length && !rawGaps.length) {
    throw new TransferError('No items or gaps found. Expected an "items" array.')
  }

  const warnings: string[] = []
  const items: Omit<Item, 'id'>[] = []

  rawItems.forEach((raw, i) => {
    const row = (raw ?? {}) as Record<string, unknown>
    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) {
      warnings.push(`Item ${i + 1} skipped — no name.`)
      return
    }
    const category = normalizeCategory(row.category)
    if (!category) {
      warnings.push(`"${name}" skipped — unrecognised category ${JSON.stringify(row.category)}.`)
      return
    }
    const rise = asNumber(row.rise)
    items.push({
      name,
      category,
      color: typeof row.color === 'string' ? row.color.trim() : '',
      brand: typeof row.brand === 'string' && row.brand.trim() ? row.brand.trim() : undefined,
      rise: category === 'Trousers' ? rise : undefined,
      functional: row.functional === true,
      photo: typeof row.photo === 'string' && row.photo.startsWith('data:') ? row.photo : undefined,
    })
  })

  const gaps: Omit<Gap, 'id'>[] = []
  rawGaps.forEach((raw, i) => {
    const row = (raw ?? {}) as Record<string, unknown>
    const title = typeof row.title === 'string' ? row.title.trim() : ''
    if (!title) {
      warnings.push(`Gap ${i + 1} skipped — no title.`)
      return
    }
    gaps.push({
      title,
      note: typeof row.note === 'string' && row.note.trim() ? row.note.trim() : undefined,
      priority: normalizePriority(row.priority),
    })
  })

  if (!items.length && !gaps.length) {
    throw new TransferError('Nothing usable found — every row was missing a name or category.')
  }

  return { items, gaps, warnings }
}
