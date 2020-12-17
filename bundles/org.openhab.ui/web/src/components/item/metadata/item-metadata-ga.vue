<template>
  <div>
    <f7-list>
      <f7-list-item :key="classSelectKey"
         :title="'Google Assistant Class'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }" ref="classes">
        <select name="classes" @change="updateClass">
          <option value=""></option>
          <option v-for="cl in classesDefs" :value="cl" :key="cl" :selected="isSelected(cl)">{{cl}}</option>
        </select>
      </f7-list-item>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="[]" :parameters="parameters" :configuration="metadata.config" />
    </div>
    <p class="padding">
      <f7-link color="blue" external target="_blank" href="https://www.openhab.org/link/google-assistant">Google Assistant Integration Documentation</f7-link>
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
    parameters () {
      if (!this.metadata.value) return []
      return [...GoogleDefinitions[this.metadata.value]]
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
