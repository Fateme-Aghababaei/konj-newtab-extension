// Well-known Persian proverbs and sayings, one shown per day in the welcome widget.
// `en` is a plain translation of the meaning, not a literal one.
export const proverbs: { fa: string; en: string }[] = [
  { fa: 'قطره قطره جمع گردد، وانگهی دریا شود', en: 'Drop by drop, a sea is made.' },
  { fa: 'کار نیکو کردن از پر کردن است', en: 'Doing something well comes from doing it often.' },
  { fa: 'جوینده یابنده است', en: 'Whoever keeps looking, finds.' },
  { fa: 'از تو حرکت، از خدا برکت', en: 'You take the first step; the blessing follows.' },
  { fa: 'سحرخیز باش تا کامروا باشی', en: 'Rise early and your wishes come true.' },
  { fa: 'صبر تلخ است ولیکن بر شیرین دارد', en: 'Patience is bitter, but its fruit is sweet.' },
  { fa: 'یک دست صدا ندارد', en: 'One hand alone makes no sound.' },
  { fa: 'تا تنور گرم است باید نان را چسباند', en: 'Bake the bread while the oven is hot.' },
  { fa: 'عجله کار شیطان است', en: 'Haste is the devil’s work.' },
  { fa: 'کم گوی و گزیده گوی چون دُر', en: 'Speak little, and choose your words like pearls.' },
  { fa: 'هر که بامش بیش، برفش بیشتر', en: 'The bigger the roof, the more snow it carries.' },
  { fa: 'دوست آن باشد که گیرد دست دوست، در پریشان‌حالی و درماندگی', en: 'A friend is one who holds your hand in hard times.' },
]

/** Same proverb all day, a different one tomorrow. */
export function proverbOfDay(date: Date) {
  const day = Math.floor(date.getTime() / 86400000)
  return proverbs[((day % proverbs.length) + proverbs.length) % proverbs.length]
}
