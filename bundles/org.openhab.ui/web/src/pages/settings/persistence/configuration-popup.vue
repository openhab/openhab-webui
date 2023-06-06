<template>
  <f7-popup ref="modulePopup" class="moduleconfig-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
        </f7-nav-left>
        <f7-nav-title>
          Configure strategies and filters for Item(s)
        </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentConfiguration.items.length > 0" @click="updateModuleConfig">
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block>
        <f7-block-title>Items</f7-block-title>
        <f7-list>
          <item-picker title="Select groups whose Items are to be persisted" name="groupItems" multiple="true"
                       filterType="Group" :value="groupItems" @input="selectGroupItems" />
          <item-picker title="Select Items to be persisted" name="items" multiple="true" :value="items"
                       @input="selectItems" />
        </f7-list>
      </f7-block>
      <f7-block>
        <f7-block-title>Strategies</f7-block-title>
        <strategy-picker title="Select Strategies" name="strategies" :strategies="strategies"
                         :value="currentConfiguration.strategies"
                         @strategiesSelected="currentConfiguration.strategies = $event" />
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import ItemPicker from '@/components/config/controls/item-picker.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'

export default {
  components: { StrategyPicker, ItemPicker },
  props: ['configuration', 'strategies'],
  emits: ['configurationUpdate'],
  data () {
    return {
      currentConfiguration: this.configuration || {
        items: [],
        strategies: [],
        filters: []
      }
    }
  },
  computed: {
    groupItems () {
      return this.currentConfiguration.items.filter((i) => i.endsWith('*')).map((i) => i.slice(0, -1))
    },
    items () {
      return this.currentConfiguration.items.filter((i) => !i.endsWith('*'))
    }
  },
  methods: {
    selectGroupItems (ev) {
      this.currentConfiguration.items = ev.sort((a, b) => a.localeCompare(b)).map((i) => i + '*').concat(this.items)
    },
    selectItems (ev) {
      this.currentConfiguration.items = this.groupItems.map((i) => i + '*').concat(ev.sort((a, b) => a.localeCompare(b)))
    },
    updateModuleConfig () {
      if (this.currentConfiguration.items.length === 0) {
        this.$f7.dialog.alert('Please select Items')
        return
      }
      this.$f7.emit('configurationUpdate', this.currentConfiguration)
      this.$refs.modulePopup.close()
    }
  }
}
</script>
