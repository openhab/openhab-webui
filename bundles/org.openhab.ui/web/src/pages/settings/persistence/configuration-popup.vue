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
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-block-title medium class="padding-bottom">
            Items
          </f7-block-title>
          <f7-list>
            <f7-list-item title="Persist all Items">
              <f7-toggle slot="after" :checked="allItemsSelected" @toggle:change="allItemsSelected = $event" />
            </f7-list-item>
          </f7-list>
          <f7-list>
            <item-picker :key="'groups-' + groupItems.length" title="Select groups" name="groupItems" multiple="true" filterType="Group"
                         :disabled="allItemsSelected" :value="groupItems" @input="groupItems = $event" />
            <f7-list-item>... whose members are to be persisted.</f7-list-item>
          </f7-list>
          <f7-list>
            <item-picker :key="'items-' + items.length" title="Select Items" name="items" multiple="true"
                         :disabled="allItemsSelected" :value="items" @input="items = $event" />
            <f7-list-item>... to be persisted.</f7-list-item>
          </f7-list>
          <f7-list>
            <item-picker :key="'exclude-groups-' + excludeGroupItems.length" title="Select groups" name="excludeGroupItems" multiple="true" filterType="Group"
                         :disabled="!anySelected" :value="excludeGroupItems" @input="excludeGroupItems = $event" />
            <f7-list-item>... whose members are to be excluded from persistence.</f7-list-item>
          </f7-list>
          <f7-list>
            <item-picker :key="'exclude-items-' + excludeItems.length" title="Select Items" name="excludeItems" multiple="true"
                         :disabled="!anySelected" :value="excludeItems" @input="excludeItems = $event" />
            <f7-list-item>... to be excluded from persistence.</f7-list-item>
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom">
            Strategies
          </f7-block-title>
          <strategy-picker title="Select strategies" name="strategies" :strategies="strategies"
                           :value="currentConfiguration.strategies"
                           @strategiesSelected="currentConfiguration.strategies = $event" />
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom">
            Filters
          </f7-block-title>
          <filter-picker :filters="filters"
                         :value="currentConfiguration.filters"
                         @filtersSelected="currentConfiguration.filters = $event" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
import ItemPicker from '@/components/config/controls/item-picker.vue'
import StrategyPicker from '@/pages/settings/persistence/strategy-picker.vue'
import FilterPicker from '@/pages/settings/persistence/filter-picker.vue'

export default {
  components: { FilterPicker, StrategyPicker, ItemPicker },
  props: ['configuration', 'strategies', 'filters'],
  emits: ['configurationUpdate'],
  data () {
    return {
      currentConfiguration: this.configuration || {
        items: [],
        strategies: [
          'everyChange'
        ],
        filters: []
      }
    }
  },
  computed: {
    groupItems: {
      get () {
        return this.currentConfiguration.items.filter((i) => i.length > 1 && !i.startsWith('!') && i.endsWith('*')).map((i) => i.slice(0, -1))
      },
      set (newGroupItems) {
        this.$set(this.currentConfiguration, 'items', itemConfig(this.allItemsSelected, newGroupItems.sort((a, b) => a.localeCompare(b)), this.items, this.excludeGroupItems, this.excludeItems))
      }
    },
    items: {
      get () {
        return this.currentConfiguration.items.filter((i) => !i.startsWith('!') && !i.endsWith('*'))
      },
      set (newItems) {
        this.$set(this.currentConfiguration, 'items', itemConfig(this.allItemsSelected, this.groupItems, newItems.sort((a, b) => a.localeCompare(b)), this.excludeGroupItems, this.excludeItems))
      }
    },
    excludeGroupItems: {
      get () {
        return this.currentConfiguration.items.filter((i) => i.startsWith('!') && i.endsWith('*')).map((i) => i.slice(1, -1))
      },
      set (newExcludeGroupItems) {
        this.$set(this.currentConfiguration, 'items', itemConfig(this.allItemsSelected, this.groupItems, this.items, newExcludeGroupItems.sort((a, b) => a.localeCompare(b)), this.excludeItems))
      }
    },
    excludeItems: {
      get () {
        return this.currentConfiguration.items.filter((i) => i.startsWith('!') && !i.endsWith('*')).map((i) => i.slice(1))
      },
      set (newExcludeItems) {
        this.$set(this.currentConfiguration, 'items', itemConfig(this.allItemsSelected, this.groupItems, this.items, this.excludeGroupItems, newExcludeItems.sort((a, b) => a.localeCompare(b))))
      }
    },
    allItemsSelected: {
      get () {
        return this.currentConfiguration.items.filter((i) => i === '*').length > 0
      },
      set (newAllItemsSelected) {
        this.$set(this.currentConfiguration, 'items',  itemConfig(newAllItemsSelected, this.groupItems, this.items, this.excludeGroupItems, this.excludeItems))
      }
    },
    anySelected: {
      get () {
        return this.allItemsSelected || (this.groupItems.length > 0) || (this.items.length > 0)
      }
    }
  },
  methods: {
    itemConfig(allItemsSelected, groupItems, items, excludeGroupItems, excludeItems) {
      return (allItemsSelected ? ['*'] : []).concat(groupItems.map((i) => i + '*')).concat(items).concat(excludeGroupItems.map((i) => '!' + i + '*')).concat(excludeItems.map((i) => '!' + i))
    },
    updateModuleConfig () {
      if (!this.anySelected) {
        this.$f7.dialog.alert('Please select Items')
        return
      }
      this.$f7.emit('configurationUpdate', itemConfig(this.allItemsSelected, this.allItemsSelected ? [] : this.groupItems, this.allItemsSelected ? [] : this.items, this.excludeGroupItems, this.excludeItems))
      this.$refs.modulePopup.close()
    }
  }
}
</script>
