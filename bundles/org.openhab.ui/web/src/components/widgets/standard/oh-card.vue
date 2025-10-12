<template>
  <f7-card :no-border="config.noBorder ? true : null"
           :no-shadow="config.noShadow ? true : null"
           :outline="config.outline ? true : null"
           :style="config.style"
           :class="['oh-card', ...(Array.isArray(config.class) ? config.class : [])]">
    <slot name="header">
      <f7-card-header v-if="config.title" :style="config.headerStyle" :class="config.headerClass">
        <div>{{ config.title }}</div>
      </f7-card-header>
    </slot>
    <slot name="content-root">
      <f7-card-content @click.native="performAction"
                       @taphold.native="onTaphold($event)"
                       @contextmenu.native="onContextMenu($event)"
                       :style="{ ...contentStyle, ...config.contentStyle}"
                       :class="computedContentClass">
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
.oh-card
  .card-link
    cursor pointer
  .card-link:hover
    background var(--f7-list-link-hover-bg-color)
</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'
import { OhCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  widget: OhCardDefinition,
  props: ['context', 'contentStyle', 'contentClass'],
  slotProps: ['header', 'content', 'content-root', 'footer'],
  computed: {
    computedContentClass () {
      return [
        ...(this.hasAction ? ['card-link'] : []),
        ...(Array.isArray(this.contentClass) ? this.contentClass : ['padding']),
        ...(Array.isArray(this.config.contentClass) ? this.config.contentClass : [])
      ]
    }
  }
}
</script>
