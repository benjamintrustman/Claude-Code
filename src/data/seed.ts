import type { Category, Gap, Item, ProfileId } from '../types'

let counter = 0
function item(
  category: Category,
  name: string,
  color: string,
  extra?: Partial<Pick<Item, 'brand' | 'rise' | 'functional' | 'note'>>,
): Item {
  counter += 1
  return {
    id: `seed-${counter}`,
    name,
    category,
    color,
    ...extra,
  }
}

function benCloset(): Item[] {
  return [
    // Outerwear
    item('Outerwear', 'Wax London tan field jacket', 'tan'),
    item('Outerwear', 'Taylor & Stitch lighter tan work jacket', 'tan'),
    item('Outerwear', 'Brown chore coat', 'brown'),
    item('Outerwear', 'Relwen army green jacket', 'army green'),
    item('Outerwear', 'mfpen charcoal wool zip jacket (cropped)', 'charcoal'),
    item('Outerwear', 'LL Bean grey wool blazer', 'grey'),
    item('Outerwear', 'Outerknown wool plaid jacket, sherpa-lined', 'burgundy/tobacco/cream'),
    item('Outerwear', 'Camel corduroy zip jacket', 'camel'),
    item('Outerwear', 'Form + Thread sage/stone work jacket', 'sage/stone'),
    item('Outerwear', 'Patagonia blue puffer', 'blue', { functional: true }),
    item('Outerwear', 'Patagonia Retro-X fleece (rust/terracotta sherpa)', 'rust/terracotta', { brand: 'Patagonia' }),
    item('Outerwear', 'Marine Layer Olive Bomber', 'Olive', { brand: 'Marine Layer' }),
    item('Outerwear', 'Flint and Tinder Waxed Trucker Jacket', 'Brown', { brand: 'Flint and Tinder' }),
    item('Outerwear', 'Barbour Wax Canvas Beaufort Classic Coat', 'Dark Olive', { brand: 'Barbour', note: 'This is a longer coat for colder days and light rain' }),
    item('Outerwear', 'Michale Max Leather Jacket', 'Brown'),

    // Overshirt
    item('Overshirt', 'Wax London navy textured overshirt', 'navy'),
    item('Overshirt', 'Wax London plaid overshirt', 'cream/navy'),
    item('Overshirt', '45R indigo linen short-sleeve overshirt', 'indigo'),

    // Shirt
    item('Shirt', 'Cream/natural stripe button-up (Grandpa, Sweden)', 'cream/natural'),
    item('Shirt', 'Dusty blue-green shirt', 'dusty blue-green'),
    item('Shirt', 'Light blue Oxford shirt', 'light blue'),
    item('Shirt', 'Olive/mustard corduroy shirt', 'olive/mustard'),
    item('Shirt', 'Foret Seersucker Cream and Blue', 'cream/blue', { brand: 'Foret' }),
    item('Shirt', 'Rust/terracotta ribbed shirt', 'rust/terracotta'),
    item('Shirt', 'Mac Weldon shirt', 'sage/stone'),
    item('Shirt', 'Ronaldus Shamask pinstripe shirt (lavender-grey)', 'lavender-grey', { brand: 'Ronaldus Shamask' }),
    item('Shirt', 'Ronaldus Shamask pinstripe shirt (sage-green)', 'sage-green', { brand: 'Ronaldus Shamask' }),
    item('Shirt', 'Frizm Works Blue Stripe Button up', 'white/blue'),
    item('Shirt', 'Wax London Light Blue Ecru Shelly Shirt', 'Blue/Ecru', { brand: 'Wax london' }),

    // Knitwear
    item('Knitwear', 'Berner Kühl oatmeal ribbed wool zip knit', 'oatmeal'),
    item('Knitwear', 'Berner Kühl blue-grey zip knit', 'blue-grey'),
    item('Knitwear', 'Dark navy knit', 'dark navy'),
    item('Knitwear', 'Forét sand/camel waffle grid knit polo', 'sand/camel'),
    item('Knitwear', 'Quince camel cashmere zip hoodie', 'camel'),
    item('Knitwear', 'Indie + Ash Heavy Blue Cardigan', 'Blue'),

    // Basics/Tee
    item('Basics/Tee', 'Buck Mason heavyweight tee (white)', 'white'),
    item('Basics/Tee', 'Buck Mason heavyweight tee (camel)', 'camel'),
    item('Basics/Tee', 'Relwen lime green stripe tee', 'lime green'),
    item('Basics/Tee', 'Colorful Standard ivory tee', 'ivory'),
    item('Basics/Tee', 'Lady White Co. Municipal tee (Paper)', 'paper/off-white'),
    item('Basics/Tee', 'KOTN heavyweight tee (white)', 'white', { brand: 'KOTN' }),
    item('Basics/Tee', 'KOTN heavyweight tee (brown)', 'brown', { brand: 'KOTN' }),
    item('Basics/Tee', 'KOTN heavyweight long sleeve tee (white)', 'white', { brand: 'KOTN' }),
    item('Basics/Tee', 'KOTN lightweight tee (white)', 'white', { brand: 'KOTN' }),
    item('Basics/Tee', 'Colorful Standard tee (oyster grey)', 'oyster grey', { brand: 'Colorful Standard' }),
    item('Basics/Tee', 'Colorful Standard tee (white)', 'white', { brand: 'Colorful Standard' }),
    item('Basics/Tee', 'Lady White Co. Municipal tee (White)', 'white', { brand: 'Lady White Co.' }),
    item('Basics/Tee', 'KOTN heavyweight tee (sand)', 'Sand', { brand: 'KOTN' }),

    // Trousers
    item('Trousers', 'Nudie Tough Tony brown herringbone trouser', 'brown', { rise: 13 }),
    item('Trousers', 'KOTN olive pleat trouser', 'olive', { rise: 12.5 }),
    item('Trousers', 'KOTN brown corduroy trouser', 'brown', { rise: 12.5 }),
    item('Trousers', 'Indi+Ash dark olive double-front work pant', 'dark olive', { rise: 12 }),
    item('Trousers', 'mfpen stone/greige flannel trouser', 'stone/greige', { rise: 13 }),
    item('Trousers', 'Toast sand/khaki pleated wide-leg trouser', 'sand/khaki', { rise: 14 }),
    item('Trousers', 'Toast brick/terracotta wide-leg trouser', 'brick/terracotta', { rise: 14 }),
    item('Trousers', 'Carhartt dark indigo carpenter pant', 'dark indigo', { rise: 11 }),
    item('Trousers', 'Wendell high-waist French blue canvas trouser', 'French blue', { rise: 14 }),
    item('Trousers', 'G1 Goods sage/olive utility trouser', 'sage/olive', { rise: 13.5 }),
    item('Trousers', 'Bric a Brac dark navy cotton trouser', 'dark navy', { rise: 13 }),
    item('Trousers', 'Carhartt Light Wash Denim Double Knee Pants', 'light blue wash', { brand: 'Carhartt', rise: 13.5 }),
    item('Trousers', 'KOTN dark brown trouser', 'dark brown', { brand: 'KOTN' }),
    item('Trousers', 'Uniqlo wide-leg khaki trouser', 'khaki', { brand: 'Uniqlo' }),
    item('Trousers', 'Mid-wash denim', 'mid-wash blue'),
    item('Trousers', 'Carhartt Parrish Pant', 'Obsidian Stone Grey', { brand: 'Carhartt', rise: 13.5 }),

    // Footwear
    item('Footwear', 'Jacques Solovière near-black pebbled hiker', 'near-black'),
    item('Footwear', 'Gravity Pope brown derby, black lug sole', 'brown'),
    item('Footwear', 'Mephisto Rainbow tan suede moccasin hiker', 'tan'),
    item('Footwear', 'Mephisto navy pebbled sneaker', 'navy'),
    item('Footwear', 'Pikolinos Vigo', 'dark brown olmo'),
    item('Footwear', 'Danner Mountain 360 dark grey suede boot', 'dark grey'),
    item('Footwear', 'Diadora Equipe Vela SW', 'white/rust'),
    item('Footwear', 'Diadora Heritage Equipe Dirty SW Evo Beige Dew', 'beige'),
    item('Footwear', 'Grey-green Air Force 1', 'grey-green'),
    item('Footwear', 'Nike Killshot 2 dark chocolate leather', 'dark chocolate'),
    item('Footwear', 'Air Jordan 3 Winterized', 'Archeo Brown', { brand: 'Nike' }),
    item('Footwear', 'Taylor and Stitch Moto cap toe boot', 'Brown'),
    item('Footwear', 'Camper suede Beige sneakers red gum', 'Beige with red gum'),
    item('Footwear', 'Nike Air Force One \'07 LX', 'Light bone and pale vanilla'),
    item('Footwear', 'Oliver Cabell low top', 'Sea Salt White'),
    item('Footwear', 'Pikolinos Chukka', 'Brown'),
    item('Footwear', 'Blundstone 1944 Chelsea boot', 'Rustic Brown'),
    item('Footwear', 'Nike Air Max black/bright blue', 'black/bright blue', { brand: 'Nike', functional: true }),
    item('Footwear', 'Asics gel NYC 2.0', 'Cream/Dusty Fern', { brand: 'Asics', note: 'Running style streetwear shoe' }),

    // Bag
    item('Bag', 'Brown leather Pikolinos satchel', 'brown'),
    item('Bag', 'Chrome tan/camel messenger bag', 'tan/camel'),
    item('Bag', 'Coach cognac/tan belt bag', 'cognac/tan'),
    item('Bag', 'Freitag grey messenger', 'grey', { brand: 'Freitag' }),
    item('Bag', 'Freitag grey sling with teal panels', 'grey/teal', { brand: 'Freitag' }),
    item('Bag', 'Shiny black crossbody', 'black'),
    item('Bag', 'Topo Designs crossbody', 'grey-green', { brand: 'Topo Designs' }),
    item('Bag', 'Alpaka Metro Crossbody sling', 'olive/green', { brand: 'Alpaka' }),
    item('Bag', 'Patagonia black sling bag', 'black', { brand: 'Patagonia' }),

    // Belt
    item('Belt', 'Brave tan/khaki roughout belt', 'tan/khaki'),
    item('Belt', 'Brave dark brown pebbled belt', 'dark brown'),
    item('Belt', 'Brave medium brown perforated belt', 'medium brown'),
    item('Belt', 'Dark brown belt', 'dark brown'),
    item('Belt', 'Black belt', 'black'),
  ]
}

