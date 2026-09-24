<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  modelValue: string
  label: string
  options: { value: string; label: string; lang?: string }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const open = ref(false)
const active = ref(0)
const above = ref(false)
const maxHeight = ref(200)
const selected = computed(() => props.options.find(option => option.value === props.modelValue))

function show() {
  const rect = trigger.value!.getBoundingClientRect()
  const dialog = root.value?.closest('dialog')?.getBoundingClientRect()
  const bottom = Math.min(window.innerHeight, dialog?.bottom ?? window.innerHeight) - rect.bottom - 12
  const top = rect.top - Math.max(0, dialog?.top ?? 0) - 12
  above.value = bottom < props.options.length * 44 + 12 && top > bottom
  maxHeight.value = Math.max(44, Math.min(240, above.value ? top : bottom))
  active.value = Math.max(0, props.options.findIndex(option => option.value === props.modelValue))
  open.value = true
}
function choose(index: number) {
  const option = props.options[index]
  if (!option) return
  emit('update:modelValue', option.value)
  open.value = false
  trigger.value?.focus()
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault(); event.stopPropagation(); open.value = false
  } else if (event.key === 'Tab') {
    open.value = false
  } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    if (!open.value) show()
    else if (event.key === 'Home') active.value = 0
    else if (event.key === 'End') active.value = props.options.length - 1
    else active.value = (active.value + (event.key === 'ArrowDown' ? 1 : -1) + props.options.length) % props.options.length
    nextTick(() => document.getElementById(`${id}-${active.value}`)?.scrollIntoView({ block: 'nearest' }))
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (open.value) choose(active.value)
    else show()
  } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const match = props.options.findIndex(option => option.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()))
    if (match >= 0) { event.preventDefault(); if (!open.value) show(); active.value = match }
  }
}
function outside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('pointerdown', outside))
onUnmounted(() => document.removeEventListener('pointerdown', outside))
</script>

<template>
  <div ref="root" class="select-field" @focusout="!root?.contains($event.relatedTarget as Node) && (open = false)">
    <span :id="`${id}-label`" class="select-label">{{ label }}</span>
    <div class="select-control">
    <button ref="trigger" type="button" class="select-trigger" role="combobox" :aria-labelledby="`${id}-label`" aria-haspopup="listbox" :aria-expanded="open" :aria-controls="`${id}-options`" :aria-activedescendant="open ? `${id}-${active}` : undefined" @click="open ? (open = false) : show()" @keydown="keydown">
      <span :lang="selected?.lang">{{ selected?.label }}</span><AppIcon name="down" :size="18" />
    </button>
    <ul v-if="open" :id="`${id}-options`" class="select-options" :class="{ 'opens-above': above }" :style="{ maxHeight: `${maxHeight}px` }" role="listbox" :aria-labelledby="`${id}-label`">
      <li v-for="(option, index) in options" :id="`${id}-${index}`" :key="option.value" role="option" :aria-selected="modelValue === option.value" :lang="option.lang" :class="{ highlighted: active === index }" @pointermove="active = index" @pointerdown.prevent @click="choose(index)">
        <span>{{ option.label }}</span><AppIcon v-if="modelValue === option.value" name="check" :size="16" />
      </li>
    </ul>
    </div>
  </div>
</template>
