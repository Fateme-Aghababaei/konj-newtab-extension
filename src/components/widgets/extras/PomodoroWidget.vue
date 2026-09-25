<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance } from '@/types/widget'
const props = defineProps<{ widget: WidgetInstance }>()
const { t } = useI18n()
const store = useWidgetsStore()
const now = ref(Date.now())
const mode = computed(() => props.widget.settings.mode === 'break' ? 'break' : 'focus')
const duration = computed(() => (mode.value === 'focus' ? 25 : 5) * 60)
const end = computed(() => Number(props.widget.settings.endsAt) || 0)
const remaining = computed(() => end.value ? Math.max(0, Math.ceil((end.value - now.value) / 1000)) : Math.max(0, Number(props.widget.settings.remaining ?? duration.value)))
const display = computed(() => `${Math.floor(remaining.value / 60).toString().padStart(2, '0')}:${(remaining.value % 60).toString().padStart(2, '0')}`)
function save(data: Record<string, unknown>) { store.updateSettings(props.widget.id, data) }
function toggle() { now.value = Date.now(); if (end.value) save({ remaining: remaining.value, endsAt: 0 }); else save({ endsAt: now.value + (remaining.value || duration.value) * 1000, completed: false }) }
function reset(value = mode.value) { save({ mode: value, remaining: (value === 'focus' ? 25 : 5) * 60, endsAt: 0, completed: false }) }
const tick = setInterval(() => { now.value = Date.now(); if (end.value && remaining.value === 0) save({ endsAt: 0, remaining: 0, completed: true }) }, 250)
onUnmounted(() => clearInterval(tick))
</script>
<template><div class="extra-widget timer-widget"><div class="widget-tabs"><button v-for="value in (['focus', 'break'] as const)" :key="value" :aria-pressed="mode === value" @click="reset(value)">{{ t(`extras.${value}`) }}</button></div><div class="widget-number" dir="ltr" role="timer">{{ display }}</div><p class="widget-muted" role="status">{{ widget.settings.completed ? t('extras.sessionDone') : t('extras.timerHint') }}</p><div class="widget-controls"><button class="primary-button" @click="toggle">{{ t(end ? 'extras.pause' : 'extras.start') }}</button><button class="secondary-button" @click="reset()">{{ t('extras.reset') }}</button></div></div></template>
