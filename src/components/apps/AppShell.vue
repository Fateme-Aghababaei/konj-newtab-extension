<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import AppCanvas from './AppCanvas.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SearchBox from '@/components/ui/SearchBox.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { themes } from '@/data/themes'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance, WidgetId } from '@/types/widget'
const { t, locale } = useI18n()
const store = useWidgetsStore()
const editing = ref(false)
const dialog = ref<HTMLDialogElement>()
const panel = ref<'widgets' | 'settings'>('widgets')
const notice = ref('')
watch(locale, () => { notice.value = '' })
const removed = ref<WidgetInstance>()
let noticeTimer: ReturnType<typeof setTimeout> | undefined
let opener: HTMLElement | null = null
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>
onMounted(() => timer = setInterval(() => now.value = new Date(), 60000))
onUnmounted(() => { clearInterval(timer); clearTimeout(noticeTimer) })
const greeting = computed(() => {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: store.preferences.timeZone === 'local' ? undefined : 'Asia/Tehran' }).format(now.value))
  return hour < 5 ? t('welcome.night') : hour < 12 ? t('welcome.morning') : hour < 17 ? t('welcome.day') : hour < 21 ? t('welcome.evening') : t('welcome.night')
})
function openPanel(value: 'widgets' | 'settings') { opener = document.activeElement as HTMLElement; panel.value = value; dialog.value?.showModal() }
function closed() { opener?.focus() }
function announce(message: string) { notice.value = message; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice.value = '', 5000) }
function addWidget(type: WidgetId) { store.addWidget(type); announce(t('notice.added', { title: store.getDefinition(type)?.title })) }
function removeWidget(widget: WidgetInstance) { removed.value = structuredClone(JSON.parse(JSON.stringify(widget))); store.removeWidget(widget.id); announce(t('notice.removed')) }
function undo() { if (removed.value) { store.instances.push(removed.value); removed.value = undefined; announce(t('notice.restored')) } }
</script>
<template>
  <main class="app-shell" :data-theme="store.preferences.theme" :class="{ opaque: store.preferences.opaque }">
    <div class="ambient-art" aria-hidden="true"><div class="sun-halo" /><div class="mountain mountain-back" /><div class="mountain mountain-front" /><div class="tile-pattern" /></div>
    <div class="dashboard">
      <header class="topbar"><a href="#" class="brand" :aria-label="t('brand.home')"><span class="brand-symbol">ک</span><span>{{ t('brand.name') }}<span class="brand-tagline">{{ t('brand.tagline') }}</span></span></a><nav class="toolbar glass" :aria-label="t('nav.tools')"><button class="toolbar-button" :aria-label="t('nav.add')" @click="openPanel('widgets')"><AppIcon name="plus" /><span>{{ t('nav.add') }}</span></button><span class="toolbar-divider" /><button class="toolbar-button" :class="{ active: editing }" :aria-label="editing ? t('nav.done') : t('nav.edit')" :aria-pressed="editing" @click="editing = !editing"><AppIcon :name="editing ? 'check' : 'edit'" /><span>{{ editing ? t('nav.done') : t('nav.edit') }}</span></button><button class="icon-button" :aria-label="t('nav.settings')" @click="openPanel('settings')"><AppIcon name="settings" /></button></nav></header>
      <section class="welcome"><span class="welcome-kicker"><span class="tiny-sun">✳</span> {{ t('welcome.kicker') }}</span><h1>{{ greeting }}<template v-if="store.preferences.name">{{ t('welcome.comma') }}{{ store.preferences.name }}</template><span class="greeting-dot">.</span></h1><p>{{ t('welcome.subtitle') }}</p><SearchBox /></section>
      <div class="dashboard-heading"><div><span class="section-marker" /><h2>{{ editing ? t('dashboard.edit') : t('dashboard.title') }}</h2><span class="dashboard-subtitle">{{ editing ? t('dashboard.hint') : t('dashboard.subtitle') }}</span></div><span class="saved-label"><span class="status-dot" />{{ store.storageError ? t('dashboard.unavailable') : t('dashboard.personal') }}</span></div>
      <p v-if="store.storageError" class="storage-error" role="alert">{{ t(store.storageError) }}</p>
      <p v-if="editing" class="edit-tip">{{ t('dashboard.keyboard') }}</p>
      <AppCanvas :editing="editing" @add="openPanel('widgets')" @remove="removeWidget" />
      <footer class="page-footer"><span>{{ t('footer.text') }}</span><span class="footer-mark">{{ t('brand.name') }} <span>✧</span></span><button class="text-button" @click="openPanel('settings')">{{ t('footer.personalize') }} <AppIcon name="arrow" :size="15" /></button></footer>
    </div>
    <div v-if="notice || removed" class="toast glass" role="status"><AppIcon name="check" :size="18" /><span>{{ notice || t('notice.removedShort') }}</span><button v-if="removed" class="text-button" @click="undo">{{ t('common.undo') }}</button><button class="icon-button small" :aria-label="t('common.dismiss')" @click="notice = ''; removed = undefined"><AppIcon name="close" :size="16" /></button></div>
    <dialog ref="dialog" class="panel-dialog" aria-labelledby="panel-title" @close="closed" @click="($event.target === dialog) && dialog?.close()">
      <div class="panel-inner"><header class="panel-header"><div><span class="welcome-kicker">{{ t('panel.kicker') }}</span><h2 id="panel-title">{{ panel === 'widgets' ? t('panel.widgets') : t('panel.settings') }}</h2></div><button class="icon-button" :aria-label="t('common.close')" @click="dialog?.close()"><AppIcon name="close" /></button></header>
      <template v-if="panel === 'widgets'"><p class="panel-description">{{ t('panel.description') }}</p><div class="catalog"><article v-for="definition in store.definitions" :key="definition.type" class="catalog-item"><span class="catalog-icon"><AppIcon :name="definition.type" :size="24" /></span><h3>{{ definition.title }}</h3><p>{{ definition.description }}</p><button class="secondary-button" @click="addWidget(definition.type)"><AppIcon name="plus" :size="17" />{{ t('common.add') }}<span v-if="store.instances.some(w => w.type === definition.type)" class="catalog-count">{{ t('panel.count', { count: store.instances.filter(w => w.type === definition.type).length.toLocaleString(locale) }) }}</span></button></article></div><p class="panel-note" role="status">{{ notice || t('panel.offline') }}</p></template>
      <div v-else class="settings-form">
        <AppSelect :model-value="store.preferences.language" :label="t('settings.language')" :options="[{ value: 'fa', label: 'فارسی', lang: 'fa' }, { value: 'en', label: 'English', lang: 'en' }]" @update:model-value="store.preferences.language = $event === 'en' ? 'en' : 'fa'" /><label>{{ t('settings.name') }}<input v-model="store.preferences.name" :placeholder="t('settings.namePlaceholder')" maxlength="30" autocomplete="given-name" /></label><fieldset><legend>{{ t('settings.theme') }}</legend><div class="theme-options"><label v-for="theme in themes" :key="theme" class="theme-option" :class="{ selected: store.preferences.theme === theme }"><input v-model="store.preferences.theme" type="radio" name="theme" :value="theme" /><span class="theme-swatch" :data-theme="theme" /><span>{{ t(`settings.${theme}`) }}</span></label></div></fieldset><AppSelect v-model="store.preferences.timeZone" :label="t('settings.timeZone')" :options="[{ value: 'Asia/Tehran', label: t('settings.tehran') }, { value: 'local', label: t('settings.local') }]" /><label class="toggle-label"><span>{{ t('settings.opaque') }}<small>{{ t('settings.opaqueHint') }}</small></span><input v-model="store.preferences.opaque" type="checkbox" /></label><p class="panel-note">{{ t('settings.privacy') }}</p></div>
      </div>
    </dialog>
  </main>
</template>
