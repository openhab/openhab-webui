<template>
  <f7-card expandable class="equipments-card" :animate="$f7.data.themeOptions.expandableCardAnimation !== 'disabled'" card-tablet-fullscreen v-on:card:opened="cardOpening" v-on:card:closed="cardClosed">
    <f7-card-content :padding="false">
      <div :class="`bg-color-${color}`" :style="{height: '150px'}">
        <f7-card-header text-color="white" class="display-block">
          {{title || 'Something'}}
          <div class="equipment-stats"><small v-if="subtitle">{{subtitle}}</small></div>
          <br>
          <!-- <h1>State</h1> -->
        </f7-card-header>
        <f7-link
          card-close
          color="white"
          class="card-opened-fade-in"
          :style="{position: 'absolute', right: '15px', top: '15px'}"
          icon-f7="multiply_circle_fill"
        ></f7-link>
      </div>
      <div v-if="opened">
        <generic-widget-component :context="listContext" />
        <p>
          <f7-button fill round large card-close :color="color" class="margin-horizontal">Close</f7-button>
        </p>
      </div>
    </f7-card-content>
  </f7-card>
</template>

<style lang="stylus">
.equipments-card
  height 150px
.equipment-stats
  font-weight normal
</style>

<script>
import itemDefaultListComponent from '@/components/widgets/standard/list/default-list-item'

export default {
  props: ['color', 'type', 'header', 'title', 'subtitle', 'items'],
  data () {
    return {
      opened: false
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
    listContext () {
      const standaloneEquipments = this.items.filter((i) => i.points.length === 0).map((i) => itemDefaultListComponent(i.item, true))
      const equipmentsWithPoints = this.items.filter((i) => i.points.length !== 0).map((i) => {
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
