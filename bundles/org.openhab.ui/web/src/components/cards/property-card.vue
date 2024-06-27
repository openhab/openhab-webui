<template>
  <model-card type="property" :context="context" :element="element" header-height="150px">
    <template #glance>
      <div v-if="context && context.component.slots && context.component.slots.glance" class="display-flex flex-direction-column align-items-flex-start">
        <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.glance" :key="'glance-' + idx" @command="onCommand" />
      </div>
      <!-- <div class="property-stats" v-else><small v-if="element.points">{{element.points.length}}</small></div> -->
    </template>
    <div class="card-content-padding">
      <generic-widget-component :context="listContext" />
      <p class="padding-top margin-horizontal">
        <f7-button outline round :color="color" :href="`/analyzer/?items=${element.points.map((m) => m.name).join(',')}`">
          {{ element.points.length > 1 ? $t('home.cards.analyzeAll') : $t('home.cards.analyze') }}
        </f7-button>
      </p>
      <p class="margin-horizontal">
        <f7-button fill round large card-close :color="color" :text="$t('home.cards.close')" />
      </p>
    </div>
  </model-card>
</template>

<style lang="stylus" scoped>
.property-card
  height 150px
.property-stats
  font-weight normal
</style>

<script>
import mixin from '@/components/widgets/widget-mixin'
import itemDefaultListComponent, { itemPathLabel } from '@/components/widgets/standard/list/default-list-item'
import CardMixin from './card-mixin'
import ModelCard from './model-card.vue'

export default {
  mixins: [mixin, CardMixin],
  props: ['tabContext'],
  components: {
    ModelCard
  },
  computed: {
    listContext () {
      const footerDefaults = { contextLabelSource: 'path' }
      let pointsByType = []
      for (let pointType in this.itemsByPointType) {
        pointsByType.push([
          {
            component: 'oh-list-item',
            config: {
              title: this.$t(pointType),
              divider: true
            }
          },
          ...this.itemsByPointType[pointType].map((p) => itemDefaultListComponent(p, { ...footerDefaults, ...this.tabContext }))
        ])
      }

      return {
        store: this.$store.getters.trackedItems,
        component: {
          component: 'oh-list',
          config: {
            mediaList: true
          },
          slots: {
            default: pointsByType.flat()
          }
        }
      }
    },
    itemsByPointType () {
      const points = {}
      this.element.points.forEach((item) => {
        const pointType = item.metadata.semantics.value.replace(/^.*_/g, '')
        if (!points[pointType]) points[pointType] = []
        points[pointType].push(item)
      })
      return points
    }
  }
}
</script>
