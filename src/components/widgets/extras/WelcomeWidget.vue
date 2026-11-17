<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWidgetsStore } from '@/stores/widgets'
import { solarDays } from '@/data/holidays'
import { proverbOfDay } from '@/data/proverbs'
import { daysToNowruz, moonPhase, phaseOf, skies } from '@/utils/sky'

const { t, locale } = useI18n()
const store = useWidgetsStore()
const id = useId()
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => now.value = new Date(), 60000) })
onUnmounted(() => clearInterval(timer))

const zone = computed(() => store.preferences.timeZone === 'local' ? undefined : 'Asia/Tehran')
const clock = computed(() => {
  const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone: zone.value }).formatToParts(now.value)
  const n = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0)
  return n('hour') + n('minute') / 60
})
const phase = computed(() => phaseOf(Math.floor(clock.value)))
const sky = computed(() => skies[phase.value])
const isNight = computed(() => ['midnight', 'evening', 'dawn'].includes(phase.value) && !(phase.value === 'dawn' && clock.value >= 5.5))

const greeting = computed(() => {
  const h = clock.value
  return h < 5 ? t('welcome.night') : h < 12 ? t('welcome.morning') : h < 17 ? t('welcome.day') : h < 21 ? t('welcome.evening') : t('welcome.night')
})

// Sun travels a low arc from 6:00 to 20:00; the moon takes the night shift.
const body = computed(() => {
  const h = clock.value
  const day = h >= 6 && h < 20
  const t = day ? (h - 6) / 14 : ((h + 24 - 20) % 24) / 10
  const x = 12 + 76 * Math.min(1, Math.max(0, t))
  const y = 80 - 56 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)))
  return { day, x, y }
})

// Moon drawn as a lit disc with a shadow disc sliding across it.
const moon = computed(() => {
  const p = moonPhase(now.value)
  const lit = (1 - Math.cos(2 * Math.PI * p)) / 2
  const r = 7
  return { r, dx: (p < 0.5 ? -1 : 1) * 2 * r * lit }
})

