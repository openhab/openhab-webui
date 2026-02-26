<template>
  <model-card type="equipment" :context="context" :element="element" header-height="150px">
    <template #glance>
      <div v-if="'glance' in slots" class="display-flex flex-direction-column align-items-flex-start">
        <generic-widget-component
          v-for="(slotComponent, idx) in slots.glance"
          :context="childContext(slotComponent)"
          :key="'glance-' + idx" />
      </div>
      <!-- <div class="equipment-stats" v-else><small v-if="element.equipment">{{element.equipment.length}}</small></div> -->
    </template>
    <div class="card-content-padding">
      <generic-widget-component :context="listContext" />
      <p>
        <f7-button fill round large card-close :color="color" class="margin-horizontal" :text="$t('home.cards.close')" />
      </p>
    </div>
  </model-card>
</template>

<style lang="stylus" scoped>
.equipment-card
  height 150px
.equipment-stats
  font-weight normal
</style>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { equipmentListComponent } from '@/components/widgets/standard/list/default-list-item'
import CardMixin from './card-mixin'
import ModelCard from './model-card.vue'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [CardMixin],
  props: {
    context: Object,
    tabContext: Object,
    element: Object
  },
  components: {
    ModelCard
  },
  data () {
    return {
      type: 'equipment'
    }
  },
  setup (props) {
    const { config, childContext, slots } = useWidgetContext(props.context)
    return { config, childContext, slots }
  },
  computed: {
    listContext () {
      const contextLabelDefaults = { contextLabelSource: 'path' }
      return {
        store: useStatesStore().trackedItems,
        component: equipmentListComponent(this.element.equipment, { ...contextLabelDefaults, ...this.tabContext }, false)
      }
    }
  }
}
</script>
