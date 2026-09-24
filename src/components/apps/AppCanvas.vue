<script setup lang="ts">
import WidgetGrid from '@/components/widgets/WidgetGrid.vue'
import type { WidgetInstance } from '@/types/widget'
defineProps<{ editing: boolean }>()
const emit = defineEmits<{ remove: [widget: WidgetInstance]; add: [] }>()
</script>
<template><WidgetGrid :editing="editing" @remove="emit('remove', $event)" @add="emit('add')" /></template>
