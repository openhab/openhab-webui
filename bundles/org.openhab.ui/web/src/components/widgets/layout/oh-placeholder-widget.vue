<template>
  <div class="placeholder-widget margin">
    <f7-button class="button" icon-f7="plus" color="gray" :icon-size="50" outline
      @click="$emit('click')">
    </f7-button>
  </div>
</template>

<style lang="stylus">
.placeholder-widget
  width 100%
  display inline-block
  opacity 0.5
  height calc(2*3rem + 50px)
  .button
    width calc(100% - var(--f7-typography-margin))
    padding 3rem 0
    height calc(2*3rem + 50px)
</style>
