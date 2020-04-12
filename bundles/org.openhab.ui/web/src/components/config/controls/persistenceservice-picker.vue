<template>
<ul>
  <f7-list-item :title="title || 'Persistence Service'" smart-select :smart-select-params="smartSelectParams" v-if="ready">
    <select :name="name" :multiple="multiple" @change="select">
      <option value=""></option>
      <option v-for="service in services" :value="service.id" :key="service.id" :selected="(multiple) ? value.indexOf(service.id) >= 0 : value === service.id">
        {{service.label}}
      </option>
    </select>
  </f7-list-item>
  <!-- for placeholder purposes before items are loaded -->
  <f7-list-item link v-show="!ready" :title="title" />
</ul>
</template>

<script>
export default {
  props: ['title', 'name', 'value', 'multiple'],
  data () {
    return {
      ready: false,
      service: [],
      icons: {},
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popover'
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    // TODO use a Vuex store
    this.$oh.api.get('/rest/persistence').then((data) => {
      this.services = data.sort((a, b) => {
        const labelA = a.label
        const labelB = b.label
        return labelA.localeCompare(labelB)
      })
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
