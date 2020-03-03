<template>
  <f7-popup tablet-fullscreen close-on-escape :opened="opened" @popup:opened="() => showNetwork = true" @popup:closed="$emit('closed')">
    <f7-page class="analyzer-content">
      <f7-navbar title="Z-Wave Network Map">
        <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <zwave-network v-if="showNetwork"></zwave-network>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
// .analyzer-content
//   background white
</style>

<script>
export default {
  components: {
    'zwave-network': () => import('@/components/thing/zwave/zwave-network.vue')
  },
  props: ['opened'],
  data () {
    return {
      popupOpened: false,
      showNetwork: false
    }
  },
  methods: {
  },
  computed: {
  }
}
</script>
