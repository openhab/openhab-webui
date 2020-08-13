<template>
  <div>
    <!-- <f7-segmented strong>
      <f7-button :active="viewMode === 'design'" @click="viewMode = 'design'">Design</f7-button>
      <f7-button :active="viewMode === 'preview'" @click="viewMode = 'preview'">Preview</f7-button>
    </f7-segmented> -->
    <div style="text-align:right" class="padding-right">
      <label @click="togglePreview" style="cursor:pointer">Open Preview</label> <f7-checkbox :checked="previewOpened" @change="togglePreview"></f7-checkbox>
    </div>

    <f7-list v-if="viewMode === 'design'">
      <f7-list-item :key="componentSelectKey"
         :title="'Widget'" smart-select :smart-select-params="{ openIn: 'popup', searchbar: true, closeOnSelect: true }" ref="widgets">
        <select name="widgets" @change="updateComponent">
          <option value=""></option>
          <optgroup v-if="$store.getters.widgets.length" label="Widgets">
            <option v-for="widget in $store.getters.widgets" :value="'widget:' + widget.uid" :key="widget.uid" :selected="metadata.value.replace('widget:', '') === widget.uid">{{widget.uid}}</option>
          </optgroup>
          <optgroup label="Standard Library (List)" v-if="namespace === 'listWidget'">
            <option v-for="widget in standardListWidgets" :key="widget.name" :value="widget.name" :selected="metadata.value === widget.name">{{widget.label}}</option>
          </optgroup>
          <optgroup label="Standard Library" v-else>
            <option v-for="widget in standardWidgets" :key="widget.name" :value="widget.name" :selected="metadata.value === widget.name">{{widget.label}}</option>
          </optgroup>
          <!-- <optgroup label="System Widgets">
            <option v-for="widget in systemWidgets" :key="widget.name" :value="widget.name">{{widget.label}}</option>
          </optgroup> -->
        </select>
      </f7-list-item>
    </f7-list>
    <div v-if="viewMode === 'design' && configDescriptions.parameters" class="widget-metadata-config-sheet">
      <f7-block-title>Configuration</f7-block-title>
      <f7-block-footer class="padding-horizontal">Note: a parameter named 'item' will be set automatically with the name of this item - no need to specify it here.</f7-block-footer>
      <config-sheet :parameterGroups="configDescriptions.parameterGroups || []" :parameters="configDescriptions.parameters || []" :configuration="metadata.config" />
    </div>
    <div v-if="viewMode === 'preview'">
      <generic-widget-component v-if="previewContext.component" :context="previewContext" />
    </div>
    <f7-sheet ref="previewSheet" :opened="previewOpened" :backdrop="false" :close-by-outside-click="false" :close-by-backdrop-click="false" :close-on-escape="true">
      <f7-toolbar tabbar bottom>
        <span class="margin-left">Preview</span>
        <div class="right">
          <f7-link @click="previewOpened = false" class="padding-right"><f7-icon f7="chevron_down"></f7-icon></f7-link>
        </div>
      </f7-toolbar>
      <f7-page>
        <f7-block class="block-narrow">
          <f7-col>
            <generic-widget-component v-if="previewContext.component" :context="previewContext" />
          </f7-col>
        </f7-block>
      </f7-page>
    </f7-sheet>
  </div>
</template>

<style lang="stylus">
.widget-metadata-config-sheet
  margin-bottom var(--f7-sheet-height)
  z-index 10500
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

import * as SystemWidgets from '@/components/widgets/system/index'
import * as StandardWidgets from '@/components/widgets/standard/index'
import * as StandardListWidgets from '@/components/widgets/standard/list/index'

import itemDefaultStandaloneComponent from '@/components/widgets/standard/default-standalone-item'
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'

export default {
  props: ['item', 'metadata', 'namespace'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      viewMode: 'design',
      previewOpened: false,
      componentSelectKey: this.$f7.utils.id(),
      standardWidgets: Object.values(StandardWidgets).filter((c) => c.widget).map((c) => c.widget()),
      standardListWidgets: Object.values(StandardListWidgets).filter((c) => c.widget && typeof c.widget === 'function').map((c) => c.widget()),
      systemWidgets: Object.values(SystemWidgets).filter((c) => c.widget & typeof c.widget === 'function').map((c) => c.widget())
    }
  },
  computed: {
    configDescriptions () {
      if (!this.metadata.value) return {}

      const widget = this.$store.getters.widgets.find((w) => w.uid === this.metadata.value.replace('widget:', ''))
      if (widget && widget.props) return widget.props

      if (this.namespace === 'listWidget') {
        const standardListItemWidget = this.standardListWidgets.find((w) => w.name === this.metadata.value)
        if (standardListItemWidget && standardListItemWidget.props) return standardListItemWidget.props
      } else {
        const standardWidget = this.standardWidgets.find((w) => w.name === this.metadata.value)
        if (standardWidget && standardWidget.props) return standardWidget.props
      }

      return {}
    },
    previewContext () {
      const componentFromMetadata = (this.metadata.value !== '') ? {
        component: this.metadata.value,
        config: Object.assign({ item: this.item.name }, this.metadata.config || {})
      } : null

      if (this.namespace === 'listWidget') {
        return {
          store: this.$store.getters.trackedItems,
          component: {
            component: 'oh-list-card',
            config: {},
            slots: {
              default: [componentFromMetadata || itemDefaultListComponent(this.item)]
            }
          }
        }
      } else {
        return {
          store: this.$store.getters.trackedItems,
          component: componentFromMetadata || itemDefaultStandaloneComponent(this.item)
        }
      }
    }
  },
  mounted () {
    this.$store.dispatch('startTrackingStates')
  },
  beforeDestroy () {
    this.previewOpened = false
    this.$refs.previewSheet.f7Sheet.close()
    this.$refs.previewSheet.f7Sheet.destroy()
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
    togglePreview () {
      this.previewOpened = !this.previewOpened
    }
  }
}
</script>
