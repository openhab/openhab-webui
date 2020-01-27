<template>
  <f7-page class="item-details-page" @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn">
    <f7-navbar :title="item.name" back-link="Back" no-shadow no-hairline class="item-details-navbar">
      <f7-nav-right>
        <f7-link icon-md="material:edit" href="edit">{{ $theme.md ? '' : 'Edit' }}</f7-link>
      </f7-nav-right>
    <f7-subnavbar sliding class="item-header">
      <div class="item-icon" v-if="item.name">
        <oh-icon v-if="item.category" :icon="item.category" height="60" width="60" />
        <span v-else>
          {{item.label ? item.label[0] : item.name[0]}}
        </span>
      </div>
      <h2>{{item.label}}</h2>
      <!-- <h4 v-show="item.label">{{item.name}}</h4> -->
      <h5 v-show="item.type"><small>{{item.type}}</small></h5>
    </f7-subnavbar>
    </f7-navbar>
    <f7-block class="block-narrow after-item-header" v-if="item">
      <f7-row v-if="item.state">
        <f7-col>
          <f7-block-title>Current State</f7-block-title>
          <f7-block strong class="state-block">
            {{item.transformedState || item.state}}
            <f7-button v-show="$theme.md" :href="'/analyzer/?items=' + item.name">Analyze</f7-button>
          </f7-block>
          <f7-list class="analyze-button" v-show="!$theme.md">
            <f7-list-button :href="'/analyzer/?items=' + item.name">Analyze</f7-list-button>
          </f7-list>
        </f7-col>
      </f7-row>
      <f7-row  v-if="item && item.tags && item.tags.length > 0">
        <f7-col>
          <f7-block-title>Tags</f7-block-title>
          <f7-block strong class="tags-block">
            <f7-chip v-for="tag in item.tags" :key="tag" :text="tag" media-bg-color="blue">
              <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" ></f7-icon>
            </f7-chip>
          </f7-block>
        </f7-col>
      </f7-row>
      <f7-row  v-if="item && item.groupNames && item.groupNames.length > 0">
        <f7-col>
          <f7-block-title>Member of (Direct)</f7-block-title>
          <f7-card>
            <f7-list>
              <f7-list-item
                v-for="group in item.groupNames"
                :key="group"
                :link="'/settings/items/' + group"
                :title="group"
              ></f7-list-item>
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
      <f7-row  v-if="item && item.members && item.members.length > 0">
        <f7-col>
          <f7-block-title>Group Members (Children Items)</f7-block-title>
          <f7-card>
            <f7-list>
              <f7-list-item
                v-for="member in item.members" :key="member.name"
                media-item
                class="itemlist-item"
                @change="(e) => toggleItemCheck(e, member.name)"
                :link="'/settings/items/' + member.name"
                :title="(member.label) ? member.label : member.name"
                :footer="(member.label) ? member.name : '\xa0'"
                :subtitle="getItemTypeAndMetaLabel(member)"
                :after="member.state"
              >
                <oh-icon v-if="member.category" slot="media" :icon="member.category" height="32" width="32" />
                <span v-else slot="media" class="item-initial">{{member.name[0]}}</span>
                <!-- <f7-icon v-if="!member.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray"></f7-icon> -->
                <!-- <f7-button slot="after-start" color="blue" icon-f7="compose" icon-size="24px" :link="`${item.name}/edit`"></f7-button> -->
              </f7-list-item>
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
      <f7-row  v-if="item && item.metadata && item.metadata.semantics">
        <f7-col>
          <f7-block-title>Semantic Classification</f7-block-title>
          <f7-list>
            <f7-list-item title="class" :after="item.metadata.semantics.value"></f7-list-item>
            <f7-list-item
              v-for="(value, key) in item.metadata.semantics.config"
              :key="key"
              :title="key"
              :after="value"
            ></f7-list-item>
          </f7-list>
        </f7-col>
      </f7-row>
      <f7-row v-if="item.name && links.length && item.type !== 'Group'">
        <f7-col>
          <f7-block-title>Channel Links</f7-block-title>
          <link-details :item="item" :links="links" />
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
      background white
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
.state-block
  margin-bottom 0
  text-align center
  font-size 36px
.tags-block
  margin-bottom 0
  text-align center
  .chip
    margin-left 3px
    margin-right 3px
.analyze-button
  margin-top -1px
</style>

<script>
import LinkDetails from '@/components/model/link-details.vue'

export default {
  props: ['itemName'],
  components: {
    LinkDetails
  },
  data () {
    return {
      item: {},
      links: []
    }
  },
  methods: {
    onPageBeforeIn () {
      this.$oh.api.get('/rest/items/' + this.itemName + '?metadata=semantics').then((data) => {
        this.item = data
        this.iconUrl = (localStorage.getItem('openhab.ui:serverUrl') || '') + '/icon/' + this.item.category + '?format=svg'
      })
    },
    onPageAfterIn () {
      this.$oh.api.get('/rest/links?itemName=' + this.item.name).then((data) => {
        console.dir(data.filter((l) => l.itemName === this.item.name))
        this.links = data
      })
    },
    getItemTypeAndMetaLabel (item) {
      let ret = item.type
      if (item.metadata && item.metadata.semantics) {
        ret += ' · '
        const classParts = item.metadata.semantics.value.split('_')
        ret += classParts[0]
        if (classParts.length > 1) {
          ret += '>' + classParts.pop()
        }
      }
      return ret
    }
  }
}
</script>
