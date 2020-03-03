<template>
  <f7-sheet>
    <f7-toolbar>
      <div class="left padding-left">{{(page) ? page.config.label : ''}}</div>
      <div class="right"><f7-link sheet-close>Close</f7-link></div>
    </f7-toolbar>

    <f7-page v-if="page && page.component === 'oh-layout-page'">
      <oh-layout-page :context="context"
        class="layout-page"
        :class="{notready: !ready}" />
    </f7-page>
    <generic-widget-component v-else-if="widget" :context="context" :class="{notready: !ready}" />
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
    OhLayoutPage
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
    }
  }
}
</script>