const stars = [[14, 26], [28, 14], [42, 32], [60, 18], [80, 28], [88, 46], [22, 50], [54, 44], [90, 12], [36, 56]]
// Lit windows in the rooftops at night
const lights = [[2, 111], [9, 107], [10, 113], [42, 114], [47, 109], [52, 112], [58, 115], [83, 113], [87, 108], [94, 115]]
const postmark = computed(() => new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-GB', { calendar: 'persian', day: 'numeric', month: 'short', timeZone: zone.value }).format(now.value))

const fullDate = computed(() => {
  const parts = new Intl.DateTimeFormat(locale.value, { calendar: 'persian', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zone.value }).formatToParts(now.value)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return locale.value === 'fa'
    ? `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}`
    : `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`
})
const occasion = computed(() => {
  const parts = new Intl.DateTimeFormat('en', { calendar: 'persian', month: 'numeric', day: 'numeric', timeZone: zone.value }).formatToParts(now.value)
  const entry = solarDays[`${parts.find(p => p.type === 'month')!.value}-${parts.find(p => p.type === 'day')!.value}`]
  return entry ? (locale.value === 'fa' ? entry.fa : entry.en) : ''
})
const nowruz = computed(() => daysToNowruz(now.value, zone.value))
const proverb = computed(() => proverbOfDay(now.value))
</script>

<template>
  <div class="welcome-content" :data-phase="phase">
    <!-- A postage stamp of Tehran under today's sky: Damavand, Azadi Tower, Milad Tower -->
    <div class="stamp">
      <svg class="stamp-art" viewBox="0 0 100 120" role="img" :aria-label="t(`welcome.phase.${phase}`)">
        <defs>
          <linearGradient :id="`sky-${id}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" :stop-color="sky[0]" />
            <stop offset=".6" :stop-color="sky[1]" />
            <stop offset="1" :stop-color="sky[2]" />
          </linearGradient>
        </defs>
        <rect width="100" height="120" :fill="`url(#sky-${id})`" />
        <g v-if="isNight" class="stars">
          <circle v-for="([x, y], i) in stars" :key="i" :cx="x" :cy="y" :r="i % 3 ? 0.7 : 1.1" fill="#FFF6DD" :style="{ animationDelay: `${i * 0.37}s` }" />
        </g>
        <g v-if="body.day" class="sun">
          <circle :cx="body.x" :cy="body.y" r="12" fill="#FFE7A3" opacity=".35" />
          <circle :cx="body.x" :cy="body.y" r="7.5" fill="#FFD267" />
        </g>
        <g v-else>
          <circle :cx="body.x" :cy="body.y" :r="moon.r" fill="#FFF4D6" />
          <circle :cx="body.x + moon.dx" :cy="body.y" :r="moon.r + 0.3" :fill="sky[1]" />
        </g>
        <!-- Damavand -->
        <path d="M-2 98 26 84l18-16 6-4 6 4 18 16 28 12v24H-2Z" :fill="isNight ? '#1A2346' : '#8C9BB8'" />
        <path d="M44 68l6-4 6 4-3 2.4-3-2-3 2.6z" fill="#FBF7EE" :opacity="isNight ? .55 : 1" />
        <!-- City -->
        <g :fill="isNight ? '#0B1024' : '#3F4C6B'">
          <!-- Azadi Tower -->
          <path d="M18 120l2.6-13c.8-4 2.6-7.4 5.4-10.6h3.6c2.8 3.2 4.6 6.6 5.4 10.6L37.6 120h-5.2c-.6-5.6-1.8-9-4.6-11.4-2.8 2.4-4 5.8-4.6 11.4Z" />
          <rect x="25" y="93.6" width="5.6" height="3" rx=".6" />
          <!-- Milad Tower -->
          <rect x="72.2" y="62" width="2.6" height="58" />
          <path d="M66.5 70h14l-2 4.6h-10Z" />
          <ellipse cx="73.5" cy="69" rx="5" ry="2.4" />
          <rect x="73" y="48" width="1" height="14" />
          <!-- Rooftops -->
          <path d="M0 120v-12h6v-4h7v8h4v8ZM40 120v-9h5v-5h6v6h5v-3h6v11ZM80 120v-10h5v-6h7v8h8v8Z" />
        </g>
        <g v-if="isNight" fill="#FFD267">
          <rect v-for="([x, y], i) in lights" :key="`l${i}`" :x="x" :y="y" width="1.2" height="1.2" />
        </g>
      </svg>
      <span class="postmark" aria-hidden="true">
        <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="27" /><circle cx="30" cy="30" r="21" /></svg>
        <span>{{ postmark }}</span>
      </span>
    </div>

    <div class="welcome-text">
      <p class="welcome-phase">{{ t(`welcome.phase.${phase}`) }}</p>
      <h1>{{ greeting }}<template v-if="store.preferences.name">{{ t('welcome.comma') }}{{ store.preferences.name }}</template></h1>
      <p class="welcome-date">{{ fullDate }}</p>
      <p class="welcome-chips">
        <span v-if="occasion" class="chip chip-occasion">{{ occasion }}</span>
        <span v-if="nowruz >= 0" class="chip chip-nowruz">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M5 18h14l-1.6 4H6.6Z" /><path d="M12 18V9M9 18V12M15 18v-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" /><ellipse cx="12" cy="6.5" rx="1.8" ry="3.2" /><ellipse cx="8.4" cy="10" rx="1.5" ry="2.7" transform="rotate(-20 8.4 10)" /><ellipse cx="15.6" cy="10.6" rx="1.5" ry="2.7" transform="rotate(20 15.6 10.6)" /></svg>
          {{ nowruz === 0 ? t('welcome.nowruzToday') : t('welcome.nowruz', { n: nowruz.toLocaleString(locale) }) }}
        </span>
      </p>
      <blockquote class="welcome-proverb">
        <span class="proverb-label">{{ t('welcome.proverb') }}</span>
        <span lang="fa" dir="rtl">«{{ proverb.fa }}»</span>
        <small v-if="locale !== 'fa'">{{ proverb.en }}</small>
      </blockquote>
    </div>
  </div>
</template>
