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
        'cream', 'ivory', 'white', 'natural', 'ecru', 'paper/off-white', 'bone',
        'vanilla', 'sea salt white', 'oatmeal', 'oyster grey', 'sand', 'khaki',
        'stone', 'greige', 'beige', 'tan', 'light blue', 'light blue wash',
      ],
      mid: [
        'camel', 'cognac', 'medium brown', 'rust', 'terracotta', 'brick',
        'olive', 'sage', 'army green', 'grey-green', 'dusty fern', 'blue-grey',
        'dusty blue-green', 'French blue', 'mid-wash blue', 'grey', 'indigo',
        'teal', 'lavender-grey', 'burgundy', 'mustard', 'lime green',
      ],
      dark: [
        'brown', 'dark brown', 'olmo', 'archeo brown', 'rustic brown',
        'dark chocolate', 'dark olive', 'navy', 'dark navy', 'dark indigo',
        'charcoal', 'dark grey', 'obsidian stone grey', 'near-black', 'black',
      ],
    },
    stylingPatterns: [
      'A plain white or cream tee is the base layer in nearly every outfit he actually wears. It is the default starting point, not a fallback — reach for it before reaching for a shirt as the bottom layer',
      'One dark garment per outfit, not two. It sits either at the bottom (the trouser) or on top (the jacket or overshirt), and the rest of the outfit is light or mid. An outfit with a dark top AND a dark bottom is not how he dresses',
      'The outer layer is worn open over the tee — never buttoned or zipped shut. The light middle showing through the open front is what carries the value contrast',
      'Trousers are wide and full length, worn high, with a full break or a single turned cuff. A cropped or hip-length jacket is what balances them — a long layer over a full trouser is the proportion to avoid',
      'A brown leather belt is usually visible at the waist',
      'An outfit with no dark piece at all is fine, and common — two mid tones held apart by a white tee and a light shoe reads correctly',
    ],
    knownGoodLooks: [
      'Wax London plaid overshirt open over a white tee, KOTN dark brown trouser, Jacques Solovière near-black pebbled hiker — the cream plaid is the light anchor on top, and the near-black shoe under a dark trouser is fine because shoes do not count as the dark garment',
      'Taylor & Stitch lighter tan work jacket open over a white tee, brown corduroy trouser, beige suede sneaker — a light jacket and a light shoe bracketing the one dark piece',
      'Sage/stone shirt open over a white tee, Toast brick/terracotta wide-leg trouser with a single cuff, white sneaker, brown belt — no dark piece anywhere; two mid tones held apart by the white',
      '45R indigo linen short-sleeve overshirt open over a white tee, stone/greige trouser cuffed once, tan suede moc boot, brown belt — the dark piece on top for once, over a light bottom',
      'mfpen charcoal cropped zip jacket over a cream tee, stone/greige wide-leg trouser, dark brown derby — a cropped jacket against a high full trouser, dark above and below a light middle',
    ],
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
