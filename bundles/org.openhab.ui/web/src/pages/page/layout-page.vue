<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title>{{(ready) ? page.config.label : ''}}</f7-nav-title>
    </f7-navbar>

    <oh-layout-page v-if="page.uid" :context="context"
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
import stateTracking from '@/js/openhab/stateTracking'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'

export default {
  mixins: [stateTracking],
  components: {
    OhLayoutPage
  },
  props: ['uid'],
  data () {
    return {
      ready: false,
      loading: false,
      page: {}
    }
  },
  created () {

  },
  computed: {
    context () {
      return {
        component: this.page,
        store: this.stateTracking.store
      }
    }
  },
  methods: {
    onPageAfterIn () {
      this.startStateTracking()
      this.load()
    },
    onPageBeforeOut () {
      this.stopStateTracking()
    },
    onReady (component) {
    },
    load () {
      if (this.loading) return
      this.loading = true

      this.$oh.api.get('/rest/ui/components/ui:page/' + this.uid).then((data) => {
        this.$set(this, 'page', data)
        this.ready = true
        this.loading = false
      })
    }
  }
}
</script>
