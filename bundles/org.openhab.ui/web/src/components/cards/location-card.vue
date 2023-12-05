<template>
  <model-card type="location" :context="context" :element="element" header-height="200px">
    <template #glance>
      <div v-if="!subtitle && parentLocation" class="subtitle">
        <small>{{ parentLocation }}</small>
      </div>
      <div v-if="context && context.component.slots && context.component.slots.glance" class="display-flex flex-direction-column align-items-flex-start">
        <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.glance" :key="'glance-' + idx" @command="onCommand" />
      </div>
      <div class="location-stats margin-top" :class="config.invertText ? 'invert-text' : ''" v-if="!config.disableBadges">
        <span v-for="badgeType in ['temperature', 'humidity', 'co2', 'luminance']" :key="badgeType">
          <measurement-badge v-if="!config.badges || !config.badges.length || config.badges.indexOf(badgeType) >= 0"
                             :store="context.store" :element="element" :type="badgeType" :invert-color="config.invertText" :badgeOverrides="badgeOverrides" />
        </span>
      </div>
      <div class="location-stats margin-top-half" v-if="!config.disableBadges">
        <span v-for="badgeType in ['alarms', 'battery', 'lights', 'windows', 'doors', 'garagedoors', 'blinds', 'presence', 'lock', 'climate', 'screens', 'projectors', 'speakers']" :key="badgeType">
          <status-badge v-if="!config.badges || !config.badges.length || config.badges.indexOf(badgeType) >= 0"
                        :store="context.store" :element="element" :type="badgeType" :invert-color="config.invertText" :badgeOverrides="badgeOverrides" />
        </span>        
      </div>
    </template>
    <div class="card-content-padding">
      <f7-segmented round tag="p" v-if="element.equipment.length > 0 && element.properties.length > 0">
        <f7-button round outline :active="activeTab === 'equipment'" :color="color" @click="activeTab = 'equipment'" :text="$t('home.equipment.tab')" />
        <f7-button round outline :active="activeTab === 'properties'" :color="color" @click="activeTab = 'properties'" :text="$t('home.properties.tab')" />
      </f7-segmented>
      <generic-widget-component v-if="activeTab === 'equipment'" class="margin-vertical" :key="cardId + '-equipment'" :context="equipmentListContext" />
      <generic-widget-component v-if="activeTab === 'properties'" class="margin-vertical" key="'cardId + '-properties'" :context="propertiesListContext" />
      <p>
        <f7-button fill round large card-close :color="color" class="margin-horizontal" :text="$t('home.cards.close')" />
      </p>
    </div>
  </model-card>
</template>

<style lang="stylus">
.location-card
  height 200px
.location-stats
  font-weight normal
  font-size 16px
  max-width calc(340px - 2*var(--f7-card-header-padding-horizontal))
  display flex
  flex-wrap wrap
</style>

<script>
import mixin from '@/components/widgets/widget-mixin'
import itemDefaultListComponent, { equipmentListComponent } from '@/components/widgets/standard/list/default-list-item'
import CardMixin from './card-mixin'
import ModelCard from './model-card.vue'
import StatusBadge from './glance/location/status-badge.vue'
import MeasurementBadge from './glance/location/measurement-badge.vue'

export default {
  mixins: [mixin, CardMixin],
  props: ['parentLocation', 'tabContext'],
  components: {
    ModelCard,
    StatusBadge,
    MeasurementBadge
  },
  data () {
    return {
      activeTab: (this.element.equipment.length === 0 && this.element.properties.length > 0) ? 'properties' : 'equipment'
    }
  },
  computed: {
    badgeOverrides () {
      return this.config.badges || this.context.badgeOverrides
    },
    propertiesListContext () {
      return {
        store: this.$store.getters.trackedItems,
        component: {
          component: 'oh-list',
          config: {
            mediaList: true
          },
          slots: {
            default: this.element.properties.map((i) => itemDefaultListComponent(i))
          }
        }
      }
    },
    equipmentListContext () {
      return {
        store: this.$store.getters.trackedItems,
        component: equipmentListComponent(this.element.item.equipment, this.tabContext, true)
      }
    }
  }
}
</script>
