<template>
  <div class="list-header">
    <div class="list-header-grid">
      <div v-if="$slots['before-title']" class="lh-before-title"><slot name="before-title" /></div>
      <div class="lh-title"><slot name="title" /></div>
      <div v-if="$slots.updated" class="lh-updated">
        <slot name="updated" />
      </div>
      <div v-if="$slots.refresh" class="lh-refresh"><slot name="refresh" /></div>
      <div v-if="$slots.view" class="lh-view"><slot name="view" /></div>
    </div>
  </div>
</template>

<style lang="stylus">
.list-header
  container-type inline-size
  width 100%
  border-bottom 0.5px solid var(--f7-list-item-border-color, rgba(128, 128, 128, 0.3))

  // Wide: one row. Title left, controls right.
  .list-header-grid
    display grid
    grid-template-columns auto minmax(0, 1fr) auto auto auto
    grid-template-areas "before title updated refresh view"
    align-items center
    padding 10px 16px
    font-size var(--f7-block-title-font-size)

  .lh-before-title
    grid-area before
    margin-right 12px
  .lh-title
    grid-area title
    white-space nowrap
    min-width 0
    overflow hidden
    font-weight 500
    text-transform capitalize
  .lh-updated
    grid-area updated
    margin-left 12px
    white-space nowrap
    font-size 0.8rem
    opacity 0.6
    vertical-align middle
  .lh-refresh
    grid-area refresh
    margin-left 12px
  .lh-view
    grid-area view
    margin-left 12px

  .grouping-switch
    flex none
    margin 0
    padding 2px
    gap 2px
    border-radius 8px
    background var(--f7-card-bg-color)

  .grouping-switch .button
    height 28px
    line-height 28px
    padding 0 12px
    font-size 12px
    text-transform none
    letter-spacing 0
    border none
    border-radius 6px
    color var(--f7-text-color)
    opacity 0.7
    background transparent

  .grouping-switch .button.button-active
    box-shadow 0 0 0 2px var(--f7-theme-color)
    z-index 2
    font-weight 500
    background var(--f7-card-bg-color, var(--f7-list-bg-color))

// Narrow: stacked layout for small screens
@media (--media-XS-down)
  .list-header
    .list-header-grid
      grid-template-columns auto minmax(0, 1fr) auto
      grid-template-areas "before title refresh" "before updated refresh" "view view view"
    .lh-updated
      margin-left 0
      font-size 11px
    .lh-view
      margin 8px 0 0
</style>
