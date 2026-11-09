<template>
  <div
    class="oh-slide-button"
    :class="{
      vertical: isVertical,
      dragging,
      active: position === 1
    }"
    :data-state="visualState"
    :style="config.style"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @lostpointercapture="onPointerCancel">
    <div class="oh-slide-button-track">
      <span class="oh-slide-button-label" :class="{ 'label-reversed': labelReversed }">
        <span class="oh-slide-button-label-text">
          {{ config.text }}
        </span>
      </span>
      <div class="oh-slide-button-thumb" :style="thumbStyle">
        <f7-icon :f7="slideIcon" class="oh-slide-button-icon" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="stylus">
.oh-slide-button
  /* Geometry */
  --slide-length: var(--oh-slide-length, 160px)
  --slide-thickness: var(--oh-slide-thickness, 48px)
  --slide-padding: var(--oh-slide-padding, 4px)
  --slide-thumb-size: calc(var(--slide-thickness) - 2 * var(--slide-padding))

  /* Colors */
  --slide-track-color: var(--oh-slide-track-color, var(--f7-bars-bg-color, #d0d0d0))
  --slide-thumb-color: var(--oh-slide-thumb-color, var(--f7-theme-color, #007aff))
  --slide-text-color: var(--oh-slide-text-color, var(--f7-text-color, #222))
  --slide-confirmed-color: var(--oh-slide-confirmed-color, var(--f7-color-green, #4cd964))
  --slide-unknown-color: var(--oh-slide-unknown-color, var(--f7-color-gray, #8e8e93))
  --slide-dragging-color: var(--oh-slide-dragging-color, var(--f7-color-orange, #ff9500))

  position: relative
  display: inline-block
  width: var(--slide-length)
  height: var(--slide-thickness)

  user-select: none
  -webkit-user-select: none
  touch-action: none
  cursor: grab

.oh-slide-button.vertical
  width: var(--slide-thickness)
  height: var(--slide-length)

.oh-slide-button.dragging
  cursor: grabbing

/* Track */
.oh-slide-button-track
  position: relative
  width: 100%
  height: 100%
  box-sizing: border-box
  border: 1px solid var(--f7-theme-color)
  border-radius: calc(var(--slide-thickness) / 2)
  background: var(--slide-track-color)
  overflow: hidden

/* Label: horizontal orientation */
.oh-slide-button-label
  position: absolute
  top: 0
  bottom: 0
  left: calc(var(--slide-thumb-size) + var(--slide-padding) + 4px)
  right: var(--slide-padding)

  display: flex
  align-items: center
  justify-content: center

  min-width: 0
  overflow: hidden
  white-space: nowrap

  font-size: 14px
  color: var(--slide-text-color)
  opacity: 0.7
  pointer-events: none

.oh-slide-button-label.label-reversed
  left: var(--slide-padding)
  right: calc(var(--slide-thumb-size) + var(--slide-padding) + 4px)

/* Label text */
.oh-slide-button-label-text
  display: block
  min-width: 0
  max-width: 100%
  max-height: 100%
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis

/* Label: vertical orientation */
.oh-slide-button.vertical .oh-slide-button-label
  left: 0
  right: 0
  top: calc(var(--slide-thumb-size) + var(--slide-padding) + 4px)
  bottom: var(--slide-padding)

  writing-mode: vertical-rl
  text-orientation: sideways
  transform: rotate(180deg)

.oh-slide-button.vertical .oh-slide-button-label.label-reversed
  top: var(--slide-padding)
  bottom: calc(var(--slide-thumb-size) + var(--slide-padding) + 4px)

/* Thumb */
.oh-slide-button-thumb
  position: absolute
  width: var(--slide-thumb-size)
  height: var(--slide-thumb-size)
  border-radius: 9999px

  display: flex
  align-items: center
  justify-content: center

  background: var(--slide-active-color, var(--slide-thumb-color))
  color: white
  pointer-events: none
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2)

/* Thumb states */
.oh-slide-button[data-state='on'] .oh-slide-button-thumb,
.oh-slide-button[data-state='none'].active .oh-slide-button-thumb
  background: var(--slide-active-color, var(--slide-confirmed-color))

.oh-slide-button[data-state='off'] .oh-slide-button-thumb
  background: var(--slide-active-color, var(--slide-thumb-color))

.oh-slide-button[data-state='unknown'] .oh-slide-button-thumb
  background: var(--slide-active-color, var(--slide-unknown-color))

.oh-slide-button[data-state='pending'] .oh-slide-button-thumb,
.oh-slide-button.dragging .oh-slide-button-thumb
  background: var(--slide-active-color, var(--slide-dragging-color))

/* Scale the chevron proportionally with the thumb */
.oh-slide-button-icon
  --f7-icons-size: calc(var(--slide-thumb-size) * 0.55)
  font-size: var(--f7-icons-size)
  width: var(--f7-icons-size)
  height: var(--f7-icons-size)
  line-height: 1
</style>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, type StyleValue } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { useWidgetAction } from '@/components/widgets/useWidgetAction'
import { OhSlideButtonDefinition } from '@/assets/definitions/widgets/system'
import { OhSlideButton as OhSlideButtonType } from '@/types/components/widgets'
import type { WidgetContext } from '@/components/widgets/types'
import type { Config as SlideButtonConfig } from '@/types/components/widgets/system/oh-slide-button.gen'

import { subscribeItemUpdates } from '@/js/openhab/itemUpdateEvents'

defineOptions({
  widget: OhSlideButtonDefinition
})

const props = defineProps<{
  context: WidgetContext
}>()

const locked = ref(false)
const latch = computed(() => config.value.latch === true)
const context = computed(() => props.context)
const { config, evaluateExpression } = useWidgetContext<
  SlideButtonConfig & {
    style?: StyleValue
  }
>(context, OhSlideButtonType.isConfig)
const { performAction } = useWidgetAction(context, config, evaluateExpression)

const orientation = computed(() => config.value.orientation || 'right')
const isVertical = computed(() => ['up', 'down'].includes(orientation.value))
const isReversed = computed(() => ['left', 'up'].includes(orientation.value))
const labelReversed = computed(() => (isReversed.value ? displayedPosition.value < 0.5 : displayedPosition.value >= 0.5))
const thumbAspectRatio = computed(() => {
  const ratio = Number(config.value.thumbAspectRatio ?? 1.5)
  return Number.isFinite(ratio) ? Math.max(1, ratio) : 1.5
})

const threshold = computed(() => Math.min(100, Math.max(0, Number(config.value.threshold ?? 80))) / 100)
const resetDelay = computed(() => Math.max(0, Number(config.value.resetDelay ?? 500)))

const position = ref(0)
const dragPosition = ref(0)
const dragging = ref(false)
const pointerId = ref<number | null>(null)

let startCoordinate = 0
let startPosition = 0
let travelDistance = 1
let activePointerElement: HTMLElement | null = null
let resetTimer: ReturnType<typeof setTimeout> | undefined

const hasStateFeedback = computed(() => !!(config.value.stateItem || config.value.stateVariable))

const stateControlledMomentary = computed(() => !latch.value && hasStateFeedback.value)
const stateOn = computed(() => config.value.stateOn ?? 'ON')
const stateOff = computed(() => config.value.stateOff ?? 'OFF')

const confirmedPosition = ref<0 | 1 | null>(null)
const lastKnownPosition = ref<0 | 1 | null>(null)
const pendingPosition = ref<0 | 1 | null>(null)

const itemState = computed(() => {
  if (config.value.stateVariable) {
    return props.context.vars?.[config.value.stateVariable]
  }

  const item = config.value.stateItem
  return item ? props.context.store?.[item]?.state : undefined
})

const reportedPosition = computed<0 | 1 | null>(() => {
  if (itemState.value === stateOn.value) return 1
  if (itemState.value === stateOff.value) return 0
  return null
})

const momentaryPending = ref(false)

const momentaryAvailable = computed(() => !stateControlledMomentary.value || (reportedPosition.value !== 1 && !momentaryPending.value))

let unsubscribeItemUpdates: (() => void) | null = null

watch(
  () => [config.value.stateItem, config.value.stateVariable],
  ([itemName, stateVariable]) => {
    unsubscribeItemUpdates?.()
    unsubscribeItemUpdates = null

    // Only subscribe when Item feedback is actually used.
    if (!itemName || stateVariable) return

    unsubscribeItemUpdates = subscribeItemUpdates(itemName, (event) => {
      // Only resolve pending latch actions.
      if (!latch.value || pendingPosition.value === null) return

      let payload: { value?: string }

      try {
        payload = JSON.parse(event.payload)
      } catch {
        console.warn('[oh-slide-button] Invalid state update payload:', event.payload)
        return
      }

      const state = payload.value

      // Normal state changes are handled by MainUI's state tracker.
      // This subscription only handles repeated updates of the
      // currently cached Item state.
      const currentState = props.context.store?.[itemName]?.state

      if (state !== currentState) return

      let reported: 0 | 1

      if (state === stateOn.value) {
        reported = 1
      } else if (state === stateOff.value) {
        reported = 0
      } else {
        return
      }

      handleLatchFeedback(reported)
    })
  },
  { immediate: true }
)

function handleLatchFeedback(reported: 0 | 1) {
  lastKnownPosition.value = reported
  confirmedPosition.value = reported

  if (pendingPosition.value !== null) {
    pendingPosition.value = null
    clearResetTimer()
    position.value = reported
    locked.value = false
    return
  }

  if (!dragging.value && !locked.value) {
    position.value = reported
  }
}

watch(
  [reportedPosition, latch, hasStateFeedback],
  ([reported, isLatch, hasFeedback]) => {
    if (!hasFeedback) return

    if (!isLatch) {
      // Momentary mode: feedback controls the resting position.
      if (reported === 1) {
        clearResetTimer()
        momentaryPending.value = false

        // External ON feedback takes precedence over dragging.
        if (dragging.value) {
          cancelActivePointer()
        }

        position.value = 1
        locked.value = false
      } else if (reported === 0 && !momentaryPending.value) {
        position.value = 0
        locked.value = false
      }
      return
    }

    if (reported === null) {
      confirmedPosition.value = null
      return
    }

    handleLatchFeedback(reported)
  },
  { immediate: true }
)

const visualState = computed(() => {
  if (!hasStateFeedback.value) return 'none'

  if (!latch.value) {
    if (momentaryPending.value) return 'pending'

    if (reportedPosition.value === 1) return 'on'
    if (reportedPosition.value === 0) return 'off'

    return 'unknown'
  }

  if (pendingPosition.value !== null) return 'pending'
  if (confirmedPosition.value === null) return 'unknown'

  return confirmedPosition.value === 1 ? 'on' : 'off'
})

const thumbColor = computed(() => {
  const cfg = config.value
  const hasFeedback = !!(cfg.stateItem || cfg.stateVariable)

  if (dragging.value || (hasFeedback && visualState.value === 'pending')) {
    return cfg.colorDragging
  }

  if (!hasFeedback) {
    return position.value === 1 ? cfg.color : cfg.colorOff
  }

  if (visualState.value === 'unknown') {
    return cfg.colorUnknown
  }

  return visualState.value === 'on' ? cfg.color : cfg.colorOff
})

const displayedPosition = computed(() => (dragging.value ? dragPosition.value : position.value))

const slideIcon = computed(() => {
  const currentPosition = latch.value && pendingPosition.value !== null ? 1 - pendingPosition.value : position.value

  const reverse = latch.value && currentPosition === 1

  switch (orientation.value) {
    case 'left':
      return reverse ? 'chevron_right' : 'chevron_left'
    case 'up':
      return reverse ? 'chevron_down' : 'chevron_up'
    case 'down':
      return reverse ? 'chevron_up' : 'chevron_down'
    default:
      return reverse ? 'chevron_left' : 'chevron_right'
  }
})

const thumbStyle = computed(() => {
  const offset = isReversed.value ? 1 - displayedPosition.value : displayedPosition.value

  const thumbLength = `min(
    calc(var(--slide-thumb-size) * ${thumbAspectRatio.value}),
    calc(var(--slide-length) - 2 * var(--slide-padding) - 1px)
  )`

  const travel = `calc(
    var(--slide-padding) +
    (100% - ${thumbLength} - 2 * var(--slide-padding)) * ${offset}
  )`

  return {
    width: isVertical.value ? 'var(--slide-thumb-size)' : thumbLength,
    height: isVertical.value ? thumbLength : 'var(--slide-thumb-size)',

    left: isVertical.value ? '50%' : travel,
    top: isVertical.value ? travel : '50%',

    transform: isVertical.value ? 'translateX(-50%)' : 'translateY(-50%)',

    transition: dragging.value ? 'left 100ms ease-out, top 100ms ease-out' : 'left 180ms ease, top 180ms ease',

    '--slide-active-color': thumbColor.value
    ? `var(--f7-color-${thumbColor.value})`
    : undefined
  }
})

function clearResetTimer() {
  if (resetTimer !== undefined) {
    clearTimeout(resetTimer)
    resetTimer = undefined
  }
}

function cancelActivePointer() {
  if (pointerId.value === null) return

  const element = activePointerElement
  const id = pointerId.value

  pointerId.value = null
  dragging.value = false
  dragPosition.value = position.value
  activePointerElement = null

  if (element?.hasPointerCapture(id)) {
    element.releasePointerCapture(id)
  }
}

const reverseActionConfig = computed(() => {
  const cfg = config.value

  return {
    ...cfg,
    actionCommand: cfg.actionCommandAlt ?? cfg.actionCommand,
    actionVariableValue: cfg.actionVariableValueAlt ?? cfg.actionVariableValue
  }
})

const hasResetCommand = computed(() => {
  const cfg = config.value

  if (!cfg.resetAction) return false

  if (cfg.action === 'command') {
    return cfg.actionCommandAlt !== undefined && cfg.actionCommandAlt !== null && cfg.actionCommandAlt !== ''
  }

  if (cfg.action === 'variable') {
    return cfg.actionVariableValueAlt !== undefined && cfg.actionVariableValueAlt !== null && cfg.actionVariableValueAlt !== ''
  }

  return false
})

const completeSlide = (event: PointerEvent, target: 0 | 1) => {
  locked.value = true
  dragging.value = false
  position.value = target

  // Establish pending state before dispatching the command.
  if (latch.value) {
    if (hasStateFeedback.value) {
      clearResetTimer()
      pendingPosition.value = target
    }
  } else if (stateControlledMomentary.value) {
    clearResetTimer()
    momentaryPending.value = true
  }

  // Dispatch the requested action.
  if (target === 1) {
    performAction(event)
  } else {
    performAction(event, '', undefined, reverseActionConfig.value)
  }

  if (latch.value) {
    if (hasStateFeedback.value) {
      // A synchronous feedback change may already have resolved pending.
      if (pendingPosition.value === null) return

      const timeout = Math.max(0, Number(config.value.stateTimeout ?? 2000))

      if (timeout > 0) {
        resetTimer = setTimeout(() => {
          if (pendingPosition.value !== target) return

          pendingPosition.value = null
          position.value = lastKnownPosition.value ?? 0
          locked.value = false
          resetTimer = undefined
        }, timeout)
      }
    }
  } else {
    if (stateControlledMomentary.value) {
      // Feedback may already have confirmed ON synchronously.
      if (!momentaryPending.value) return

      resetTimer = setTimeout(() => {
        momentaryPending.value = false
        resetTimer = undefined

        if (hasResetCommand.value) {
          performAction(undefined, '', undefined, reverseActionConfig.value)
        }

        if (reportedPosition.value === 1) {
          position.value = 1
        } else {
          position.value = 0
        }

        locked.value = false
      }, resetDelay.value)
    } else {
      clearResetTimer()

      resetTimer = setTimeout(() => {
        if (hasResetCommand.value) {
          performAction(undefined, '', undefined, reverseActionConfig.value)
        }

        position.value = 0
        locked.value = false
        resetTimer = undefined
      }, resetDelay.value)
    }
  }
}

const onPointerDown = (event: PointerEvent) => {
  if (pointerId.value !== null) return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  if (locked.value) return
  if (!momentaryAvailable.value) return

  // Prevent another gesture while awaiting state confirmation
  if (latch.value && pendingPosition.value !== null) return

  const element = event.currentTarget as HTMLElement
  const rect = element.getBoundingClientRect()

  const thumb = element.querySelector('.oh-slide-button-thumb') as HTMLElement
  const thumbRect = thumb.getBoundingClientRect()

  // Accept pointer input within the capsule-shaped thumb.
  const radius = Math.min(thumbRect.width, thumbRect.height) / 2

  const centerX = thumbRect.left + thumbRect.width / 2
  const centerY = thumbRect.top + thumbRect.height / 2

  const dx = Math.abs(event.clientX - centerX)
  const dy = Math.abs(event.clientY - centerY)

  const halfStraight = Math.abs(thumbRect.width - thumbRect.height) / 2

  const distanceX = isVertical.value ? dx : Math.max(0, dx - halfStraight)
  const distanceY = isVertical.value ? Math.max(0, dy - halfStraight) : dy

  if (distanceX * distanceX + distanceY * distanceY > radius * radius) return

  const trackLength = isVertical.value ? rect.height : rect.width
  const thumbLength = isVertical.value ? thumbRect.height : thumbRect.width

  const padding = parseFloat(getComputedStyle(element).getPropertyValue('--slide-padding')) || 0

  travelDistance = Math.max(1, trackLength - thumbLength - 2 * padding)

  startCoordinate = isVertical.value ? event.clientY : event.clientX
  startPosition = position.value

  pointerId.value = event.pointerId
  dragging.value = true
  dragPosition.value = startPosition

  activePointerElement = element
  element.setPointerCapture(event.pointerId)
}

const onPointerMove = (event: PointerEvent) => {
  if (pointerId.value !== event.pointerId || !dragging.value || locked.value) return

  const coordinate = isVertical.value ? event.clientY : event.clientX
  const direction = isReversed.value ? -1 : 1
  const delta = ((coordinate - startCoordinate) * direction) / travelDistance

  dragPosition.value = Math.max(0, Math.min(1, startPosition + delta))

  if (startPosition === 0 && dragPosition.value >= threshold.value) {
    completeSlide(event, 1)
  } else if (startPosition === 1 && dragPosition.value <= 1 - threshold.value) {
    completeSlide(event, 0)
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (pointerId.value !== event.pointerId) return

  const element = event.currentTarget as HTMLElement

  pointerId.value = null
  dragging.value = false
  activePointerElement = null

  if (element.hasPointerCapture(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }

  if (latch.value) {
    locked.value = false

    if (pendingPosition.value === null && reportedPosition.value !== null) {
      position.value = reportedPosition.value
    }
  } else if (stateControlledMomentary.value) {
    // Keep the activated position while awaiting confirmation.
    if (!momentaryPending.value) {
      position.value = reportedPosition.value === 1 ? 1 : 0
    }
  } else if (!locked.value) {
    position.value = 0
  }
}

const onPointerCancel = (event: PointerEvent) => {
  if (pointerId.value !== event.pointerId) return

  dragging.value = false
  pointerId.value = null
  activePointerElement = null
  dragPosition.value = position.value

  if (latch.value) {
    locked.value = false

    if (pendingPosition.value === null && reportedPosition.value !== null) {
      position.value = reportedPosition.value
    }
  }
}

//onBeforeUnmount(clearResetTimer)
onBeforeUnmount(() => {
  clearResetTimer()
  unsubscribeItemUpdates?.()
})
</script>
