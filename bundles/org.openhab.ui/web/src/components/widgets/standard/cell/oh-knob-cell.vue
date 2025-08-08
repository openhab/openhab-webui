<template>
  <oh-cell :context="context" :no-swipe-to-close="true">
    <f7-row>
      <f7-col width="100" style="height: 400px" class="cell-knob display-flex flex-direction-column align-items-center">
        <slot name="beforeKnob">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component :context="childContext(slotComponent)"
                                      v-for="(slotComponent, idx) in context.component.slots.beforeKnob"
                                      :key="'beforeKnob-' + idx"
                                      @command="onCommand" />
          </div>
        </slot>
        <oh-knob :context="knobContext" />
        <slot name="afterKnob">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component :context="childContext(slotComponent)"
                                      v-for="(slotComponent, idx) in context.component.slots.afterKnob"
                                      :key="'afterKnob-' + idx"
                                      @command="onCommand" />
          </div>
        </slot>
      </f7-col>
    </f7-row>
  </oh-cell>
</template>

<style lang="stylus">
</style>

<script>
import mixin from '../../widget-mixin'
import { OhKnobCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'
import OhKnob from '../../system/oh-knob.vue'

export default {
  mixins: [mixin],
  components: {
    OhCell,
    OhKnob
  },
  widget: OhKnobCellDefinition,
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
