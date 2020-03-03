<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" hide-bars-on-scroll>
    <f7-navbar :back-link="(deep) ? 'Back' : undefined">
      <f7-nav-left v-if="!deep">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title>{{(ready) ? page.config.label : ''}}</f7-nav-title>
      <f7-nav-right>
        <f7-link icon-md="material:edit" :href="'/settings/pages/' + pageType + '/' + uid">{{ $theme.md ? '' : 'Edit' }}</f7-link>
      </f7-nav-right>
    </f7-navbar>

    <oh-layout-page v-if="page && pageType === 'layout'" :context="context"
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
  props: ['uid', 'deep'],
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
    pageType () {
      switch (this.page.component) {
        case 'oh-layout-page':
          return 'layout'
        default:
          console.warn('Unknown page type!')
          return 'unknown'
      }
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
