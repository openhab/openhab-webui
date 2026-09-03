<template>
  <f7-card
    ref="container"
    class="group-box"
    @accordion:open="onAccordionOpen"
    @accordion:close="onAccordionClose"
    :class="{ 'accordion-item': accordion }">
    <div
      v-if="title || description || $slots['before-title'] || $slots['after-title']"
      class="group-box-header"
      :role="accordion ? 'button' : undefined"
      :tabindex="accordion ? 0 : undefined"
      :aria-expanded="accordion ? isAccordionOpened : undefined"
      @click="toggleAccordion"
      @keydown.enter.prevent="toggleAccordion"
      @keydown.space.prevent="toggleAccordion">
      <div v-if="title || description || $slots['before-title'] || $slots['after-title']" class="group-box-header-text">
        <div v-if="title || $slots['before-title'] || $slots['after-title']" class="group-box-title-row">
          <div v-if="$slots['before-title']" class="group-box-before-title">
            <slot name="before-title" />
          </div>
          <f7-block-title v-if="title">
            {{ title }}
          </f7-block-title>
          <div v-if="$slots['after-title']" class="group-box-after-title">
            <slot name="after-title" />
          </div>
        </div>
        <f7-block-footer v-if="description" class="group-box-description">
          <div v-html="description" />
        </f7-block-footer>
      </div>
      <f7-icon v-if="accordion" f7="chevron_down" class="group-box-chevron" />
    </div>

    <div v-if="accordion" class="accordion-item-content">
      <slot />
    </div>
    <slot v-else />
  </f7-card>
</template>

<style lang="stylus">
// Shared style for flush containers, used on smaller screens and in popups.
// Remove the outer breathing room, rounded corners, and left/right borders
// so the container fills the available width.
flush-styles()
  margin-left 0 !important
  margin-right 0 !important
  border-radius 0 !important
  border-left 0
  border-right 0
  box-shadow none

.group-box
  // Shared knobs for spacing and separators inside the container.
  --group-box-divider-color var(--f7-list-border-color, var(--f7-border-color))
  --group-box-list-edge-spacing 0
  --group-box-config-item-padding calc(var(--f7-list-item-padding-vertical) + 2px)
  --group-box-config-item-margin-top 8px
  --group-box-config-item-margin-bottom 8px

  width 100%
  margin var(--f7-card-margin-vertical) 0 var(--f7-list-margin-vertical) !important
  border 1px solid var(--group-box-divider-color)
  overflow hidden

  // Revert to full-width, flush style on smaller screens
  @media (max-width 1024px)
    flush-styles()

  // Popups are also narrow; keep containers flush there as well.
  .popup &
    flush-styles()

  // Shared shaded header used by title and optional description.
  .group-box-header
    background var(--f7-list-item-divider-bg-color)
    border-bottom 1px solid var(--group-box-divider-color)
    padding 0

    .group-box-header-text
      min-width 0
      width 100%
      padding var(--f7-card-header-padding-vertical) 0

    .group-box-title-row
      display flex
      align-items center
      width 100%

    .group-box-before-title
      display flex
      align-items center
      gap 8px
      padding-left var(--f7-block-padding-horizontal)

    .group-box-after-title
      margin-left auto
      display flex
      align-items center
      justify-content flex-end
      // flex 1 1 0
      min-width 0
      // text-align right
      gap 8px
      padding-right var(--f7-block-padding-horizontal)

      > *
        margin-left auto

    .block-title
      margin 0 !important
      padding 0 var(--f7-block-padding-horizontal)
      background transparent
      font-size var(--f7-block-title-font-size)
      color var(--f7-block-title-text-color, var(--f7-text-color))

    .group-box-description
      margin 0
      padding 0 var(--f7-block-padding-horizontal)
      font-weight normal

      p
        margin 0

  &.accordion-item
    .group-box-header
      display flex
      align-items center
      cursor pointer
      user-select none

    .group-box-header-text
      flex 1 1 auto

    .group-box-chevron
      margin-right var(--f7-block-padding-horizontal)
      color var(--f7-list-item-after-text-color, var(--f7-text-color))
      opacity 0.5
      transition transform 0.3s

  &:not(.accordion-item-opened).accordion-item
    .group-box-header
      border-bottom 0

  &.accordion-item-opened
    .group-box-chevron
      transform rotate(180deg)

  // Regular Framework7 lists are used by settings, developer tools and theme switcher.
  // We hide Framework7's indented hairlines and draw one full-width divider per row.
  > .list:not(.config-parameter),
  > .accordion-item-content > .list:not(.config-parameter)
    margin 0 !important

    > ul
      padding-left 0
      background transparent
      padding-top var(--group-box-list-edge-spacing)
      padding-bottom var(--group-box-list-edge-spacing) !important

      &:before, &:after
        display none !important

    > ul > li
      position relative

      &:after
        content ''
        position absolute
        left 0
        right 0
        bottom 0
        height 1px
        background var(--group-box-divider-color)

      &:last-child:after
        display none

      .item-inner:after
        display none !important

  // Config sheets render each control as its own root .config-parameter list.
  // Keep the outer breathing room on the sheet, then strip internal Framework7
  // hairlines so we only show one separator between sibling parameters.
  > .config-sheet,
  > .accordion-item-content > .config-sheet
    margin 0
    width 100%
    padding-bottom var(--group-box-list-edge-spacing)

  > .config-parameter,
  > .accordion-item-content > .config-parameter,
  > .config-sheet .config-parameter,
  > .accordion-item-content > .config-sheet .config-parameter
    margin-top 0 !important
    padding-top var(--group-box-config-item-margin-top) !important
    margin-bottom 0 !important
    padding-bottom var(--group-box-config-item-margin-bottom) !important
    --f7-list-item-padding-vertical var(--group-box-config-item-padding)

    .list-group:before, .list-group:after
      display none !important

    .list-group > ul:before,
    .list-group > ul:after,
    > ul:before,
    > ul:after,
    ul:before,
    ul:after
      display none !important

    .item-inner:after
      display none !important

    .item-content:after
      display none !important

    .param-description.block-footer
      margin-top 0
      margin-bottom 0
      padding-bottom var(--group-box-config-item-margin-bottom)

    & + .config-parameter
      padding-top var(--group-box-config-item-margin-top)
      border-top 1px solid var(--group-box-divider-color)
</style>

<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { f7 } from 'framework7-vue'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    accordion?: boolean
    accordionOpened?: boolean
  }>(),
  {
    accordionOpened: false
  }
)

const container = useTemplateRef('container')
const isAccordionOpened = ref(props.accordionOpened)

watch(
  () => props.accordionOpened,
  (accordionOpened) => {
    isAccordionOpened.value = accordionOpened
    if (!props.accordion || !container.value?.$el) return
    if (accordionOpened) {
      f7.accordion.open(container.value?.$el)
    } else {
      f7.accordion.close(container.value?.$el)
    }
  }
)

function toggleAccordion() {
  if (!props.accordion || !container.value?.$el) return
  f7.accordion.toggle(container.value?.$el)
}

function onAccordionOpen() {
  isAccordionOpened.value = true
}

function onAccordionClose() {
  isAccordionOpened.value = false
}
</script>
