<template>
  <f7-page class="sitemap">
    <f7-navbar :back-link="(!isRoot) ? 'Back' : null" :large="isRoot">
      <f7-nav-left v-if="sitemapId === pageId">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title-large v-if="isRoot">{{sitemap.title}}</f7-nav-title-large>
      <f7-nav-title>{{sitemap.title}}</f7-nav-title>
    </f7-navbar>
    <f7-toolbar position="bottom">
      <span class="text-color-red">Warning: sitemaps are not functional. Please use Basic UI.</span>
    </f7-toolbar>
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

export default {
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
