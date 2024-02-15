<template>
  <f7-popup ref="modelPicker" class="modelpicker-popup" close-on-escape
            @popup:open="onOpen" @popup:close="onClose">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
        </f7-nav-left>
        <f7-nav-title>{{ popupTitle || 'Pick from Model' }}</f7-nav-title>
        <f7-nav-right>
          <f7-link v-if="ready && ((multiple && checkedItems.length > 0) || selectedItem || allowEmpty)" @click="pickItems">
            {{ actionLabel || 'Pick' }}<span v-if="multiple && checkedItems.length > 0">&nbsp;{{ checkedItems.length }}</span>
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          :init="initSearchbar"
          search-container=".model-treeview"
          search-item=".treeview-item"
          search-in=".treeview-item-label"
          :disable-button="!$theme.aurora" />
        <div class="expand-button">
          <f7-button v-if="!expanded" icon-size="24" tooltip="Expand" icon-f7="rectangle_expand_vertical" @click="toggleExpanded()" />
          <f7-button v-else color="gray" icon-size="24" tooltip="Collapse" icon-f7="rectangle_compress_vertical" @click="toggleExpanded()" />
        </div>
      </f7-subnavbar>
      <f7-toolbar bottom class="toolbar-details">
        <f7-link v-if="!multiple" :disabled="selectedItem != null" class="left" @click="selectedItem = null">
          Clear
        </f7-link>
        <span v-else />
        <div class="padding-right text-align-right">
          <f7-checkbox :checked="includeNonSemantic" @change="toggleNonSemantic" />
          <label @click="toggleNonSemantic" class="advanced-label">Show non-semantic</label>
          <f7-checkbox style="margin-left: 5px" :checked="includeItemName" @change="toggleItemName" />
          <label @click="toggleItemName" class="advanced-label">Show name</label>
          <f7-checkbox style="margin-left: 5px" :checked="includeItemTags" @change="toggleItemTags" />
          <label @click="toggleItemTags" class="advanced-label">Show tags</label>
        </div>
        <span />
        <!-- <f7-link class="right details-link padding-right" ref="detailsLink" @click="detailsOpened = true" icon-f7="chevron_up"></f7-link> -->
      </f7-toolbar>
      <f7-block strong class="no-padding" v-if="ready">
        <model-treeview class="model-picker-treeview" :root-nodes="rootNodes"
                        :includeItemName="includeItemName" :includeItemTags="includeItemTags"
                        :selected-item="selectedItem" @selected="selectItem" @checked="checkItem" />
      </f7-block>
      <f7-block v-else-if="!ready" class="text-align-center">
        <f7-preloader />
        <div>Loading...</div>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.expand-button
  margin-right 8px
  text-overflow: unset
  align-self: center
  .icon
    margin-bottom: 2.75px !important
</style>

<script>
import ModelTreeview from '@/components/model/model-treeview.vue'

import { compareItems } from '@/components/widgets/widget-order'

function compareModelItems (o1, o2) {
  return compareItems(o1.item || o1, o2.item || o2)
}

