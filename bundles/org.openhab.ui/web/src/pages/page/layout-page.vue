<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title>{{(ready) ? page.config.label : ''}}</f7-nav-title>
    </f7-navbar>

    <oh-layout-page v-if="page" :context="context"
      class="layout-page"
      :class="{notready: !ready}"
      @command="onCommand" />

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
    OhLayoutPage
  },
  props: ['uid'],
  data () {
    return {
      // ready: false,
      loading: false
      // page: {}
    }
  },
  computed: {
    context () {
      return {
        component: this.page,
        store: this.$store.getters.trackedItems
      }
    },
    page () {
      return this.$store.getters.page(this.uid)
    },
    ready () {
      return this.page
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
    onCommand (itemName, command) {
      this.$store.dispatch('sendCommand', { itemName, command })
    },
    load () {
    }
  }
}
</script>
