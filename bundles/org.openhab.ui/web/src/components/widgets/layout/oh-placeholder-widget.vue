<template>
  <div class="placeholder-widget">
    <f7-button class="button"
               icon-f7="plus"
               color="gray"
               :icon-size="50"
               outline
               @click="$emit('click')" />
  </div>
</template>

<style lang="stylus">
.placeholder-widget
  margin var(--f7-typography-margin)
  width calc(100% - 2 * var(--f7-typography-margin))
  display inline-block
  opacity 0.5
  height calc(2*3rem + 50px)
  z-index 100
  .button
    width 100%
    padding 3rem 0
    height calc(2*3rem + 50px)
</style>

<script>
export default {
  emits: ['click']
}
</script>
