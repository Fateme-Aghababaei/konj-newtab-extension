/** Parts of the day as Persian speakers name them. */
export type Phase = 'midnight' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'evening'

export function phaseOf(hour: number): Phase {
  if (hour < 4) return 'midnight'
  if (hour < 6) return 'dawn' // سحر
  if (hour < 11) return 'morning'
  if (hour < 14) return 'noon'
  if (hour < 18) return 'afternoon'
  if (hour < 20) return 'sunset'
  return 'evening'
}

/** Sky colours for the welcome window, top to horizon. */
export const skies: Record<Phase, [string, string, string]> = {
  midnight: ['#0B1230', '#1B2552', '#2E3A6E'],
  dawn: ['#2B2F63', '#B66A86', '#F2B58A'],
  morning: ['#6FB6E8', '#A7D6F0', '#F4E7C8'],
  noon: ['#3E9BE0', '#86C5EE', '#DDEFF7'],
  afternoon: ['#5FA4D8', '#E8C08A', '#F6DFAF'],
  sunset: ['#3A2D63', '#D9634C', '#F5B05A'],
  evening: ['#101A3F', '#253366', '#4A4D84'],
}

/**
 * Moon age as a fraction of the synodic month (0 = new, 0.5 = full),
 * measured from the new moon of 6 January 2000, 18:14 UTC.
 */
export function moonPhase(date: Date) {
  const synodic = 29.530588853
  const days = (date.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000
  return (((days / synodic) % 1) + 1) % 1
}

/** Days until the next 1 Farvardin (Nowruz). 0 means today. */
export function daysToNowruz(date: Date, timeZone?: string) {
  const fmt = new Intl.DateTimeFormat('en', { calendar: 'persian', month: 'numeric', day: 'numeric', timeZone })
  for (let i = 0; i <= 366; i++) {
    const p = fmt.formatToParts(new Date(date.getTime() + i * 86400000))
    if (p.find(x => x.type === 'month')?.value === '1' && p.find(x => x.type === 'day')?.value === '1') return i
  }
  return -1
}
