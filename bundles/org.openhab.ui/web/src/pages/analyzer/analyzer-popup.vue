<template>
  <f7-popup tablet-fullscreen :backdrop="false" class="analyzer-popup" @popup:close="$refs.analyzer.onClose()">
    <analyzer ref="analyzer" />
  </f7-popup>
</template>

<style lang="stylus" scoped>
.analyzer-popup
  z-index 10490
</style>
<script>
export default {
  components: {
    'analyzer': () => import(/* webpackChunkName: "analyzer" */ './analyzer.vue')
  }
}
</script>
