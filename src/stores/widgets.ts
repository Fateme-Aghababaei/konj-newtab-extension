import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { WidgetDefinition, WidgetInstance, WidgetId, WidgetPosition } from '@/types/widget'
import { isTheme, type Theme } from '@/data/themes'
import { i18n } from '@/i18n'
import { getStorage, setStorage } from '@/utils/storage'

const definitions: WidgetDefinition[] = [
  { type: 'clock', title: 'widgets.clock.title', description: 'widgets.clock.description', defaultSize: { w: 4, h: 3 }, minSize: { w: 3, h: 3 }, defaultSettings: {} },
  { type: 'hafez', title: 'widgets.hafez.title', description: 'widgets.hafez.description', defaultSize: { w: 4, h: 3 }, minSize: { w: 3, h: 3 }, defaultSettings: {} },
  { type: 'todo', title: 'widgets.todo.title', description: 'widgets.todo.description', defaultSize: { w: 4, h: 3 }, minSize: { w: 3, h: 3 }, defaultSettings: { tasks: [] } },
  { type: 'quick-links', title: 'widgets.quick-links.title', description: 'widgets.quick-links.description', defaultSize: { w: 8, h: 2 }, minSize: { w: 4, h: 2 }, defaultSettings: { links: [{ id: 'wiki', title: 'ویکی‌پدیا', url: 'https://fa.wikipedia.org' }, { id: 'aparat', title: 'آپارات', url: 'https://www.aparat.com' }, { id: 'github', title: 'گیت‌هاب', url: 'https://github.com' }] } },
  { type: 'greeting', title: 'widgets.greeting.title', description: 'widgets.greeting.description', defaultSize: { w: 4, h: 2 }, minSize: { w: 3, h: 2 }, defaultSettings: { note: '' } },
  { type: 'search', title: 'widgets.search.title', description: 'widgets.search.description', defaultSize: { w: 8, h: 2 }, minSize: { w: 4, h: 2 }, defaultSettings: {} },
]
interface Preferences { language: 'fa' | 'en'; name: string; theme: Theme; opaque: boolean; timeZone: string }
interface Saved { instances: WidgetInstance[]; preferences: Preferences }
export const useWidgetsStore = defineStore('widgets', () => {
  const instances = ref<WidgetInstance[]>([])
  const preferences = ref<Preferences>({ language: 'fa', name: '', theme: 'dusk', opaque: false, timeZone: 'Asia/Tehran' })
  const storageError = ref('')
  let canSave = true
  const localizedDefinitions = computed(() => definitions.map(d => ({ ...d, title: i18n.global.t(d.title), description: i18n.global.t(d.description!) })))
  const getDefinition = (type: WidgetId) => localizedDefinitions.value.find(d => d.type === type)
  function addWidget(type: WidgetId, position?: Partial<WidgetPosition>) {
    const definition = getDefinition(type)!
    const widget: WidgetInstance = { id: crypto.randomUUID(), type, position: { x: 0, y: Math.max(0, ...instances.value.map(w => w.position.y + w.position.h)), ...definition.defaultSize, ...position }, settings: structuredClone(definition.defaultSettings) }
    instances.value.push(widget)
    return widget
  }
  try {
    const saved = getStorage<Saved>()
    if (saved) {
      if (!Array.isArray(saved.instances) || !saved.instances.every(w => w && getDefinition(w.type) && typeof w.id === 'string' && w.settings && typeof w.settings === 'object' && w.position && ['x', 'y', 'w', 'h'].every(k => Number.isFinite(w.position[k as keyof WidgetPosition])) && w.position.x >= 0 && w.position.y >= 0 && w.position.w >= 1 && w.position.x + w.position.w <= 12 && w.position.h >= 1) || new Set(saved.instances.map(w => w.id)).size !== saved.instances.length) throw new Error('Invalid saved dashboard')
      instances.value = saved.instances
      const p = saved.preferences
      if (p) {
        preferences.value = { language: p.language === 'en' ? 'en' : 'fa', name: typeof p.name === 'string' ? p.name : '', theme: isTheme(p.theme) ? p.theme : 'dusk', opaque: p.opaque === true, timeZone: p.timeZone === 'local' ? 'local' : 'Asia/Tehran' }
      }
    } else {
      addWidget('clock', { x: 0, y: 0 }); addWidget('hafez', { x: 4, y: 0 }); addWidget('todo', { x: 8, y: 0 })
      addWidget('quick-links', { x: 0, y: 3 }); addWidget('greeting', { x: 8, y: 3 })
    }
  } catch {
    canSave = false
    storageError.value = 'storage.read'
  }
  watch([instances, preferences], () => {
    if (!canSave) return
    try { setStorage({ instances: instances.value, preferences: preferences.value }); storageError.value = '' }
    catch { storageError.value = 'storage.write' }
  }, { deep: true, flush: 'sync', immediate: true })
  function updatePosition(id: string, position: Partial<WidgetPosition>) {
    const w = instances.value.find(w => w.id === id)
    if (w && Object.entries(position).some(([key, value]) => w.position[key as keyof WidgetPosition] !== value)) w.position = { ...w.position, ...position }
  }
  function updateSettings(id: string, settings: Record<string, unknown>) {
    const w = instances.value.find(w => w.id === id)
    if (w) w.settings = { ...w.settings, ...settings }
  }
  function removeWidget(id: string) { instances.value = instances.value.filter(w => w.id !== id) }
  return { instances, preferences, storageError, definitions: localizedDefinitions, getDefinition, addWidget, updatePosition, updateSettings, removeWidget }
})
