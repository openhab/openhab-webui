<template>
  <ul>
    <f7-list-item
      :floating-label="$theme.md"
      :title="configDescription.label">
      <vue-qrcode :value="value" slot="media" />
    </f7-list-item>
  </ul>
</template>

<script>
export default {
  props: {
    configDescription: Object,
    value: String
  },
  components: {
    'vue-qrcode': () => import(/* webpackChunkName: "vue-qrcode" */ 'vue-qrcode')
  }
}
</script>
