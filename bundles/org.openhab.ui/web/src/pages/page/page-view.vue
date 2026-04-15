<template>
  <f7-page
    ref="root"
    @page:afterin="onPageAfterIn"
    @page:beforeout="onPageBeforeOut"
    hide-bars-on-scroll
    :style="pageStyle"
    class="disable-user-select">
    <f7-navbar
      v-if="!page || !page.config.hideNavbar"
      :back-link="showBackButton ? $t('page.navbar.back') : undefined"
      class="disable-user-select">
      <f7-nav-left v-if="!showBackButton">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left" />
      </f7-nav-left>
      <f7-nav-title>
        {{ pageLabel }}
      </f7-nav-title>
      <f7-nav-right>
        <f7-link v-if="editable" icon-md="material:edit" @click="editPage" class="edit-page-button">
          {{ theme === 'md' ? '' : $t('page.navbar.edit') }}
        </f7-link>
        <f7-link v-if="fullscreenIcon" class="fullscreen-icon-navbar" :icon-f7="fullscreenIcon" @click="toggleFullscreen" />
        <div v-if="!showBackButton && !editable && !fullscreenIcon" style="width: 44px; height: 44px" />
      </f7-nav-right>
    </f7-navbar>
    <template v-else>
      <f7-link
        v-if="!page.config.hideSidebarIcon"
        class="sidebar-icon"
        icon-ios="f7:menu"
        icon-aurora="f7:menu"
        icon-md="material:menu"
        panel-open="left" />
      <f7-link v-if="fullscreenIcon" class="fullscreen-icon" :icon-f7="fullscreenIcon" @click="toggleFullscreen" />
    </template>

    <!-- Tabbed Pages -->
    <f7-toolbar v-if="page && pageType === 'tabs' && visibleToCurrentUser" tabbar labels bottom>
      <f7-link
        v-for="(tab, idx) in page.slots.default"
        :key="idx"
        :tab-link="'#tab-' + idx"
        @click="onTabChange(idx)"
        :tab-link-active="currentTab === idx">
        <i v-if="tabEvaluateExpression(tab, idx, 'icon')" class="icon" :style="{ width: tabBarIconSize, height: tabBarIconSize }">
          <oh-icon :icon="tabEvaluateExpression(tab, idx, 'icon')" :width="tabBarIconSize" :height="tabBarIconSize" />
          <f7-badge v-if="tabEvaluateExpression(tab, idx, 'badge')" :color="tabEvaluateExpression(tab, idx, 'badgeColor')">{{
            tabEvaluateExpression(tab, idx, 'badge')
          }}</f7-badge>
        </i>
        <span class="tabbar-label">{{ tabEvaluateExpression(tab, idx, 'title') }}</span>
      </f7-link>
    </f7-toolbar>
    <f7-tabs v-if="page && pageType === 'tabs' && visibleToCurrentUser">
      <f7-tab v-for="(tab, idx) in page.slots.default" :id="'tab-' + idx" :key="idx" :tab-active="currentTab === idx">
        <component :is="tabComponent(tab)" v-if="currentTab === idx" :context="tabContext(tab)" :f7router />
      </f7-tab>
    </f7-tabs>

    <component :is="pageComponent(page)" v-else-if="page && visibleToCurrentUser" :context="context" :f7router="f7router" />

    <empty-state-placeholder
      v-if="!visibleToCurrentUser"
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

<script setup lang="ts">
import { computed, type DeepReadonly, defineAsyncComponent, ref, useTemplateRef } from 'vue'
import type { Router } from 'framework7'
import { f7 } from 'framework7-vue'
import { api as fullscreen } from 'vue-fullscreen'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useWidgetExpression } from '@/components/widgets/useWidgetExpression.ts'
import { useViewArea } from '@/js/composables/useViewArea.ts'

import * as api from '@/api'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import type { WidgetContext } from '@/components/widgets/types'
const OhMapPage = defineAsyncComponent(() => import('@/components/widgets/map/oh-map-page.vue'))
const OhPlanPage = defineAsyncComponent(() => import('@/components/widgets/plan/oh-plan-page.vue'))
const OhChartPage = defineAsyncComponent(() => import('@/components/widgets/chart/oh-chart-page.vue'))

const OhLocationsTab = defineAsyncComponent(() => import('@/components/tabs/locations-tab.vue'))
const OhEquipmentTab = defineAsyncComponent(() => import('@/components/tabs/equipment-tab.vue'))
const OhPropertiesTab = defineAsyncComponent(() => import('@/components/tabs/properties-tab.vue'))

const props = defineProps<{
  uid: string
  initialTab?: string // declare string here as router will pass string, not number
  deep?: boolean
  defineVars?: Record<string, unknown>
  f7router: Router.Router
}>()

const componentStore = useComponentsStore()
const statesStore = useStatesStore()
const userStore = useUserStore()

const theme = f7.theme

// composables
useViewArea()
const { evaluateExpression } = useWidgetExpression()

// data (state)
const currentTab = ref(props.initialTab ? Number(props.initialTab) : 0)
const isFullscreen = ref(fullscreen.isFullscreen)
const vars = ref({})
const root = useTemplateRef<{ $el: HTMLElement }>('root')

