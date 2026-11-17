<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onUnmounted, watch } from 'vue'
import AppCanvas from './AppCanvas.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import KonjMark from '@/components/ui/KonjMark.vue'
import { swatches, themes } from '@/data/themes'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance, WidgetId } from '@/types/widget'

const { t, locale } = useI18n()
const store = useWidgetsStore()
const editing = ref(false)
const dialog = ref<HTMLDialogElement>()
const panel = ref<'widgets' | 'settings'>('widgets')
const notice = ref('')
const removed = ref<WidgetInstance>()
let noticeTimer: ReturnType<typeof setTimeout> | undefined
let opener: HTMLElement | null = null

watch(locale, () => { notice.value = '' })
onUnmounted(() => clearTimeout(noticeTimer))

function openPanel(value: 'widgets' | 'settings') { opener = document.activeElement as HTMLElement; panel.value = value; dialog.value?.showModal() }
function closed() { opener?.focus() }
function announce(message: string) { notice.value = message; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => notice.value = '', 5000) }
function addWidget(type: WidgetId) { store.addWidget(type); announce(t('notice.added', { title: store.getDefinition(type)?.title })) }
function removeWidget(widget: WidgetInstance) { removed.value = structuredClone(JSON.parse(JSON.stringify(widget))); store.removeWidget(widget.id); announce(t('notice.removed')) }
function undo() { if (removed.value) { store.instances.push(removed.value); removed.value = undefined; announce(t('notice.restored')) } }
const count = (type: WidgetId) => store.instances.filter(w => w.type === type).length
</script>

<template>
  <main class="app-shell" :data-theme="store.preferences.theme">
    <div class="dashboard">
      <header class="topbar">
        <a href="#" class="brand" :aria-label="t('brand.home')" @click.prevent>
          <KonjMark :size="42" />
          <span class="brand-name">{{ t('brand.name') }}</span>
        </a>
        <nav class="toolbar" :aria-label="t('nav.tools')">
          <button class="tool" :aria-label="t('nav.add')" @click="openPanel('widgets')">
            <AppIcon name="plus" :size="18" /><span>{{ t('nav.add') }}</span>
          </button>
          <button class="tool" :class="{ active: editing }" :aria-label="editing ? t('nav.done') : t('nav.edit')" :aria-pressed="editing" @click="editing = !editing">
            <AppIcon :name="editing ? 'check' : 'edit'" :size="18" /><span>{{ editing ? t('nav.done') : t('nav.edit') }}</span>
          </button>
          <button class="tool icon-only" :aria-label="t('nav.settings')" @click="openPanel('settings')">
            <AppIcon name="settings" :size="18" />
          </button>
        </nav>
      </header>

      <p v-if="store.storageError" class="banner" role="alert">{{ t(store.storageError) }}</p>
      <p v-if="editing" class="banner subtle">{{ t('dashboard.hint') }} {{ t('dashboard.keyboard') }}</p>

      <AppCanvas :editing="editing" @add="openPanel('widgets')" @remove="removeWidget" />

      <footer class="page-footer">
        <span>{{ t('footer.text') }}</span>
        <button class="text-button" @click="openPanel('settings')">{{ t('footer.personalize') }}</button>
      </footer>
    </div>

    <div v-if="notice || removed" class="toast" role="status">
      <span>{{ notice || t('notice.removedShort') }}</span>
      <button v-if="removed" class="text-button" @click="undo">{{ t('common.undo') }}</button>
      <button class="icon-button small" :aria-label="t('common.dismiss')" @click="notice = ''; removed = undefined"><AppIcon name="close" :size="16" /></button>
    </div>

    <dialog ref="dialog" class="panel-dialog" aria-labelledby="panel-title" @close="closed" @click="($event.target === dialog) && dialog?.close()">
      <div class="panel-inner">
        <header class="panel-header">
          <h2 id="panel-title">{{ panel === 'widgets' ? t('panel.widgets') : t('panel.settings') }}</h2>
          <button class="icon-button" :aria-label="t('common.close')" @click="dialog?.close()"><AppIcon name="close" /></button>
        </header>

        <template v-if="panel === 'widgets'">
          <p class="panel-description">{{ t('panel.description') }}</p>
          <div class="catalog">
            <article v-for="definition in store.definitions" :key="definition.type" class="catalog-item">
              <span class="catalog-icon"><AppIcon :name="definition.type" :size="22" /></span>
              <div class="catalog-text">
                <h3>{{ definition.title }}</h3>
                <p>{{ definition.description }}</p>
              </div>
              <button class="secondary-button" :aria-label="`${t('common.add')} ${definition.title}`" @click="addWidget(definition.type)">
                <AppIcon name="plus" :size="16" />
                <span v-if="count(definition.type)" class="catalog-count">{{ count(definition.type).toLocaleString(locale) }}</span>
              </button>
            </article>
          </div>
          <p class="panel-note" role="status">{{ notice || t('panel.offline') }}</p>
        </template>

        <div v-else class="settings-form">
          <AppSelect
            :model-value="store.preferences.language"
            :label="t('settings.language')"
            :options="[{ value: 'fa', label: 'فارسی', lang: 'fa' }, { value: 'en', label: 'English', lang: 'en' }]"
            @update:model-value="store.preferences.language = $event === 'en' ? 'en' : 'fa'"
          />
          <label>{{ t('settings.name') }}<input v-model="store.preferences.name" :placeholder="t('settings.namePlaceholder')" maxlength="30" autocomplete="given-name" /></label>
          <fieldset>
            <legend>{{ t('settings.theme') }}</legend>
            <div class="theme-options">
              <label v-for="theme in themes" :key="theme" class="theme-option" :class="{ selected: store.preferences.theme === theme }">
                <input v-model="store.preferences.theme" type="radio" name="theme" :value="theme" />
                <span class="theme-swatch" :style="{ background: swatches[theme][0] }">
                  <span :style="{ background: swatches[theme][1] }" />
                  <span :style="{ background: swatches[theme][2] }" />
                </span>
                <span>{{ t(`settings.${theme}`) }}</span>
              </label>
            </div>
          </fieldset>
          <AppSelect v-model="store.preferences.timeZone" :label="t('settings.timeZone')" :options="[{ value: 'Asia/Tehran', label: t('settings.tehran') }, { value: 'local', label: t('settings.local') }]" />
          <p class="panel-note">{{ t('settings.privacy') }}</p>
        </div>
      </div>
    </dialog>
  </main>
</template>
