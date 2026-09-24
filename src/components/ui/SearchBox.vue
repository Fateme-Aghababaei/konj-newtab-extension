<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
const { t } = useI18n()
const query = ref('')
function search() { if (query.value.trim()) window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(query.value.trim())}`) }
</script>
<template><form class="search-box" role="search" @submit.prevent="search"><AppIcon name="search" /><input v-model="query" :aria-label="t('search.label')" :placeholder="t('search.placeholder')" autocomplete="off" maxlength="2000" /><span class="search-provider">Google</span><button class="icon-button" type="submit" :aria-label="t('search.submit')"><AppIcon name="arrow" /></button></form></template>
