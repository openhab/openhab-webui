<template>
  <div>
    <div style="text-align:right" class="padding-right">
      <label @click="toggleMultiple" style="cursor:pointer">Multiple</label> <f7-checkbox :checked="multiple" @change="toggleMultiple"></f7-checkbox>
    </div>
    <f7-list>
      <f7-list-item :key="classSelectKey"
         :title="(multiple) ? 'HomeKit Accessory/Charactistics' : 'HomeKit Accessory/Charactistic'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: !multiple }" ref="classes">
        <select name="parameters" @change="updateClasses" :multiple="multiple">
          <option v-if="!multiple" value=""></option>
          <option v-for="cl in classesDefs.filter((c) => c.indexOf('label:') !== 0)"
            :value="cl" :key="cl"
            :selected="isSelected(cl)">
            {{cl}}
          </option>
        </select>
      </f7-list-item>
    </f7-list>
    <div>
      <config-sheet :parameterGroups="[]" :parameters="parameters" :configuration="metadata.config" />
    </div>
    <p class="padding">
      <f7-link color="blue" external target="_blank" href="https://www.openhab.org/link/homekit">HomeKit integration documentation</f7-link>
    </p>
  </div>
</template>

<script>
import { accessoriesAndCharacteristics, homekitParameters } from '@/assets/definitions/metadata/homekit'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: ['itemName', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      classesDefs: accessoriesAndCharacteristics,
      multiple: !!this.metadata.value && this.metadata.value.indexOf(',') > 0,
      classSelectKey: this.$f7.utils.id()
    }
  },
  computed: {
    classes () {
      if (!this.multiple) return this.metadata.value
      return (this.metadata.value) ? this.metadata.value.split(',') : []
    },
    parameters () {
      if (!this.classes) return []
      if (!this.multiple && this.classes.indexOf('Valve') === 0) return homekitParameters
      if (this.multiple && this.classes.some((c) => c.indexOf('Valve') === 0)) return homekitParameters
      return []
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
