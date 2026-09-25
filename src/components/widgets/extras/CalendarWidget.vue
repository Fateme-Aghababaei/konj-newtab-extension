<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance } from '@/types/widget'
const props = defineProps<{ widget: WidgetInstance }>()
const { t, locale } = useI18n()
const store = useWidgetsStore()
const now = ref(new Date())
const today = computed(() => new Intl.DateTimeFormat('en-CA', { timeZone: store.preferences.timeZone === 'local' ? undefined : 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now.value))
const cursor = ref(new Date(`${today.value}T12:00:00Z`))
const calendar = computed(() => String(props.widget.settings.calendar || (locale.value === 'fa' ? 'persian' : 'gregory')))
function parts(date: Date) { return new Intl.DateTimeFormat('en', { calendar: calendar.value, timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(date) }
function day(date: Date) { return Number(parts(date).find(p => p.type === 'day')!.value) }
function shift(date: Date, amount: number) { return new Date(date.getTime() + amount * 86400000) }
const first = computed(() => shift(cursor.value, 1 - day(cursor.value)))
const dates = computed(() => { const result: Date[] = []; for (let i = 0; i < 32; i++) { const date = shift(first.value, i); if (i && day(date) === 1) break; result.push(date) } return result })
const offset = computed(() => (first.value.getUTCDay() + (locale.value === 'fa' ? 1 : 0)) % 7)
const weekdays = computed(() => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale.value, { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, locale.value === 'fa' ? 6 + i : 7 + i)))))
function key(date: Date) { return date.toISOString().slice(0, 10) }
function move(amount: number) { cursor.value = amount < 0 ? shift(first.value, -1) : shift(first.value, dates.value.length) }
interface Occasion { id: string; title: string; date: string }
const occasions = computed<Occasion[]>(() => Array.isArray(props.widget.settings.occasions) ? props.widget.settings.occasions.filter((e): e is Occasion => !!e && typeof e.id === 'string' && typeof e.title === 'string' && typeof e.date === 'string' && Number.isFinite(Date.parse(e.date))) : [])
const upcoming = computed(() => occasions.value.filter(e => e.date >= today.value).sort((a, b) => a.date.localeCompare(b.date)))
const title = ref(''); const selected = ref(today.value); const adding = ref(false)
function add() { if (!title.value.trim() || !Number.isFinite(Date.parse(selected.value))) return; store.updateSettings(props.widget.id, { occasions: [...occasions.value, { id: crypto.randomUUID(), title: title.value.trim(), date: selected.value }] }); title.value = ''; adding.value = false }
const tick = setInterval(() => now.value = new Date(), 30000)
onUnmounted(() => clearInterval(tick))
</script>
<template><div class="extra-widget calendar-content"><div class="widget-tabs"><button v-for="value in ['persian', 'gregory']" :key="value" :aria-pressed="calendar === value" @click="store.updateSettings(widget.id, { calendar: value })">{{ t(`extras.${value}`) }}</button></div><div class="calendar-nav"><button class="icon-button small" :aria-label="t('extras.previousMonth')" @click="move(-1)">−</button><strong>{{ new Intl.DateTimeFormat(locale, { calendar, month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first) }}</strong><button class="icon-button small" :aria-label="t('extras.nextMonth')" @click="move(1)">+</button></div><div class="calendar-grid"><small v-for="(name, index) in weekdays" :key="`weekday-${index}`">{{ name }}</small><span v-for="n in offset" :key="`empty-${n}`" /><button v-for="date in dates" :key="key(date)" :class="{ 'is-today': key(date) === today, 'has-occasion': occasions.some(e => e.date === key(date)) }" :aria-label="new Intl.DateTimeFormat(locale, { dateStyle: 'full', calendar, timeZone: 'UTC' }).format(date)" :aria-current="key(date) === today ? 'date' : undefined" @click="selected = key(date); adding = true">{{ day(date).toLocaleString(locale) }}</button></div><button class="text-button" @click="adding = !adding">{{ t('extras.addOccasion') }}</button><form v-if="adding" class="widget-form" @submit.prevent="add"><label>{{ t('extras.eventTitle') }}<input v-model="title" required maxlength="80" /></label><label>{{ t('extras.date') }}<input v-model="selected" type="date" required /></label><div class="widget-controls"><button class="secondary-button">{{ t('common.save') }}</button><button type="button" class="text-button" @click="adding = false">{{ t('common.cancel') }}</button></div></form><div v-else class="occasions-list"><small class="widget-muted">{{ t(upcoming.length ? 'extras.upcoming' : 'extras.noOccasions') }}</small><div v-for="event in upcoming" :key="event.id" class="occasion"><span dir="auto">{{ event.title }}<small>{{ new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', calendar, timeZone: 'UTC' }).format(new Date(event.date)) }}</small></span><button class="icon-button small" :aria-label="t('common.remove', { title: event.title })" @click="store.updateSettings(widget.id, { occasions: occasions.filter(e => e.id !== event.id) })">×</button></div></div></div></template>
