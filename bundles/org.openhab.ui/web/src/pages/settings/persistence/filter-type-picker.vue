<template>
  <f7-popup :opened="opened" class="filtertype-selection-popup">
    <f7-page>
      <f7-navbar title="Configure Filter">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="$emit('close')" />
        </f7-nav-left>
      </f7-navbar>
      <f7-block-title class="no-margin padding-horizontal margin-vertical" medium> Filter Type </f7-block-title>
      <f7-block>
        <f7-row v-for="ftRow in filterTypesMatrix" :key="ftRow" class="margin-bottom">
          <f7-col
            v-for="ft in ftRow"
            :key="ft.name"
            class="elevation-2 elevation-hover-6 elevation-pressed-1 persistence-filter-big-button"
            width="50">
            <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="selectFilterType(ft)">
              <f7-icon size="35" :f7="ft.icon" class="margin" />
              {{ ft.label }}<br />Filter
            </f7-link>
          </f7-col>
        </f7-row>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style scoped lang="stylus">
.persistence-filter-big-button
  background var(--f7-card-bg-color)
  text-align center
  height 7.5rem
  .link
    color var(--f7-text-color)
</style>

<script>
import { FilterTypes } from '@/assets/definitions/persistence'

export default {
  emits: ['close', 'filter-type-selected'],
  props: {
    opened: Boolean
  },
  data () {
    return {
      FilterTypes
    }
  },
  computed: {
    filterTypesMatrix () {
      if (!this.FilterTypes) return []
      const matrix = []
      const columns = 2
      for (let i = 0; i < this.FilterTypes.length; i += columns) {
        matrix.push(this.FilterTypes.slice(i, i + columns))
      }
      return matrix
    }
  },
  methods: {
    selectFilterType (filterType) {
      this.$emit('filter-type-selected', filterType)
    }
  }
}
</script>

