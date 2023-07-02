<template>
  <ul>
    <f7-list-item :title="title || 'Rule'" smart-select :smart-select-params="smartSelectParams" v-if="ready" ref="smartSelect">
      <select :name="name" :multiple="multiple" @change="select" :required="required">
        <option v-if="!multiple" value="" />
        <option v-for="rule in rules" :value="rule.uid" :key="rule.uid" :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid">
          {{ rule.name }}
        </option>
      </select>
    </f7-list-item>
    <!-- for placeholder purposes before items are loaded -->
    <f7-list-item link v-show="!ready" :title="title" />
  </ul>
</template>

<script>
export default {
  props: ['title', 'name', 'value', 'multiple', 'required'],
  data () {
    return {
      ready: false,
      rules: [],
      icons: {},
      smartSelectParams: {
        view: this.$f7.view.main,
        openIn: 'popup',
        searchbar: true,
        multiple: this.multiple,
        searchbarPlaceholder: 'Search rules'
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !(this.multiple)
    this.$oh.api.get('/rest/rules?staticDataOnly=true').then((data) => {
      this.rules = data.sort((a, b) => {
        const labelA = a.name
        const labelB = b.name
        return labelA.localeCompare(labelB)
      })
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
