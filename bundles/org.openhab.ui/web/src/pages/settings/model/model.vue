<template>
  <f7-page name="Model" :stacked="true" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" @click="selectItem(null)">
    <f7-navbar title="Semantic Model" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <!-- <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link> -->
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          :init="initSearchbar"
          search-container=".semantic-tree"
          search-item=".treeview-item"
          search-in=".treeview-item-label"
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar bottom class="toolbar-details">
      <f7-link class="left details-link" @click="detailsOpened = true">Details</f7-link>
      <div class="padding-right text-align-right">
        <f7-checkbox :checked="includeNonSemantic" @change="toggleNonSemantic"></f7-checkbox>
        <label @click="toggleNonSemantic" class="advanced-label">Show non-semantic</label>
      </div>
      <f7-link :disabled="selectedItem != null" class="right" @click="selectedItem = null">Clear</f7-link>
    </f7-toolbar>
    <f7-block v-if="!ready" class="text-align-center">
      <f7-preloader></f7-preloader>
      <div>Loading...</div>
    </f7-block>
    <f7-block v-else class="semantic-tree-wrapper" :class="{ 'sheet-opened' : detailsOpened }">
      <f7-row>
        <f7-col width="100" medium="50">
          <empty-state-placeholder v-if="empty" icon="list_bullet_indent" title="model.title" text="model.text" />
          <f7-block v-show="!empty" strong class="semantic-tree" no-gap @click.native="clearSelection">
            <!-- <empty-state-placeholder v-if="empty" icon="list_bullet_indent" title="model.title" text="model.text" /> -->
            <f7-treeview>
              <model-treeview-item v-for="node in [rootLocations, rootEquipments, rootPoints, rootGroups, rootItems].flat()"
                :key="node.item.name" :model="node"
                @selected="selectItem" :selected="selectedItem">
              </model-treeview-item>
            </f7-treeview>
          </f7-block>
        </f7-col>
        <f7-col width="100" medium="50" class="details-pane">
          <f7-block v-if="selectedItem" no-gap>
            <model-details-pane :model="selectedItem" :links="links" @item-updated="update" @item-created="update" @item-removed="selectItem(null)" @cancel-create="selectItem(null)" />
          </f7-block>
          <f7-block v-else>
            <div class="padding text-align-center">Nothing selected</div>
          </f7-block>
          <f7-block v-if="!selectedItem || (selectedItem.item.created !== false && selectedItem.item.type === 'Group' && selectedItem.class.indexOf('Point_') < 0)">
            <div><f7-block-title>Add to Model</f7-block-title></div>
            <f7-card>
              <f7-card-content>
                <f7-list>
                  <f7-list-button color="blue" v-show="!selectedItem || selectedItem.class.indexOf('Location') === 0" title="Add Location" @click="addSemanticItem('Location')"></f7-list-button>
                  <f7-list-button color="blue" title="Create Equipment from Thing" @click="addFromThing(true)"></f7-list-button>
                  <f7-list-button color="blue" title="Create Points from Thing" @click="addFromThing(false)"></f7-list-button>
                  <f7-list-button color="blue" title="Add Equipment" @click="addSemanticItem('Equipment')"></f7-list-button>
                  <f7-list-button color="blue" title="Add Point" @click="addSemanticItem('Point')"></f7-list-button>
                  <f7-list-button color="blue" v-if="includeNonSemantic" title="Add Item" @click="addNonSemanticItem(false)"></f7-list-button>
                </f7-list>
              </f7-card-content>
            </f7-card>
          </f7-block>
        </f7-col>
      </f7-row>
    </f7-block>

    <f7-fab class="add-to-model-fab" position="right-bottom" slot="fixed" color="blue" v-if="!selectedItem || (selectedItem.item.created !== false && selectedItem.item.type === 'Group' && selectedItem.class.indexOf('Point_') < 0)">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply"></f7-icon>
      <f7-fab-buttons position="top">
        <f7-fab-button v-if="includeNonSemantic" fab-close label="Add Item" @click="addNonSemanticItem(false)"><f7-icon ios="material:label_outline" md="material:label_outline" aurora="material:label_outline"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Add Point" @click="addSemanticItem('Point')"><f7-icon ios="f7:bolt_fill" md="material:flash_on" aurora="f7:bolt_fill"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Add Equipment" @click="addSemanticItem('Equipment')"><f7-icon ios="f7:lightbulb_fill" md="material:highlight" aurora="f7:lightbulb_fill"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Create Points from Thing" @click="addFromThing(false)"><f7-icon ios="f7:layers" md="material:layers" aurora="f7:layers"></f7-icon></f7-fab-button>
        <f7-fab-button fab-close label="Create Equipment from Thing" @click="addFromThing(true)"><f7-icon ios="f7:layers_fill" md="material:layers" aurora="f7:layers_fill"></f7-icon></f7-fab-button>
        <f7-fab-button v-show="!selectedItem || selectedItem.class.indexOf('Location') === 0" fab-close label="Add Location" @click="addSemanticItem('Location')"><f7-icon ios="f7:placemark_fill" md="material:place" aurora="f7:placemark_fill"></f7-icon></f7-fab-button>
      </f7-fab-buttons>
    </f7-fab>

    <f7-sheet class="model-details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'item'" @click="detailsTab = 'item'">Item</f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'links'" @click="detailsTab = 'links'">Links</f7-link>
          <div class="right">
            <f7-link sheet-close class="padding-right"><f7-icon f7="chevron_down"></f7-icon></f7-link>
          </div>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-if="selectedItem">
          <item-details v-if="detailsTab === 'item'" :model="selectedItem" :links="links" @item-updated="update" @item-created="update" @item-removed="selectItem(null)" @cancel-create="selectItem(null)"/>
          <link-details v-if="detailsTab === 'links'" :item="selectedItem.item" :links="links" />
        </f7-block>
      </f7-page>
    </f7-sheet>

  </f7-page>
