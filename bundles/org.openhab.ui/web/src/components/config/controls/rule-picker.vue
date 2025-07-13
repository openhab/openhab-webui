<template>
  <ul>
    <f7-list-item :title="title || 'Rule'"
                  smart-select
                  :smart-select-params="smartSelectParams"
                  v-if="ready"
                  ref="smartSelect">
      <select :name="name"
              :multiple="multiple"
              @change="select"
              :required="required">
        <option v-if="!multiple" value="" />
        <optgroup v-if="scenes.length > 0" label="Scenes">
          <option v-for="rule in scenes"
                  :value="rule.uid"
                  :key="rule.uid"
                  :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid ? true : null
                  ">
            {{ rule.name }}
          </option>
        </optgroup>
        <optgroup v-if="scripts.length > 0" label="Scripts">
          <option v-for="rule in scripts"
                  :value="rule.uid"
                  :key="rule.uid"
                  :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid ? true : null
                  ">
            {{ rule.name }}
          </option>
        </optgroup>
        <optgroup v-if="rules.length > 0" label="Rules">
          <option v-for="rule in rules"
                  :value="rule.uid"
                  :key="rule.uid"
                  :selected="(multiple) ? value && value.indexOf(rule.uid) >= 0 : value === rule.uid ? true : null">
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
import { f7 } from 'framework7-vue'

export default {
  props: {
    title: String,
    name: String,
    value: [String, Array],
    multiple: Boolean,
    required: Boolean
  },
  emits: ['input'],
  data () {
    return {
      ready: false,
      scenes: [],
      scripts: [],
      rules: [],
      icons: {},
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup',
        searchbar: true,
        multiple: this.multiple,
        searchbarPlaceholder: 'Search rules'
      }
    }
  },
  created () {
    this.smartSelectParams.closeOnSelect = !this.multiple
    this.$oh.api.get('/rest/rules?staticDataOnly=true').then((data) => {
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
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.$el.children[0].f7SmartSelect.getValue()
      this.$emit('input', value)
    }
  }
}
</script>
