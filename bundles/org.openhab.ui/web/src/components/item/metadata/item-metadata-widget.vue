<template>
  <div>
    <f7-block class="block-narrow widget-preview">
      <f7-col>
        <generic-widget-component v-if="previewContext.component" :context="previewContext" />
      </f7-col>
    </f7-block>

    <f7-list v-if="viewMode === 'design' && defaultComponent.component">
      <f7-list-item :key="componentSelectKey"
         :title="'Widget'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }" ref="widgets">
        <select name="widgets" @change="updateComponent">
          <option value="">Default ({{defaultComponent.component}})</option>
          <optgroup label="Standard Library (List)" v-if="namespace === 'listWidget'">
            <option v-for="widget in standardListWidgets" :key="widget.name" :value="widget.name" :selected="metadata.value === widget.name">{{widget.label}}</option>
          </optgroup>
          <optgroup label="Standard Library (Cell)" v-else-if="namespace === 'cellWidget'">
            <option v-for="widget in standardCellWidgets" :key="widget.name" :value="widget.name" :selected="metadata.value === widget.name">{{widget.label}}</option>
          </optgroup>
          <optgroup label="Standard Library" v-else>
            <option v-for="widget in standardWidgets" :key="widget.name" :value="widget.name" :selected="metadata.value === widget.name">{{widget.label}}</option>
          </optgroup>
          <optgroup v-if="$store.getters.widgets.length" label="Personal Widgets">
            <option v-for="widget in $store.getters.widgets" :value="'widget:' + widget.uid" :key="widget.uid" :selected="metadata.value.replace('widget:', '') === widget.uid">{{widget.uid}}</option>
          </optgroup>
          <!-- <optgroup label="System Widgets">
            <option v-for="widget in systemWidgets" :key="widget.name" :value="widget.name">{{widget.label}}</option>
          </optgroup> -->
        </select>
      </f7-list-item>
    </f7-list>
    <div v-if="viewMode === 'design' && configDescriptions.parameters" class="widget-metadata-config-sheet">
      <f7-block-title>Configuration</f7-block-title>
      <f7-block-footer class="padding-horizontal margin-bottom">Note: the parameter named 'item' will be set automatically with the name of the item ({{this.item.name}}) unless it's set explicitely.</f7-block-footer>
      <f7-block-footer v-if="currentComponent.component && currentComponent.component.indexOf('widget:') === 0" class="padding-horizontal margin-bottom">Make sure the personal widget is of the expected type (cell, list item or standalone).</f7-block-footer>
      <config-sheet :parameterGroups="configDescriptions.parameterGroups" :parameters="configDescriptions.parameters" :configuration="metadata.config" @updated="widgetConfigUpdated" />
    </div>
    <div v-if="viewMode === 'preview'">
      <generic-widget-component v-if="previewContext.component" :context="previewContext" />
    </div>
  </div>
</template>

<style lang="stylus">
.widget-metadata-config-sheet
  margin-bottom var(--f7-sheet-height)
  z-index 10500
.widget-preview
  z-index auto
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

import * as SystemWidgets from '@/components/widgets/system'
import * as StandardWidgets from '@/components/widgets/standard'
import * as StandardListWidgets from '@/components/widgets/standard/list'
import * as StandardCellWidgets from '@/components/widgets/standard/cell'

import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'
import itemDefaultCellComponent from '@/components/widgets/standard/cell/default-cell-item'

import { VisibilityGroup, VisibilityParameters } from '@/assets/definitions/widgets/visibility'

