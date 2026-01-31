<template>
  <f7-list class="module-picker-container">
    <f7-list-item :title="title" class="defaults-picker" @click="popupOpened = true">
      <template #after>
        <div>{{ localValue.join(', ') }}<f7-icon f7="chevron_right" style="margin-left: 8px;"></f7-icon></div>
      </template>
    </f7-list-item>
  </f7-list>

  <f7-popup v-model:opened="popupOpened">
    <f7-page>
      <f7-navbar :title="title">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="popupOpened = false" />
        </f7-nav-left>
        <f7-nav-right>
          <f7-link @click="onDone">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-list class="module-picker-container popup-list">
        <f7-list-item v-for="s in localStrategies" :key="s" checkbox :checked="localValue.includes(s)" @change="toggleStrategy(s)">
          {{ s }}
        </f7-list-item>
        <f7-list-item
          link
          no-chevron
          media-item
          :color="(theme.dark) ? 'black' : 'white'"
          subtitle="Add cron strategy"
          @click="openCronPopup">
          <template #media>
            <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
          </template>
        </f7-list-item>
      </f7-list>
    </f7-page>
  </f7-popup>

  <cron-strategy-popup
    v-model:opened="cronStrategyPopupOpen"
    :persistence="persistence"
    @close="cronStrategyPopupOpen = false"
    @cron-strategy-config-update="handleCronStrategyUpdate($event)" />
</template>

<script>
import { theme } from 'framework7-vue'
import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'

export default {
  components: { CronStrategyPopup },
  props: {
    title: String,
    strategies: Array,
    value: Array,
    persistence: Object
  },
  emits: ['strategiesSelected'],
  data () {
    return {
      popupOpened: false,
      cronStrategyPopupOpen: false,

      localStrategies: this.strategies || [],
      localValue: [...this.value]
    }
  },
  computed: {
    theme () {
      return theme
    }
  },
  watch: {
    value: {
      handler (newVal) {
        this.localValue = [...newVal]
      },
      immediate: true
    },
    strategies: {
      handler (newVal) {
        this.localStrategies = newVal || []
      },
      immediate: true
    }
  },
  methods: {
    toggleStrategy (strategy) {
      if (this.localValue.includes(strategy)) {
        this.localValue = this.localValue.filter(s => s !== strategy)
      } else {
        this.localValue = [...this.localValue, strategy]
      }
    },
    openCronPopup () {
      this.cronStrategyPopupOpen = true
    },
    handleCronStrategyUpdate (ev) {
      const strategyName = ev.name
      // Update localValue FIRST so the new item will be checked when the list re-renders
      if (!this.localValue.includes(strategyName)) {
        this.localValue = [...this.localValue, strategyName]
      }
      // Then add to available strategies
      if (!this.localStrategies.includes(strategyName)) {
        this.localStrategies = [...this.localStrategies, strategyName]
      }
    },
    onDone () {
      this.$emit('strategiesSelected', this.localValue)
      this.popupOpened = false
    }
  }
}
</script>
