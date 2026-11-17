<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { WidgetInstance } from '@/types/widget'
import { useWidgetsStore } from '@/stores/widgets'
import AppIcon from '@/components/ui/AppIcon.vue'
import SearchBox from '@/components/ui/SearchBox.vue'
import PomodoroWidget from './extras/PomodoroWidget.vue'
import CalendarWidget from './extras/CalendarWidget.vue'
import WeatherWidget from './extras/WeatherWidget.vue'
import CountdownWidget from './extras/CountdownWidget.vue'
import AmbientWidget from './extras/AmbientWidget.vue'
import WelcomeWidget from './extras/WelcomeWidget.vue'
import { poems } from '@/data/poems'
import { phaseOf } from '@/utils/sky'
const { t, locale } = useI18n()
const props = defineProps<{ widget: WidgetInstance }>()
const store = useWidgetsStore()
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (props.widget.type === 'clock') timer = setInterval(() => now.value = new Date(), 1000)
})
onUnmounted(() => clearInterval(timer))
const zone = computed(() => store.preferences.timeZone === 'local' ? undefined : 'Asia/Tehran')
const time = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zone.value }).format(now.value))
const date = computed(() => new Intl.DateTimeFormat(locale.value, { calendar: 'persian', weekday: 'long', day: 'numeric', month: 'long', timeZone: zone.value }).format(now.value))
const westernDate = computed(() => new Intl.DateTimeFormat(locale.value, { calendar: 'gregory', day: 'numeric', month: 'long', year: 'numeric', timeZone: zone.value }).format(now.value))
const clockPhase = computed(() => phaseOf(Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: zone.value }).format(now.value))))

