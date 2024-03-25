<template>
  <div>
    <f7-list>
      <f7-list-item :key="classSelectKey"
                    :title="'Google Assistant Class'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true, scrollToSelectedItem: true }" ref="classes">
        <select name="classes" @change="updateClass">
          <option value="" />
          <optgroup label="Types">
            <option v-for="cl in orderedClasses.filter((c) => c.indexOf('type:') === 0)"
                    :value="cl.replace('type:', '')"
                    :key="cl"
                    :selected="isSelected(cl.replace('type:', ''))">
              {{ cl.replace('type:', '') }}
            </option>
          </optgroup>
          <optgroup label="Attributes">
            <option v-for="cl in orderedClasses.filter((c) => c.indexOf('attribute:') === 0)"
                    :value="cl.replace('attribute:', '')"
                    :key="cl"
                    :selected="isSelected(cl.replace('attribute:', ''))">
              {{ cl.replace('attribute:', '') }}
            </option>
          </optgroup>
        </select>
      </f7-list-item>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="[]" :parameters="parameters" :configuration="metadata.config" />
    </div>
    <p class="padding">
      <f7-link color="blue" external target="_blank" href="https://v34.openhab.org/link/google-assistant">
        Google Assistant Integration Documentation
      </f7-link>
    </p>
  </div>
</template>

<script>
import GoogleDefinitions from '@/assets/definitions/metadata/ga'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: ['itemName', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      classesDefs: Object.keys(GoogleDefinitions),
      classSelectKey: this.$f7.utils.id()
    }
  },
  computed: {
    classes () {
      return this.metadata.value
    },
    orderedClasses () {
      return [...this.classesDefs].sort((a, b) => {
        return a.localeCompare(b)
      })
    },
    parameters () {
      if (!this.metadata.value) return []
      return GoogleDefinitions['type:' + this.metadata.value] || GoogleDefinitions['attribute:' + this.metadata.value]
    }
  },
  methods: {
    isSelected (cl) {
      return this.classes === cl
    },
    updateClass () {
      const value = this.$refs.classes.f7SmartSelect.getValue()
      this.metadata.value = value
      this.$set(this.metadata, 'config', {})
    }
  }
}
</script>
