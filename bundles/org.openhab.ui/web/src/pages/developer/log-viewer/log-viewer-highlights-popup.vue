<template>
  <f7-popup class="log-highlights-popup">
    <f7-page>
      <f7-navbar title="Logging Highlight Filters">
        <f7-nav-right>
          <f7-link class="popup-close">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-page-content>
        <f7-list class="col wide">
          <f7-list-item v-for="(highlightFilter, index) in highlightFilters" :key="index">
            <template #media>
              <input type="checkbox" v-model="highlightFilter.active" />
            </template>
            <template #title>
              <f7-input v-model:value="highlightFilter.text" type="text" placeholder="Enter text to highlight..." />
            </template>

            <!-- Color Picker -->
            <template #after>
              <div>
                <f7-button
                  :class="['color-picker-button', `bg-color-${highlightFilter.color}`]"
                  @click="openColorPopover(index, $event)"
                  :style="{ backgroundColor: highlightFilter.color }" />
              </div>
              <f7-button small icon-f7="xmark_circle" @click="removeHighlight(index)" />
            </template>
          </f7-list-item>
        </f7-list>
        <button class="button" @click="addNewHighlight">Add New Highlight</button>
      </f7-page-content>
    </f7-page>
  </f7-popup>

  <!-- Color Picker Popover -->
  <f7-popover id="color-picker-popover" class="color-picker-popover">
    <f7-block>
      <div class="color-palette">
        <button
          v-for="color in Object.values(Color)"
          :key="color"
          :class="[`bg-color-${color}`, { selected: currentHighlightColor === color }]"
          @click="selectHighlightColor(color)" />
      </div>
    </f7-block>
  </f7-popover>
</template>

<style lang="stylus">
.color-picker-popover
  .color-palette
    display flex
    flex-wrap wrap
    gap 8px
    justify-content center

  .color-palette button
    width 32px
    height 32px
    border none
    border-radius 50%
    cursor pointer
    outline none
    box-shadow 0 2px 4px rgba(0, 0, 0, 0.2)
    transition transform 0.2s

  .color-palette button.selected
    transform scale(1.2)
    border 2px solid black

.dark .color-picker-popover
  .color-palette button.selected
    border 2px solid white
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { f7 } from 'framework7-vue'

import { type LogHighlightFilter, Color } from './types'

const highlightFilters = defineModel<LogHighlightFilter[]>('highlightFilters', { required: true })

const currentHighlightIndex = ref<number | null>(null)

const currentHighlightColor = computed(() => {
  if (currentHighlightIndex.value !== null) {
    return highlightFilters?.value[currentHighlightIndex.value].color
  }
  return null
})

function openColorPopover(index: number, event: Event) {
  currentHighlightIndex.value = index
  f7.popover.open('#color-picker-popover', event.target as HTMLElement)
}

function selectHighlightColor(color: Color | null) {
  f7.popover.close('#color-picker-popover')
  if (color !== null && currentHighlightIndex.value !== null) {
    highlightFilters.value[currentHighlightIndex.value].color = color
  }
}

function removeHighlight(index: number) {
  highlightFilters.value.splice(index, 1)
}

function addNewHighlight() {
  highlightFilters.value.push({
    text: '',
    color: Color.yellow,
    active: true
  } satisfies LogHighlightFilter)
}
</script>