const poem = computed(() => poems[Math.abs(Number(props.widget.settings.poem) || 0) % poems.length]!)
// فال حافظ: a short pause «to make an intention», then a different couplet.
const drawing = ref(false)
const poemKey = ref(0)
function drawFal() {
  drawing.value = true
  const current = Math.abs(Number(props.widget.settings.poem) || 0) % poems.length
  const next = (current + 1 + Math.floor(Math.random() * (poems.length - 1))) % poems.length
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  setTimeout(() => {
    store.updateSettings(props.widget.id, { poem: next })
    poemKey.value++
    drawing.value = false
  }, reduce ? 0 : 700)
}
interface Task { id: string; text: string; done: boolean }
const tasks = computed<Task[]>(() => Array.isArray(props.widget.settings.tasks) ? props.widget.settings.tasks.filter((t): t is Task => !!t && typeof t.id === 'string' && typeof t.text === 'string' && typeof t.done === 'boolean') : [])
const draft = ref('')
function addTask() {
  if (!draft.value.trim()) return
  store.updateSettings(props.widget.id, { tasks: [...tasks.value, { id: crypto.randomUUID(), text: draft.value.trim(), done: false }] }); draft.value = ''
}
const burst = ref('')
const doneCount = computed(() => tasks.value.filter(task => task.done).length)
function toggleTask(id: string) {
  const finishing = tasks.value.find(task => task.id === id)?.done === false
  store.updateSettings(props.widget.id, { tasks: tasks.value.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  if (finishing) { burst.value = id; setTimeout(() => { if (burst.value === id) burst.value = '' }, 700) }
}
function deleteTask(id: string) { store.updateSettings(props.widget.id, { tasks: tasks.value.filter(t => t.id !== id) }) }
interface Link { id: string; title: string; url: string }
function linkLabel(link: Link) {
  // Translate only unchanged built-in labels, never user-authored names.
  const defaults: Record<string, string> = { wiki: 'ویکی‌پدیا', aparat: 'آپارات', github: 'گیت‌هاب' }
  return defaults[link.id] === link.title ? t(`links.${link.id}`) : link.title
}
function safeUrl(value: string) { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null } catch { return null } }
const links = computed<Link[]>(() => Array.isArray(props.widget.settings.links) ? props.widget.settings.links.filter((l): l is Link => !!l && typeof l.id === 'string' && typeof l.title === 'string' && typeof l.url === 'string' && !!safeUrl(l.url)) : [])
const linkForm = ref(false)
const linkTitle = ref(''); const linkUrl = ref(''); const linkError = ref('')
function addLink() {
  const raw = linkUrl.value.trim()
  const url = safeUrl(raw.includes('://') ? raw : `https://${raw}`)
  if (!url || !linkTitle.value.trim()) { linkError.value = 'links.invalid'; return }
  store.updateSettings(props.widget.id, { links: [...links.value, { id: crypto.randomUUID(), title: linkTitle.value.trim(), url }] })
  linkForm.value = false; linkTitle.value = ''; linkUrl.value = ''; linkError.value = ''
}
const managingLinks = ref(false)
</script>
<template>
  <PomodoroWidget v-if="widget.type === 'pomodoro'" :widget="widget" />
  <CalendarWidget v-else-if="widget.type === 'calendar'" :widget="widget" />
  <WeatherWidget v-else-if="widget.type === 'weather'" :widget="widget" />
  <CountdownWidget v-else-if="widget.type === 'countdown'" :widget="widget" />
  <AmbientWidget v-else-if="widget.type === 'ambient'" :widget="widget" />
  <WelcomeWidget v-else-if="widget.type === 'welcome'" />
  <div v-else-if="widget.type === 'clock'" class="clock-content">
    <span class="clock-phase">{{ t(`welcome.phase.${clockPhase}`) }}</span>
    <div class="clock-time" dir="ltr">{{ time }}</div>
    <div class="persian-date">{{ date }}</div>
    <div class="western-date">{{ westernDate }}</div>
    <span class="widget-foot">{{ zone ? t('clock.tehran') : t('clock.local') }}</span>
  </div>
  <div v-else-if="widget.type === 'hafez'" class="poem-content" :class="{ drawing }">
    <p class="poem-intent" aria-live="polite">{{ drawing ? t('poem.intent') : '' }}</p>
    <div :key="poemKey" class="poem-lines" lang="fa" dir="rtl"><p v-for="line in poem" :key="line">{{ line }}</p></div>
    <div class="widget-foot"><span>{{ t('poem.source') }}</span><button class="fal-button" :disabled="drawing" @click="drawFal"><span class="fal-star" aria-hidden="true" />{{ t('poem.next') }}</button></div>
  </div>
  <div v-else-if="widget.type === 'todo'" class="todo-content">
    <div v-if="!tasks.length" class="empty-tasks">
      <!-- An estekan of tea, still steaming -->
      <svg class="tea" width="44" height="52" viewBox="0 0 44 52" aria-hidden="true">
        <g class="steam" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".6"><path d="M18 12c-3-3 3-5 0-9" /><path d="M26 12c-3-3 3-5 0-9" /></g>
        <path d="M11 17h22c0 6-4 9-4 15s4 8 3 13H12c-1-5 3-7 3-13s-4-9-4-15Z" fill="currentColor" opacity=".15" />
        <path d="M13.5 24h17c-1.2 3-2.5 5-2.5 8s2.6 6 2.3 11H13.7c-.3-5 2.3-8 2.3-11s-1.3-5-2.5-8Z" fill="currentColor" opacity=".85" />
        <path d="M11 17h22c0 6-4 9-4 15s4 8 3 13H12c-1-5 3-7 3-13s-4-9-4-15Z" fill="none" stroke="currentColor" stroke-width="1.6" />
        <ellipse cx="22" cy="48" rx="15" ry="2.6" fill="currentColor" opacity=".25" />
      </svg>
      <p>{{ t('todo.empty') }}</p>
    </div>
    <ul v-else class="task-list"><li v-for="task in tasks" :key="task.id"><label :class="{ completed: task.done }"><span class="check-wrap"><input type="checkbox" :checked="task.done" @change="toggleTask(task.id)" /><span v-if="burst === task.id" class="burst" aria-hidden="true"><i v-for="n in 8" :key="n" :style="{ '--a': `${n * 45}deg` }" /></span></span><span dir="auto">{{ task.text }}</span></label><button class="icon-button small" :aria-label="t('common.remove', { title: task.text })" @click="deleteTask(task.id)"><AppIcon name="close" :size="14" /></button></li></ul>
    <form class="task-form" @submit.prevent="addTask"><input v-model="draft" :placeholder="t('todo.placeholder')" :aria-label="t('todo.input')" maxlength="200" /><button class="icon-button" :aria-label="t('todo.add')" :disabled="!draft.trim()"><AppIcon name="plus" :size="18" /></button></form>
    <div v-if="tasks.length" class="task-progress" aria-hidden="true"><span :style="{ width: `${(doneCount / tasks.length) * 100}%` }" /></div>
    <small v-if="tasks.length" class="widget-foot" :class="{ 'all-done': doneCount === tasks.length }">{{ doneCount === tasks.length ? t('todo.allDone') : t('todo.count', { done: doneCount.toLocaleString(locale), total: tasks.length.toLocaleString(locale) }) }}</small>
  </div>
  <div v-else-if="widget.type === 'quick-links'" class="links-content">
    <form v-if="linkForm" class="link-form" @submit.prevent="addLink"><input v-model="linkTitle" :placeholder="t('links.name')" :aria-label="t('links.name')" required maxlength="30" /><input v-model="linkUrl" placeholder="example.com" :aria-label="t('links.url')" dir="ltr" required maxlength="2048" /><button class="text-button" type="submit">{{ t('common.save') }}</button><button class="icon-button" type="button" :aria-label="t('common.cancel')" @click="linkForm = false"><AppIcon name="close" /></button><small v-if="linkError" role="alert">{{ t(linkError) }}</small></form>
    <div v-else class="links-list"><div v-for="link in links" :key="link.id" class="shortcut"><a :href="link.url"><span class="shortcut-icon">{{ linkLabel(link).charAt(0).toUpperCase() }}</span><span>{{ linkLabel(link) }}</span></a><button v-if="managingLinks" class="remove-link" :aria-label="t('common.remove', { title: linkLabel(link) })" @click="store.updateSettings(widget.id, { links: links.filter(l => l.id !== link.id) })"><AppIcon name="close" :size="14" /></button></div><button class="shortcut add-shortcut" @click="linkForm = true"><span class="shortcut-icon"><AppIcon name="plus" /></span><span>{{ t('common.add') }}</span></button><button v-if="links.length" class="icon-button manage-links" :aria-label="managingLinks ? t('links.done') : t('links.edit')" :aria-pressed="managingLinks" @click="managingLinks = !managingLinks"><AppIcon :name="managingLinks ? 'check' : 'edit'" :size="16" /></button></div>
  </div>
  <div v-else-if="widget.type === 'greeting'" class="note-content"><textarea dir="auto" :value="typeof widget.settings.note === 'string' ? widget.settings.note : ''" :aria-label="t('note.label')" :placeholder="t('note.placeholder')" maxlength="5000" @input="store.updateSettings(widget.id, { note: ($event.target as HTMLTextAreaElement).value })" /></div>
  <div v-else-if="widget.type === 'search'" class="search-content"><SearchBox /></div>
</template>
