<template>
  <f7-card expandable class="location-card" :animate="$f7.data.themeOptions.expandableCardAnimation !== 'disabled'" card-tablet-fullscreen v-on:card:opened="cardOpening" v-on:card:closed="cardClosed">
    <f7-card-content :padding="false">
      <div :class="`bg-color-${color}`" :style="{height: '200px'}">
        <f7-card-header text-color="white" class="display-block">
          {{title || 'Something'}}
          <div><small>{{subtitle || '&nbsp;'}}</small></div>
          <div class="location-stats" v-if="items.equipments.length > 0"><small><f7-icon ios="f7:cube_box" aurora="f7:cube_box" md="material:payments" />&nbsp;{{items.equipments.length}}</small></div>
          <div class="location-stats" v-if="items.properties.length > 0"><small><f7-icon ios="f7:bolt" aurora="f7:bolt" md="material:flash_on" />&nbsp;{{items.properties.length}}</small></div>
        </f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in"
          :style="{position: 'absolute', right: '15px', top: '15px'}"
          icon-f7="multiply_circle_fill"
        ></f7-link>
      </div>
      <div class="card-content-padding" v-if="opened && items.equipments.length > 0 && items.properties.length > 0">
        <f7-segmented round tag="p">
          <f7-button round outline :active="activeTab === 'equipments'" :color="color" @click="activeTab = 'equipments'">Equipment</f7-button>
          <f7-button round outline :active="activeTab === 'properties'" :color="color" @click="activeTab = 'properties'">Properties</f7-button>
        </f7-segmented>
      </div>
      <div v-if="opened">
        <generic-widget-component v-if="activeTab === 'equipments'" :context="equipmentsListContext" />
        <generic-widget-component v-if="activeTab === 'properties'" :context="propertiesListContext" />
        <p>
          <f7-button fill round large card-close :color="color" class="margin-horizontal">Close</f7-button>
        </p>
      </div>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
.location-card
  height 200px
.location-stats
  font-weight normal
</style>

<script>
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'

export default {
  props: ['color', 'type', 'header', 'title', 'subtitle', 'items'],
  data () {
    return {
      opened: false,
      activeTab: (this.items.equipments.length === 0 && this.items.properties.length > 0) ? 'properties' : 'equipments'
    }
  },
  methods: {
    cardOpening () {
      console.log('card opened')
      setTimeout(() => { this.opened = true })
    },
    cardClosed () {
      console.log('card closed')
      this.opened = false
    }
  },
  computed: {
    propertiesListContext () {
      return {
        store: this.$store.getters.trackedItems,
        component: {
          component: 'oh-list',
          config: {
            mediaList: true
          },
          slots: {
            default: this.items.properties.map(itemDefaultListComponent)
          }
        }
      }
    },
    equipmentsListContext () {
      const standaloneEquipments = this.items.equipments.filter((i) => i.points.length === 0).map((i) => itemDefaultListComponent(i.item))
      const equipmentsWithPoints = this.items.equipments.filter((i) => i.points.length !== 0).map((i) => {
        return [
          {
            component: 'oh-list-item',
            config: {
              title: i.item.label || i.item.name,
              divider: true
            }
          },
          ...i.points.map((p) => itemDefaultListComponent(p))
        ]
      })

      return {
        store: this.$store.getters.trackedItems,
        component: {
          component: 'oh-list',
          config: {
            mediaList: true
          },
          slots: {
            default: [...standaloneEquipments, ...equipmentsWithPoints].flat()
          }
        }
      }
    }
  }
}
</script>
