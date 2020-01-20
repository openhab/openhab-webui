<template>
  <f7-page stacked name="HomePage" class="page-home" @page:init="onPageInit">
    <f7-navbar :large="$f7.data.themeOptions.homeNavbar !== 'simple'" :large-transparent="true">
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title-large v-if="$f7.data.themeOptions.homeNavbar !== 'simple'" class="home-title-large">
        <span class="today">{{new Date().toLocaleString('default', { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
        {{title}}
      </f7-nav-title-large>
      <f7-nav-title>
        {{title}}
      </f7-nav-title>
      <!-- <f7-nav-right>
        <f7-link icon-ios="f7:sidebar_right" icon-aurora="f7:sidebar_right" icon-md="material:exit_to_app" panel-open="right"></f7-link>
      </f7-nav-right> -->
    </f7-navbar>

    <f7-toolbar tabbar labels bottom>
      <f7-link tab-link @click="currentTab = 'overview'" :tab-link-active="currentTab === 'overview'" icon-ios="f7:house_fill" icon-aurora="f7:house_fill" icon-md="material:home" text="Overview"></f7-link>
      <f7-link tab-link @click="currentTab = 'locations'" :tab-link-active="currentTab === 'locations'" icon-ios="f7:placemark_fill" icon-aurora="f7:placemark_fill" icon-md="material:place" text="Locations"></f7-link>
      <f7-link tab-link @click="currentTab = 'equipments'" :tab-link-active="currentTab === 'equipments'" icon-ios="f7:lightbulb_fill" icon-aurora="f7:lightbulb_fill" icon-md="material:highlight" text="Equipments"></f7-link>
      <f7-link tab-link @click="currentTab = 'properties'" :tab-link-active="currentTab === 'properties'" icon-ios="f7:bolt_fill" icon-aurora="f7:bolt_fill" icon-md="material:flash_on" text="Properties"></f7-link>
    </f7-toolbar>

    <f7-tabs :class="{ 'after-big-title': $f7.data.themeOptions.homeNavbar !== 'simple' }" v-if="items">
      <f7-tab id="tab-overview" :tab-active="currentTab === 'overview'" @tab:show="() => this.currentTab = 'overview'">
        <overview-tab v-if="currentTab === 'overview'" :items="items" />
      </f7-tab>
      <f7-tab id="tab-locations" :tab-active="currentTab === 'locations'" @tab:show="() => this.currentTab = 'locations'">
        <locations-tab v-if="currentTab === 'locations'" :semantic-items="semanticItems" />
      </f7-tab>
      <f7-tab id="tab-equipments" :tab-active="currentTab === 'equipments'" @tab:show="() => this.currentTab = 'equipments'">
        <equipments-tab v-if="currentTab === 'equipments'" :semantic-items="semanticItems" />
      </f7-tab>
      <f7-tab id="tab-properties" :tab-active="currentTab === 'properties'" @tab:show="() => this.currentTab = 'properties'">
        <properties-tab v-if="currentTab === 'properties'" :semantic-items="semanticItems" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.home-title-large .title-large-text
  line-height 0.95
  .today
    position absolute
    font-size 8pt
    font-weight normal
    text-transform uppercase
    top -6px
    letter-spacing 1px
    color var(--f7-list-item-footer-text-color)
</style>

<script>
import OverviewTab from './home/overview-tab.vue'
import LocationsTab from './home/locations-tab.vue'
import EquipmentsTab from './home/equipments-tab.vue'
import PropertiesTab from './home/properties-tab.vue'

export default {
  components: {
    OverviewTab,
    LocationsTab,
    EquipmentsTab,
    PropertiesTab
  },
  data () {
    return {
      showSetup: true,
      showTasks: true,
      showCards: false,
      currentTab: 'overview',
      items: [],
      semanticItems: {}
    }
  },
  created () {
    this.$oh.api.get('/rest/items?metadata=semantics').then((data) => {
      this.items = data
      // get the location items
      this.semanticItems.locations = data.filter((item, index, items) => {
        return item.metadata && item.metadata.semantics &&
          item.metadata.semantics.value.indexOf('Location_') === 0
      }).sort((a, b) => {
        const titleA = a.label || a.name
        const titleB = b.label || b.name
        return titleA.localeCompare(titleB)
      }).map((l) => {
        return {
          item: l,
          properties: data.filter((item, index, items) => {
            return item.metadata && item.metadata.semantics &&
              item.metadata.semantics && item.metadata.semantics.config &&
              item.metadata.semantics.config.relatesTo &&
              item.metadata.semantics.config.hasLocation === l.name
          }),
          equipments: data.filter((item, index, items) => {
            return item.metadata && item.metadata.semantics &&
              item.metadata.semantics && item.metadata.semantics.config &&
              item.metadata.semantics.value.indexOf('Equipment_') === 0 &&
              item.metadata.semantics.config.hasLocation === l.name
          }).map((item) => {
            return {
              item: item,
              points: data.filter((item2, index, items) => {
                return item2.metadata && item2.metadata.semantics &&
                  item2.metadata.semantics && item2.metadata.semantics.config &&
                  item2.metadata.semantics.config.isPointOf === item.name
              })
            }
          })
        }
      })

      // get the equipment items
      this.semanticItems.equipments = data.filter((item, index, items) => {
        return item.metadata && item.metadata.semantics &&
          item.metadata.semantics &&
          item.metadata.semantics.value.indexOf('Equipment_') === 0
      }).reduce((prev, item, i, properties) => {
        const equipmentType = item.metadata.semantics.value.split('_')[1]
        if (!prev[equipmentType]) prev[equipmentType] = []
        const equipmentWithPoints = {
          item: item,
          points: data.filter((item2, index, items) => {
            return item2.metadata && item2.metadata.semantics &&
              item2.metadata.semantics && item2.metadata.semantics.config &&
              item2.metadata.semantics.config.isPointOf === item.name
          })
        }
        prev[equipmentType].push(equipmentWithPoints)
        return prev
      }, {})

      // get the property items
      this.semanticItems.properties = data.filter((item, index, items) => {
        return item.metadata && item.metadata.semantics &&
          item.metadata.semantics && item.metadata.semantics.config &&
          item.metadata.semantics.config.relatesTo
      }).reduce((prev, item, i, properties) => {
        const property = item.metadata.semantics.config.relatesTo.split('_')[1]
        if (!prev[property]) prev[property] = []
        prev[property].push(item)
        return prev
      }, {})
    })
  },
  methods: {
    onPageInit () {
      this.$f7.panel.get('left').enableVisibleBreakpoint()
    },
    skipSetupWizard () {
      const vm = this
      this.$f7.dialog.confirm(
        'Are you sure? You currently only have a minimal set of features available and you will need to install all essential add-ons by hand!',
        'Skip Setup Wizard',
        () => {
          vm.showSetup = false
        }
      )
    },
    dismissTasks () {
      this.showTasks = false
    },
    displayCards () {
      setTimeout(() => { this.showCards = true }, 3000)
    }
  },
  computed: {
    title () {
      switch (this.currentTab) {
        case 'overview':
          return 'Home'
        case 'locations':
          return 'Locations'
        case 'equipments':
          return 'Equipments'
        case 'properties':
          return 'Properties'
        default:
          return 'Home'
      }
    }
  }
}
</script>
