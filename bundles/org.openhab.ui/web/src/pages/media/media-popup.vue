<template>
  <f7-popup  :backdrop="false" :animate="false" :closeOnEscape="true" class="media-popup" @popup:close="$refs.media.onClose()">
    <media ref="media" />
  </f7-popup>
</template>

<script>
export default {
  components: {
    'media': () => import(/* webpackChunkName: "media" */ './media.vue')
  }
}
</script>
