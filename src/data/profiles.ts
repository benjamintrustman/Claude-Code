import type { ProfileConfig, ProfileId } from '../types'

export const PROFILES: Record<ProfileId, ProfileConfig> = {
  ben: {
    id: 'ben',
    name: 'Ben',
    aesthetic:
      'Worn European Workwear — Copenhagen / Forum Store sensibility. Earthy, understated, heritage-leaning, artisanal. Warm earth tones: camel, tan, terracotta, tobacco, olive, sage, brown. Brass hardware, workwear construction details. 5\'8", 28" inseam, proportionally long torso. Red-green colorblind with some blue-purple confusion — dark saturated tones (deep navy, dark olive, dark brown) compress into ambiguity against each other, so outfits should avoid stacking them and prefer contrast in value, not just hue.',
    hardRules: [
      'Pieces may sit close in value only at the light end. A tonal outfit — ecru trouser, sand tee, beige shoe — is a look he wears and likes, because light values stay separable. The same closeness among dark pieces collapses into mud, and that is the failure mode to avoid',
      'At most two pieces from the dark band, and two only when something light runs between them. A layer worn open over a white tee does this — the light stripe down the centre keeps a dark navy overshirt legible against a dark brown trouser. Closed up, or with a dark piece underneath, the same two collapse into each other. Footwear and belts do not count toward the limit at all — dark leather is a neutral here',
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
        'camel', 'cognac', 'medium brown', 'tobacco', 'rust', 'terracotta', 'brick',
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
      'Usually one dark garment, often none, and the rest light or mid. Two happens — a dark overshirt over a dark trouser — but only ever open over a white tee, which is what makes the pairing readable. Do not build a dark top over a dark bottom without that light break',
      'The outer layer is usually worn open over the tee, with the light middle showing down the centre. Zipped or buttoned shut does happen, but only when the layer itself is light or mid and nothing else in the outfit is dark except the trouser. The open front is a requirement when two dark pieces are in play, not a preference',
      'Trousers are wide and full length, worn high, with a full break or a single turned cuff. A cropped or hip-length jacket is what balances them — a long layer over a full trouser is the proportion to avoid',
      'A brown leather belt is usually visible at the waist',
      'Half his outfits have no dark garment at all. Two mid tones held apart by a white tee and a light shoe reads correctly, and so does an all-light tonal look with no contrast to speak of',
      'A bag, when he carries one, is worn crossbody — warm brown leather with a tonal or earthy outfit, a plain black sling with a grey or charcoal one. Either way it sits on the body rather than in the hand',
      'Not every outfit has a layer. A tee and a trouser on their own is a complete look when the tones and the proportion carry it',
    ],
    knownGoodLooks: [
      'Wax London plaid overshirt open over a white tee, KOTN brown pleated trouser, Jacques Solovière near-black pebbled hiker — the cream plaid is the light anchor on top, and the near-black shoe under a dark trouser is fine because shoes do not count as the dark garment',
      'Taylor & Stitch lighter tan work jacket open over a white tee, KOTN brown corduroy trouser, Mephisto Rainbow tan suede moccasin hiker — a light jacket and a light shoe bracketing the one dark piece, the trouser',
      'Mac Weldon sage/stone shirt open over a white tee, Toast brick/terracotta wide-leg trouser with a single cuff, Diadora Equipe Vela SW, brown belt — no dark piece anywhere; two mid tones held apart by the white tee and the white sneaker',
      '45R indigo linen short-sleeve overshirt open over a white tee, G1 Goods sage/olive utility trouser cuffed once, Mephisto Rainbow tan suede moccasin hiker, brown belt — the darkest piece on top for once rather than at the bottom, over a mid trouser, with the white tee showing through the open front',
      'Buck Mason heavyweight tee (camel) untucked over a Wax London ecru trouser cuffed once, Camper suede beige sneakers, Coach cognac/tan belt bag worn crossbody — no layer and no dark piece at all; the whole outfit sits in warm light tones and works on texture and proportion rather than contrast',
      'Wax London navy textured overshirt open over a white tee, KOTN brown pleated trouser, brown belt, Pikolinos Vigo — the one look with two dark garments; navy over brown would collapse but for the white tee running down the centre of the open front',
      'Berner Kühl blue-grey ribbed zip knit zipped shut over a white tee, Carhartt Parrish Pant in obsidian stone grey, Jacques Solovière near-black pebbled hiker, black sling worn crossbody — the one closed layer; only the tee hem shows below the knit, so the knit has to stay lighter than the trouser for the two to separate',
      'mfpen charcoal wool cropped zip jacket over a cream tee, mfpen stone/greige flannel trouser, Jacques Solovière near-black pebbled hiker — a cropped jacket against a high full trouser; the jacket is the one dark garment, the light trouser carries the contrast, and the near-black shoe is exempt',
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
