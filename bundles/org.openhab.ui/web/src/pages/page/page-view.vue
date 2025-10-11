<template>
  <f7-page @page:afterin="onPageAfterIn"
           @page:beforeout="onPageBeforeOut"
           hide-bars-on-scroll
           :style="pageStyle"
           class="disable-user-select">
    <f7-navbar v-if="!page || !page.config.hideNavbar" :back-link="(showBackButton) ? $t('page.navbar.back') : undefined" class="disable-user-select">
      <f7-nav-left v-if="!showBackButton">
        <f7-link icon-ios="f7:menu"
                 icon-aurora="f7:menu"
                 icon-md="material:menu"
                 panel-open="left" />
      </f7-nav-left>
      <f7-nav-title>{{ pageLabel }}</f7-nav-title>
      <f7-nav-right>
        <f7-link v-if="isAdmin"
                 icon-md="material:edit"
                 @click="editPage"
                 class="edit-page-button">
          {{ theme.md ? '' : $t('page.navbar.edit') }}
        </f7-link>
        <f7-link v-if="fullscreenIcon"
                 class="fullscreen-icon-navbar"
                 :icon-f7="fullscreenIcon"
                 @click="toggleFullscreen" />
        <div v-if="!showBackButton && !isAdmin && !fullscreenIcon" style="width: 44px; height: 44px;" />
      </f7-nav-right>
    </f7-navbar>
    <template v-else>
      <f7-link v-if="!page.config.hideSidebarIcon"
               class="sidebar-icon"
               icon-ios="f7:menu"
               icon-aurora="f7:menu"
               icon-md="material:menu"
               panel-open="left" />
      <f7-link v-if="fullscreenIcon"
               class="fullscreen-icon"
               :icon-f7="fullscreenIcon"
               @click="toggleFullscreen" />
    </template>

    <!-- Tabbed Pages -->
    <f7-toolbar tabbar
                labels
                bottom
                v-if="page && pageType === 'tabs' && visibleToCurrentUser">
      <f7-link v-for="(tab, idx) in page.slots.default"
               :key="idx"
               :tab-link="'#tab-' + idx"
               @click="onTabChange(idx)"
               :tab-link-active="currentTab === idx">
        <i v-if="tabEvaluateExpression(tab, idx, 'icon')" class="icon" :style="{ width: tabBarIconSize, height: tabBarIconSize }">
          <oh-icon :icon="tabEvaluateExpression(tab, idx, 'icon')" :width="tabBarIconSize" :height="tabBarIconSize" />
          <f7-badge v-if="tabEvaluateExpression(tab, idx, 'badge')" :color="tabEvaluateExpression(tab, idx, 'badgeColor')">{{ tabEvaluateExpression(tab, idx, 'badge') }}</f7-badge>
        </i>
        <span class="tabbar-label">{{ tabEvaluateExpression(tab, idx, 'title') }}</span>
      </f7-link>
    </f7-toolbar>
    <f7-tabs v-if="page && pageType === 'tabs' && visibleToCurrentUser">
      <f7-tab v-for="(tab, idx) in page.slots.default"
              :id="'tab-' + idx"
              :key="idx"
              :tab-active="currentTab === idx">
        <component v-if="currentTab === idx"
                   :is="tabComponent(tab)"
                   :context="tabContext(tab)"
                   @command="onCommand" />
      </f7-tab>
    </f7-tabs>

    <component v-else-if="page && visibleToCurrentUser"
               :is="page.component"
               :context="context"
               @command="onCommand"
               @action="performAction($event.ev, $event.prefix, $event.config, $event.context)" />

    <empty-state-placeholder v-if="!visibleToCurrentUser"
                             icon="multiply_circle_fill"
                             title="page.unavailable.title"
                             text="page.unavailable.text" />
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
.icon
  .badge
    margin-left -10px !important
</style>

