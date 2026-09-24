<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { GridItem, GridLayout, type Layout } from 'grid-layout-plus'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance } from '@/types/widget'
import WidgetContent from './WidgetContent.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
const { t, locale } = useI18n()
const props = defineProps<{ editing: boolean }>()
const emit = defineEmits<{ remove: [widget: WidgetInstance]; add: [] }>()
const store = useWidgetsStore()
const rtl = computed(() => locale.value === 'fa')
watch(locale, () => { resizing.value = undefined })
const compact = ref(window.innerWidth < 760)
function resize() { compact.value = window.innerWidth < 760 }
onMounted(() => window.addEventListener('resize', resize))
onUnmounted(() => window.removeEventListener('resize', resize))
const ordered = computed(() => [...store.instances].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x))
const resizing = ref<{ id: string; startX: number; startY: number; column: number; w: number; h: number; previewW: number; previewH: number }>()
function startResize(event: PointerEvent, widget: WidgetInstance) {
  if (event.button !== 0) return
  const button = event.currentTarget as HTMLElement
  const width = button.closest('.widget-wrap')!.getBoundingClientRect().width
  resizing.value = { id: widget.id, startX: event.clientX, startY: event.clientY, column: (width + 20) / widget.position.w, w: widget.position.w, h: widget.position.h, previewW: widget.position.w, previewH: widget.position.h }
  button.setPointerCapture(event.pointerId)
  event.preventDefault()
}
function resizePreview(event: PointerEvent, widget: WidgetInstance) {
  const value = resizing.value
  if (!value || value.id !== widget.id) return
  const min = store.getDefinition(widget.type)!.minSize!
  value.previewW = Math.max(min.w, Math.min(12 - widget.position.x, value.w + Math.round(((event.clientX - value.startX) * (rtl.value ? -1 : 1)) / value.column)))
  value.previewH = Math.max(min.h, value.h + Math.round((event.clientY - value.startY) / 106))
}
function finishResize(widget: WidgetInstance) {
  const value = resizing.value
  if (!value || value.id !== widget.id) return
  store.updatePosition(widget.id, { w: value.previewW, h: value.previewH })
  resizing.value = undefined
}
function keyboardResize(event: KeyboardEvent, widget: WidgetInstance) {
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  const min = store.getDefinition(widget.type)!.minSize!
  store.updatePosition(widget.id, { w: Math.max(min.w, Math.min(12 - widget.position.x, widget.position.w + (event.key === (rtl.value ? 'ArrowLeft' : 'ArrowRight') ? 1 : event.key === (rtl.value ? 'ArrowRight' : 'ArrowLeft') ? -1 : 0))), h: Math.max(min.h, widget.position.h + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0)) })
}
const layout = computed<Layout>(() => store.instances.map(w => ({ i: w.id, ...w.position })))
function updateLayout(value: Layout) {
  if (!props.editing || compact.value) return
  for (const item of value) store.updatePosition(String(item.i), { x: item.x, y: item.y, w: item.w, h: item.h })
}
function move(widget: WidgetInstance, direction: number) {
  const sorted = ordered.value
  const index = sorted.findIndex(w => w.id === widget.id)
  const target = sorted[index + direction]
  if (!target) return
  // Stack in reading order so keyboard movement also works with differently sized widgets.
  ;[sorted[index], sorted[index + direction]] = [target, widget]
  let y = 0
  for (const item of sorted) { store.updatePosition(item.id, { x: 0, y }); y += item.position.h }
}
</script>
<template>
  <section v-if="!store.instances.length" class="empty-dashboard surface"><AppIcon name="quick-links" :size="36" /><h2>{{ t('empty.title') }}</h2><p>{{ t('empty.hint') }}</p><button class="primary-button" @click="emit('add')"><AppIcon name="plus" />{{ t('nav.add') }}</button></section>
  <component :is="compact ? 'div' : GridLayout" v-else :key="`${compact ? 'mobile' : 'desktop'}-${locale}`" :layout="layout" :col-num="12" :row-height="86" :margin="[20, 20]" :is-draggable="editing" :is-resizable="false" :vertical-compact="true" :is-mirrored="false" :use-css-transforms="true" :class="['widget-grid', { 'mobile-grid': compact, 'is-editing': editing }]" @layout-updated="updateLayout">
    <component :is="compact ? 'div' : GridItem" v-for="widget in (compact ? ordered : store.instances)" :key="widget.id" :i="widget.id" :x="widget.position.x" :y="widget.position.y" :w="widget.position.w" :h="widget.position.h" :min-w="store.getDefinition(widget.type)?.minSize?.w" :min-h="store.getDefinition(widget.type)?.minSize?.h" :max-w="12" drag-allow-from=".drag-handle" drag-ignore-from="button, input, textarea, a" :class="['widget-wrap', `widget-${widget.type}`]">
      <article class="widget surface" :style="resizing?.id === widget.id ? { width: `${resizing.previewW * resizing.column - 20}px`, height: `${resizing.previewH * 106 - 20}px` } : undefined" :aria-label="store.getDefinition(widget.type)?.title">
        <header class="widget-header"><div :class="['widget-title', { 'drag-handle': editing }] "><AppIcon :name="editing ? 'drag' : widget.type" :size="18" /><h2>{{ store.getDefinition(widget.type)?.title }}</h2></div><span v-if="!editing && widget.type === 'hafez'" class="eyebrow">{{ t('grid.poetry') }}</span><div v-if="editing" class="widget-actions"><button class="icon-button small" :disabled="ordered[0]?.id === widget.id" :aria-label="t('grid.previous')" @click="move(widget, -1)"><AppIcon name="up" :size="16" /></button><button class="icon-button small" :disabled="ordered[ordered.length - 1]?.id === widget.id" :aria-label="t('grid.next')" @click="move(widget, 1)"><AppIcon name="down" :size="16" /></button><button class="icon-button small danger" :aria-label="t('common.remove', { title: store.getDefinition(widget.type)?.title })" @click="emit('remove', widget)"><AppIcon name="close" :size="18" /></button></div></header>
        <WidgetContent :widget="widget" />
        <button v-if="editing && !compact" class="resize-handle" :aria-label="t('grid.resize', { title: store.getDefinition(widget.type)?.title })" :title="t('grid.resizeHint')" @pointerdown.stop="startResize($event, widget)" @pointermove="resizePreview($event, widget)" @pointerup="finishResize(widget)" @pointercancel="resizing = undefined" @lostpointercapture="resizing = undefined" @keydown="keyboardResize($event, widget)" />
      </article>
    </component>
  </component>
</template>
