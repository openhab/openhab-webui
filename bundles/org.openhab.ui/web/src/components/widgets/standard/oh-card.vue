<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline" :style="config.style" :class="['oh-card', ...(Array.isArray(config.class) ? config.class : [])]">
    <slot name="header">
      <f7-card-header v-if="config.title" :style="config.headerStyle" :class="config.headerClass">
        <div>{{ config.title }}</div>
      </f7-card-header>
    </slot>
    <slot name="content-root">
      <f7-card-content @click.native="config.action ? performAction : ''" :style="{ ...contentStyle, ...config.contentStyle}" :class="[ ...(Array.isArray(contentClass) ? contentClass : ['padding']), ...(Array.isArray(config.contentClass) ? config.contentClass : []) ]">
        <slot name="content" />
      </f7-card-content>
    </slot>
    <slot name="footer">
      <f7-card-footer v-if="config.footer && !Array.isArray(config.footer)">
        {{ config.footer }}
      </f7-card-footer>
      <f7-card-footer v-else-if="config.footer && Array.isArray(config.footer)">
        <span v-for="text in config.footer" :key="text">
          {{ text }}
        </span>
      </f7-card-footer>
    </slot>
  </f7-card>
</template>

<style lang="stylus">
// Fix safe-area issues where oh-card is used inside a block or masonry layout, where the safe areas are already respected by the parent block
.oh-col >
.oh-masonry-item >
  .oh-card
    margin-left var(--f7-card-margin-horizontal)
    margin-right var(--f7-card-margin-horizontal)
</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'
import { OhCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  widget: OhCardDefinition,
  props: ['context', 'contentStyle', 'contentClass'],
  slotProps: ['header', 'content', 'content-root', 'footer']
}
</script>
