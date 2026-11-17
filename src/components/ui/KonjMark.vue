<template>
  <!--
    The Konj mark: a note with its corner folded over (a literal «کنج», corner)
    and the letter «ک» in Lalezar.
  -->
  <svg :width="size" :height="size" viewBox="0 0 40 40" aria-hidden="true" class="konj-mark">
    <path d="M10 0h18l12 12v18a10 10 0 0 1-10 10H10A10 10 0 0 1 0 30V10A10 10 0 0 1 10 0Z" fill="var(--accent)" />
    <path d="M28 0v7a5 5 0 0 0 5 5h7Z" fill="var(--pop)" />
    <text x="18.5" y="31" text-anchor="middle" font-family="Lalezar, Vazirmatn, sans-serif" font-size="26" fill="var(--accent-ink)">ک</text>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 40 })
</script>
