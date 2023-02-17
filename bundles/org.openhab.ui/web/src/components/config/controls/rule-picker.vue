<template>
  <ul>
    <f7-list-item :title="title || 'Rule'" smart-select :smart-select-params="smartSelectParams" v-if="ready" ref="smartSelect">
      <select :name="name" :multiple="multiple" @change="select" :required="required">
        <option v-if="!multiple" value="" />
        <optgroup v-if="scenes.length > 0" label="Scenes">
          <option v-for="rule in scenes" :value="rule.uid" :key="rule.uid" :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid">
            {{ rule.name }}
          </option>
        </optgroup>
        <optgroup v-if="scripts.length > 0" label="Scripts">
          <option v-for="rule in scripts" :value="rule.uid" :key="rule.uid" :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid">
            {{ rule.name }}
          </option>
        </optgroup>
        <optgroup v-if="rules.length > 0" label="Rules">
          <option v-for="rule in rules" :value="rule.uid" :key="rule.uid" :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid">
            {{ rule.name }}
          </option>
        </optgroup>
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
      scenes: [],
      scripts: [],
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
    // TODO use a Vuex store
    this.$oh.api.get('/rest/rules?summary=true').then((data) => {
      this.scenes = data.filter((r) => r.tags.indexOf('Scene') >= 0).sort((a, b) => {
        const labelA = a.name
        const labelB = b.name
        return labelA.localeCompare(labelB)
      })
      this.scripts = data.filter((r) => r.tags.indexOf('Script') >= 0).sort((a, b) => {
        const labelA = a.name
        const labelB = b.name
        return labelA.localeCompare(labelB)
      })
      this.rules = data.filter((r) => r.tags.indexOf('Scene') < 0 && r.tags.indexOf('Script') < 0).sort((a, b) => {
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
