<template>
  <div>
    <div style="text-align:right" class="padding-right">
      <label @click="toggleMultiple" style="cursor:pointer">Multiple</label> <f7-checkbox :checked="multiple" @change="toggleMultiple"></f7-checkbox>
    </div>
    <f7-list>
      <f7-list-item :key="classSelectKey"
         :title="(multiple) ? 'Alexa Classes' : 'Alexa Class'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple, scrollToSelectedItem: true }" ref="classes">
        <select name="parameters" @change="updateClasses" :multiple="multiple">
          <option v-if="!multiple" value=""></option>
          <optgroup label="Labels" v-if="!multiple">
            <option v-for="cl in orderedClasses.filter((c) => c.indexOf('label:') === 0)"
              :value="cl.replace('label:', '')" :key="cl"
              :selected="isSelected(cl.replace('label:', ''))">
              {{cl.replace('label:', '')}}
            </option>
          </optgroup>
          <optgroup label="Capabilities">
            <option v-for="cl in orderedClasses.filter((c) => c.indexOf('label:') !== 0)"
              :value="cl" :key="cl"
              :selected="isSelected(cl)">
              {{cl}}
            </option>
          </optgroup>
        </select>
      </f7-list-item>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="[]" :parameters="parameters" :configuration="metadata.config" />
    </div>
    <p class="padding">
      <f7-link color="blue" external target="_blank" href="https://www.openhab.org/link/alexa">Alexa Integration Documentation</f7-link>
    </p>
  </div>
</template>

<script>
import AlexaDefinitions from '@/assets/definitions/metadata/alexa'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: ['itemName', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      classesDefs: Object.keys(AlexaDefinitions),
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: this.$f7.utils.id()
    }
  },
  computed: {
    classes () {
      if (!this.multiple) return this.metadata.value
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    orderedClasses () {
      return [...this.classesDefs].sort((a, b) => {
        return a.localeCompare(b);
      })
    },
    parameters () {
      if (!this.classes) return []
      if (!this.multiple) {
        return AlexaDefinitions['label:' + this.classes] || [...AlexaDefinitions[this.classes]]
      }
      const params = []
      this.classes.forEach((c) => {
        for (const p of AlexaDefinitions[c]) {
          if (!params.find(p2 => p2.name === p.name)) params.push(p)
        }
      })
      return params
    }
  },
  methods: {
    isSelected (cl) {
      return (this.multiple) ? this.classes.indexOf(cl) >= 0 : this.classes === cl
    },
    toggleMultiple () {
      this.multiple = !this.multiple
      this.metadata.value = ''
      this.classSelectKey = this.$f7.utils.id()
    },
    updateClasses () {
      const value = this.$refs.classes.f7SmartSelect.getValue()
      this.metadata.value = (Array.isArray(value)) ? value.join(',') : value
      this.$set(this.metadata, 'config', {})
    }
  }
}
</script>
