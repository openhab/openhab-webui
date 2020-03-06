<template>
  <f7-popup>
    <f7-page>
      <f7-navbar :title="(page) ? page.config.label : ''" back-link="Back">
      </f7-navbar>

      <f7-toolbar tabbar labels bottom v-if="page && page.component === 'oh-tabs-page'">
        <f7-link v-for="(tab, idx) in page.slots.default" :key="idx" tab-link @click="currentTab = idx" :tab-link-active="currentTab === idx" :icon-ios="tab.config.icon" :icon-md="tab.config.icon" :icon-aurora="tab.config.icon" :text="tab.config.title"></f7-link>
      </f7-toolbar>

      <f7-tabs v-if="page && page.component === 'oh-tabs-page'" :class="{notready: !ready}">
        <f7-tab v-for="(tab, idx) in page.slots.default" :key="idx" :tab-active="currentTab === idx">
          <component v-if="currentTab === idx" :is="tabComponent(tab)" :context="tabContext(tab)" />
        </f7-tab>
      </f7-tabs>
      <component v-else :is="componentType" :context="context" :class="{notready: !ready}" />

    </f7-page>
  </f7-popup>
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
  props: ['uid', 'modalParams'],
  data () {
    return {
      currentTab: 0
    }
  },
  computed: {
    context () {
      return {
        component: this.page || this.widget,
        store: this.$store.getters.trackedItems,
        config: this.modalParams
      }
    },
    page () {
      return (this.uid.indexOf('page:') === 0) ? this.$store.getters.page(this.uid.substring(5)) : null
    },
    widget () {
      return (this.uid.indexOf('widget:') === 0) ? this.$store.getters.widget(this.uid.substring(7)) : null
    },
    ready () {
      return this.page || this.widget
    },
    componentType () {
      if (this.page) {
        return this.page.component
      } else if (this.widget) {
        return 'generic-widget-component'
      }
      return null
    }
  },
  methods: {
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
