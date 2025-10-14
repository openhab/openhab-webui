<template>
  <ul class="persistence-picker-container">
    <f7-list-item :title="title || 'Persistence'"
                  smart-select
                  :smart-select-params="smartSelectParams"
                  ref="smartSelect"
                  v-if="ready">
      <select :name="name" @change="select" :required="required">
        <option value="" />
        <option v-for="service in services"
                :value="service.id"
                :key="service.id"
                :selected="value === service.id">
          {{ service.label ? service.label + ' (' + service.id + ')' : service.id }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before persistence services are loaded -->
    <f7-list-item link v-show="!ready" :title="title" />
  </ul>
</template>

<style lang="stylus">
.persistence-picker-container
  .item-inner:after
    display none
</style>

<script>
export default {
  props: {
    title: String,
    name: String,
    value: String,
    required: Boolean,
    filterType: Array,
    openOnReady: Boolean
  },
  emits: ['persistencePicked', 'input'],
  data () {
    return {
      ready: false,
      services: [],
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.persistence')
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = true
    this.$oh.api.get('/rest/persistence').then((data) => {
      this.services = data.sort((a, b) => {
        const labelA = a.label || a.id
        const labelB = b.label || b.id
        return labelA.localeCompare(labelB)
      })
      if (this.filterType) {
        this.services = this.services.filter((i) => this.filterType.indexOf(i.type) >= 0)
        if (this.services.length < 5) {
          this.smartSelectParams.openIn = 'sheet'
          this.smartSelectParams.searchbar = false
        }
      }
      this.ready = true
      if (this.openOnReady) {
        this.$nextTick(() => {
          this.$refs.smartSelect.f7SmartSelect.open()
        })
      }
    })
  },
  methods: {
    open () {
      this.$refs.smartSelect.f7SmartSelect.open()
    },
    select (e) {
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      this.$emit('input', e.target.value)
      this.$f7.emit('persistencePicked', e.target.value)
    }
  }
}
</script>
