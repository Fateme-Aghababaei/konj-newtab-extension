import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,

  name: 'Konj',
  description: 'A Persian-first new tab made of widgets: solar Hijri calendar, Fal-e Hafez, tasks and more.',
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  version: '0.1.0',

  chrome_url_overrides: {
    newtab: 'index.html',
  },

  permissions: [],
})