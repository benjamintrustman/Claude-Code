export type Category =
  | 'Outerwear'
  | 'Overshirt'
  | 'Shirt'
  | 'Knitwear'
  | 'Basics/Tee'
  | 'Trousers'
  | 'Skirt'
  | 'Dress/Top'
  | 'Footwear'
  | 'Bag'
  | 'Belt'

export const CATEGORIES: Category[] = [
  'Outerwear',
  'Overshirt',
  'Shirt',
  'Knitwear',
  'Basics/Tee',
  'Trousers',
  'Skirt',
  'Dress/Top',
  'Footwear',
  'Bag',
  'Belt',
]

export type Item = {
  id: string
  name: string
  category: Category
  color: string
  brand?: string
  rise?: number // trousers only, inches
  functional?: boolean // excluded from style suggestions (e.g. a technical puffer)
  photo?: string // optional base64/blob
  /** How this specific piece wants to be worn — "fitted tops only, no tuck",
   *  "statement shoe", "works best with simpler outfits". Passed to the model. */
  note?: string
}

export type GapPriority = 'low' | 'medium' | 'high'

export type Gap = {
  id: string
  title: string
  note?: string
  priority: GapPriority
}

export type LocationSource = 'geolocation' | 'manual' | 'default'

export type Location = {
  label: string
  lat: number
  lon: number
  source: LocationSource
}

export type ProfileId = 'ben' | 'yona'

export type ProfileConfig = {
  id: ProfileId
  name: string
  aesthetic: string
  /** Rules that govern wearing what you own — applied to outfit suggestions and to new finds. */
  hardRules: string[]
  /** Rules that only govern buying. Anything already in the closet has passed these. */
  purchaseRules?: string[]
  /** Minimum trouser rise, in inches. Used when judging a potential purchase. */
  minRise?: number
  colorPalette?: string[]
  /** The closet's colours sorted by how light or dark they read, rather than by
   *  hue. For a colourblind wearer this is the axis that actually separates
   *  pieces, so the prompt reasons in value and not just in colour names. */
  valueBands?: { light: string[]; mid: string[]; dark: string[] }
  /** Combinations this person is known to actually wear. Evidence of taste,
   *  far more useful to the model than an adjective like "boho". */
  knownGoodLooks?: string[]
}
