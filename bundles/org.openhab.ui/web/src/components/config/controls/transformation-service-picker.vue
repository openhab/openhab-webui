<template>
  <ul class="transformation-service-picker-container">
    <f7-list-item
      v-if="ready"
      :title="showPlaceholder ? title || 'Transformation Service' : undefined"
      smart-select
      :smart-select-params="smartSelectParams"
      ref="smartSelect"
      :no-chevron="noChevron"
      :disabled="disabled">
      <select :name="name" @change="select" :required="required">
        <option value="" />
        <option v-for="service in services" :value="service" :key="service" :selected="value === service ? true : null">
          {{ service }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before transformation services are loaded -->
    <f7-list-item
      v-show="!ready"
      link
      :title="showPlaceholder ? title : undefined"
      :after="!showPlaceholder ? value : undefined"
      :no-chevron="noChevron" />
  </ul>
</template>

<style lang="stylus">
.transformation-service-picker-container
  .item-inner:after
    display none
</style>

<script>
import { f7 } from 'framework7-vue'
import { nextTick } from 'vue'

export default {
  props: {
    title: String,
    name: String,
    value: String,
    required: Boolean,
    filterType: Array,
    openOnReady: Boolean,
    disabled: Boolean,
    noChevron: Boolean,
    showPlaceholder: {
      type: Boolean,
      default: true
    }
  },
  emits: ['transformationServicePicked', 'input'],
  data() {
    return {
      ready: false,
      services: [],
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.transformationService')
      }
    }
  },
  created() {
    this.smartSelectParams.closeOnSelect = true
    this.$oh.api.get('/rest/transformations/services').then((data) => {
      this.services = data.sort()
      if (this.filterType) {
        this.services = this.services.filter((s) => this.filterType.indexOf(s) >= 0)
        if (this.services.length < 5) {
          this.smartSelectParams.openIn = 'sheet'
          this.smartSelectParams.searchbar = false
        }
      }
      this.ready = true
      if (this.openOnReady) {
        nextTick(() => {
          this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
        })
      }
    })
  },
  methods: {
    open() {
      this.$refs.smartSelect.$el.children[0].f7SmartSelect.open()
    },
    select(e) {
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      this.$emit('input', e.target.value)
      f7.emit('transformationServicePicked', e.target.value)
    }
  }
}
</script>
