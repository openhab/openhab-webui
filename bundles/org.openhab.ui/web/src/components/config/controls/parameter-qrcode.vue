<template>
  <ul>
    <f7-list-item
      :floating-label="$theme.md"
      :title="configDescription.label"
    >
        <vue-qrcode :value="value" slot="media"/>
    </f7-list-item>
  </ul>
</template>

<script>
 import VueQrcode from 'vue-qrcode'

export default {
  props: ['configDescription', 'value'],
  components: {
      VueQrcode
    }
}
</script>
