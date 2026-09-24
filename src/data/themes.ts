export const themes = ['dusk', 'forest', 'night', 'carpet', 'tea', 'sea'] as const
export type Theme = typeof themes[number]

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && themes.some(theme => theme === value)
}
