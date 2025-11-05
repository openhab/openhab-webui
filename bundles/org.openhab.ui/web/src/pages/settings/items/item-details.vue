<template>
  <!-- page-with-subnavbar class required on Android -->
  <f7-page class="item-details-page page-with-subnavbar"
           @page:beforein="onPageBeforeIn"
           @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content v-if="ready"
                      :title="item.name"
                      :editable="item.editable"
                      :f7router>
        <template v-if="ready" #right>
          <f7-link v-if="item.editable" icon-md="material:edit" href="edit">
            {{ theme.md ? '' : 'Edit' }}
          </f7-link>
          <f7-link v-else icon-f7="lock_fill" tooltip="This Item is not editable through the UI" href="edit">
            Details
          </f7-link>

        </template>
        <template #after>
          <f7-subnavbar class="item-header">
            <div class="item-icon" v-if="item.name">
              <oh-icon v-if="item.category"
                       :icon="item.category"
                       :state="item.type === 'Image' ? null : (context.store[item.name].state || item.state)"
                       height="60"
                       width="60" />
              <span v-else>
                {{ item.label ? item.label[0] : item.name[0] }}
              </span>
            </div>
            <h2>{{ item.label }}</h2>
            <!-- <h4 v-show="item.label">{{item.name}}</h4> -->
            <h5 v-show="item.type" style="margin-top: 10px; margin-bottom: 15px;">
              <small>{{ getItemTypeLabel(item) }}</small>
            </h5>
          </f7-subnavbar>
        </template>
      </oh-nav-content>
    </f7-navbar>
    <f7-block class="block-narrow after-item-header" v-if="item">
      <f7-row v-if="item.state">
        <f7-col>
          <item-state-preview :item="item" :context="context" />
        </f7-col>
      </f7-row>
      <f7-row v-if="nonSemanticTags?.length > 0">
        <f7-col>
          <f7-block-title>Non-Semantic Tags</f7-block-title>
          <f7-block strong class="tags-block">
            <f7-chip v-for="tag in nonSemanticTags"
                     :key="tag"
                     :text="tag"
                     media-bg-color="blue">
              <template #media>
                <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
              </template>
            </f7-chip>
          </f7-block>
        </f7-col>
      </f7-row>
      <f7-row v-if="item?.metadata?.semantics?.value">
        <f7-col>
          <f7-block-title>Semantic Model</f7-block-title>
          <f7-card>
            <model-treeview class="model-treeview no-selection-style"
                            :rootNodes="[rootLocations, rootEquipment, rootPoints, rootGroups, rootItems].flat()"
                            :includeItemName="true"
                            :includeItemTags="true"
                            :selected="modelItem(item)"
                            @selected="navigateToItem" />
          </f7-card>
        </f7-col>
      </f7-row>
      <f7-row v-if="item?.groupNames?.length > 0">
        <f7-col>
          <f7-block-title>Parent Groups</f7-block-title>
          <f7-card>
            <f7-list>
              <ul>
                <item v-for="group in itemGroups"
                      :key="group.name"
                      :item="group"
                      :link="itemLink(group.name)"
                      :context="context" />
              </ul>
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
      <f7-row v-if="item?.type === 'Group'">
        <f7-col>
          <f7-block-title>Members</f7-block-title>
          <group-members :group-item="item"
                         :context="context"
                         @updated="load" />
        </f7-col>
      </f7-row>
      <f7-row v-if="item.name">
        <f7-col>
          <f7-block-title>Metadata</f7-block-title>
          <metadata-menu :item="item" :f7router />
        </f7-col>
      </f7-row>
      <f7-row v-if="item.name && item.type !== 'Group'">
        <f7-col>
          <f7-block-title>Channel Links</f7-block-title>
          <link-details :item="item" :links="links" :f7router />
        </f7-col>
      </f7-row>
      <f7-row>
        <f7-col>
          <f7-list>
            <f7-list-button color="blue" @click="duplicateItem">
              Duplicate Item
            </f7-list-button>
            <f7-list-button color="blue" @click="copyFileDefinitionToClipboard(ObjectType.ITEM, [item.name])">
              Copy File Definition
            </f7-list-button>
            <f7-list-button v-if="item.editable"
                            color="red"
                            @click="deleteItem">
              Remove Item
            </f7-list-button>
          </f7-list>
          <p class="developer-sidebar-tip text-align-center">
            Tip: Use the developer sidebar (Shift+Alt+D) to
            <f7-link text="search for usages of this Item"
                     @click="searchInSidebar" />
          </p>
        </f7-col>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.item-header.subnavbar
  height auto !important
  .subnavbar-inner
    flex-direction column !important
    .item-icon
      height 60px
      width 60px
      padding 10px
      border-radius 40px
      border 1px solid white
      img
        height 60px
        width 60px
      span
        width 100%
        display block
        text-align center
        color #c0c0c0
        font-size 40px
        font-weight thin
    h2
      white-space nowrap
      text-overflow ellipsis
      overflow-x hidden
      width 95%
      font-weight normal
      text-align center
      margin 0
    h4
      font-weight normal
      text-align center
      margin 0
    h5
      font-weight normal
      text-align center
      margin-top 0
