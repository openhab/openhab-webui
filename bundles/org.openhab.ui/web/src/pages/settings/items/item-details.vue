<template>
  <f7-page class="item-details-page"
           @page:beforein="onPageBeforeIn"
           @page:afterin="onPageAfterIn"
           @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="item.name"
               :key="item.name"
               back-link="Back"
               no-shadow
               no-hairline
               class="item-details-navbar">
      <f7-nav-right v-if="ready">
        <f7-link v-if="item.editable" icon-md="material:edit" href="edit">
          {{ theme.md ? '' : 'Edit' }}
        </f7-link>
        <f7-link v-else
                 icon-f7="lock_fill"
                 tooltip="This Item is not editable through the UI"
                 href="edit">
          Details
        </f7-link>
      </f7-nav-right>
      <f7-subnavbar sliding class="item-header">
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
      <f7-row v-if="item && item.metadata && item.metadata.semantics">
        <f7-col>
          <f7-block-title>Semantic Classification</f7-block-title>
          <f7-list>
            <f7-list-item v-if="semanticClass" :title="semanticClass" :after="semanticValue" />
            <f7-list-item v-if="semanticProperty" title="Property" :after="semanticProperty" />
            <f7-list-item
              v-for="(value, key) in semanticAttributes"
              :key="key"
              :link="groupLink(value)"
              :title="key"
              :after="value" />
          </f7-list>
        </f7-col>
      </f7-row>
      <f7-row v-if="item && item.groupNames && item.groupNames.length > 0">
        <f7-col>
          <f7-block-title>Direct Non-Semantic Parent Groups</f7-block-title>
          <f7-card>
            <f7-list>
              <f7-list-item
                v-for="group in nonSemanticGroupNames"
                :key="group"
                :link="groupLink(group)"
                :title="group" />
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
      <f7-row v-if="item && item.type === 'Group'">
        <f7-col>
          <f7-block-title>Direct Group Members</f7-block-title>
          <group-members :group-item="item" :context="context" @updated="load" />
        </f7-col>
      </f7-row>
      <f7-row v-if="item.name">
        <f7-col>
          <f7-block-title>Metadata</f7-block-title>
          <metadata-menu :item="item" />
        </f7-col>
      </f7-row>
      <f7-row v-if="item.name && item.type !== 'Group'">
        <f7-col>
          <f7-block-title>Channel Links</f7-block-title>
          <link-details :item="item" :links="links" />
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
            <f7-list-button v-if="item.editable" color="red" @click="deleteItem">
              Remove Item
            </f7-list-button>
          </f7-list>
          <p class="developer-sidebar-tip text-align-center">
            Tip: Use the developer sidebar (Shift+Alt+D) to
            <f7-link text="search for usages of this Item" @click="searchInSidebar" />
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
.after-item-header
  margin-top 10rem !important
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
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { f7, theme } from 'framework7-vue'

import { useStatesStore } from '@/js/stores/useStatesStore'

import ItemStatePreview from '@/components/item/item-state-preview.vue'
import LinkDetails from '@/components/model/link-details.vue'
import GroupMembers from '@/components/item/group-members.vue'
import MetadataMenu from '@/components/item/metadata/item-metadata-menu.vue'
import ItemMixin from '@/components/item/item-mixin'
import FileDefinition from '@/pages/settings/file-definition-mixin'

export default {
  mixins: [ItemMixin, FileDefinition],
  props: {
    itemName: String,
    f7router: Object
  },
  components: {
    LinkDetails,
    GroupMembers,
    ItemStatePreview,
    MetadataMenu
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      item: {},
      links: [],
      ready: false
    }
  },
  computed: {
    context () {
      return {
        store: useStatesStore().trackedItems
      }
    },
    semanticClass () {
      return this.item?.metadata?.semantics?.value?.split('_')[0]
    },
    semanticValue () {
      const valueArray = this.item?.metadata?.semantics?.value?.split('_')
      if (!valueArray) return null
      if (valueArray.length > 1) return valueArray.slice(1).join('->')
      return valueArray[0]
    },
    semanticProperty () {
      const config = this.item?.metadata?.semantics?.config
      if (!config) return null
      const propertyArray = config.relatesTo?.split('_')
      if (!propertyArray) return null
      if (propertyArray.length > 1) return propertyArray.slice(1).join('->')
      return propertyArray[0]
    },
    /**
     * Returns the semantic attributes of the item, i.e. "Point Of" - "X", "In Location" - "Y", "Part Of" - "Z".
     *
     * @return {{}|null}
     */
    semanticAttributes () {
      const config = this.item?.metadata?.semantics?.config
      if (!config) return null
      const filteredAttributes = {
        'isPointOf': 'Point Of',
        'hasLocation': 'In Location',
        'isPartOf': 'Part Of'
      }
      const attributes = {}
      Object.keys(filteredAttributes).filter((key) => config[key]).forEach((key) => {
        attributes[filteredAttributes[key]] = config[key]
      })
      return attributes
    },
    nonSemanticGroupNames () {
      if (this.semanticAttributes === null) return this.item?.groupNames ?? []
      const semanticGroupNames = Object.values(this.semanticAttributes)
      return this.item?.groupNames?.filter((g) => !semanticGroupNames.includes(g)) ?? []
    },
    nonSemanticTags () {
      return this.item?.tags?.filter((tag) => tag !== this.semanticTag(this.semanticValue) && tag !== this.semanticTag(this.semanticProperty))
    }
  },
  methods: {
    onPageBeforeIn () {
      useStatesStore().startTrackingStates()
      this.load()
    },
    onPageAfterIn () {
      this.$oh.api.get('/rest/links?itemName=' + this.itemName).then((data) => {
        this.links = data
      })
    },
    onPageBeforeOut () {
      useStatesStore().stopTrackingStates()
    },
    load () {
      this.$oh.api.get(`/rest/items/${this.itemName}?metadata=.+`).then((data) => {
        this.item = data
        this.ready = true
        this.iconUrl = '/icon/' + this.item.category + '?format=svg'
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
    groupLink (group) {
      return '/settings/items/' + group
    },
    /**
     * Extracts the semantic tag from the semantic metadata value field.
     *
     * @param {string|null} value
     * @return {*|null}
     */
    semanticTag (value) {
      if (!value) return null
      const valueArray = value.split('->')
      if (valueArray.length === 0) return null
      return valueArray[valueArray.length - 1]
    }
  }
}
</script>
