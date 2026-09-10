import type { ProfileConfig, ProfileId } from '../types'

export const PROFILES: Record<ProfileId, ProfileConfig> = {
  ben: {
    id: 'ben',
    name: 'Ben',
    aesthetic:
      'Worn European Workwear — Copenhagen / Forum Store sensibility. Earthy, understated, heritage-leaning, artisanal. Warm earth tones: camel, tan, terracotta, tobacco, olive, sage, brown. Brass hardware, workwear construction details. 5\'8", 28" inseam, proportionally long torso. Red-green colorblind with some blue-purple confusion — dark saturated tones (deep navy, dark olive, dark brown) compress into ambiguity against each other, so outfits should avoid stacking them and prefer contrast in value, not just hue.',
    hardRules: [
      'Avoid stacking multiple dark saturated tones (deep navy, dark olive, dark brown) in one outfit — prefer contrast in value, not just hue',
    ],
    purchaseRules: [
      'Trouser rise minimum 13.5", ideally 14"+',
      'Wide-leg only — no slim, no skinny',
      'No cropped or high-water hems; full break preferred',
      'No loafers',
    ],
    minRise: 13.5,
  },
  yona: {
    id: 'yona',
    name: 'Yona',
    aesthetic:
      'Earthy, organic, casual, boho. Print-forward — botanical, floral, polka dot, check. Relaxed layered silhouettes. Warm-dominant mixed color palette from a professional color analysis.',
    hardRules: [],
    purchaseRules: ['No heels; occasional slight lift only'],
    colorPalette: [
      'silver/metallic',
      'blush pink',
      'burgundy/wine',
      'teal',
      'dark teal',
      'orange/rust',
      'brown/camel',
      'coral/salmon',
      'red',
      'pink-red',
      'purple/violet',
      'pink',
      'emerald/kelly green',
    ],
  },
}

export const PROFILE_ORDER: ProfileId[] = ['ben', 'yona']
