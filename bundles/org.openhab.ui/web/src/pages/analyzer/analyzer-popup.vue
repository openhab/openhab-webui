<template>
  <f7-popup tablet-fullscreen
            :backdrop="false"
            class="analyzer-popup"
            @popup:close="$refs.analyzer.onClose()">
    <analyzer ref="analyzer" :f7router="f7router" :f7route="f7route" />
  </f7-popup>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  props: {
    f7router: Object,
    f7route: Object
  },
  components: {
    analyzer: defineAsyncComponent(() => import(/* webpackChunkName: "analyzer" */ './analyzer.vue'))
  }
}
</script>
