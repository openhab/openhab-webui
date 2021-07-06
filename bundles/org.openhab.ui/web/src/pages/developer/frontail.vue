<template>
  <f7-page name="frontail" ref="page">
    <f7-navbar title="Log Viewer" ref="navbar" back-link="Developer Tools" back-link-url="/developer/" back-link-force />
    <f7-block class="frontail-block">
      <f7-col class="frontail-block--col">
        <iframe
          id="frontailUi"
          ref="frontailIframe"
          :src="`${frontailUrl}/${this.filter ? '?filter=' + this.filter : ''}`"
          scrolling="yes"
          frameborder="0"
          allowtransparency="true"
          :height="iframeHeight" />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.frontail-block
  padding-left: 0
  padding-right: 0
  margin: 0 !important
.frontail-block--col
  flex-direction: column
  height: calc(99vh - var(--f7-block-margin-vertical) - var(--f7-block-margin-vertical) - calc(var(--f7-navbar-height) + var(--f7-safe-area-top)))
  display: flex
  flex-flow: column
#frontailUi
  width: 0
  min-width: 100% !important
  border: 0
  min-height: 350px
  flex: 1 1 auto
  display: flex
</style>

<script>
import auth from '@/components/auth-mixin.js'

export default {
  mixins: [auth],
  data () {
    return {
      filter: this.$f7route.query.filter
    }
  },
  computed: {
    iframeHeight () {
      return Number(
        this.$refs['page']?.offsetHeight - this.$refs['navbar']?.offsetHeight
      )
    },
    frontailUrl () {
      const FRONTAIL_PORT = 9001
      const url = new URL(window.location.origin)
      const { protocol, hostname } = url

      return `${protocol}//${hostname}:${FRONTAIL_PORT}`
    }
  }
}
</script>
