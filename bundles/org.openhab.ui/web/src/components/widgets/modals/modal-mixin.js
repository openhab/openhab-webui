import { defineAsyncComponent } from 'vue'

import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useStatesStore } from '@/js/stores/useStatesStore'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
const OhMapPage = defineAsyncComponent(() => import('@/components/widgets/map/oh-map-page.vue'))
const OhPlanPage = defineAsyncComponent(() => import('@/components/widgets/plan/oh-plan-page.vue'))
const OhChartPage = defineAsyncComponent(() => import('@/components/widgets/chart/oh-chart-page.vue'))

function pageComponent(page) {
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

export default {
  props: {
    uid: String,
    el: Object,
    modalConfig: Object
  },
  data() {
    return {
      currentTab: 0,
      vars: {},
      ctxVars: {},
      tabVars: {}
    }
  },
  computed: {
    context() {
      const component = this.page || this.widget || this.standard
      return {
        component,
        root: component,
        store: useStatesStore().trackedItems,
        props: this.modalConfig,
        vars: this.vars,
        ctxVars: this.ctxVars,
        modalConfig: this.modalConfig // For configuration of oh- components
      }
    },
    modalStyle() {
      if (!this.context) return null
      const pageComponent =
        this.context.component === 'oh-tabs-page'
          ? this.tabContext(this.context.component.slots.default[this.currentTab]).component
          : this.context.component
      if (!pageComponent || !pageComponent.config || !pageComponent.config.style) return null
      return pageComponent.config.style
    },
    page() {
      return this.uid.indexOf('page:') === 0 ? useComponentsStore().page(this.uid.substring(5)) : null
    },
    widget() {
      return this.uid.indexOf('widget:') === 0 ? useComponentsStore().widget(this.uid.substring(7)) : null
    },
    standard() {
      return this.uid.indexOf('oh-') === 0 ? { component: this.uid } : null
    },
    ready() {
      return this.page || this.widget || this.standard
    },
    componentType() {
      if (this.page) {
        return pageComponent(this.page)
      } else if (this.widget || this.standard) {
        return 'generic-widget-component'
      }
      return null
    },
    visibleToCurrentUser() {
      // widgets in modals cannot be restricted (this is by design)
      if (!this.page || !this.page.config || !this.page.config.visibleTo) return true
      const user = useUserStore().user
      if (!user) return false
      if (user.roles && user.roles.some((r) => this.page.config.visibleTo.indexOf('role:' + r) >= 0)) return true
      if (this.page.config.visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    }
  },
  methods: {
    onTabChange(idx) {
      this.currentTab = idx
      this.vars = {}
      this.ctxVars = {}
    },
    tabContext(tab) {
      const page = useComponentsStore().page(tab.config.page.replace('page:', ''))
      return {
        component: page,
        root: page,
        tab,
        props: tab.config.pageConfig,
        store: useStatesStore().trackedItems
      }
    },
    tabComponent(tab) {
      const page = useComponentsStore().page(tab.config.page.replace('page:', ''))
      return pageComponent(page)
    }
  }
}
