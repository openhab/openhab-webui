<template>
<div>
  <div class="hint-apps" v-if="!overviewPage && !$store.getters.user">
    <p><em><f7-icon class="float-right margin-left margin-bottom" f7="arrow_turn_right_up" size="20" />Open the apps panel to launch other interfaces</em></p>
  </div>
  <f7-block class="block-narrow">
    <habot v-if="showHABot" />
    <other-apps v-if="showApps" />
    <f7-col>
    </f7-col>
  </f7-block>

  <f7-block v-if="!$store" class="text-align-center">
    <f7-preloader></f7-preloader>
    <div>Loading...</div>
  </f7-block>

  <component :is="overviewPage.component" v-if="overviewPage" :context="overviewPageContext" :class="{notready: !ready}" @command="onCommand" />
  <div class="empty-overview" v-else>
    <empty-state-placeholder icon="house" title="overview.title" text="overview.text" />
    <f7-row class="display-flex justify-content-center">
      <f7-button large fill color="blue" external href="https://next.openhab.org/docs/" target="_blank">Documentation</f7-button>
      <span style="width: 8px"></span>
      <f7-button large color="blue" external href="https://next.openhab.org/docs/tutorial/" target="_blank">Tutorial</f7-button>
    </f7-row>
  </div>
  <!-- <h2 class="home-header">
    Now
  </h2> -->

  <!-- <div class="demo-expandable-cards" v-if="showCards && ready">
    <expandable-card color="teal" header="gauge" />
    <h2 class="home-header">Favorites</h2>
    <h3 class="home-header">Scenes</h3>
    <f7-block style="text-align: center">No favorite scenes defined</f7-block>
    <h3 class="home-header">Cards</h3>
    <expandable-card color="red" header="temperature" title="Thermostat Upstairs" />
    <expandable-card color="blue" header="temperature" title="Thermostat Downstairs" />
    <expandable-card color="green" header="gauge" />
    <expandable-card color="deeppurple" />
    <expandable-card color="black" header="player" title="SONOS Multiroom" />
    <expandable-card color="blue" header="image" title="Webcam Front Door" />
  </div> -->

  <!-- <f7-block v-if="showCards && ready">
    <f7-button small @click="showSetup = true; showTasks = true; showCards = false; showHABot = false">Simulate first-time run</f7-button>
  </f7-block> -->
</div>

</template>

<style lang="stylus">
.home-header
  display block
  width calc(100% - 30px)
  margin-left calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left))
.hint-apps
  position absolute
  top calc(var(--f7-page-navbar-offset, 0px) + var(--f7-page-content-extra-padding-top, 0px))
  right 1rem
  width 60%
  p
    text-align right
.empty-overview
  padding-top 0.3rem
</style>

<script>
// import ExpandableCard from '../../components/expandable-card.vue'
// import OtherApps from '../../components/home/other-apps.vue'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import Habot from '../../components/home/habot.vue'

export default {
  props: ['context', 'items'],
  components: {
    OhLayoutPage,
    Habot
  },
  data () {
    return {
      showSetup: false,
      showTasks: false,
      showApps: false,
      showCards: false,
      showHABot: false,
      ready: true
    }
  },
  computed: {
    overviewPage () {
      const page = this.$store.getters.page('overview')
      if (!page) return null
      if (page.component !== 'oh-layout-page') return null
      return page
    },
    overviewPageContext () {
      return {
        component: this.overviewPage,
        store: this.context.store
      }
    }
  },
  methods: {
    onCommand (itemName, command) {
      this.$store.dispatch('sendCommand', { itemName, command })
    }
  }
}
</script>
