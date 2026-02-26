<template>
  <oh-cell :context="context" class="label-cell">
    <template #header>
      <f7-list media-list>
        <f7-list-item media-item :subtitle="config.subtitle" :footer="config.footer">
          <template #title>
            <div class="button-header display-flex">
              <oh-icon v-if="config.icon" class="header-icon" :icon="config.icon" :color="config.iconColor" width="20" height="20" />
              <span>{{ config.title || config.header }}</span>
              <f7-badge v-if="config.headerBadge" :color="config.headerBadgeColor">
                {{ config.headerBadge }}
              </f7-badge>
            </div>
          </template>
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
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhLabelCellDefinition } from '@/assets/definitions/widgets/standard/cells'
import OhCell from './oh-cell.vue'

export default {
  props: {
    context: Object
  },
  components: {
    OhCell
  },
  widget: OhLabelCellDefinition,
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  computed: {
    label () {
      return this.config.label || this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
    }
  }
}
</script>
