<template>
  <f7-popup class="log-details-popup" id="logdetails-popup" ref="logDetailsPopup" close-on-escape close-by-backdrop-click>
    <f7-page>
      <f7-navbar title="Log Details" ref="logDetailsNavbar">
        <f7-nav-right>
          <f7-link popup-close="#logdetails-popup"> Close </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar bottom class="toolbar-details">
        <div class="display-flex justify-content-center" style="width: 100%">
          <f7-link class="display-flex flex-direction-row margin-right" @click="emits('select:previous')">
            <f7-icon f7="backward_fill" />
            &nbsp; Previous
          </f7-link>
          <f7-link class="display-flex flex-direction-row margin-right" @click="emits('select:next')">
            Next &nbsp;
            <f7-icon f7="forward_fill" />
          </f7-link>
          <f7-link class="display-flex flex-direction-row" @click="emits('select:latest')">
            <f7-icon f7="forward_end_fill" />
          </f7-link>
        </div>
      </f7-toolbar>

      <f7-block class="config-sheet no-margin no-padding">
        <f7-col>
          <f7-list class="col wide">
            <f7-list-item header="Time" :title="logEntry ? logEntry.time : ''" />
            <f7-list-item header="Timestamp" :title="logEntry ? logEntry.timestamp : ''" />
            <f7-list-item header="Level">
              <template #title>
                <span :class="logEntry ? logEntry.level.toLowerCase() : ''">
                  {{ logEntry ? logEntry.level : '' }}
                </span>
              </template>
            </f7-list-item>
            <f7-list-item header="Logger Name" :title="logEntry ? logEntry.loggerName : ''" />
            <f7-list-item>
              <template #title>
                <div class="item-title">
                  <div class="item-header">Message</div>
                  <div class="log-message">
                    {{ logEntry ? logEntry.message : '' }}
                  </div>
                </div>
              </template>
            </f7-list-item>
            <f7-list-item v-if="logEntry && logEntry.stackTrace">
              <template #title>
                <div class="item-title">
                  <div class="item-header">Stack Trace</div>
                  <div class="stack-trace">
                    {{ logEntry.stackTrace }}
                  </div>
                </div>
              </template>
            </f7-list-item>
          </f7-list>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.log-details-popup
  .navbar
    cursor move
  .log-message
    white-space normal
    word-break break-word
  .stack-trace
    white-space pre-line
    word-break break-word
  margin-left 0
  margin-top 0
  .item-title
    padding 5px 0px 5px 0px
    span
      border-radius 3px
      display inline-flex
      line-height 1;
      padding 2px 6px
      align-items center
      height 1.2em
    span::before
      content "●"
      margin-right 4px
      font-size 0.8em
    span.info
      color #1976D2 !important
      background #E3F2FD !important
    span.debug
      color #6C757D !important
      background #E9ECEF !important
    span.warn
      color #B77900 !important
      background #FFF3CD !important
    span.error
      color #D32F2F !important
      background #FDECEC !important
    span.trace
      color #7B4AB5 !important
      background #F1E8FA !important

    .item-header
      margin-bottom 5px
.dark .log-details-popup
  .item-title
    span.info
      background #12395A !important
    span.debug
      background #30363D !important
    span.warn
      background #4A3508 !important
    span.error
      background #4A1818 !important
    span.trace
      background #392447 !important
</style>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
import { type EnrichedLogEntry } from './types'
import { useDraggable } from '@vueuse/core'

const props = defineProps<{
  logEntry: EnrichedLogEntry | null
}>()

const emits = defineEmits<{
  (e: 'select:next'): void
  (e: 'select:previous'): void
  (e: 'select:latest'): void
}>()

const navbarRef = useTemplateRef('logDetailsNavbar')
const popupRef = useTemplateRef('logDetailsPopup')

onMounted(() => {
  const popupEl = popupRef.value?.$el as HTMLElement
  const navbarEl = navbarRef.value?.$el as HTMLElement

  if (popupEl && navbarEl) {
    useDraggable(popupEl, {
      handle: navbarEl,
      preventDefault: true,
      stopPropagation: true,
      onStart: (_, event) => {
        if (!popupEl || !navbarEl) return false

        const target = event.target as HTMLElement | null
        if (target?.closest('.popup-close, .link, a, button, input, select, textarea')) return false

        // Prevent dragging if the popup has full parent width (e.g. on mobile)
        if (popupEl.parentElement && popupEl.offsetWidth >= popupEl.parentElement.offsetWidth) return false

        // Framework7 popups are centered with margins by default.
        // Reset margins so top/left updates take visible effect while dragging.
        popupEl.style.marginLeft = '0'
        popupEl.style.marginTop = '0'
        return
      },
      onMove(position) {
        if (!popupEl) return
        popupEl.style.left = `${position.x}px`
        popupEl.style.top = `${position.y}px`
        popupEl.style.transform = 'none'
      }
    })
  }
})
</script>
