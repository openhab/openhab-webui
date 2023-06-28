<template>
  <f7-list class="strategy-picker-container" v-if="filters">
    <f7-list-item title="Select filters" :smart-select="disabled !== true && filters.length > 0"
                  :smart-select-params="smartSelectParams"
                  ref="smartSelect" class="defaults-picker">
      <select v-if="disabled !== true && filters.length > 0" name="filters" multiple @change="select">
        <option v-for="s in filters" :key="s" :value="s"
                :selected="value.includes(s)">
          {{ s }}
        </option>
      </select>
      <div v-else-if="disabled === true">
        {{ value.join(', ') }}
      </div>
      <div v-else-if="disabled !== true && filters.length === 0">
        No filters available. Please add them first.
      </div>
    </f7-list-item>
  </f7-list>
</template>

<style lang="stylus">
.strategy-picker-container
  .item-content
    padding-left calc(var(--f7-list-item-padding-horizontal) / 2 + var(--f7-safe-area-left))

  .item-media
    padding 0

  .item-inner:after
    display none
</style>

<script>
export default {
  props: ['filters', 'value', 'disabled'],
  emits: ['filtersSelected'],
  data () {
    return {
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined
      }
    }
  },
  methods: {
    select () {
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.f7SmartSelect.getValue()
      this.$emit('filtersSelected', value)
    }
  }
}
</script>
