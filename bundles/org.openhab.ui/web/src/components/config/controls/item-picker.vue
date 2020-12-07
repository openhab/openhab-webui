<template>
<ul>
  <f7-list-item :title="title" smart-select :smart-select-params="smartSelectParams" v-if="ready" ref="smartSelect" class="item-picker">
    <select :name="name" :multiple="multiple" @change="select" :required="required">
      <option value="" v-if="!multiple"></option>
      <option v-for="item in items" :value="item.name" :key="item.name" :selected="(multiple) ? Array.isArray(value) && value.indexOf(item.name) >= 0 : value === item.name">
        {{item.label ? item.label + ' (' + item.name + ')' : item.name}}
      </option>
    </select>
  </f7-list-item>
  <!-- for placeholder purposes before items are loaded -->
  <f7-list-item link v-show="!ready" :title="title" />
</ul>
</template>

<script>
export default {
  props: ['title', 'name', 'value', 'multiple', 'filterType', 'required', 'editableOnly'],
  data () {
    return {
      ready: false,
      items: [],
      icons: {},
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: this.$t('dialogs.search.items'),
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    // TODO use a Vuex store
    this.$oh.api.get('/rest/items').then((data) => {
      this.items = data.sort((a, b) => {
        const labelA = a.label || a.name
        const labelB = b.label || b.name
        return labelA.localeCompare(labelB)
      })
      if (this.filterType) {
        this.items = this.items.filter((i) => i.type === this.filterType)
      }
      if (this.editableOnly) {
        this.items = this.items.filter((i) => i.editable)
      }
      this.ready = true
    })
  },
  methods: {
    select (e) {
      this.$f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.f7SmartSelect.getValue()
      this.$emit('input', value)
    }
  }
}
</script>
