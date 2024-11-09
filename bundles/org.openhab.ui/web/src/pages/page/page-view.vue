<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" hide-bars-on-scroll :style="pageStyle" class="disable-user-select">
    <f7-navbar v-if="!page || !page.config.hideNavbar" :back-link="(showBackButton) ? $t('page.navbar.back') : undefined" class="disable-user-select">
      <f7-nav-left v-if="!showBackButton">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left" />
      </f7-nav-left>
      <f7-nav-title>{{ (page) ? page.config.label : '' }}</f7-nav-title>
      <f7-nav-right>
        <f7-link v-if="isAdmin" icon-md="material:edit" :href="'/settings/pages/' + pageType + '/' + uid">
          {{ $theme.md ? '' : $t('page.navbar.edit') }}
        </f7-link>
        <f7-link v-if="fullscreenIcon" class="fullscreen-icon-navbar" :icon-f7="fullscreenIcon" @click="toggleFullscreen" />
      </f7-nav-right>
    </f7-navbar>
    <template v-else>
      <f7-link v-if="!page.config.hideSidebarIcon" class="sidebar-icon" icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left" />
      <f7-link v-if="fullscreenIcon" class="fullscreen-icon" :icon-f7="fullscreenIcon" @click="toggleFullscreen" />
    </template>

    <!-- Tabbed Pages -->
    <f7-toolbar tabbar labels bottom v-if="page && pageType === 'tabs' && visibleToCurrentUser">
      <f7-link v-for="(tab, idx) in page.slots.default" :key="idx" tab-link @click="onTabChange(idx)" :tab-link-active="currentTab === idx" :icon-ios="tabEvaluateExpression(tab, idx, 'icon')" :icon-md="tabEvaluateExpression(tab, idx, 'icon')" :icon-aurora="tabEvaluateExpression(tab, idx, 'icon')" :text="tabEvaluateExpression(tab, idx, 'title')" :icon-badge="tabEvaluateExpression(tab, idx, 'badge')" :badge-color="tabEvaluateExpression(tab, idx, 'badgeColor')" />
    </f7-toolbar>
    <f7-tabs v-if="page && pageType === 'tabs' && visibleToCurrentUser">
      <f7-tab v-for="(tab, idx) in page.slots.default" :key="idx" :tab-active="currentTab === idx">
        <component v-if="currentTab === idx" :is="tabComponent(tab)" :context="tabContext(tab)" @command="onCommand" />
      </f7-tab>
    </f7-tabs>

    <component :is="page.component" v-else-if="page && visibleToCurrentUser" :context="context" @command="onCommand" @action="performAction($event.ev, $event.prefix, $event.config, $event.context)" />

    <empty-state-placeholder v-if="!visibleToCurrentUser" icon="multiply_circle_fill" title="page.unavailable.title" text="page.unavailable.text" />
  </f7-page>
</template>

<style lang="stylus">
.sidebar-icon
  position fixed
  top 8px
  left 8px
.fullscreen-icon-navbar
  margin-left: 20px !important
.fullscreen-icon
  position absolute
  top 8px
  right 8px
</style>

<script>
import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import WidgetExpressionMixin from '@/components/widgets/widget-expression-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'

export default {
  mixins: [WidgetExpressionMixin, actionsMixin],
  components: {
    'oh-layout-page': OhLayoutPage,
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue'),
    'oh-map-page': () => import(/* webpackChunkName: "map-page" */ '@/components/widgets/map/oh-map-page.vue'),
    'oh-plan-page': () => import(/* webpackChunkName: "plan-page" */ '@/components/widgets/plan/oh-plan-page.vue'),
    'oh-chart-page': () => import(/* webpackChunkName: "chart-page" */ '@/components/widgets/chart/oh-chart-page.vue'),
    'oh-locations-tab': () => import('@/components/tabs/locations-tab.vue'),
    'oh-equipment-tab': () => import('@/components/tabs/equipment-tab.vue'),
    'oh-properties-tab': () => import('@/components/tabs/properties-tab.vue')
  },
  props: ['uid', 'initialTab', 'deep', 'defineVars'],
  data () {
    return {
      currentTab: this.initialTab ? Number(this.initialTab) : 0,
      fullscreen: this.$fullscreen.getState()
    }
  },
  watch: {
    pageType (newType, oldType) {
      if (oldType === null && newType === 'tabs') {
        this.onTabChange(this.currentTab)
      }
    }
  },
  computed: {
    pageStyle () {
      if (!this.context) return null
      const pageComponent = (this.pageType === 'tabs') ? this.tabContext(this.context.component.slots.default[this.currentTab]).component : this.context.component
      if (!pageComponent || !pageComponent.config || !pageComponent.config.style) return null
      return pageComponent.config.style
    },
    context () {
      return {
        component: this.page,
        vars: Object.assign((this.page && this.page.config && this.page.config.defineVars) ? this.page.config.defineVars : {}, this.defineVars),
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
    isAdmin () {
      return this.page && this.$store.getters.isAdmin
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
    },
    fullscreenIcon () {
      if (this.page && this.$fullscreen.support && this.page.config.showFullscreenIcon) {
        return this.fullscreen ? 'rectangle_arrow_up_right_arrow_down_left_slash' : 'rectangle_arrow_up_right_arrow_down_left'
      } else return null
    }
  },
  methods: {
    onPageAfterIn () {
      this.$store.dispatch('startTrackingStates')
    },
    onPageBeforeOut () {
      this.$store.dispatch('stopTrackingStates')
    },
    onTabChange (idx) {
      this.currentTab = idx
      this.$set(this, 'vars', {})
      const url = '/page/' + this.uid + '/' + this.currentTab
      this.$f7router.updateCurrentUrl(url)
      this.$f7router.url = url
    },
    onCommand (itemName, command) {
      this.$store.dispatch('sendCommand', { itemName, command })
    },
    tabContext (tab) {
      const page = tab.config.page ? this.$store.getters.page(tab.config.page.replace('page:', '')) : tab.component
      const context = {
        component: page,
        tab,
        vars: this.vars,
        props: tab.config.pageConfig,
        store: this.$store.getters.trackedItems
      }
      // mock some slots so that it works with current homecard-grouping implementation
      if (tab.component === 'oh-locations-tab') {
        context.slots = { locations: [tab] }
      } else if (tab.component === 'oh-equipment-tab') {
        context.slots = { equipment: [tab] }
      } else if (tab.component === 'oh-properties-tab') {
        context.slots = { properties: [tab] }
      }
      return context
    },
    tabComponent (tab) {
      if (tab.component === 'oh-locations-tab' || tab.component === 'oh-equipment-tab' || tab.component === 'oh-properties-tab') {
        return tab.component
      }

      const page = this.$store.getters.page(tab.config.page.replace('page:', ''))
      return page.component
    },
    tabEvaluateExpression (tab, idx, key) {
      const ctx = this.tabContext(tab)
      return this.evaluateExpression('tab-' + idx + '-' + key, tab.config[key], ctx, ctx.props)
    },
    toggleFullscreen () {
      this.$fullscreen.toggle(document.body, {
        wrap: false,
        callback: (fullscreen) => {
          this.fullscreen = fullscreen
          if (fullscreen) {
            this.$f7.panel.get('left').disableVisibleBreakpoint()
          } else {
            if (localStorage.getItem('openhab.ui:panel.visibleBreakpointDisabled') !== 'true') {
              this.$f7.panel.get('left').enableVisibleBreakpoint()
            }
          }
        }
      })
    }
  }
}
</script>
