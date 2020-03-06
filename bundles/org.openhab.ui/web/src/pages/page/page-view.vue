<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" hide-bars-on-scroll>
    <f7-navbar :back-link="(deep) ? 'Back' : undefined">
      <f7-nav-left v-if="!deep">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title>{{(ready) ? page.config.label : ''}}</f7-nav-title>
      <f7-nav-right>
        <f7-link icon-md="material:edit" :href="'/settings/pages/' + pageType + '/' + uid">{{ $theme.md ? '' : 'Edit' }}</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-toolbar tabbar labels bottom v-if="page && pageType === 'tabs'">
      <f7-link v-for="(tab, idx) in page.slots.default" :key="idx" tab-link @click="currentTab = idx" :tab-link-active="currentTab === idx" :icon-ios="tab.config.icon" :icon-md="tab.config.icon" :icon-aurora="tab.config.icon" :text="tab.config.title"></f7-link>
    </f7-toolbar>

    <f7-tabs v-if="page && pageType === 'tabs'" :class="{notready: !ready}">
      <f7-tab v-for="(tab, idx) in page.slots.default" :key="idx" :tab-active="currentTab === idx">
        <component v-if="currentTab === idx" :is="tabComponent(tab)" :context="tabContext(tab)" @command="onCommand" />
      </f7-tab>
    </f7-tabs>

    <component :is="page.component" v-if="page" :context="context" :class="{notready: !ready}" @command="onCommand" />

  </f7-page>
</template>

<style lang="stylus">
.notready
  visibility hidden
</style>

<script>
import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'

export default {
  components: {
    'oh-layout-page': OhLayoutPage,
    'oh-map-page': () => import('@/components/widgets/map/oh-map-page.vue'),
    'oh-plan-page': () => import('@/components/widgets/plan/oh-plan-page.vue')
  },
  props: ['uid', 'deep'],
  data () {
    return {
      currentTab: 0,
      // ready: false,
      loading: false
      // page: {}
    }
  },
  computed: {
    context () {
      return {
        component: this.page,
        store: this.$store.getters.trackedItems
      }
    },
    page () {
      return this.$store.getters.page(this.uid)
    },
    pageType () {
      if (!this.page) return null
      switch (this.page.component) {
        case 'oh-layout-page':
          return 'layout'
        case 'oh-map-page':
          return 'map'
        case 'oh-tabs-page':
          return 'tabs'
        case 'oh-plan-page':
          return 'plan'
        default:
          console.warn('Unknown page type!')
          return 'unknown'
      }
    },
    ready () {
      return this.page
    }
  },
  methods: {
    onPageAfterIn () {
      this.$store.dispatch('startTrackingStates')
      this.load()
    },
    onPageBeforeOut () {
      this.$store.dispatch('stopTrackingStates')
    },
    onCommand (itemName, command) {
      this.$store.dispatch('sendCommand', { itemName, command })
    },
    load () {
    },
    tabContext (tab) {
      const page = this.$store.getters.page(tab.config.page.replace('page:', ''))
      return {
        component: page,
        tab: tab,
        props: tab.config.pageConfig,
        store: this.$store.getters.trackedItems
      }
    },
    tabComponent (tab) {
      const page = this.$store.getters.page(tab.config.page.replace('page:', ''))
      return page.component
    }
  }
}
</script>
