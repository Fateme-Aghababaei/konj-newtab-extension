import { createI18n } from 'vue-i18n'
import fa from './locales/fa.json'
import en from './locales/en.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'fa',
  messages: { fa, en },
})
