<template>
  <ul>
    <f7-list-item
      :floating-label="theme.md"
      :title="configDescription.label">
      <template #media>
        <vue-qrcode :value="value" />
      </template>
    </f7-list-item>
  </ul>
</template>

<script>
import { theme } from 'framework7-vue'
import { defineAsyncComponent } from 'vue'

export default {
  props: {
    configDescription: Object,
    value: String
  },
  setup () {
    return { theme }
  },
  components: {
    'vue-qrcode': defineAsyncComponent(() => import(/* webpackChunkName: "vue-qrcode" */ 'vue-qrcode'))
  }
}
</script>
