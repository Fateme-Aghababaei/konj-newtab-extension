<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string> = {
  plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6', search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  edit: 'm16 3 5 5-12 12-6 1 1-6ZM13 6l5 5', check: 'm5 12 4 4L19 6', clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  hafez: 'M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-3-1-7-2-10 1',
  todo: 'm3 6 2 2 3-4M11 6h10M3 14h4v4H3ZM11 16h10', 'quick-links': 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  greeting: 'M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5', settings: 'M4 7h16M4 17h16M8 4v6M16 14v6',
  arrow: 'M19 12H5m6-6-6 6 6 6', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  sun: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  drag: 'M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01', up: 'm6 14 6-6 6 6', down: 'm6 10 6 6 6-6',
}
</script>
<template><svg :class="{ 'directional-icon': name === 'arrow' }" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="name === 'drag' ? 4 : 1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.sun" /></svg></template>