export default {
  props: ['item', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      viewMode: 'design',
      defaultComponent: {},
      componentSelectKey: this.$f7.utils.id(),
      standardWidgets: Object.values(StandardWidgets).filter((c) => c.widget).map((c) => c.widget()),
      standardListWidgets: Object.values(StandardListWidgets).filter((c) => c.widget && typeof c.widget === 'function').map((c) => c.widget()),
      standardCellWidgets: Object.values(StandardCellWidgets).filter((c) => c.widget && typeof c.widget === 'function').map((c) => c.widget()),
      systemWidgets: Object.values(SystemWidgets).filter((c) => c.widget & typeof c.widget === 'function').map((c) => c.widget()),
      widgetVars: {}
    }
  },
  computed: {
    configDescriptions () {
      let ret = {}
      if (!this.currentComponent || !this.currentComponent.component) return ret
      const widget = this.$store.getters.widgets.find((w) => w.uid === this.currentComponent.component.replace('widget:', ''))
      if (widget && widget.props) ret = Object.assign({}, widget.props)

      if (this.namespace === 'listWidget') {
        const standardListItemWidget = this.standardListWidgets.find((w) => w.name === this.currentComponent.component)
        if (standardListItemWidget && standardListItemWidget.props) ret = Object.assign({}, standardListItemWidget.props)
      } else if (this.namespace === 'cellWidget') {
        const standardCellWidget = this.standardCellWidgets.find((w) => w.name === this.currentComponent.component)
        if (standardCellWidget && standardCellWidget.props) ret = Object.assign({}, standardCellWidget.props)
      } else {
        const standardWidget = this.standardWidgets.find((w) => w.name === this.currentComponent.component)
        if (standardWidget && standardWidget.props) ret = Object.assign({}, standardWidget.props)
      }

      if (!ret.parameters) ret.parameters = []
      if (!ret.parameterGroups) ret.parameterGroups = []

      if (ret.parameters.length && (!this.metadata.value || this.metadata.value === ' ')) {
        // for the default system-suggested widget, take the default config and put it as default value
        for (const key in this.defaultComponent.config) {
          const parameter = ret.parameters.find((p) => p.name === key)
          if (parameter) parameter.defaultValue = this.defaultComponent.config[key]
        }
      } else {
        // for user-specified widgets, set a default value for the 'item' parameter only
        const itemParameter = ret.parameters.find((p) => p.name === 'item')
        if (itemParameter) itemParameter.defaultValue = this.item.name
      }

      if (!ret.parameterGroups.length || ret.parameterGroups[ret.parameterGroups.length - 1].name !== 'visibility') {
        ret.parameterGroups.push(VisibilityGroup())
        ret.parameters.push(...VisibilityParameters())
      }

      return ret
    },
    currentComponent () {
      let component
      if (!this.metadata.value || this.metadata.value === ' ') {
        component = Object.assign({}, this.defaultComponent)
        if (typeof this.metadata.config === 'object') {
          component.config = Object.assign({}, component.config, this.metadata.config)
        }
        return component
      } else {
        component = {
          component: this.metadata.value,
          config: Object.assign({}, this.metadata.config || {})
        }
        if (!component.config.item) component.config.item = this.item.name
      }

      if (!component.config.item) component.config.item = this.item.name
      return component
    },
    previewContext () {
      if (this.namespace === 'listWidget') {
        return {
          store: this.$store.getters.trackedItems,
          vars: this.widgetVars,
          component: {
            component: 'oh-list-card',
            config: {
              mediaList: true
            },
            slots: {
              default: [this.currentComponent]
            }
          }
        }
      } else if (this.namespace === 'cellWidget') {
        return {
          store: this.$store.getters.trackedItems,
          vars: this.widgetVars,
          component: {
            component: 'oh-grid-cells',
            config: {},
            slots: {
              default: [this.currentComponent]
            }
          }
        }
      } else {
        return {
          store: this.$store.getters.trackedItems,
          vars: this.widgetVars,
          component: this.currentComponent
        }
      }
    }
  },
  mounted () {
    this.$store.dispatch('startTrackingStates')
    // copy the item & remove the metadata to get the default widget
    const defaultItem = Object.assign({}, this.item)
    if (defaultItem.metadata) {
      delete defaultItem.metadata[this.namespace]
    }
    this.defaultComponent =
      (this.namespace === 'cellWidget') ? itemDefaultCellComponent(defaultItem)
        : (this.namespace === 'listWidget') ? itemDefaultListComponent(defaultItem)
          : itemDefaultStandaloneComponent(defaultItem)
  },
  beforeDestroy () {
    this.previewOpened = false
    this.$store.dispatch('stopTrackingStates')
  },
  methods: {
    isSelected (cl) {
      return this.component === cl
    },
    updateComponent () {
      const value = this.$refs.widgets.f7SmartSelect.getValue()
      this.metadata.value = value
      this.$set(this.metadata, 'config', {})
    },
    widgetConfigUpdated () {
      for (let key in this.metadata.config) {
        // set to '' when the default defines the option but the metadata doesn't (null would be better but the API then removes it)
        if (!this.metadata.config[key] && this.defaultComponent.config[key]) this.$set(this.metadata.config, key, '')
        else if (this.metadata.config[key] === undefined || this.metadata.config[key] === null) delete this.metadata.config[key]

        if (key === 'visibleTo' && this.metadata.config.visibleTo.length === 0) delete this.metadata.config.visibleTo
      }
    }
  }
}
</script>
