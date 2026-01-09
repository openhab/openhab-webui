<template>
  <f7-popup ref="networkPopup" tablet-fullscreen class="network-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
        </f7-nav-left>
        <f7-nav-title>{{ title }}</f7-nav-title>
        <f7-nav-right>
          <f7-link popup-close> Close </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <network-graph v-if="networkGraph" :graph="networkGraph" />
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
      </div>
      <div v-else class="loading-container">
        <f7-preloader />
        <p>Loading network...</p>
      </div>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.network-popup
  .loading-container
  .error-container
    display flex
    flex-direction column
    align-items center
    justify-content center
    height calc(100% - var(--f7-navbar-height))
    margin-top var(--f7-navbar-height)
    gap 16px
    color var(--f7-text-color)

  .error-container
    color var(--f7-theme-color-red)
</style>

<script>
import { NetworkGraphComponent, networkProviders } from '@/components/thing/network'

export default {
  components: {
    NetworkGraph: NetworkGraphComponent
  },
  props: {
    bridgeUID: {
      type: String,
      required: true
    },
    networkType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      networkGraph: null,
      error: null
    }
  },
  computed: {
    provider () {
      return networkProviders[this.networkType]
    },
    title () {
      return this.provider?.title || 'Network Map'
    }
  },
  mounted () {
    this.loadNetworkGraph()
  },
  methods: {
    async loadNetworkGraph () {
      if (!this.provider) {
        this.error = `Unknown network type: ${this.networkType}`
        return
      }

      try {
        const things = await this.$oh.api.get('/rest/things')
        this.networkGraph = this.provider.buildGraph(things, this.bridgeUID)
      } catch (err) {
        console.error(`Failed to load ${this.networkType} network:`, err)
        this.error = `Failed to load network: ${err.message}`
      }
    }
  }
}
</script>
