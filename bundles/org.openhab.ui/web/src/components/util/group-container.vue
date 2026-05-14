<template>
  <div
    class="list-group-container"
    :class="{
      'list-group-container-full-width': fullWidth,
      'list-group-container-top-spacing-none': topSpacing === 'none',
      'list-group-container-top-spacing-block': topSpacing === 'block'
    }">
    <f7-block-title v-if="title">
      {{ title }}
    </f7-block-title>

    <f7-list v-bind="$attrs">
      <slot />
    </f7-list>
  </div>
</template>

<style lang="stylus">
.list-group-container
  margin var(--f7-card-margin-vertical) var(--f7-card-margin-horizontal) var(--f7-list-margin-vertical)
  background var(--f7-list-bg-color)
  border-radius var(--f7-card-border-radius)
  overflow hidden
  border 1px solid var(--f7-list-border-color, var(--f7-border-color))
  box-shadow var(--f7-elevation-1)

  &.list-group-container-top-spacing-none
    margin-top 0

  &.list-group-container-top-spacing-block
    margin-top var(--f7-block-margin-vertical)

  &.list-group-container-full-width
    margin-left 0
    margin-right 0

  @media (max-width: 767px)
    margin-left 0
    margin-right 0
    border-radius 0
    border-left 0
    border-right 0
    box-shadow none

  .block-title
    margin 0 !important
    padding var(--f7-card-header-padding-vertical) var(--f7-block-padding-horizontal)
    background var(--f7-list-item-divider-bg-color)
    border-bottom 1px solid var(--f7-list-border-color, var(--f7-border-color))
    font-size var(--f7-block-title-font-size)
    color var(--f7-block-title-text-color, var(--f7-text-color))

  .list
    margin 0 !important

    ul
      padding-left 0
      background transparent
      padding-bottom 0 !important

      &:before, &:after
        display none !important

    li:last-child .item-inner:after
      display none !important
</style>

<script setup>
defineOptions({
  inheritAttrs: false
})

defineProps({
  title: String,
  fullWidth: Boolean,
  topSpacing: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'none', 'block'].includes(value)
  }
})
</script>
