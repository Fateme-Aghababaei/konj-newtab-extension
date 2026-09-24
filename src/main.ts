import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'

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
watch(() => store.preferences.language, language => {
  i18n.global.locale.value = language
  document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'
  document.documentElement.lang = language
  document.title = `${i18n.global.t('brand.name')} | ${i18n.global.t('brand.tagline')}`
}, { immediate: true, flush: 'sync' })

app.mount('#app')