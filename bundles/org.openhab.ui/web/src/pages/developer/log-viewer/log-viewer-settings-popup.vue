<template>
  <f7-popup class="log-settings-popup">
    <f7-page>
      <f7-navbar title="Logging Settings">
        <f7-nav-right>
          <f7-link class="popup-close" popup-close=".log-settings-popup">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="config-sheet no-margin no-padding">
        <f7-col>
          <f7-block class="no-margin no-padding">
            <f7-list class="config-parameter">
              <f7-list-input
                type="text"
                ref="addLoggerInput"
                label="Add Logger Package"
                spellcheck="false"
                @change="addLogger"
                v-model:value="loggerNameInput"
                :info="`Logger will be added with ROOT log level ${defaultLogLevel}`">
                <template #inner-end>
                  <f7-icon
                    v-if="loggerNameInput.trim() !== ''"
                    ref="filterButtonRef"
                    f7="plus_circle"
                    class="input-enter-button"
                    @click="addLogger" />
                </template>
              </f7-list-input>
            </f7-list>
          </f7-block>
          <f7-block class="no-margin no-padding">
            <f7-block-title class="padding-horizontal">Logger Packages</f7-block-title>
            <f7-list class="config-parameter">
              <f7-list-item v-for="logger in loggerPackages" :key="logger.loggerName" :title="logger.loggerName">
                <template #after>
                  <f7-input type="select" :value="logger.level" @change="emits('update:log-level', logger.loggerName, $event.target.value)">
                    <option value="DEFAULT">Default</option>
                    <option value="TRACE">Trace</option>
                    <option value="DEBUG">Debug</option>
                    <option value="INFO">Info</option>
                    <option value="WARN">Warning</option>
                    <option value="ERROR">Error</option>
                    <option value="OFF">Off</option>
                  </f7-input>
                  <f7-button small icon-f7="xmark_circle" @click="emits('delete:logger', logger.loggerName)" />
                </template>
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.log-settings-popup
  .input-enter-button
    position absolute
    top 50%
    transform translateY(-50%)
    right 8px
    z-index 40
    margin 0
    color var(--f7-searchbar-input-clear-button-color, var(--f7-input-clear-button-color))
    width 24px
    height 24px
    font-size 24px
    align-content center
    cursor pointer

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
</style>

<script setup lang="ts">
import { ref } from 'vue'
import * as api from '@/api'
import { type LogLevel } from './types'

const props = defineProps<{
  defaultLogLevel: string
  loggerPackages: api.LoggerInfo[]
}>()

const emits = defineEmits<{
  'update:log-level': [loggerName: string, newLevel: LogLevel]
  'add:logger': [loggerName: string]
  'delete:logger': [loggerName: string]
}>()

const loggerNameInput = ref('')

function addLogger() {
  if (loggerNameInput.value.trim() !== '') {
    emits('add:logger', loggerNameInput.value.trim())
    loggerNameInput.value = ''
  }
}
</script>
