<template>
  <f7-popup tablet-fullscreen close-on-escape @popup:opened="() => showNetwork = true" @popup:closed="$emit('closed')">
    <f7-page class="analyzer-content">
      <f7-navbar title="Z-Wave Network Map">
        <f7-nav-right>
          <f7-link popup-close>
            Close
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <zwave-network v-if="showNetwork" :bridgeUID="bridgeUID" />
    </f7-page>
  </f7-popup>
</template>

<script>
export default {
  props: ['bridgeUID'],
  components: {
    'zwave-network': () => import(/* webpackChunkName: "zwave-network" */ '@/components/thing/zwave/zwave-network.vue')
  },
  data () {
    return {
      showNetwork: false
    }
  },
  methods: {
  },
  computed: {
  }
}
</script>
