/**
 * Palettes named after everyday Iranian things.
 * The colours themselves live in style.css; `swatch` is only for the settings preview.
 */
export const themes = ['kaghaz', 'kahgel', 'firoozeh', 'lajevard', 'shab', 'anar'] as const
export type Theme = typeof themes[number]

export const swatches: Record<Theme, [bg: string, surface: string, accent: string]> = {
  kaghaz: ['#F7F1E8', '#FFFCF7', '#D2343F'],
  kahgel: ['#EBDCC5', '#F8F0E3', '#B5502E'],
  firoozeh: ['#DCEDE8', '#F6FBF9', '#13877F'],
  lajevard: ['#141A2E', '#1D2540', '#F4A259'],
  shab: ['#161411', '#221F1A', '#E2765F'],
  anar: ['#2B1418', '#3A1C21', '#F6B94C'],
}

// Names used before the redesign, so saved preferences carry over.
const legacy: Record<string, Theme> = {
  dusk: 'kahgel',
  forest: 'firoozeh',
  night: 'lajevard',
  carpet: 'anar',
  tea: 'kahgel',
  sea: 'firoozeh',
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && themes.some(theme => theme === value)
}

export function toTheme(value: unknown): Theme {
  if (isTheme(value)) return value
  return (typeof value === 'string' && legacy[value]) || 'kaghaz'
}

export const darkThemes: Theme[] = ['lajevard', 'shab', 'anar']