.item-details-page
  --f7-page-subnavbar-offset 170px
  .after-item-header
    margin-bottom 0 !important
.tags-block
  margin-bottom 0
  text-align center
  .chip
    margin-left 3px
    margin-right 3px
.developer-sidebar-tip
    visibility visible
@media(max-width: 1279px)
  .developer-sidebar-tip
    visibility hidden
.model-treeview.no-selection-style
  .treeview-item-selected > .treeview-item-root,
  .treeview-item-selected.treeview-item-root
    background transparent !important
    color inherit !important
    border none !important
</style>

<script setup>
import cloneDeep from 'lodash/cloneDeep'

import Item from '@/components/item/item.vue'
import ItemStatePreview from '@/components/item/item-state-preview.vue'
import LinkDetails from '@/components/model/link-details.vue'
import GroupMembers from '@/components/item/group-members.vue'
import MetadataMenu from '@/components/item/metadata/item-metadata-menu.vue'
</script>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { utils } from 'framework7'
import { f7, theme } from 'framework7-vue'

import { useStatesStore } from '@/js/stores/useStatesStore'

import ItemMixin from '@/components/item/item-mixin'
import ModelMixin from '@/pages/settings/model/model-mixin'
import ModelTreeview from '@/components/model/model-treeview.vue'
import FileDefinition from '@/pages/settings/file-definition-mixin'

export default {
  mixins: [ItemMixin, ModelMixin, FileDefinition],
  props: {
    itemName: String,
    f7router: Object
  },
  components: {
    Item,
    LinkDetails,
    GroupMembers,
    ItemStatePreview,
    MetadataMenu,
    ModelTreeview
  },
  setup () {
    return { theme, utils }
  },
  data () {
    return {
      item: {}
    }
  },
  computed: {
    context () {
      return {
        store: useStatesStore().trackedItems
      }
    },
    nonSemanticTags () {
      return this.item?.tags?.filter((tag) => tag !== this.semanticTag(this.item?.metadata?.semantics?.value) && tag !== this.semanticTag(this.item?.metadata?.semantics?.config?.relatesTo)) || []
    },
    itemGroups () {
      return this.item?.parents?.toSorted((a, b) => (a.label || a.name).localeCompare(b.label || b.name))
    }
  },
  methods: {
    onPageBeforeIn () {
      this.load()
    },
    onPageBeforeOut () {
      useStatesStore().stopTrackingStates()
    },
    modelItem (item) {
      return {
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
    },
    async load () {
      const promises = [
        this.$oh.api.get(`/rest/items/${this.itemName}?parents=true&metadata=.+`),
        this.$oh.api.get('/rest/links?itemName=' + this.itemName)
      ]
      Promise.all(promises).then((data) => {
        this.item = data[0]
        this.links = data[1]
        this.iconUrl = '/icon/' + this.item.category + '?format=svg'
        this.ready = true
        useStatesStore().startTrackingStates()
      })
    },
    duplicateItem () {
      let itemClone = cloneDeep(this.item)
      this.f7router.navigate({
        url: '/settings/items/duplicate'
      }, {
        props: {
          itemCopy: itemClone
        }
      })
    },
    deleteItem () {
      f7.dialog.confirm(
        `Are you sure you want to delete ${this.item.label || this.item.name}?`,
        'Delete Item',
        () => {
          this.$oh.api.delete('/rest/items/' + this.item.name).then(() => {
            this.f7router.back('/settings/items/', { force: true })
          })
        }
      )
    },
    searchInSidebar () {
      f7.emit('selectDeveloperDock', { 'dock': 'tools', 'toolTab': 'pin', 'searchFor': this.item.name })
    },
    navigateToItem (value) {
      this.$f7router.navigate(this.itemLink(value.item.name))
    },
    itemLink (item) {
      return '/settings/items/' + item
    },
    /**
     * Extracts the semantic tag from the semantic metadata value field.
     *
     * @param {string|null} value
     * @return {*|null}
     */
    semanticTag (value) {
      if (!value) return null
      const valueArray = value.split('_')
      return valueArray[valueArray.length - 1]
    }
  }
}
</script>
