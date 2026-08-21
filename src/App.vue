<script setup lang="ts">
import { ref } from 'vue'
import { GridLayout } from 'grid-layout-plus'

// Mirrors the WidgetInstance shape we defined: instanceId/widgetId/position/size
// grid-layout-plus wants { i, x, y, w, h } — x/y/w/h map directly to our
// GridPosition + WidgetSize, i maps to instanceId.
interface DemoWidget {
  i: string
  x: number
  y: number
  w: number
  h: number
  widgetId: string
  label: string
  emoji: string
}

const layout = ref<DemoWidget[]>([
  { i: 'w1', x: 0, y: 0, w: 3, h: 2, widgetId: 'clock', label: 'ساعت', emoji: '🕐' },
  { i: 'w2', x: 3, y: 0, w: 4, h: 2, widgetId: 'greeting', label: 'خوش‌آمد', emoji: '👋' },
  { i: 'w3', x: 0, y: 2, w: 3, h: 3, widgetId: 'hafez', label: 'فال حافظ', emoji: '📖' },
  { i: 'w4', x: 3, y: 2, w: 4, h: 3, widgetId: 'todo', label: 'کارها', emoji: '✅' },
  { i: 'w5', x: 7, y: 0, w: 3, h: 5, widgetId: 'links', label: 'میانبرها', emoji: '🔗' },
])

const isRtl = ref(true)
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 p-8" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-semibold">Konj — RTL Drag &amp; Resize Prototype</h1>
        <button
          class="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm transition-colors"
          @click="isRtl = !isRtl"
        >
          Toggle direction: {{ isRtl ? 'RTL (فارسی)' : 'LTR' }}
        </button>
      </div>

      <p class="text-neutral-400 text-sm mb-6">
        Drag widgets by their body, resize from the corner handle. Confirm drag direction,
        resize-handle position, and collision behavior all feel natural in RTL — not mirrored
        incorrectly, not stuck with LTR muscle memory.
      </p>

      <GridLayout
        v-model:layout="layout"
        :col-num="10"
        :row-height="70"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :prevent-collision="false"
        :margin="[12, 12]"
        class="min-h-[500px]"
      >
        <template #item="{ item }">
          <div
            class="h-full w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col justify-between cursor-move select-none hover:border-neutral-600 transition-colors"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ (item as DemoWidget).emoji }}</span>
              <span class="font-medium">{{ (item as DemoWidget).label }}</span>
            </div>
            <div class="text-xs text-neutral-500">
              {{ item.x }},{{ item.y }} · {{ item.w }}×{{ item.h }}
            </div>
          </div>
        </template>
      </GridLayout>
    </div>
  </div>
</template>
