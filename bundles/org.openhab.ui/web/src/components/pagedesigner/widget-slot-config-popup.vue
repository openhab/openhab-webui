<template>
  <f7-popup ref="slotConfig"
            class="slotconfig-popup"
            @popup:open="ready = true"
            @popup:closed="widgetSlotConfigClosed">
    <f7-page v-if="ready">
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left"
                   icon-md="material:arrow_back"
                   icon-aurora="f7:arrow_left"
                   popup-close />
        </f7-nav-left>
        <f7-nav-title>Edit {{ currentSlot }}</f7-nav-title>
        <f7-nav-right>
          <f7-link @click="updateWidgetSlotConfig" class="popup-close">
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar tabbar position="top">
        <f7-link v-for="(slotComponent, idx) in slotConfig"
                 :key="idx"
                 @click="switchTab(idx)"
                 :tab-link-active="currentTab === idx"
                 class="tab-link">
          {{ idx }}
        </f7-link>
        <f7-link @click="addComponentToSlot" icon-f7="plus_filled" class="tab-link" />
        <!-- <f7-link @click="currentTab = 'config'" :tab-link-active="currentTab === 'config'" class="tab-link">Config</f7-link>
        <f7-link @click="currentTab = 'channels'" :tab-link-active="currentTab === 'channels'" class="tab-link">Channels</f7-link> -->
      </f7-toolbar>
      <f7-tabs>
        <f7-tab v-for="(slotComponent, idx) in slotConfig"
                :id="'tab-' + idx"
                :key="idx"
                :tab-active="currentTab === idx">
          <config-sheet v-if="currentTab === idx && getWidgetDefinition(slotComponent.component)"
                        :parameterGroups="getWidgetDefinition(slotComponent.component).props.parameterGroups || []"
                        :parameters="getWidgetDefinition(slotComponent.component).props.parameters || []"
                        :configuration="slotComponent.config"
                        @updated="dirty = true" />
          <f7-block v-else strong>
            This type of component cannot be configured: {{ slotComponent.component }}.
          </f7-block>
          <f7-list>
            <f7-list-button color="blue" @click="editWidgetCode(slotComponent)">
              Edit YAML
            </f7-list-button>
            <f7-list-button color="Remove" @click="removeComponentFromSlot(slotComponent, slotConfig); switchTab(slotConfig.length - 1)">
              Remove
            </f7-list-button>
          </f7-list>
        </f7-tab>
      </f7-tabs>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.slotconfig-popup
  .page-content
    overflow-x hidden
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  props: {
    currentSlot: String,
    slotConfig: Array,
    getWidgetDefinition: Function,
    currentSlotDefaultComponentType: String,
    initialConfig: Object,
    removeComponentFromSlot: Function,
    editWidgetCode: Function
  },
  emits: ['widgetSlotConfigClosed', 'widgetSlotConfigUpdate'],
  components: {
    ConfigSheet
  },
  data () {
    return {
      ready: false,
      currentTab: 0
    }
  },
  methods: {
    switchTab (idx) {
      this.currentTab = undefined
      this.$nextTick(() => { this.currentTab = idx })
    },
    widgetSlotConfigOpened () {
    },
    widgetSlotConfigClosed () {
      this.$f7.emit('widgetSlotConfigClosed')
    },
    updateWidgetSlotConfig () {
      this.$f7.emit('widgetSlotConfigUpdate', this.slotConfig)
    },
    addComponentToSlot () {
      this.slotConfig.push({ component: this.currentSlotDefaultComponentType, config: Object.assign({}, this.initialConfig) })
      this.switchTab(this.slotConfig.length - 1)
    }
  }
}
</script>
