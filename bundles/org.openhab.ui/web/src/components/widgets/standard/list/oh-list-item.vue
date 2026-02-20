<template>
  <f7-list-button
    v-if="config.listButton && !context.editmode"
    :title="config.title || 'Action'"
    :color="config.color || 'blue'"
    @click.stop="performAction" />
  <f7-list-item v-else-if="config.divider && !context.editmode" divider ref="divider" :title="config.title" />
  <f7-list-item
    v-else
    v-bind="config"
    :divider="config.divider && !context.editmode"
    :media-item="context.parent.component.config.mediaList && !config.divider"
    :badge="(config.divider) ? 'Divider' : (config.listButton) ? 'List button' : config.badge"
    :accordion-item="isRegularAccordion && !config.divider && !context.editmode"
    :link="(hasAction && !context.editmode) ? true : undefined"
    @click.stop="openAccordionOrPerformAction"
    :class="{ 'oh-equipment-accordion-item': isEquipmentAccordion }"
    ref="f7AccordionContent">
    <template v-if="$slots.inner" #inner>
      <slot name="inner" />
    </template>
    <template v-if="$slots.content" #content>
      <slot name="content" />
    </template>
    <template v-if="$slots['root-end']" #root-end>
      <slot name="root-end" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
    <template v-if="$slots.after || context.component.slots?.after?.length" #after>
      <template v-if="context.component.slots?.after?.length">
        <generic-widget-component :context="childContext(context.component.slots.after[0])" />
      </template>
      <template v-if="$slots.after">
        <slot name="after" />
      </template>
    </template>
    <f7-accordion-content v-if="isRegularAccordion && !context.editmode">
      <generic-widget-component :context="childContext(accordionSlots[0])" />
    </f7-accordion-content>
    <template #root>
      <f7-accordion-content v-if="isEquipmentAccordion && !context.editmode">
        <generic-widget-component :context="childContext(accordionSlots[0])" />
      </f7-accordion-content>
    </template>
    <template
      v-if="$slots.media || config.icon || (config.fallbackIconToInitial && config.title && context.parent.component.config && context.parent.component.config.mediaList)"
      #media>
      <oh-icon
        v-if="config.icon"
        :icon="config.icon"
        height="32"
        width="32"
        :color="config.iconColor"
        :state="config.item && config.iconUseState ? context.store[config.item].state : null" />
      <span
        v-else-if="config.fallbackIconToInitial && config.title && context.parent.component.config && context.parent.component.config.mediaList"
        class="item-initial"
        >{{ config.title[0].toUpperCase() }}</span
      >
    </template>
  </f7-list-item>
</template>

<style lang="stylus">
.oh-equipment-accordion-item
  .item-link .item-inner:after
    transition-duration 300ms

  > .item-content
    cursor pointer

    &:active
      background var(--f7-list-link-pressed-bg-color)

  .list,
  .block
    margin-top 0
    margin-bottom 0

  .block
    > h1,
    > h2,
    > h3,
    > h4,
    > p
      &:first-child
        margin-top 10px

      &:last-child
        margin-bottom 10px

  & > ul
    ltr(padding-left 0)
    rtl(padding-right 0)

  & > .accordion-item-content > div > ul
    padding-left var(--f7-list-item-padding-horizontal) !important

  .item-inner
    padding-right calc(16px + 0px)
    padding-right calc(var(--f7-list-item-padding-horizontal) + var(--f7-safe-area-right))

  .item-title-row
    padding-right @css{ max(20px, calc(var(--f7-list-chevron-icon-area))) }

  & > .item-content > .item-inner > .item-title-row:before
    font-family 'framework7-core-icons'
    font-weight normal
    font-style normal
    font-size var(--f7-list-chevron-icon-font-size)
    line-height 1
    letter-spacing normal
    text-transform none
    white-space nowrap
    word-wrap normal
    direction ltr
    -webkit-font-smoothing antialiased
    text-rendering optimizeLegibility
    -moz-osx-font-smoothing grayscale
    -moz-font-feature-settings "liga"
    font-feature-settings "liga"
    content var(--f7-accordion-chevron-icon-down)
    width 14px
    height 8px
    margin-top -4px
    line-height 8px
    right 0
    text-align right
    display block
    width 100%
    height 100%
    position absolute
    top 50%
    color var(--f7-list-chevron-icon-color)

  &.accordion-item-opened > .item-content > .item-inner > .item-title-row:before
    content var(--f7-accordion-chevron-icon-up)

.aurora
  .oh-equipment-accordion-item
    > .item-content
      &:hover
        background var(--f7-list-link-hover-bg-color)
      &:active
        background var(--f7-list-link-pressed-bg-color)

.item-divider > span
  flex-shrink 1
  overflow hidden
</style>

<script>
import { nextTick } from 'vue'
import { f7 } from 'framework7-vue'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { actionsMixin } from '../../widget-actions'
import { OhListItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  name: 'oh-list-item',
  mixins: [actionsMixin],
  props: {
    context: Object
  },
  widget: OhListItemDefinition,
  setup (props) {
    const { config, childContext, hasAction } = useWidgetContext(props.context)
    return { config, childContext, hasAction }
  },
  computed: {
    isEquipmentAccordion () {
      return this.context.parent.component.config.accordionEquipment && this.accordionSlots.length > 0
    },
    isRegularAccordion () {
      return this.context.parent.component.config.accordionList && this.accordionSlots.length > 0
    },
    accordionSlots () {
      if (!this.context.component.slots?.accordion?.length) return []
      return this.context.component.slots.accordion
    }
  },
  created () {
    if (this.config.divider && !this.context.editmode) {
      window.addEventListener('resize', this.duringResize)
    }
  },
  methods: {
    openAccordionOrPerformAction () {
      if (this.isEquipmentAccordion) {
        f7.accordion.toggle(this.$refs.f7AccordionContent.$el)
      } else {
        this.performAction()
      }
    }
  }
}
</script>
