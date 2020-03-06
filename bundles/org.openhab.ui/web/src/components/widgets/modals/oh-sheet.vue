<template>
  <f7-sheet>
    <f7-toolbar>
      <div class="left padding-left">{{(page) ? page.config.label : ''}}</div>
      <div class="right"><f7-link sheet-close>Close</f7-link></div>
    </f7-toolbar>

    <component :is="componentType" :context="context" :class="{notready: !ready}" />
  </f7-sheet>
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
  }
}
</script>
