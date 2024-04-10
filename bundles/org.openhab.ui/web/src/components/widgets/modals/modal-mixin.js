import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'

export default {
  components: {
    'oh-layout-page': OhLayoutPage,
    'oh-map-page': () => import('@/components/widgets/map/oh-map-page.vue'),
    'oh-plan-page': () => import('@/components/widgets/plan/oh-plan-page.vue'),
    'oh-chart-page': () => import('@/components/widgets/chart/oh-chart-page.vue')
  },
  props: ['uid', 'el', 'modalConfig'],
  data () {
    return {
      currentTab: 0,
      vars: {},
      ctxVars: {},
      tabVars: {}
    }
  },
  computed: {
    context () {
      const component = this.page || this.widget || this.standard
      return {
        component: component,
        root: component,
        store: this.$store.getters.trackedItems,
        props: this.modalConfig,
        vars: this.vars,
        ctxVars: this.ctxVars,
        modalConfig: this.modalConfig // For configuration of oh- components
      }
    },
    modalStyle () {
      if (!this.context) return null
      const pageComponent = (this.context.component === 'oh-tabs-page') ? this.tabContext(this.context.component.slots.default[this.currentTab]).component : this.context.component
      if (!pageComponent || !pageComponent.config || !pageComponent.config.style) return null
      return pageComponent.config.style
    },
    page () {
      return (this.uid.indexOf('page:') === 0) ? this.$store.getters.page(this.uid.substring(5)) : null
    },
    widget () {
      return (this.uid.indexOf('widget:') === 0) ? this.$store.getters.widget(this.uid.substring(7)) : null
    },
    standard () {
      return (this.uid.indexOf('oh-') === 0) ? { component: this.uid } : null
    },
    ready () {
      return this.page || this.widget || this.standard
    },
    componentType () {
      if (this.page) {
        return this.page.component
      } else if (this.widget || this.standard) {
        return 'generic-widget-component'
      }
      return null
    },
    visibleToCurrentUser () {
      // widgets in modals cannot be restricted (this is by design)
      if (!this.page || !this.page.config || !this.page.config.visibleTo) return true
      const user = this.$store.getters.user
      if (!user) return false
      if (user.roles && user.roles.some(r => this.page.config.visibleTo.indexOf('role:' + r) >= 0)) return true
      if (this.page.config.visibleTo.indexOf('user:' + user.name) >= 0) return true
      return false
    }
  },
  methods: {
    onTabChange (idx) {
      this.currentTab = idx
      this.$set(this, 'vars', {})
      this.$set(this, 'ctxVars', {})
    },
    tabContext (tab) {
      const page = this.$store.getters.page(tab.config.page.replace('page:', ''))
      return {
        component: page,
        root: page,
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
