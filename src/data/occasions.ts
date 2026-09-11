export type Occasion = { label: string; description: string }

/**
 * Several of these sit close together — a bare label like "Weekend" next to
 * "Casual day" gives the model nothing to separate them by, and the outfits
 * come back nearly identical. The description carries what actually differs:
 * how long you're out, who sees you, and how much comfort has to win.
 */
export const OCCASIONS: Occasion[] = [
  {
    label: 'Work',
    description:
      'Out for the full day and seen by colleagues. The most considered look of the week — put together, but never stiff or corporate.',
  },
  {
    label: 'Casual day',
    description:
      'Around the house or out locally with no fixed plans. Comfortable and easy, but still deliberately dressed rather than thrown on.',
  },
  {
    label: 'Weekend',
    description:
      'Unstructured and social — coffee, shops, seeing people. Relaxed, and the best chance to be expressive with colour, print or a statement piece.',
  },
  {
    label: 'Errands',
    description:
      'Short trips, in and out of the car, on your feet. Practicality leads: easy shoes, nothing that needs managing or fussing with.',
  },
  {
    label: 'Dinner out',
    description:
      'Evening, indoors, seen close up under low light. The sharpest end of the wardrobe — texture, a considered layer, better shoes.',
  },
  {
    label: 'Travel',
    description:
      'Hours sitting, airports or stations, temperature swinging between inside and out. Comfort, layers that come off easily, shoes that slip on and off.',
  },
]

export function occasionDescription(label: string): string | undefined {
  return OCCASIONS.find((o) => o.label === label)?.description
}
