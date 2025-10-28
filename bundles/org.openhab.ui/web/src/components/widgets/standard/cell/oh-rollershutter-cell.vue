<template>
  <oh-cell class="cell-expanded-thin" :context="context" :no-swipe-to-close="true">
    <f7-row>
      <f7-col width="100" class="cell-rollershutter display-flex flex-direction-column justify-content-center">
        <slot name="beforeRollershutter">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.beforeRollershutter"
                                      :context="childContext(slotComponent)"
                                      :key="'beforeRollershutter-' + idx" />
          </div>
        </slot>
        <oh-rollershutter class="rollershutter-controls" :context="rollershutterContext" />
        <slot name="afterRollershutter">
          <div v-if="context.component.slots" class="margin-top display-flex flex-direction-column justify-content-center">
            <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.afterRollershutter"
                                      :context="childContext(slotComponent)"
                                      :key="'afterRollershutter-' + idx" />
          </div>
        </slot>
      </f7-col>
    </f7-row>
  </oh-cell>
</template>

<style lang="stylus">
@media (min-width: 768px) and (min-height: 670px)
  .cell-expanded-thin:not(.card-tablet-fullscreen)
    max-width var(--oh-default-cell-tablet-width) !important
.cell-expanded-thin
  --f7-card-expandable-tablet-width 400px
.cell-rollershutter
  .rollershutter-controls
    position absolute
    top 50%
    transform scaleY(2) scaleX(2) rotate(90deg)
    transform-origin center
</style>

<script>
import mixin from '../../widget-mixin'
import { OhRollershutterCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'
import OhRollershutter from '../../system/oh-rollershutter.vue'

export default {
  mixins: [mixin],
  components: {
    OhCell,
    OhRollershutter
  },
  widget: OhRollershutterCellDefinition,
  computed: {
    rollershutterContext () {
      return Object.assign({}, this.context, {
        component: {
          component: 'oh-rollershutter',
          config: Object.assign({}, this.context.component.config, {
            vertical: true
          })
        }
      })
    }
  }
}
</script>
