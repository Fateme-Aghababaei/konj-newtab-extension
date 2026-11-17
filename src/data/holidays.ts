/**
 * Fixed-date entries of the Iranian solar calendar, keyed "month-day".
 * Lunar (Hijri) holidays move every year and are not included.
 * `off` marks an official day off; the rest are cultural dates.
 */
export const solarDays: Record<string, { fa: string; en: string; off?: boolean }> = {
  '1-1': { fa: 'نوروز', en: 'Nowruz', off: true },
  '1-2': { fa: 'عید نوروز', en: 'Nowruz holiday', off: true },
  '1-3': { fa: 'عید نوروز', en: 'Nowruz holiday', off: true },
  '1-4': { fa: 'عید نوروز', en: 'Nowruz holiday', off: true },
  '1-12': { fa: 'روز جمهوری اسلامی', en: 'Islamic Republic Day', off: true },
  '1-13': { fa: 'سیزده‌به‌در', en: 'Sizdah Bedar', off: true },
  '2-25': { fa: 'روز بزرگداشت فردوسی', en: 'Ferdowsi Day' },
  '3-14': { fa: 'رحلت امام خمینی', en: 'Death of Khomeini', off: true },
  '3-15': { fa: 'قیام ۱۵ خرداد', en: '15 Khordad uprising', off: true },
  '7-20': { fa: 'روز بزرگداشت حافظ', en: 'Hafez Day' },
  '9-30': { fa: 'شب یلدا', en: 'Yalda night' },
  '11-22': { fa: 'پیروزی انقلاب', en: 'Revolution Day', off: true },
  '12-29': { fa: 'ملی شدن صنعت نفت', en: 'Oil Nationalization Day', off: true },
}
