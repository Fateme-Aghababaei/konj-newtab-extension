import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'
// Lalezar: Persian display face for the greeting, clock and wordmark
import '@fontsource/lalezar/400.css'

import { createPinia } from 'pinia'
import { createApp, watch } from 'vue'
import { i18n } from './i18n'
import { useWidgetsStore } from './stores/widgets'

import App from './App.vue'
import './style.css'


const app = createApp(App)

app.use(createPinia())
app.use(i18n)
const store = useWidgetsStore()
const themeColors: Record<string, string> = { kaghaz: '#F7F1E8', kahgel: '#EBDCC5', firoozeh: '#DCEDE8', lajevard: '#141A2E', shab: '#161411', anar: '#2B1418' }
watch(() => store.preferences.theme, theme => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme] ?? '#F1ECE1')
}, { immediate: true })
watch(() => store.preferences.language, language => {
  i18n.global.locale.value = language
  document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'
  document.documentElement.lang = language
  document.title = `${i18n.global.t('brand.name')} | ${i18n.global.t('brand.tagline')}`
}, { immediate: true, flush: 'sync' })

app.mount('#app')