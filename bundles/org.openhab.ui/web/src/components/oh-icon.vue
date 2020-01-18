<template>
  <img :src="iconUrl" :width="width" :height="height"
    :style="{ width: (width) ? width + 'px' : 'auto', height: (height) ? height + 'px' : 'auto' }"
    onload="this.className=''" onerror="this.className='no-icon'" />
</template>

<style lang="stylus">
.no-icon
  visibility hidden !important
</style>

<script>
export default {
  props: ['icon', 'width', 'height'],
  asyncComputed: {
    iconUrl () {
      return (this.icon)
        ? this.$oh.media.getIcon(this.icon)
        // transparent PNG pixel
        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    }
  }
}
</script>
