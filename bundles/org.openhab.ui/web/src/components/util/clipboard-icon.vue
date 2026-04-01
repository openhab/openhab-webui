<template>
  <f7-icon
    class="clipboard-icon"
    v-bind="$attrs"
    f7="square_on_square"
    :size="size ? size : 12"
    v-clipboard="value"
    v-clipboard:success="success"
    @click.stop />
</template>

<style lang="stylus">
.clipboard-icon
  cursor: copy
</style>

<script>
import { showToast } from '@/js/dialog-promises'

export default {
  props: {
    value: String,
    size: Number
  },
  methods: {
    success() {
      showToast('Copied to clipboard')
    }
  }
}
</script>