<script>
import { defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import WidgetExpressionMixin from '@/components/widgets/widget-expression-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  mixins: [WidgetExpressionMixin, actionsMixin],
  components: {
    'oh-layout-page': OhLayoutPage,
    EmptyStatePlaceholder,
    'oh-map-page': defineAsyncComponent(() => import(/* webpackChunkName: "map-page" */ '@/components/widgets/map/oh-map-page.vue')),
    'oh-plan-page': defineAsyncComponent(() => import(/* webpackChunkName: "plan-page" */ '@/components/widgets/plan/oh-plan-page.vue')),
    'oh-chart-page': defineAsyncComponent(() => import(/* webpackChunkName: "chart-page" */ '@/components/widgets/chart/oh-chart-page.vue')),
    'oh-locations-tab': defineAsyncComponent(() => import('@/components/tabs/locations-tab.vue')),
    'oh-equipment-tab': defineAsyncComponent(() => import('@/components/tabs/equipment-tab.vue')),
    'oh-properties-tab': defineAsyncComponent(() => import('@/components/tabs/properties-tab.vue'))
  },
  props: {
    uid: String,
    initialTab: String, // declare string here as router will pass string, not number
    deep: Boolean,
    defineVars: Object,
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      currentTab: this.initialTab ? Number(this.initialTab) : 0,
      fullscreen: this.$fullscreen.isFullscreen,

      vars: {}
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
      const pageComponent =
        this.pageType === 'tabs'
          ? this.tabContext(this.context.component.slots.default[this.currentTab]).component
          : this.context.component
      if (!pageComponent || !pageComponent.config || !pageComponent.config.style) return null
      return pageComponent.config.style
    },
    // Resolve the f7 CSS variable because iconify's SVG element doesn't like css variables
    tabBarIconSize () {
      return window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--f7-tabbar-icon-size')
    },
    context () {
      return {
        component: this.page,
        vars: Object.assign(
          this.page && this.page.config && this.page.config.defineVars
            ? this.page.config.defineVars
            : {},
          this.defineVars
        ),
        store: useStatesStore().trackedItems
      }
    },
    page () {
      return useComponentsStore().page(this.uid)
    },
    pageType () {
      return this.getPageType(this.page)
    },
    pageLabel () {
      return this.page?.config.label
    },
    isAdmin () {
      return this.page && useUserStore().isAdmin()
    },
    visibleToCurrentUser () {
      if (!this.page || !this.page.config || !this.page.config.visibleTo) return true
      const user = useUserStore().user
      if (!user) return false
      if (user.roles && user.roles.some((r) => this.page.config.visibleTo.indexOf('role:' + r) >= 0))
        return true
      if (this.page.config.visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    },
    showBackButton () {
      return this.deep && !this.page?.config.sidebar
    },
    fullscreenIcon () {
      if (this.$fullscreen.isEnabled && this.page?.config.showFullscreenIcon) {
        return this.fullscreen
          ? 'rectangle_arrow_up_right_arrow_down_left_slash'
          : 'rectangle_arrow_up_right_arrow_down_left'
      }
      return null
    }
  },
  methods: {
    onPageAfterIn () {
      useStatesStore().startTrackingStates()
    },
    onPageBeforeOut () {
      useStatesStore().stopTrackingStates()
    },
    onTabChange (idx) {
      this.currentTab = idx
      this.vars = {}
      const url = '/page/' + this.uid + '/' + this.currentTab
      this.f7router.updateCurrentUrl(url)
      this.f7router.url = url
    },
    onCommand (itemName, command) {
      useStatesStore().sendCommand(itemName, command)
    },
    getPageType (page) {
      if (!page) return null
      switch (page.component) {
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
    tabContext (tab) {
      const page = tab.config.page
        ? useComponentsStore().page(tab.config.page.replace('page:', ''))
        : tab.component
      const context = {
        component: page,
        tab,
        vars: this.vars,
        props: tab.config.pageConfig,
        store: useStatesStore().trackedItems
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

      const page = useComponentsStore().page(tab.config.page.replace('page:', ''))
      return page.component
    },
    tabEvaluateExpression (tab, idx, key) {
      const ctx = this.tabContext(tab)
      return this.evaluateExpression('tab-' + idx + '-' + key, tab.config[key], ctx, ctx.props)
    },
    editPage () {
      if (this.pageType === 'tabs') {
        const action = f7.actions.create({
          buttons: [
            {
              text: 'Edit Tabbed Page',
              onClick: () => {
                this.f7router.navigate('/settings/pages/' + this.pageType + '/' + this.uid)
              }
            },
            {
              text: 'Edit Current Tab',
              onClick: () => {
                const tabPageUid = this.page.slots.default[this.currentTab].config.page.replace('page:', '')
                const tabPage = useComponentsStore().page(tabPageUid)
                const tabPageType = this.getPageType(tabPage)
                this.f7router.navigate('/settings/pages/' + tabPageType + '/' + tabPageUid)
              }
            }
          ],
          targetEl: this.$el.querySelector('.edit-page-button')
        })
        action.open()
      } else {
        this.f7router.navigate('/settings/pages/' + this.pageType + '/' + this.uid)
      }
    },
    toggleFullscreen () {
      this.$fullscreen.toggle(document.body, {
        wrap: false,
        callback: (fullscreen) => {
          this.fullscreen = fullscreen
          if (fullscreen) {
            f7.panel.get('left').disableVisibleBreakpoint()
          } else {
            if (!useUIOptionsStore().visibleBreakpointDisabled) {
              f7.panel.get('left').enableVisibleBreakpoint()
            }
          }
        }
      })
    }
  }
}
</script>
