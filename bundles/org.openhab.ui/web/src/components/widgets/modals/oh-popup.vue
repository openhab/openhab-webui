<template>
  <f7-popup>
    <f7-page>
      <f7-navbar :title="(page) ? page.config.label : ''" back-link="Back">
      </f7-navbar>

      <oh-layout-page v-if="page && page.component === 'oh-layout-page'" :context="context"
        class="layout-page"
        :class="{notready: !ready}" />
      <generic-widget-component v-else-if="widget" :context="context" :class="{notready: !ready}" />

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
