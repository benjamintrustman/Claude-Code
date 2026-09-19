import type { ProfileConfig, ProfileId } from '../types'

export const PROFILES: Record<ProfileId, ProfileConfig> = {
  ben: {
    id: 'ben',
    name: 'Ben',
    aesthetic:
      'Worn European Workwear — Copenhagen / Forum Store sensibility. Earthy, understated, heritage-leaning, artisanal. Warm earth tones: camel, tan, terracotta, tobacco, olive, sage, brown. Brass hardware, workwear construction details. 5\'8", 28" inseam, proportionally long torso. Red-green colorblind with some blue-purple confusion — dark saturated tones (deep navy, dark olive, dark brown) compress into ambiguity against each other, so outfits should avoid stacking them and prefer contrast in value, not just hue.',
    hardRules: [
      'Every outfit needs at least one clear step in value — a light or mid piece read against a darker one. An outfit where everything sits in the same band is the failure mode to avoid',
      'At most two pieces from the dark band, and they must not sit adjacent to each other (a dark navy knit over a dark olive trouser is exactly the pairing that collapses). Footwear and belts do not count toward that limit — dark leather is a neutral here',
    ],
    purchaseRules: [
      'Trouser rise minimum 13.5", ideally 14"+',
      'Wide-leg only — no slim, no skinny',
      'No cropped or high-water hems; full break preferred',
      'No loafers',
    ],
    minRise: 13.5,
    // Drawn from the closet itself rather than invented — these are the colours
    // actually hanging there, grouped into the families they fall into.
    colorPalette: [
      'tan, camel, sand, khaki, oatmeal, beige, stone/greige (the spine — most outfits lean on these)',
      'brown, cognac, dark chocolate, tobacco, rust, terracotta, brick, burgundy',
      'olive, dark olive, sage, army green, grey-green',
      'cream, ivory, natural, paper/off-white, white',
      'light blue, dusty blue-green, French blue, indigo, dark indigo, navy, blue-grey',
      'grey, charcoal, dark grey, near-black',
    ],
    valueBands: {
      light: [
        'cream', 'ivory', 'white', 'natural', 'paper/off-white', 'oatmeal',
        'sand', 'khaki', 'stone', 'greige', 'beige', 'tan', 'light blue',
      ],
      mid: [
        'camel', 'cognac', 'medium brown', 'rust', 'terracotta', 'brick',
        'olive', 'sage', 'army green', 'grey-green', 'blue-grey',
        'dusty blue-green', 'French blue', 'grey', 'indigo', 'burgundy',
        'mustard', 'lime green',
      ],
      dark: [
        'brown', 'dark brown', 'dark chocolate', 'dark olive', 'navy',
        'dark navy', 'dark indigo', 'charcoal', 'dark grey', 'near-black',
      ],
    },
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
    knownGoodLooks: [
      'Wide-leg jeans + white tee + olive cardigan (the casual go-to)',
      'Wide-leg jeans + white tee + camel Ganni jacket + orange Salomon XT-Whisper',
      'Black wool trousers + cream muscle tank + copper Rosa Mosa mules',
      'Dark navy blazer + dark indigo denim jacket over dark olive tank + mustard/navy ikat skirt',
      'Brown/taupe Jeanerica flares + fitted tank or tee + copper Rosa Mosa mules',
    ],
  },
}

export const PROFILE_ORDER: ProfileId[] = ['ben', 'yona']
