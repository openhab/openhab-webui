<template>
  <ul class="persistence-picker-container">
    <f7-list-item :title="title || 'Persistence'" smart-select :smart-select-params="smartSelectParams" ref="smartSelect" v-if="ready">
      <select :name="name" :multiple="multiple" @change="select" :required="required">
        <option v-if="!multiple" value="" />
        <option v-for="service in services" :value="service.id" :key="service.id" :selected="(multiple) ? value.indexOf(service.id) >= 0 : value === service.id">
          {{ service.label ? service.label + ' (' + service.id + ')' : service.id }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before persistence services are loaded -->
    <f7-list-item link v-show="!ready" :title="title" />
  </ul>
</template>

<style lang="stylus">
.item-picker-container
  .item-content
    padding-left calc(var(--f7-list-item-padding-horizontal)/2 + var(--f7-safe-area-left))
  .item-media
    padding 0
  .item-inner:after
    display none
</style>

<script>
export default {
  props: ['title', 'name', 'value', 'multiple', 'required', 'filterType', 'openOnReady'],
  data () {
    return {
      ready: false,
      services: [],
      icons: {},
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.persistence'),
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    this.$oh.api.get('/rest/persistence').then((data) => {
      this.services = data.sort((a, b) => {
        const labelA = a.label || a.UID
        const labelB = b.label || b.UID
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
