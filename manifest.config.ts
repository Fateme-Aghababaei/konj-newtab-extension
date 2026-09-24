import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,

  name: 'Konj',
  description: 'A minimal new tab designed for Iranian users',
  version: '0.1.0',

  chrome_url_overrides: {
    newtab: 'index.html',
  },

  permissions: [],
})