export default {
  props: ['value', 'multiple', 'semanticOnly', 'groupsOnly', 'editableOnly', 'allowEmpty', 'popupTitle', 'actionLabel'],
  components: {
    ModelTreeview
  },
  data () {
    if (!this.$f7.data.modelPicker) this.$f7.data.modelPicker = {}
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      includeNonSemantic: this.$f7.data.modelPicker.includeNonSemantic || false,
      includeItemName: this.$f7.data.modelPicker.includeItemName || false,
      includeItemTags: this.$f7.data.modelPicker.includeItemTags || false,
      expanded: false,
      doubleClickStarted: null,
      doubleClickItem: null,
      items: [],
      links: [],
      locations: [],
      rootLocations: [],
      equipment: {},
      rootEquipment: [],
      rootPoints: [],
      rootGroups: [],
      rootItems: [],
      selectedItem: null,
      previousSelection: null,
      checkedItems: []
    }
  },
  computed: {
    rootNodes () {
      if (this.semanticOnly) {
        return [this.rootLocations, this.rootEquipment, (!this.groupsOnly) ? this.rootPoints : []]
      } else {
        return [this.rootLocations, this.rootEquipment, (!this.groupsOnly) ? this.rootPoints : [], this.rootGroups, (!this.groupsOnly) ? this.rootItems : []].flat()
      }
    }
  },
  methods: {
    onOpen () {
      this.selectedItem = null
      this.initSearchbar = false
      this.$set(this, 'checkedItems', [])
      this.load()
    },
    onClose () {
      this.ready = false
      this.$emit('closed')
      this.$f7.emit('modelPickerClosed')
    },
    pickItems () {
      let pickedItems
      if (this.multiple) {
        pickedItems = this.checkedItems.map((i) => i.item)
      } else {
        pickedItems = (this.selectedItem) ? this.selectedItem.item : null
      }
      this.$emit('input', pickedItems)
      this.$f7.emit('itemsPicked', pickedItems)
      this.$refs.modelPicker.close()
    },
    modelItem (item) {
      const modelItem = {
        item: item,
        opened: (item.type.indexOf('Group') === 0) ? false : undefined,
        checked: undefined,
        class: (item.metadata && item.metadata.semantics) ? item.metadata.semantics.value : '',
        children: {
          locations: [],
          equipment: [],
          points: [],
          groups: [],
          items: []
        }
      }
      // force the selection of the placeholder for a item being created
      if (item.created === false) {
        this.selectItem(modelItem)
      }
      if (this.previousSelection && item.name === this.previousSelection.item.name) {
        this.selectedItem = parent
        this.previousSelection = null
        this.selectItem(modelItem)
      }

      modelItem.checkable = this.multiple
      if (!this.multiple && this.value === item.name) {
        this.selectItem(modelItem)
      } else if (this.multiple && Array.isArray(this.value) && this.value.findIndex((i) => typeof i === 'string' ? i === item.name : i.name === item.name) >= 0) {
        modelItem.checked = true
        this.checkedItems.push(modelItem)
      }

      return modelItem
    },
    load (update) {
      // if (this.ready) return
      this.loading = true
      const items = this.$oh.api.get('/rest/items?staticDataOnly=true&metadata=.+')
      const links = this.$oh.api.get('/rest/links')
      Promise.all([items, links]).then((data) => {
        if (this.editableOnly) {
          this.items = data[0].filter((i) => i.editable)
        } else {
          this.items = data[0]
        }
        this.links = data[1]

        if (this.newItem) {
          this.items.push(this.newItem)
        }

        this.locations = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Location') === 0)
        this.equipment = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Equipment') === 0)
        this.points = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Point') === 0)

        this.rootLocations = this.locations
          .filter((i) => !i.metadata.semantics.config || !i.metadata.semantics.config.isPartOf)
          .map(this.modelItem).sort(compareModelItems)
        this.rootLocations.forEach(this.getChildren)
        this.rootEquipment = this.equipment
          .filter((i) => !i.metadata.semantics.config || (!i.metadata.semantics.config.isPartOf && !i.metadata.semantics.config.hasLocation))
          .map(this.modelItem).sort(compareModelItems)
        this.rootEquipment.forEach(this.getChildren)
        this.rootPoints = this.points
          .filter((i) => !i.metadata.semantics.config || (!i.metadata.semantics.config.isPointOf && !i.metadata.semantics.config.hasLocation))
          .map(this.modelItem).sort(compareModelItems)

        if (this.includeNonSemantic && !this.semanticOnly) {
          this.rootGroups = this.items
            .filter((i) => i.type === 'Group' && (!i.metadata || !i.metadata.semantics) && i.groupNames.length === 0)
            .map(this.modelItem).sort(compareModelItems)
          this.rootGroups.forEach(this.getChildren)
          this.rootItems = this.items
            .filter((i) => i.type !== 'Group' && (!i.metadata || !i.metadata.semantics) && i.groupNames.length === 0)
            .map(this.modelItem).sort(compareModelItems)
        }

        this.loading = false
        this.ready = true
        this.$nextTick(() => { this.initSearchbar = true })
      })
    },
    getChildren (parent) {
      // open the parent node of the placeholder
      if (this.newItemParent && this.newItemParent === parent.item.name) {
        parent.opened = true
      }

      // restore previous selection
      if (this.previousSelection && parent.item.name === this.previousSelection.item.name) {
        this.selectedItem = parent
        this.previousSelection = null
        this.selectItem(parent)
      }

      if (parent.class.indexOf('Location') === 0) {
        parent.children.locations = this.locations
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPartOf === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.locations.forEach(this.getChildren)
        parent.children.equipment = this.equipment
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.hasLocation === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.equipment.forEach(this.getChildren)

        if (!this.groupsOnly) {
          parent.children.points = this.points
            .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.hasLocation === parent.item.name)
            .map(this.modelItem).sort(compareModelItems)
        }
      } else {
        parent.children.equipment = this.equipment
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPartOf === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.equipment.forEach(this.getChildren)

        if (!this.groupsOnly) {
          parent.children.points = this.points
            .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPointOf === parent.item.name)
            .map(this.modelItem).sort(compareModelItems)
        }
      }

      if (this.includeNonSemantic) {
        parent.children.groups = this.items
          .filter((i) => i.type === 'Group' && (!i.metadata) && i.groupNames.indexOf(parent.item.name) >= 0)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.groups.forEach(this.getChildren)
        if (parent.item.metadata) {
          parent.children.items = this.items
            .filter((i) => i.type !== 'Group' && (!i.metadata) && i.groupNames.indexOf(parent.item.name) >= 0)
            .map(this.modelItem).sort(compareModelItems)
        } else {
          if (!this.groupsOnly) {
            parent.children.items = this.items
              .filter((i) => i.type !== 'Group' && i.groupNames.indexOf(parent.item.name) >= 0)
              .map(this.modelItem).sort(compareModelItems)
          }
        }
      }
    },
    selectItem (item) {
      if (!this.multiple) {
        this.selectedItem = item
        if (this.doubleClickStarted && this.doubleClickItem === item) {
          this.pickItems()
        } else {
          this.doubleClickStarted = setTimeout(() => { this.doubleClickStarted = null }, 500)
          this.doubleClickItem = item
        }
      } else if (item.children && item.opened !== undefined) {
        item.opened = !item.opened
      }
    },
    checkItem (item, check) {
      if (check) {
        this.checkedItems.push(item)
      } else {
        this.checkedItems.splice(this.checkedItems.indexOf(item), 1)
      }
    },
    toggleNonSemantic () {
      this.rootGroups = []
      this.rootItems = []
      this.includeNonSemantic = !this.includeNonSemantic
      this.$f7.data.modelPicker.includeNonSemantic = this.includeNonSemantic
      this.load()
    },
    toggleItemName () {
      this.includeItemName = !this.includeItemName
      this.$f7.data.modelPicker.includeItemName = this.includeItemName
      this.load()
    },
    toggleItemTags () {
      this.includeItemTags = !this.includeItemTags
      this.$f7.data.modelPicker.includeItemTags = this.includeItemTags
      this.load()
    },
    toggleExpanded () {
      this.expanded = !this.expanded

      const treeviewItems = document.querySelectorAll('.treeview-item')

      treeviewItems.forEach(item => {
        if (item.classList.contains('treeview-item')) {
          if (this.expanded) {
            item.classList.add('treeview-item-opened')
          } else {
            item.classList.remove('treeview-item-opened')
          }
        }
      })
    }
  }
}
</script>
