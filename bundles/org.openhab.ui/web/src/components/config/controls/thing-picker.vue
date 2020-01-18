<template>
<ul>
  <f7-list-item :title="title || 'Thing'" smart-select :smart-select-params="smartSelectParams" v-if="ready">
    <select :name="name" :multiple="multiple" @change="select">
      <option value=""></option>
      <option v-for="thing in things" :value="thing.UID" :key="thing.UID" :selected="(multiple) ? value.indexOf(thing.UID) >= 0 : value === thing.UID">
        {{thing.label}}
      </option>
    </select>
  </f7-list-item>
  <!-- for placeholder purposes before items are loaded -->
  <f7-list-item link v-show="!ready" :title="title" />
</ul>
</template>

<script>
export default {
  props: ['title', 'name', 'value', 'multiple', 'filterType'],
  data () {
    return {
      ready: false,
      things: [],
      icons: {},
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        searchbarPlaceholder: 'Search things',
        virtualList: true,
        virtualListHeight: (this.$theme.aurora) ? 32 : undefined
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    // TODO use a Vuex store
    this.$oh.api.get('/rest/things').then((data) => {
      this.things = data.sort((a, b) => {
        const labelA = a.label
        const labelB = b.label
        return labelA.localeCompare(labelB)
      })
      if (this.filterType) {
        this.things = this.things.filter((i) => this.filterType.indexOf(i.thingTypeUID) >= 0)
        if (this.things.length < 5) {
          this.smartSelectParams.openIn = 'sheet'
          this.smartSelectParams.searchbar = false
        }
      }
      this.ready = true
    })
  },
  methods: {
    select (e) {
      this.$emit('input', e.target.value)
    }
  }
}
</script>