</template>

<style lang="stylus">
.semantic-tree-wrapper
  padding 0
  margin-bottom 0
.semantic-tree
  padding 0
  border-right 1px solid var(--f7-block-strong-border-color)
  .treeview
    --f7-treeview-item-height 40px
    .treeview-item-label
      font-size 10pt
      white-space nowrap
      overflow-x hidden
    .semantic-class
      font-size 8pt
      color var(--f7-list-item-footer-text-color)
.model-details-sheet
  z-index 10900
.md .model-details-sheet .toolbar .link
  width 35%

@media (min-width: 768px)
  .semantic-tree-wrapper
    height calc(100% - var(--f7-navbar-height))
    .row
      height 100%
      .col-100
        height 100%
        overflow auto
        .semantic-tree
          min-height 100%
          margin 0
          height auto
      .details-pane
        padding-top 0
        .block
          margin-top 0
  .toolbar-details
    .details-link
      visibility hidden !important
  .add-to-model-fab
    visibility hidden !important

@media (max-width: 767px)
  .details-pane
    display none
  .semantic-tree-wrapper.sheet-opened
    margin-bottom var(--f7-sheet-height)
  .details-sheet
    height calc(1.4*var(--f7-sheet-height))
</style>

<script>
import ModelDetailsPane from '@/components/model/details-pane.vue'
import AddFromThing from './add-from-thing.vue'

import ItemDetails from '@/components/model/item-details.vue'
import LinkDetails from '@/components/model/link-details.vue'