// computed
const pageStyle = computed(() => {
  if (!context.value) return null
  const pageComponent: DeepReadonly<api.RootUiComponent> | string | null =
    pageType.value === 'tabs'
      ? context.value.component?.slots.default?.[currentTab.value]
        ? // the tabbed page component can be null if this.currentTab is out of bounds
          tabContext(context.value.component!.slots.default![currentTab.value]!).component
        : null
      : context.value.component
  if (!pageComponent) return null
  if (typeof pageComponent === 'string') return null
  if (!pageComponent.config?.style) return null
  return pageComponent.config.style
})
/**
 * Resolve the Framework7 CSS variable because Iconify's SVG element doesn't like CSS variables.
 */
const tabBarIconSize = computed(() => window.getComputedStyle(document.documentElement).getPropertyValue('--f7-tabbar-icon-size'))
const visibleToCurrentUser = computed(() => {
  const visibleTo = page.value?.config?.visibleTo as string | undefined
  if (!visibleTo) return true
  const user = userStore.user
  if (!user) return false
  if (user.roles && user.roles.some((r) => visibleTo.indexOf('role:' + r) >= 0)) return true
  if (visibleTo.indexOf('user:' + user.name) >= 0) return true
  return false
})
const showBackButton = computed(() => props.deep && !page.value?.config?.sidebar)
const page = computed(() => componentStore.page(props.uid))
const context = computed(() => ({
  component: page.value,
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  vars: Object.assign(vars.value, page.value?.config?.defineVars ?? {}, props.defineVars ?? {}),
  store: statesStore.trackedItems
}))
const pageType = computed(() => (page.value ? getPageType(page.value) : null))
const pageLabel = computed(() => page.value?.config?.label)
const editable = computed(() => page.value && userStore.isAdmin())
const fullscreenIcon = computed(() => {
  if (fullscreen.isEnabled && page.value?.config.showFullscreenIcon) {
    return isFullscreen.value ? 'rectangle_arrow_up_right_arrow_down_left_slash' : 'rectangle_arrow_up_right_arrow_down_left'
  }
  return null
})

// methods
const onPageAfterIn = () => {
  statesStore.startTrackingStates()
  // make sure to set the current tab
  // fixes an issue where a tabbed subpage was opened and navigated around, when returning back to original page, tab was rendered empty
  onTabChange(currentTab.value)
}
const onPageBeforeOut = () => {
  statesStore.stopTrackingStates()
}
const onTabChange = (idx: number) => {
  if (pageType.value !== 'tabs') return
  currentTab.value = idx
  vars.value = {}
  const url = '/page/' + props.uid + '/' + currentTab.value
  props.f7router.updateCurrentUrl(url)
  // @ts-expect-error - url is not typed as part of the router
  props.f7router.url = url
}
const getPageType = (page: api.RootUiComponent | DeepReadonly<api.RootUiComponent>) => {
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
}
const tabContext = (tab: api.UiComponent) => {
  const tabPage: DeepReadonly<api.RootUiComponent> | string = tab.config.page
    ? componentStore.page((tab.config.page as string).replace('page:', ''))!
    : tab.component
  const context = {
    component: tabPage,
    tab,
    vars: vars.value,
    props: tab.config.pageConfig as Record<string, unknown>,
    store: statesStore.trackedItems,
    slots: {}
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
}
const pageComponent = (page: api.RootUiComponent | DeepReadonly<api.RootUiComponent>) => {
  if (!page.component) return null
  switch (page.component) {
    case 'oh-layout-page':
      return OhLayoutPage
    case 'oh-map-page':
      return OhMapPage
    case 'oh-plan-page':
      return OhPlanPage
    case 'oh-chart-page':
      return OhChartPage
  }
  return null
}
const tabComponent = (tab: string | api.UiComponent) => {
  switch (tab) {
    case 'oh-locations-tab':
      return OhLocationsTab
    case 'oh-equipment-tab':
      return OhEquipmentTab
    case 'oh-properties-tab':
      return OhPropertiesTab
  }

  if (typeof tab === 'string') {
    return null
  }

  const page = componentStore.page((tab.config.page as string).replace('page:', ''))
  if (!page) return null
  return pageComponent(page)
}
const tabEvaluateExpression = (tab: api.UiComponent, idx: number, key: string) => {
  const ctx = tabContext(tab)
  return evaluateExpression('tab-' + idx + '-' + key, tab.config[key], ctx as unknown as WidgetContext, ctx.props)
}
const editPage = () => {
  if (pageType.value === 'tabs') {
    const el = root.value!.$el.querySelector('.edit-page-button') as HTMLElement
    const action = f7.actions.create({
      buttons: [
        {
          text: 'Edit Tabbed Page',
          onClick: () => {
            props.f7router.navigate('/settings/pages/' + pageType.value + '/' + props.uid)
          }
        },
        {
          text: 'Edit Current Tab',
          onClick: () => {
            const tabPageUid = (page.value!.slots.default![currentTab.value]!.config.page as string).replace('page:', '')
            const tabPage = componentStore.page(tabPageUid)!
            const tabPageType = getPageType(tabPage)
            props.f7router.navigate('/settings/pages/' + tabPageType + '/' + tabPageUid)
          }
        }
      ],
      targetEl: el
    })
    action.open()
  } else {
    props.f7router.navigate('/settings/pages/' + pageType.value + '/' + props.uid)
  }
}
const toggleFullscreen = () => {
  fullscreen.toggle(document.body, {
    callback: (fullscreen) => {
      isFullscreen.value = fullscreen
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
</script>
