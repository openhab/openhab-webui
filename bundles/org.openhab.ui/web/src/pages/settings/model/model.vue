<template>
  <f7-page name="Model"
           @page:afterin="onPageAfterIn"
           @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Semantic Model"
                      back-link="Settings"
                      back-link-url="/settings/"
                      :f7router />
      <f7-subnavbar :inner="false" v-show="initSearchbar" style="height: var(--f7-searchbar-height)">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          search-container=".semantic-tree"
          search-item=".treeview-item"
          search-in=".treeview-item-label"
          :placeholder="searchPlaceholder"
          :disable-button="!theme.aurora" />
        <div class="expand-button">
          <f7-button v-if="!expanded"
                     icon-size="24"
                     tooltip="Expand"
                     icon-f7="rectangle_expand_vertical"
                     @click="toggleExpanded()" />
          <f7-button v-else
                     color="gray"
                     icon-size="24"
                     tooltip="Collapse"
                     icon-f7="rectangle_compress_vertical"
                     @click="toggleExpanded()" />
        </div>
      </f7-subnavbar>
    </f7-navbar>

    <!-- Toolbar -->
    <f7-toolbar v-if="$f7dim.width >= 500" bottom class="toolbar-details">
      <f7-link class="left" :class="{ disabled: selectedItem == null }" @click="selectedItem = null">
        Clear
      </f7-link>
      <div class="padding-right text-align-right">
        <label class="advanced-label">
          <f7-checkbox v-model:checked="includeNonSemantic" @change="changeNonSemantic" />
          Show non-semantic
        </label>
        <label class="advanced-label">
          <f7-checkbox v-model:checked="includeItemName" />
          Show name
        </label>
        <label class="advanced-label">
          <f7-checkbox v-model:checked="includeItemTags" />
          Show tags
        </label>
      </div>
      <f7-link class="right details-link padding-right"
               ref="detailsLink"
               @click="detailsOpened = true"
               icon-f7="chevron_up" />
    </f7-toolbar>
    <f7-toolbar v-else bottom class="toolbar-details">
      <f7-link :class="{ disabled: selectedItem == null }" @click="selectedItem = null">
        Clear
      </f7-link>
      <div class="padding-left padding-right text-align-center" style="font-size: 12px">
        <div>
          <label class="advanced-label">
            <f7-checkbox v-model:checked="includeNonSemantic" @change="changeNonSemantic" />
            Show non-semantic
          </label>
        </div>
        <div>
          <label class="advanced-label">
            <f7-checkbox v-model:checked="includeItemName" />
            Show name
          </label>
          <label class="advanced-label">
            <f7-checkbox v-model:checked="includeItemTags" />
            Show tags
          </label>
        </div>
      </div>
      <f7-link class="right details-link padding-right"
               ref="detailsLink"
               @click="detailsOpened = true"
               icon-f7="chevron_up" />
    </f7-toolbar>

    <f7-block v-if="!ready" class="text-align-center">
      <f7-preloader />
      <div>Loading...</div>
    </f7-block>
    <f7-block v-else class="semantic-tree-wrapper" :class="{ 'sheet-opened': detailsOpened }">
      <f7-row>
        <f7-col width="100" medium="50">
          <f7-block v-if="empty">
            <empty-state-placeholder icon="list_bullet_indent" title="model.title" text="model.text" />
            <f7-row class="display-flex justify-content-center">
              <f7-button color="blue"
                         large
                         raised
                         fill
                         @click="addFromLocationTemplate()">
                Add Locations from Template
              </f7-button>
            </f7-row>
          </f7-block>

          <f7-block v-show="!empty"
                    strong
                    class="semantic-tree"
                    no-gap
                    @click="clearSelection">
            <model-treeview :rootNodes="[rootLocations, rootEquipment, rootPoints, rootGroups, rootItems].flat()"
                            :items="items"
                            :includeItemName="includeItemName"
                            :includeItemTags="includeItemTags"
                            :canDragDrop="true"
                            @selected="selectItem"
                            :selected="selectedItem"
                            @reload="load"
                            @click.stop />
          </f7-block>
        </f7-col>
        <f7-col width="100" medium="50" class="details-pane">
          <f7-block v-if="selectedItem" no-gap>
            <model-details-pane :key="itemDetailsKey"
                                :model="selectedItem"
                                :links="links"
                                :items="items"
                                :context="context"
                                :f7router
                                @item-updated="update"
                                @item-created="update"
                                @item-removed="selectItem(null)"
                                @cancel-create="selectItem(null)" />
          </f7-block>
          <f7-block v-else>
            <div class="padding text-align-center">
              Nothing selected
            </div>
          </f7-block>
          <f7-block v-if="!selectedItem || (selectedItem.item.created !== false && selectedItem.item.type === 'Group' && selectedItem.class.indexOf('Point_') < 0)">
            <div><f7-block-title>Add to Model</f7-block-title></div>
            <f7-card>
              <f7-card-content>
                <f7-list>
                  <f7-list-button v-show="!selectedItem || selectedItem.class.indexOf('Location') === 0"
                                  color="blue"
                                  title="Add Location"
                                  @click="addSemanticItem('Location')" />
                  <f7-list-button color="blue" title="Create Equipment from Thing" @click="addFromThing(true)" />
                  <f7-list-button color="blue" title="Create Points from Thing" @click="addFromThing(false)" />
                  <f7-list-button color="blue" title="Add Equipment" @click="addSemanticItem('Equipment')" />
                  <f7-list-button color="blue" title="Add Point" @click="addSemanticItem('Point')" />
                  <f7-list-button color="blue"
                                  v-if="includeNonSemantic"
                                  title="Add Item"
                                  @click="addNonSemanticItem(false)" />
                </f7-list>
              </f7-card-content>
            </f7-card>
          </f7-block>
        </f7-col>
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab v-if="!selectedItem || (selectedItem.item.created !== false && selectedItem.item.type === 'Group' && selectedItem.class.indexOf('Point_') < 0)"
              class="add-to-model-fab"
              position="right-bottom"
              color="blue">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
        <f7-fab-buttons position="top">
          <f7-fab-button v-if="includeNonSemantic"
                         fab-close
                         label="Add Item"
                         @click="addNonSemanticItem(false)">
            <f7-icon ios="material:label_outline" md="material:label_outline" aurora="material:label_outline" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Add Point" @click="addSemanticItem('Point')">
            <f7-icon ios="f7:bolt_fill" md="material:flash_on" aurora="f7:bolt_fill" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Add Equipment" @click="addSemanticItem('Equipment')">
            <f7-icon ios="f7:cube_box_fill" md="material:payments" aurora="f7:cube_box_fill" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create Points from Thing" @click="addFromThing(false)">
            <f7-icon ios="f7:layers" md="material:layers" aurora="f7:layers" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create Equipment from Thing" @click="addFromThing(true)">
            <f7-icon ios="f7:layers_fill" md="material:layers" aurora="f7:layers_fill" />
          </f7-fab-button>
          <f7-fab-button v-show="!selectedItem || selectedItem.class.indexOf('Location') === 0"
                         fab-close
                         label="Add Location"
                         @click="addSemanticItem('Location')">
            <f7-icon ios="f7:placemark_fill" md="material:place" aurora="f7:placemark_fill" />
          </f7-fab-button>
        </f7-fab-buttons>
      </f7-fab>
    </template>

    <f7-sheet class="model-details-sheet"
              :backdrop="false"
              :close-on-escape="true"
              :opened="detailsOpened"
              @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar bottom>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'state'" @click="detailsTab = 'state'">
            State
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'item'" @click="detailsTab = 'item'">
            Item
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'meta'" @click="detailsTab = 'meta'">
            Meta
          </f7-link>
          <f7-link class="padding-left padding-right" :tab-link-active="detailsTab === 'links'" @click="detailsTab = 'links'">
            Links
          </f7-link>
          <div class="right">
            <f7-link sheet-close class="padding-right">
              <f7-icon f7="chevron_down" />
            </f7-link>
          </div>
        </f7-toolbar>
        <f7-block style="margin-bottom: 6rem" v-if="selectedItem">
          <item-state-preview v-if="detailsTab === 'state' && !newItem" :item="selectedItem.item" :context="context" />
          <item-details v-if="detailsTab === 'item'"
                        :model="selectedItem"
                        :links="links"
                        :items="items"
                        :context="context"
                        @item-updated="update"
                        @item-created="update"
                        @item-removed="selectItem(null)"
                        @cancel-create="selectItem(null)" />
          <metadata-menu v-if="detailsTab === 'meta'" :item="selectedItem.item" :f7router />
          <link-details v-if="detailsTab === 'links'"
                        :item="selectedItem.item"
                        :links="links"
                        :f7router />
        </f7-block>
        <f7-block v-else>
          <div class="padding text-align-center">
            Nothing selected
          </div>
        </f7-block>
      </f7-page>
    </f7-sheet>
  </f7-page>
