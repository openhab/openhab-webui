<template>
  <f7-popup tablet-fullscreen
            close-on-escape
            @popup:opened="onPopupOpened"
            @popup:closed="$emit('closed')">
    <f7-page class="matter-network-popup-content">
      <f7-navbar title="Thread Network Map">
        <f7-nav-right>
          <f7-link popup-close>
            Close
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <matter-network v-if="showNetwork" :bridgeUID="bridgeUID" />
    </f7-page>
  </f7-popup>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  props: {
    bridgeUID: String
  },
  components: {
    'matter-network': defineAsyncComponent(() => import('@/components/thing/matter/matter-network.vue'))
  },
  emits: ['closed'],
  data () {
    return {
      showNetwork: false
    }
  },
  methods: {
    onPopupOpened () {
      this.showNetwork = true
    }
  }
}
</script>

