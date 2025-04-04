<template>
  <f7-list class="strategy-picker-container" v-if="strategies">
    <f7-list-item :title="title" :smart-select="disabled !== true" :smart-select-params="smartSelectParams"
                  ref="smartSelect" class="defaults-picker">
      <select v-if="disabled !== true" :name="name" multiple>
        <option v-for="s in strategies" :key="s" :value="s"
                :selected="value.length ? value.includes(s) : suggested.includes(s)">
          {{ s }}
        </option>
      </select>
      <div v-else>
        {{ value.join(', ') }}
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
  .item-title
    padding-left 8px
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  props: ['title', 'name', 'strategies', 'value', 'suggested', 'disabled'],
  emits: ['strategiesSelected'],
  data () {
    return {
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined,
        setValueText: false || this.value?.length
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      const smartSelect = this.$refs.smartSelect?.f7SmartSelect
      if (smartSelect) {
        smartSelect.on('closed', this.select)
      }
    })
  },
  beforeDestroy () {
    const smartSelect = this.$refs.smartSelect?.f7SmartSelect
    if (smartSelect) {
      smartSelect.off('closed', this.select)
    }
  },
  methods: {
    select () {
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      const smartSelect = this.$refs.smartSelect.f7SmartSelect
      const value = smartSelect.getValue()
      if (value === this.value || ((value.length === this.value.length) && value.reduce((av, cv) => { return av || this.value?.includes(cv) }, true))) return
      this.$emit('strategiesSelected', value)
      this.smartSelectParams = {
        ...this.smartSelectParams,
        setValueText: true
      }
      // Force re-render of Smart Select showing the selected parameters
      this.$nextTick(() => {
        smartSelect.destroy()
        this.$refs.smartSelect.f7SmartSelect = this.$f7.smartSelect.create({
          el: this.$refs.smartSelect.$el,
          ...this.smartSelectParams
        })
      })
    }
  }
}
</script>