</template>

<style lang="stylus">
.semantic-tree-wrapper
  user-select: none
  padding 0
  .row
    height 100%
    .col-100
      height 100%
      overflow auto
      .semantic-tree
        min-height 100%
        margin 0
        height auto
.semantic-tree
  user-select: none
  margin 0 !important
  border-right 1px solid var(--f7-block-strong-border-color)
.model-details-sheet
  .toolbar
    --f7-theme-color var(--f7-color-blue)
    --f7-theme-color-rgb var(--f7-color-blue-rgb)
  z-index 10900
.md .model-details-sheet .toolbar .link
  width 17%

@media (min-width: 768px)
  .semantic-tree-wrapper
    height calc(100% - var(--f7-toolbar-height))
    .row
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
  .semantic-tree-wrapper.block:first-child
    margin-top 5px
  .semantic-tree-wrapper
    height calc(100% - 20px)
    margin-bottom 5px
  .details-pane
    display none
  .semantic-tree-wrapper.sheet-opened
    height calc(100% - 5px - var(--f7-sheet-height) + var(--f7-page-toolbar-bottom-offset, 0px) + var(--f7-page-content-extra-padding-bottom, 0px))
    margin-bottom calc(var(--f7-sheet-height) - var(--f7-page-toolbar-bottom-offset, 0px) - var(--f7-page-content-extra-padding-bottom, 0px))
  .toolbar-details.toolbar.toolbar-bottom
    height  calc( 50px + var(--f7-safe-area-bottom))
  .model-details-sheet.sheet-modal.sheet-modal-bottom .block
    margin-top 0px
    padding-left 0px
    padding-right 0px

