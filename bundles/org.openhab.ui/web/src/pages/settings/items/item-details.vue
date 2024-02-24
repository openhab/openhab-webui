<template>
  <f7-page class="item-details-page" @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="item.name" back-link="Back" no-shadow no-hairline class="item-details-navbar">
      <f7-nav-right v-if="ready">
        <f7-link v-if="item.editable" icon-md="material:edit" href="edit">
          {{ $theme.md ? '' : 'Edit' }}
        </f7-link>
        <f7-link v-else icon-f7="lock_fill" tooltip="This Item is not editable through the UI" href="edit">
          Details
        </f7-link>
      </f7-nav-right>
      <f7-subnavbar sliding class="item-header">
        <div class="item-icon" v-if="item.name">
          <oh-icon v-if="item.category" :icon="item.category" :state="context.store[item.name] ? context.store[item.name].state : item.state" height="60" width="60" />
          <span v-else>
            {{ item.label ? item.label[0] : item.name[0] }}
          </span>
        </div>
        <h2>{{ item.label }}</h2>
        <!-- <h4 v-show="item.label">{{item.name}}</h4> -->
        <h5 v-show="item.type">
          <small>{{ item.type === 'Group' ? `${item.type} (${item.groupType})` : item.type }}</small>
        </h5>
      </f7-subnavbar>
    </f7-navbar>
    <f7-block class="block-narrow after-item-header" v-if="item">
      <f7-row v-if="item.state">
        <f7-col>
          <item-state-preview :item="item" :context="context" />
        </f7-col>
      </f7-row>
      <f7-row v-if="item && item.tags && item.tags.length > 0">
        <f7-col>
          <f7-block-title>Tags</f7-block-title>
          <f7-block strong class="tags-block">
            <f7-chip v-for="tag in item.tags" :key="tag" :text="tag" media-bg-color="blue">
              <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
            </f7-chip>
          </f7-block>
        </f7-col>
      </f7-row>
      <f7-row v-if="item && item.metadata && item.metadata.semantics">
        <f7-col>
          <f7-block-title>Semantic Classification</f7-block-title>
          <f7-list>
            <f7-list-item title="class" :after="item.metadata.semantics.value" />
            <f7-list-item
              v-for="(value, key) in item.metadata.semantics.config"
              :key="key"
              :title="key"
              :after="value" />
          </f7-list>
        </f7-col>
      </f7-row>
      <f7-row v-if="item && item.groupNames && item.groupNames.length > 0">
        <f7-col>
          <f7-block-title>Direct Parent Groups</f7-block-title>
          <f7-card>
            <f7-list>
              <f7-list-item
                v-for="group in item.groupNames"
                :key="group"
                :link="'/settings/items/' + group"
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
            <f7-list-button v-if="item.editable" color="red" @click="deleteItem">
              Remove Item
            </f7-list-button>
          </f7-list>
          <p class="developer-sidebar-tip text-align-center">
            Tip: Use the developer sidebar (Shift+Alt+D) to search for usages of this Item
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
import ItemStatePreview from '@/components/item/item-state-preview.vue'
import LinkDetails from '@/components/model/link-details.vue'
import GroupMembers from '@/components/item/group-members.vue'
import MetadataMenu from '@/components/item/metadata/item-metadata-menu.vue'

export default {
  props: ['itemName'],
  components: {
    LinkDetails,
    GroupMembers,
    ItemStatePreview,
    MetadataMenu
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
        store: this.$store.getters.trackedItems
      }
    }
  },
  methods: {
    onPageBeforeIn () {
      this.$store.dispatch('startTrackingStates')
      this.load()
    },
    onPageAfterIn () {
      this.$oh.api.get('/rest/links?itemName=' + this.itemName).then((data) => {
        this.links = data
      })
    },
    onPageBeforeOut () {
      this.$store.dispatch('stopTrackingStates')
    },
    load () {
      this.$oh.api.get(`/rest/items/${this.itemName}?metadata=.+`).then((data) => {
        this.item = data
        this.ready = true
        this.iconUrl = (localStorage.getItem('openhab.ui:serverUrl') || '') + '/icon/' + this.item.category + '?format=svg'
      })
    },
    deleteItem () {
      this.$f7.dialog.confirm(
        `Are you sure you want to delete ${this.item.label || this.item.name}?`,
        'Delete Item',
        () => {
          this.$oh.api.delete('/rest/items/' + this.item.name).then(() => {
            this.$f7router.back('/settings/items/', { force: true })
          })
        }
      )
    }
  }
}
</script>
