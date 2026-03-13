<template>
  <f7-list :class="['strategy-picker', 'module-picker-container', attrs.class]">
    <f7-list-item :title="props.title || 'Select Strategies'" class="defaults-picker" @click="popupOpened = true">
      <template #after>
        <div>{{ localSelected.join(', ') }}<f7-icon f7="chevron_right" style="margin-left: 8px;"></f7-icon></div>
      </template>
    </f7-list-item>
  </f7-list>

  <f7-popup class="strategy-picker-popup" :opened="popupOpened" @popup:opened="onOpen" @popup:closed="popupOpened = false">
    <f7-page>
      <f7-navbar :title="props.title || 'Select Strategies'">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="popupOpened = false" />
        </f7-nav-left>
        <f7-nav-right>
          <f7-link @click="onDone">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-list class="module-picker-container popup-list">
        <f7-list-item
          v-for="s in allStrategies"
          :key="s.name"
          checkbox
          :checked="localSelected.includes(s.name)"
          @change="updateSelectedStrategies($event, s.name)">
          {{ s.name }}
          <template v-if="'cronExpression' in s" #subtitle>{{ s.cronExpression }}</template>
        </f7-list-item>
        <f7-list-item link no-chevron media-item color="auto-dark" subtitle="Add cron strategy definition" @click="openCronPopup">
          <template #media>
            <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
          </template>
        </f7-list-item>
      </f7-list>
    </f7-page>
  </f7-popup>

  <cron-strategy-popup v-model:opened="cronStrategyPopupOpen" :cron-strategy="null" @add:cron-strategy="addCronStrategy" />
</template>

<script setup lang="ts">
import { computed, ref, watch, useAttrs } from 'vue'

import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'
import { PredefinedStrategies } from '@/assets/definitions/persistence'

import * as api from '@/api'

// Props and emits
const cronStrategies = defineModel<api.PersistenceCronStrategy[]>('cron-strategies', { required: true })
const selected = defineModel<string[]>('selected-strategies', { required: true })
const props = defineProps<{ title?: string }>()
const attrs = useAttrs()

const popupOpened = ref<boolean>(false)
const cronStrategyPopupOpen = ref<boolean>(false)
const localCronStrategies = ref<api.PersistenceCronStrategy[]>([])
const localSelected = ref<string[]>([...selected.value])

// Watchers
watch(selected, (newVal) => {
  localSelected.value = [...newVal]
})

// Computed
const allStrategies = computed(() => {
  return [...PredefinedStrategies, ...localCronStrategies.value]
})

function updateSelectedStrategies (event: Event, strategyName: string) {
  if (event.target instanceof HTMLInputElement) {
    if (event.target.checked) {
      if (!localSelected.value.includes(strategyName)) {
        localSelected.value = [...localSelected.value, strategyName]
      }
    } else {
      localSelected.value = localSelected.value.filter(s => s !== strategyName)
    }
  }
}

// Events
function addCronStrategy (cronStrategy: api.PersistenceCronStrategy) {
  localCronStrategies.value = [...localCronStrategies.value, cronStrategy]
  cronStrategies.value = [...localCronStrategies.value]
  if (!localSelected.value.includes(cronStrategy.name)) {
    localSelected.value = [...localSelected.value, cronStrategy.name]
  }
}

function onOpen () {
  localCronStrategies.value = [...cronStrategies.value]
  localSelected.value = [...selected.value]
}

function onDone () {
  cronStrategies.value = [...localCronStrategies.value]
  selected.value = [...localSelected.value]
  popupOpened.value = false
}

// Methods
function openCronPopup () {
  cronStrategyPopupOpen.value = true
}
</script>
