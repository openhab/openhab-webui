<template>
  <oh-cell :context="context" :no-swipe-to-close="true" :state="state">
    <f7-row>
      <f7-col width="100" class="cell-colorpicker display-flex flex-direction-column justify-content-center">
        <slot name="beforeColorpicker">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.beforeColorpicker"
                                      :context="childContext(slotComponent)"
                                      :key="'beforeColorpicker-' + idx" />
          </div>
        </slot>
        <oh-colorpicker :context="colorpickerContext" />
        <slot name="afterColorpicker">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.afterColorpicker"
                                      :context="childContext(slotComponent)"
                                      :key="'afterColorpicker-' + idx" />
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
    },
    state () {
      const stateParts = this.context.store[this.config.item].state.split(',')
      if (stateParts.length === 3) {
        if (parseFloat(stateParts[2]) === 0) return 'Off'
        return `On · ${stateParts[2]}%`
      } else {
        if (!isNaN(parseFloat(stateParts[0]))) return stateParts[0] + '%'
      }
      return stateParts[0]
    }
  }
}
</script>