export default {
  components: {
    ModelDetailsPane,
    ItemDetails,
    LinkDetails
  },
  data () {
    return {
      ready: false,
      loading: false,
      includeNonSemantic: false,
      items: [],
      links: [],
      locations: [],
      rootLocations: [],
      equipments: {},
      rootEquipments: [],
      rootPoints: [],
      rootGroups: [],
      rootItems: [],
      newItem: null,
      newItemParent: null,
      initSearchbar: false,
      selectedItem: null,
      previousSelection: null,
      detailsOpened: false,
      detailsTab: 'item',
      eventSource: null
    }
  },
  created () {

  },
  computed: {
    empty () {
      let emptySemantic = !this.rootLocations.length && !this.rootEquipments.length && !this.rootPoints.length
      return (this.includeNonSemantic) ? emptySemantic && !this.rootGroups.length && !this.rootItems.length : emptySemantic
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageBeforeOut () {
      this.detailsOpened = false
      this.stopEventSource()
    },
    modelItem (item) {
      const modelItem = {
        item: item,
        opened: null,
        class: (item.metadata && item.metadata.semantics) ? item.metadata.semantics.value : '',
        children: {
          locations: [],
          equipments: [],
          points: [],
          groups: [],
          items: []
        }
      }
      // force the selection of the placeholder for a item being created
      if (item.created === false) {
        this.selectItem(modelItem)
      }
      return modelItem
    },
    load () {
      // if (this.ready) return
      this.loading = true
      const items = this.$oh.api.get('/rest/items?metadata=semantics')
      const links = this.$oh.api.get('/rest/links')
      Promise.all([items, links]).then((data) => {
        this.items = data[0]
        this.links = data[1]

        if (this.newItem) {
          this.items.push(this.newItem)
        }

        this.locations = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Location') === 0)
        this.equipments = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Equipment') === 0)
        this.points = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Point') === 0)

        this.rootLocations = this.locations
          .filter((i) => !i.metadata.semantics.config || !i.metadata.semantics.config.isPartOf)
          .map(this.modelItem)
        this.rootLocations.forEach(this.getChildren)
        this.rootEquipments = this.equipments
          .filter((i) => !i.metadata.semantics.config || (!i.metadata.semantics.config.isPartOf && !i.metadata.semantics.config.hasLocation))
          .map(this.modelItem)
        this.rootEquipments.forEach(this.getChildren)
        this.rootPoints = this.points
          .filter((i) => !i.metadata.semantics.config || (!i.metadata.semantics.config.isPointOf && !i.metadata.semantics.config.hasLocation))
          .map(this.modelItem)

        if (this.includeNonSemantic) {
          this.rootGroups = this.items
            .filter((i) => i.type === 'Group' && (!i.metadata || !i.metadata.semantics) && i.groupNames.length === 0)
            .map(this.modelItem)
          this.rootGroups.forEach(this.getChildren)
          this.rootItems = this.items
            .filter((i) => i.type !== 'Group' && (!i.metadata || !i.metadata.semantics) && i.groupNames.length === 0)
            .map(this.modelItem)
        }

        this.loading = false
        this.ready = true
        this.$nextTick(() => { this.initSearchbar = true })
        if (!this.eventSource) this.startEventSource()
      })
    },
    update () {
      this.previousSelection = this.selectedItem
      this.newItem = null
      this.load()
      // this.newItemParent = null
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/items/*/added,smarthome/items/*/updated,smarthome/items/*/removed', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'added':
          case 'removed':
          case 'updated':
            // this.ready = false
            this.update()
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
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
          .map(this.modelItem)
        parent.children.locations.forEach(this.getChildren)
        parent.children.equipments = this.equipments
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.hasLocation === parent.item.name)
          .map(this.modelItem)
        parent.children.equipments.forEach(this.getChildren)

        parent.children.points = this.points
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.hasLocation === parent.item.name)
          .map(this.modelItem)
      } else {
        parent.children.equipments = this.equipments
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPartOf === parent.item.name)
          .map(this.modelItem)
        parent.children.equipments.forEach(this.getChildren)

        parent.children.points = this.points
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPointOf === parent.item.name)
          .map(this.modelItem)
      }

      if (this.includeNonSemantic) {
        parent.children.groups = this.items
          .filter((i) => i.type === 'Group' && (!i.metadata) && i.groupNames.indexOf(parent.item.name) >= 0)
          .map(this.modelItem)
        parent.children.groups.forEach(this.getChildren)
        if (parent.item.metadata) {
          parent.children.items = this.items
            .filter((i) => i.type !== 'Group' && (!i.metadata) && i.groupNames.indexOf(parent.item.name) >= 0)
            .map(this.modelItem)
        } else {
          parent.children.items = this.items
            .filter((i) => i.type !== 'Group' && i.groupNames.indexOf(parent.item.name) >= 0)
            .map(this.modelItem)
        }
      }
    },
    selectItem (item) {
      this.selectedItem = item
      if (this.newItem && (!item || item.item.name !== this.newItem.name)) {
        this.newItem = null
        // this.newItemParent = null
        this.load()
      }
      // this.detailsOpened = true
      // console.log('selected ' + item.item.name)
    },
    clearSelection (ev) {
      if (ev.target && ev.currentTarget && ev.target === ev.currentTarget) {
        this.selectedItem = null
      }
    },
    toggleNonSemantic () {
      this.rootGroups = []
      this.rootItems = []
      this.includeNonSemantic = !this.includeNonSemantic
      this.load()
    },
    addSemanticItem (semanticType) {
      this.newItem = {
        type: (semanticType === 'Point') ? 'Switch' : 'Group',
        name: '',
        label: '',
        category: '',
        tags: [semanticType],
        metadata: {
          semantics: {
            value: semanticType
          }
        },
        created: false
      }
      if (this.selectedItem) {
        this.newItem.groupNames = [this.selectedItem.item.name]
        if (this.selectedItem.item.metadata && this.selectedItem.item.metadata.semantics) {
          const semantics = this.selectedItem.item.metadata.semantics
          if (semantics.value.indexOf('Location') === 0 &&
              semanticType.indexOf('Location') < 0) {
            this.newItem.metadata.semantics.config = {
              hasLocation: this.selectedItem.item.name
            }
          } else if (semanticType.indexOf('Point') === 0) {
            this.newItem.metadata.semantics.config = {
              isPointOf: this.selectedItem.item.name
            }
          } else {
            this.newItem.metadata.semantics.config = {
              isPartOf: this.selectedItem.item.name
            }
          }
        }

        this.newItemParent = this.selectedItem.item.name
      }
      this.load()
    },
    addNonSemanticItem (group) {
      this.newItem = {
        type: (group) ? 'Group' : 'String',
        name: '',
        label: '',
        category: '',
        groupNames: [],
        tags: [],
        created: false
      }
      if (this.selectedItem) {
        this.newItem.groupNames = [this.selectedItem.item.name]
        this.newItemParent = this.selectedItem.item.name
      }
      this.load()
    },
    addFromThing (createEquipment) {
      const self = this
      this.$f7router.navigate({
        url: 'add-thing',
        route: {
          component: AddFromThing,
          path: 'add-thing',
          props: {
          },
          on: {
            pageAfterOut (event, page) {
              console.log('Add from thing page closed')
            }
          }
        }
      }, {
        props: {
          parent: this.selectedItem,
          createEquipment
        }
      })
    }
  }
}
</script>
