<template>
  <oh-cell :context="context" :no-swipe-to-close="true">
    <f7-row>
      <f7-col width="100" class="cell-colorpicker display-flex flex-direction-column justify-content-center">
        <slot name="beforeColorpicker">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.beforeColorpicker" :key="'beforeColorpicker-' + idx" @command="onCommand" />
          </div>
        </slot>
        <oh-colorpicker :context="colorpickerContext">
        </oh-colorpicker>
        <slot name="afterColorpicker">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.afterColorpicker" :key="'afterColorpicker-' + idx" @command="onCommand" />
          </div>
        </slot>
      </f7-col>
    </f7-row>
  </oh-cell>
</template>

<script>
import mixin from '../../widget-mixin'
import { OhColorpickerCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'
import OhColorpicker from '../../system/oh-colorpicker.vue'

export default {
  mixins: [mixin],
  components: {
    OhCell,
    OhColorpicker
  },
  widget: OhColorpickerCellDefinition,
  computed: {
    colorpickerContext () {
      return Object.assign({}, this.context, {
        component: {
          component: 'oh-colorpicker',
          config: Object.assign({}, this.context.component.config, {
            modules: this.context.component.config.modules || ['wheel']
          })
        }
      })
    }
  }
}
</script>
