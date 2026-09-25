<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance } from '@/types/widget'
const props = defineProps<{ widget: WidgetInstance }>()
const { t, locale } = useI18n()
const store = useWidgetsStore()
const now = ref(Date.now())
const editing = ref(!props.widget.settings.date)
const title = ref(String(props.widget.settings.title || ''))
const date = ref(String(props.widget.settings.date || ''))
const days = computed(() => {
 const today = new Intl.DateTimeFormat('en-CA', { timeZone: store.preferences.timeZone === 'local' ? undefined : 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now.value))
 return Math.round((Date.parse(String(props.widget.settings.date)) - Date.parse(today)) / 86400000)
})
function save() { if (!title.value.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.value) || !Number.isFinite(Date.parse(date.value))) return; store.updateSettings(props.widget.id, { title: title.value.trim(), date: date.value }); editing.value = false }
const timer = setInterval(() => now.value = Date.now(), 30000)
onUnmounted(() => clearInterval(timer))
</script>
<template><div class="extra-widget"><form v-if="editing" class="widget-form" @submit.prevent="save"><label>{{ t('extras.eventTitle') }}<input v-model="title" required maxlength="80" /></label><label>{{ t('extras.date') }}<input v-model="date" type="date" required /></label><div class="widget-controls"><button class="primary-button">{{ t('common.save') }}</button><button v-if="widget.settings.date" type="button" class="text-button" @click="editing = false">{{ t('common.cancel') }}</button></div></form><template v-else><p class="event-title" dir="auto">{{ widget.settings.title }}</p><div class="widget-number">{{ Math.abs(days).toLocaleString(locale) }}</div><p class="widget-muted">{{ t(days === 0 ? 'extras.today' : days < 0 ? 'extras.daysAgo' : 'extras.daysLeft') }}</p><small>{{ new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(String(widget.settings.date))) }}</small><button class="text-button" @click="editing = true">{{ t('extras.editEvent') }}</button></template></div></template>
