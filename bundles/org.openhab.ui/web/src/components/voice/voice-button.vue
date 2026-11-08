<template>
  <f7-link
    v-if="runtimeStore.voiceState"
    class="voice-button"
    style="margin-right: 12px"
    :class="[`voice-${runtimeStore.voiceState}`, { 'voice-wake-word': runtimeStore.voiceListeningForWakeWord }]"
    :style="{ '--voice-level': runtimeStore.voiceLevel }"
    :icon-f7="icon"
    :tooltip="t('home.triggerVoice')"
    @click="f7.emit('triggerDialog' as Framework7Events)" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { f7 } from 'framework7-vue'
import { useI18n } from 'vue-i18n'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import type { Framework7Events } from '@/types/framework7-extensions'

// --- Store ---
const runtimeStore = useRuntimeStore()

// --- Composables ---
const { t } = useI18n({ useScope: 'global' })

// --- Computed ---
const icon = computed(() => {
  switch (runtimeStore.voiceState) {
    case 'offline':
      return 'mic_slash_fill'
    case 'triggered':
    case 'listening':
      return 'mic_circle_fill'
    case 'speaking':
      return 'speaker_2_fill'
    default:
      return 'mic_circle'
  }
})
</script>

<style lang="stylus">
.voice-button
  position relative
  // the ring around the icon
  &::after
    content ''
    position absolute
    top 50%
    left 50%
    width 36px
    height 36px
    margin -18px 0 0 -18px
    box-sizing border-box
    border-radius 50%
    border 2px solid var(--oh-voice-color)
    opacity 0
    pointer-events none
    transition opacity 0.3s, transform 0.1s, box-shadow 0.1s
  // always listening for the wake word
  &.voice-idle.voice-wake-word .icon
    color var(--oh-voice-color)
  &.voice-triggered, &.voice-listening, &.voice-thinking
    .icon
      color var(--oh-voice-color)
    &::after
      opacity 1
      box-shadow 0 0 calc(6px + 14px * var(--voice-level)) var(--oh-voice-color)
  &.voice-triggered::after
    animation voice-button-appear 0.3s ease-out
  &.voice-listening::after
    transform scale(calc(1 + 0.25 * var(--voice-level)))
  &.voice-thinking::after
    border-color var(--oh-voice-accent-color) transparent
    animation voice-button-spin 1s linear infinite
  &.voice-speaking
    .icon
      color var(--oh-voice-accent-color)
    &::after
      opacity 1
      border-color var(--oh-voice-accent-color)
      box-shadow 0 0 calc(6px + 14px * var(--voice-level)) var(--oh-voice-accent-color)
      transform scale(calc(1 + 0.25 * var(--voice-level)))

@keyframes voice-button-appear
  from
    transform scale(0.5)
    opacity 0

@keyframes voice-button-spin
  to
    transform rotate(360deg)

@media (prefers-reduced-motion: reduce)
  .voice-button::after
    animation none !important
    transform none !important
</style>
