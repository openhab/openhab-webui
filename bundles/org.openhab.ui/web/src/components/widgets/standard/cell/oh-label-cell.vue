<template>
  <oh-cell :context="context" class="label-cell">
    <template v-slot:header>
      <f7-list media-list>
        <f7-list-item :title="config.title" :subtitle="config.subtitle" :footer="config.footer">
          <div class="state" :style="config.stateStyle">{{config.label || context.store[config.item].displayState || context.store[config.item].state}}</div>
        </f7-list-item>
      </f7-list>
    </template>
  </oh-cell>
</template>

<style lang="stylus">
.label-cell
  --oh-label-cell-state-font-size 42px
  .state
    font-weight normal
    font-size var(--oh-label-cell-state-font-size)
</style>

<script>
import mixin from '../../widget-mixin'
import { OhLabelCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'

export default {
  mixins: [mixin],
  components: {
    OhCell
  },
  widget: OhLabelCellDefinition
}
</script>
