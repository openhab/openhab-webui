<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" hide-bars-on-scroll :style="pageStyle">
    <f7-navbar :back-link="(showBackButton) ? 'Back' : undefined">
      <f7-nav-left v-if="!showBackButton">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title>{{(ready) ? page.config.label : ''}}</f7-nav-title>
      <f7-nav-right>
        <f7-link v-if="isAdmin" icon-md="material:edit" :href="'/settings/pages/' + pageType + '/' + uid">{{ $theme.md ? '' : 'Edit' }}</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-toolbar tabbar labels bottom v-if="page && pageType === 'tabs' && visibleToCurrentUser">
      <f7-link v-for="(tab, idx) in page.slots.default" :key="idx" tab-link @click="onTabChange(idx)" :tab-link-active="currentTab === idx" :icon-ios="tab.config.icon" :icon-md="tab.config.icon" :icon-aurora="tab.config.icon" :text="tab.config.title"></f7-link>
    </f7-toolbar>

    <f7-tabs v-if="page && pageType === 'tabs' && visibleToCurrentUser" :class="{notready: !ready}">
      <f7-tab v-for="(tab, idx) in page.slots.default" :key="idx" :tab-active="currentTab === idx">
        <component v-if="currentTab === idx" :is="tabComponent(tab)" :context="tabContext(tab)" @command="onCommand" />
      </f7-tab>
    </f7-tabs>

    <component :is="page.component" v-else-if="page && visibleToCurrentUser" :context="context" :class="{notready: !ready}" @command="onCommand" />

    <empty-state-placeholder v-if="!visibleToCurrentUser" icon="multiply_circle_fill" title="page.unavailable.title" text="page.unavailable.text" />

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
    'oh-map-page': () => import(/* webpackChunkName: "map-page" */ '@/components/widgets/map/oh-map-page.vue'),
    'oh-plan-page': () => import(/* webpackChunkName: "plan-page" */ '@/components/widgets/plan/oh-plan-page.vue'),
    'oh-chart-page': () => import(/* webpackChunkName: "chart-page" */ '@/components/widgets/chart/oh-chart-page.vue')
  },
  props: ['uid', 'deep'],
  data () {
    return {
      currentTab: 0,
      vars: {},
      // ready: false,
      loading: false
      // page: {}
    }
  },
  computed: {
    pageStyle () {
      if (!this.context) return null
      const pageComponent = (this.pageType === 'tabs') ? this.tabContext(this.context.component.slots.default[this.currentTab].component) : this.context.component
      if (!pageComponent || !pageComponent.config || !pageComponent.config.style) return null
      return pageComponent.config.style
    },
    context () {
      return {
        component: this.page,
        vars: this.vars,
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
        case 'oh-chart-page':
          return 'chart'
        default:
          console.warn('Unknown page type!')
          return 'unknown'
      }
    },
    ready () {
      return this.page
    },
    isAdmin () {
      return this.ready && this.$store.getters.isAdmin
    },
    visibleToCurrentUser () {
      if (!this.page || !this.page.config || !this.page.config.visibleTo) return true
      const user = this.$store.getters.user
      if (!user) return false
      if (user.roles && user.roles.some(r => this.page.config.visibleTo.indexOf('role:' + r) >= 0)) return true
      if (this.page.config.visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    },
    showBackButton () {
      return this.deep && (!this.page || !this.page.config.sidebar)
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
    onTabChange (idx) {
      this.currentTab = idx
      this.$set(this, 'vars', {})
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
        vars: this.vars,
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
