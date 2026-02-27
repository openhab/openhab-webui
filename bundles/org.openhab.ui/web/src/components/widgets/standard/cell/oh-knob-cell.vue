<template>
  <oh-cell :context="context" :no-swipe-to-close="true">
    <f7-row>
      <f7-col width="100" style="height: 400px" class="cell-knob display-flex flex-direction-column align-items-center">
        <slot name="beforeKnob">
          <div v-if="'beforeKnob' in slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component
              v-for="(slotComponent, idx) in slots.beforeKnob"
              :context="childContext(slotComponent)"
              :key="'beforeKnob-' + idx" />
          </div>
        </slot>
        <oh-knob :context="knobContext" />
        <slot name="afterKnob">
          <div v-if="'afterKnob' in slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component
              v-for="(slotComponent, idx) in slots.afterKnob"
              :context="childContext(slotComponent)"
              :key="'afterKnob-' + idx" />
          </div>
        </slot>
      </f7-col>
    </f7-row>
  </oh-cell>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhKnobCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'
import OhKnob from '../../system/oh-knob.vue'

export default {
  props: {
    context: Object
  },
  components: {
    OhCell,
    OhKnob
  },
  widget: OhKnobCellDefinition,
  setup (props) {
    const { childContext, slots } = useWidgetContext(props.context)
    return { childContext, slots }
  },
  computed: {
    knobContext () {
      return Object.assign({}, this.context, {
        component: {
          component: 'oh-knob',
          config: Object.assign({}, this.context.component.config, {
            size: 350
          })
        }
      })
    }
  }
}
</script>
