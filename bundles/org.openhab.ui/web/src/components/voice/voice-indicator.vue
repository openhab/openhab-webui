<template>
  <div
    v-if="runtimeStore.voiceState"
    class="voice-indicator"
    :class="`voice-${runtimeStore.voiceState}`"
    :style="{ '--voice-level': runtimeStore.voiceLevel }" />
</template>

<script setup lang="ts">
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

// --- Store ---
const runtimeStore = useRuntimeStore()
</script>

<style lang="stylus">
// a light along the bottom of the screen, like the light bar of a smart display
.voice-indicator
  position fixed
  left 0
  right 0
  bottom 0
  height 6px
  z-index 15000
  pointer-events none
  opacity 0
  transform scaleX(0)
  background var(--oh-voice-color)
  transition opacity 0.4s, transform 0.4s ease-out, box-shadow 0.1s
  &.voice-triggered, &.voice-listening, &.voice-thinking, &.voice-speaking
    opacity 1
    transform scaleX(1)
  &.voice-triggered
    box-shadow 0 0 16px 2px var(--oh-voice-color)
    transition opacity 0.15s, transform 0.25s ease-out
  // the brighter middle widens with the voice
  &.voice-listening
    background linear-gradient(90deg, var(--oh-voice-color) calc(50% - 30% * var(--voice-level)), var(--oh-voice-accent-color) 50%, var(--oh-voice-color) calc(50% + 30% * var(--voice-level)))
    box-shadow 0 0 calc(10px + 24px * var(--voice-level)) calc(2px + 6px * var(--voice-level)) var(--oh-voice-color)
  &.voice-thinking
    background linear-gradient(90deg, var(--oh-voice-color) 35%, var(--oh-voice-accent-color) 50%, var(--oh-voice-color) 65%)
    background-size 300% 100%
    box-shadow 0 0 12px 2px var(--oh-voice-color)
    animation voice-indicator-sweep 1.2s ease-in-out infinite alternate
  &.voice-speaking
    background var(--oh-voice-accent-color)
    box-shadow 0 0 calc(10px + 24px * var(--voice-level)) calc(2px + 6px * var(--voice-level)) var(--oh-voice-accent-color)

@keyframes voice-indicator-sweep
  from
    background-position 0% 0
  to
    background-position 100% 0

@media (prefers-reduced-motion: reduce)
  .voice-indicator
    animation none !important
    transition opacity 0.4s
</style>
