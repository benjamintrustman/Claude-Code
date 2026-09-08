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
}

export type GapPriority = 'low' | 'medium' | 'high'

export type Gap = {
  id: string
  title: string
  note?: string
  priority: GapPriority
}

export type ProfileId = 'ben' | 'yona'

export type ProfileConfig = {
  id: ProfileId
  name: string
  aesthetic: string
  hardRules: string[]
  minRise?: number
  colorPalette?: string[]
}
