<template>
  <div>
    <f7-list>
      <f7-list-item :key="componentSelectKey"
         :title="'Widget'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }" ref="widgets">
        <select name="widgets" @change="updateComponent">
          <option value=""></option>
          <optgroup v-if="$store.getters.widgets.length" label="Widgets">
            <option v-for="widget in $store.getters.widgets" :value="'widget:' + widget.uid" :key="widget.uid" :selected="metadata.value.replace('widget:', '') === widget.uid">{{widget.uid}}</option>
          </optgroup>
          <optgroup label="Standard Library">
            <option v-for="widget in standardWidgets" :key="widget.name" :value="widget.name" :selected="metadata.value === widget.name">{{widget.label}}</option>
          </optgroup>
          <!-- <optgroup label="System Widgets">
            <option v-for="widget in systemWidgets" :key="widget.name" :value="widget.name">{{widget.label}}</option>
          </optgroup> -->
        </select>
      </f7-list-item>
    </f7-list>
    <div v-if="configDescriptions.parameters">
      <f7-block-title>Configuration</f7-block-title>
      <f7-block-footer class="padding-horizontal">Note: a parameter named 'item' will be set automatically with the name of this item - no need to specify it here.</f7-block-footer>
      <config-sheet :parameterGroups="configDescriptions.parameterGroups || []" :parameters="configDescriptions.parameters || []" :configuration="metadata.config" />
    </div>
  </div>
</template>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

import * as SystemWidgets from '@/components/widgets/system/index'
import * as StandardWidgets from '@/components/widgets/standard/index'

export default {
  props: ['itemName', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      componentSelectKey: this.$f7.utils.id(),
      standardWidgets: Object.values(StandardWidgets).filter((c) => c.widget).map((c) => c.widget),
      systemWidgets: Object.values(SystemWidgets).filter((c) => c.widget).map((c) => c.widget)
    }
  },
  computed: {
    configDescriptions () {
      if (!this.metadata.value) return {}

      const widget = this.$store.getters.widgets.find((w) => w.uid === this.metadata.value.replace('widget:', ''))
      if (widget && widget.props) return widget.props

      const standardWidget = this.standardWidgets.find((w) => w.name === this.metadata.value)
      if (standardWidget && standardWidget.props) return standardWidget.props

      return {}
    }
  },
  methods: {
    isSelected (cl) {
      return this.component === cl
    },
    updateComponent () {
      const value = this.$refs.widgets.f7SmartSelect.getValue()
      this.metadata.value = value
      this.$set(this.metadata, 'config', {})
    }
  }
}
</script>
