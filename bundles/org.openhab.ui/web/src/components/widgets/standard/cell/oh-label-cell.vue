<template>
  <oh-cell :context="context" class="label-cell">
    <template #header>
      <f7-list media-list>
        <f7-list-item media-item :subtitle="config.subtitle" :footer="config.footer">
          <div slot="title" class="button-header display-flex">
            <oh-icon class="header-icon"
                     v-if="config.icon"
                     :icon="config.icon"
                     :color="config.iconColor"
                     width="20"
                     height="20" />
            <span>{{ config.title || config.header }}</span>
            <f7-badge v-if="config.headerBadge" :color="config.headerBadgeColor">
              {{ config.headerBadge }}
            </f7-badge>
          </div>
          <div class="state" :style="config.stateStyle">
            {{ label }}
          </div>
        </f7-list-item>
      </f7-list>
    </template>
  </oh-cell>
</template>

<style lang="stylus">
.label-cell
  --oh-label-cell-state-font-size 24px
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
  widget: OhLabelCellDefinition,
  computed: {
    label () {
      return this.config.label || this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
    }
  }
}
</script>