.expand-button
  height unset
  margin-right 8px
  text-overflow unset
  align-self center
  .icon
    margin-bottom 2.75px !important
</style>

<script>
import { nextTick } from 'vue'
import { utils } from 'framework7'
import { f7, theme } from 'framework7-vue'
import { mapWritableState } from 'pinia'

import AddFromThing from './add-from-thing.vue'
import AddFromTemplate from './add-from-template.vue'

import ModelDetailsPane from '@/components/model/details-pane.vue'
import ModelTreeview from '@/components/model/model-treeview.vue'
import ItemStatePreview from '@/components/item/item-state-preview.vue'
import ItemDetails from '@/components/model/item-details.vue'
import MetadataMenu from '@/components/item/metadata/item-metadata-menu.vue'
import LinkDetails from '@/components/model/link-details.vue'

import ModelMixin from '@/pages/settings/model/model-mixin'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'

export default {
  props: {
    f7router: Object
  },
  mixins: [ModelMixin],
  components: {
    EmptyStatePlaceholder,
    ModelDetailsPane,
    ModelTreeview,
    ItemStatePreview,
    ItemDetails,
    MetadataMenu,
    LinkDetails
  },
  setup () {
    return {
      f7, theme
    }
  },
  data () {
    return {
      newItem: null,
      newItemParent: null,
      initSearchbar: false,
      detailsOpened: false,
      detailsTab: 'state',
      eventSource: null,
      itemDetailsKey: utils.id()
    }
  },
  computed: {
    empty () {
      let emptySemantic = !this.rootLocations.length && !this.rootEquipment.length && !this.rootPoints.length
      return (this.includeNonSemantic) ? emptySemantic && !this.rootGroups.length && !this.rootItems.length : emptySemantic
    },
    context () {
      return {
        store: useStatesStore().trackedItems
      }
    },
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    },
    ...mapWritableState(useRuntimeStore, {
      includeItemName: 'modelPicker.modelPickerIncludeItemName',
      includeItemTags: 'modelPicker.modelPickerIncludeItemTags',
      expanded: 'modelPicker.modelPickerExpanded'
    })
  },
  methods: {
    onPageAfterIn () {
      useStatesStore().startTrackingStates()
      if (this.selectedItem) {
        this.update()
      } else {
        this.load()
      }
    },
    onPageBeforeOut () {
      this.detailsOpened = false
      useStatesStore().stopTrackingStates()
      this.stopEventSource()
      useLastSearchQueryStore().lastModelSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    modelItem (item) {
      const modelItem = {
        item,
        opened: false,
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

      return modelItem
    },
    load () {
      if (this.initSearchbar) useLastSearchQueryStore().lastModelSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.loadModel().then(() => {
        this.initSearchbar = true
        nextTick(() => {
          if (this.$device.desktop && this.$refs.searchbar) {
            this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
          }
          this.$refs.searchbar?.$el.f7Searchbar.search(useLastSearchQueryStore().lastModelSearchQuery || '')
          this.restoreExpanded()
        })
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
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/items/*/added,openhab/items/*/updated,openhab/items/*/removed', null, (event) => {
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
    selectItem (item) {
      this.selectedItem = item
      if (this.newItem && (!item || item.item.name !== this.newItem.name)) {
        this.newItem = null
        // this.newItemParent = null
        this.load()
      }
      const detailsLink = this.$refs.detailsLink
      const visibility = window.getComputedStyle(detailsLink.$el).visibility
      if (!visibility || visibility !== 'hidden') {
        this.detailsOpened = true
      }
    },
    clearSelection (ev) {
      if (ev.target && ev.currentTarget && ev.target === ev.currentTarget) {
        this.selectedItem = null
        this.detailsOpened = false
      }
    },
    changeNonSemantic () {
      this.rootGroups = []
      this.rootItems = []
      this.load()
    },
    toggleExpanded () {
      this.expanded = !this.expanded
      this.applyExpandedOption()
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
      this.detailsTab = 'item'
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
      this.detailsTab = 'item'
      this.load()
    },
    addFromThing (createEquipment) {
      this.f7router.navigate({
        url: 'add-thing',
        route: {
          component: AddFromThing,
          path: 'add-thing',
          props: {
          },
          on: {
            pageAfterOut (event, page) {
            }
          }
        }
      }, {
        props: {
          parent: this.selectedItem,
          createEquipment
        }
      })
    },
    addFromLocationTemplate () {
      this.f7router.navigate({
        url: 'add-template',
        route: {
          component: AddFromTemplate,
          path: 'add-template',
          props: {
          }
        }
      }, {
        props: {
          itemList: this.items
        }
      })
    }
  }
}
</script>
