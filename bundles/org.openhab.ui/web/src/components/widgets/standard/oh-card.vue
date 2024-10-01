<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline" :style="config.style" :class="config.class">
    <slot name="header">
      <f7-card-header v-if="config.title" :style="config.headerStyle" :class="config.headerClass">
        <div>{{ config.title }}</div>
      </f7-card-header>
    </slot>
    <slot name="content-root">
      <f7-card-content @click.native="performAction" :style="config.contentStyle" :class="[ ...(Array.isArray(contentClass) ? contentClass : ['padding']), ...(Array.isArray(config.contentClass) ? config.contentClass : []) ]">
        <slot name="content" />
      </f7-card-content>
    </slot>
    <slot name="footer">
      <oh-card-footer v-if="config.footer" :texts="config.footer" :style="config.footerStyle" :class="config.footerClass" />
    </slot>
  </f7-card>
</template>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'
import OhCardFooter from '@/components/widgets/system/oh-card-footer.vue'

export default {
  mixins: [mixin, actionsMixin],
  components: { OhCardFooter },
  props: ['context', 'contentStyle', 'contentClass'],
  slotProps: ['header', 'content', 'content-root', 'footer']
}
</script>
