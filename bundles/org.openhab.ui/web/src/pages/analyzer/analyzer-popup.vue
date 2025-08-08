<template>
  <f7-popup tablet-fullscreen
            :backdrop="false"
            class="analyzer-popup"
            @popup:close="$refs.analyzer.onClose()">
    <analyzer ref="analyzer" />
  </f7-popup>
</template>

<script>
export default {
  components: {
    'analyzer': () => import(/* webpackChunkName: "analyzer" */ './analyzer.vue')
  }
}
</script>