function yonaCloset(): Item[] {
  return [
    // Outerwear
    item('Outerwear', 'Ganni tan/camel work jacket', 'tan/camel'),
    item('Outerwear', 'Toast olive/khaki work jacket', 'olive/khaki'),
    item('Outerwear', 'Toast dark navy oversized wool blazer', 'dark navy'),
    item('Outerwear', 'Toast dark indigo denim work jacket', 'dark indigo'),
    item('Outerwear', 'Toast olive green bouclé cardigan', 'olive green'),

    // Tops
    item('Dress/Top', 'Black long sleeve top (ruffle cuff)', 'black'),
    item('Dress/Top', 'Black/white medallion print blouse', 'black/white'),
    item('Dress/Top', 'Burgundy eyelet lace top', 'burgundy'),
    item('Dress/Top', 'Sage green ruffle shoulder top', 'sage green'),
    item('Dress/Top', 'Dark abstract botanical print top', 'dark abstract botanical'),
    item('Dress/Top', 'Small floral ditsy print top', 'floral ditsy print'),
    item('Dress/Top', 'Cream/mint botanical floral tunic', 'cream/mint'),
    item('Dress/Top', 'Blush/cream large floral top', 'blush/cream'),
    item('Dress/Top', 'Cream/ivory botanical floral blouse', 'cream/ivory'),
    item('Dress/Top', 'Sundance botanical blouse', 'multi botanical'),
    item('Dress/Top', 'Toast coral 3/4 sleeve tee', 'coral'),
    item('Dress/Top', 'Toast dark olive muscle tank', 'dark olive'),
    item('Dress/Top', 'Toast cream muscle tank', 'cream'),
    item('Dress/Top', 'Toast burgundy cap sleeve tee', 'burgundy'),
    item('Dress/Top', 'Toast red scoop neck tee', 'red'),

    // Bottoms — trousers
    item('Trousers', 'Rust/terracotta wide-leg trouser (elasticated)', 'rust/terracotta'),
    item('Trousers', 'Toast black wool gabardine wide-leg pull-on trouser', 'black'),
    item('Trousers', 'Toast dark grey corduroy cropped tapered trouser', 'dark grey'),
    item('Trousers', 'Jeanerica brown/taupe wide-leg flare jeans', 'brown/taupe'),
    item('Trousers', 'Still Here black wide-leg jeans', 'black'),
    item('Trousers', 'Wide-leg mid-wash jeans', 'mid-wash blue'),

    // Bottoms — skirts
    item('Skirt', 'Stone/greige flared midi skirt', 'stone/greige'),
    item('Skirt', 'Mustard/navy ikat plaid midi skirt', 'mustard/navy'),
    item('Skirt', 'Dark olive/brown crinkle midi skirt', 'dark olive/brown'),
    item('Skirt', 'Toast grass/olive pleated full midi skirt', 'grass/olive'),
    item('Skirt', 'Toast tan/camel pleated midi skirt', 'tan/camel'),

    // Footwear
    item('Footwear', 'Rosa Mosa copper/bronze metallic clog mule', 'copper/bronze'),
    item('Footwear', 'Rosa Mosa silver/dark metallic lace-up hiker', 'silver/dark metallic'),
    item('Footwear', 'Gold/champagne metallic ballet flat', 'gold/champagne'),
    item('Footwear', 'Orange/coral Salomon XT-Whisper', 'orange/coral'),
    item('Footwear', 'Black leather clog boot', 'black'),
    item('Footwear', 'Black woven Mary Jane flat', 'black'),
    item('Footwear', 'Black leather zip ankle boot', 'black'),
    item('Footwear', 'Tan/nude strappy flat sandal', 'tan/nude'),

    // Bags
    item('Bag', 'Black medallion/carpet print bag (Persian-Turkish motif)', 'black/multi'),
  ]
}

let gapCounter = 0
function gap(title: string, priority: Gap['priority'], note?: string): Gap {
  gapCounter += 1
  return { id: `seed-gap-${gapCounter}`, title, priority, note }
}

function benGaps(): Gap[] {
  return [
    gap(
      'Camel/sand wide-leg high-rise trouser',
      'high',
      'Engineered Garments Officer Pant in camel is the benchmark',
    ),
    gap('Wide-leg high-rise denim replacement', 'medium'),
    gap('Full-size leather messenger bag', 'medium', 'Mismo is the lead candidate'),
  ]
}

function yonaGaps(): Gap[] {
  return []
}

export function seedCloset(profile: ProfileId): Item[] {
  return profile === 'ben' ? benCloset() : yonaCloset()
}

export function seedGaps(profile: ProfileId): Gap[] {
  return profile === 'ben' ? benGaps() : yonaGaps()
}
