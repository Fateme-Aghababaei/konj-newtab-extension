<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWidgetsStore } from '@/stores/widgets'
import type { WidgetInstance } from '@/types/widget'
const props = defineProps<{ widget: WidgetInstance }>()
const { t } = useI18n()
const store = useWidgetsStore()
const playing = ref(false)
const error = ref(false)
const sound = computed(() => String(props.widget.settings.sound || 'rain'))
const volume = computed(() => Math.max(0, Math.min(1, Number(props.widget.settings.volume ?? .3))))
let context: AudioContext | undefined
let gain: GainNode | undefined
let generation = 0
function stop() { generation++; if (context) void context.close(); context = undefined; gain = undefined; playing.value = false }
async function play() {
 stop(); const current = generation; error.value = false
 try {
  const audio = new AudioContext(); context = audio; await audio.resume()
  if (current !== generation) return
  const buffer = audio.createBuffer(1, audio.sampleRate * 8, audio.sampleRate)
  const data = buffer.getChannelData(0)
  let brown = 0
  for (let i = 0; i < data.length; i++) { const white = Math.random() * 2 - 1; brown = (brown + .02 * white) / 1.02; data[i] = sound.value === 'rain' ? white * .4 : brown * 3.5 }
  const source = audio.createBufferSource(); source.buffer = buffer; source.loop = true
  const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = sound.value === 'rain' ? 2500 : 700
  gain = audio.createGain(); gain.gain.value = volume.value * .5
  source.connect(filter).connect(gain).connect(audio.destination)
  if (sound.value === 'sea') { const wave = audio.createOscillator(); const depth = audio.createGain(); wave.frequency.value = .12; depth.gain.value = volume.value * .22; wave.connect(depth).connect(gain.gain); wave.start() }
  source.start(); playing.value = true
 } catch { stop(); error.value = true }
}
watch(volume, value => { if (gain && context) gain.gain.setTargetAtTime(value * .5, context.currentTime, .1); if (playing.value && sound.value === 'sea') void play() })
function choose(value: string) { store.updateSettings(props.widget.id, { sound: value }); if (playing.value) void play() }
onUnmounted(stop)
</script>
<template><div class="extra-widget"><div class="sound-art" :class="{ playing }" aria-hidden="true"><span v-for="n in 9" :key="n" :style="{ animationDelay: `${n * .13}s` }" /></div><div class="widget-tabs"><button v-for="value in ['rain', 'sea', 'brown']" :key="value" :aria-pressed="sound === value" @click="choose(value)">{{ t(`extras.${value}`) }}</button></div><button class="primary-button" :aria-pressed="playing" @click="playing ? stop() : play()">{{ t(playing ? 'extras.pause' : 'extras.play') }}</button><label class="volume-control">{{ t('extras.volume') }}<input type="range" min="0" max="1" step="0.01" :value="volume" @input="store.updateSettings(widget.id, { volume: Number(($event.target as HTMLInputElement).value) })" /></label><small class="widget-muted">{{ t('extras.synthesized') }}</small><p v-if="error" role="alert">{{ t('extras.audioError') }}</p></div></template>
