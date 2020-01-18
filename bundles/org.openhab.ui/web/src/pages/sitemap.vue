<template>
  <f7-page class="sitemap">
    <f7-navbar :back-link="(!isRoot) ? 'Back' : null" :large="isRoot">
      <f7-nav-left v-if="sitemapId === pageId">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title-large v-if="isRoot">{{sitemap.title}}</f7-nav-title-large>
      <f7-nav-title>{{sitemap.title}}</f7-nav-title>
    </f7-navbar>
    <f7-block class="block-narrow" v-if="sitemap.widgets && sitemap.widgets.length > 0">
      <f7-row>
        <f7-col>
          <f7-list v-if="sitemap.widgets[0].type !== 'Frame'">
            <ul>
              <sitemap-widget-generic :model="sitemap" :sitemapId="sitemapId" :pageId="pageId"/>
            </ul>
          </f7-list>
          <sitemap-widget-generic v-else :model="sitemap" :sitemapId="sitemapId" :pageId="pageId"/>
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block class="block-narrow" v-else>
      <f7-row>
        <f7-col>
          <f7-block class="padding">There are no widgets on this page.</f7-block>
        </f7-col>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<script>
// import SitemapWidgetGeneric from '../components/sitemap/widget-generic.vue'

export default {
  // components: {
  //   SitemapWidgetGeneric
  // },
  props: ['sitemapId', 'pageId'],
  data () {
    return {
      sitemap: { title: '' }
    }
  },
  created () {
    this.$oh.api.get('/rest/sitemaps/' + this.sitemapId + '/' + this.pageId).then(data => {
      this.sitemap = data
    })
    this.$f7.toast.create({
      text: 'The sitemap rendering is currently for demonstration purposes only. It is not functional nor updates in real time. Please use another app like Basic UI or HABPanel to interact with your items.',
      closeButton: true,
      destroyOnClose: true
    }).open()
  },
  computed: {
    isRoot () {
      return (this.pageId === this.sitemapId)
    }
  }
}
</script>

<style lang="stylus">
.sitemap .block
  padding 0
  margin 0
.sitemap .block-title
  padding-left calc(var(--f7-list-item-padding-horizontal) + var(--f7-safe-area-left))
</style>
