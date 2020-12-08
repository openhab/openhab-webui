<template>
<div>
  <div class="hint-apps" v-if="!overviewPage && !$store.getters.user && !showHABot">
    <p><em><f7-icon class="float-right margin-left margin-bottom" f7="arrow_turn_right_up" size="20" />{{ $t('home.tip.otherApps') }}</em></p>
  </div>
  <f7-block class="block-narrow">
    <habot v-if="showHABot" @session-started="inChatSession = true" @session-end="inChatSession = false" />
    <other-apps v-if="showApps" />
    <f7-col>
    </f7-col>
  </f7-block>

  <f7-block v-if="!$store" class="text-align-center">
    <f7-preloader></f7-preloader>
    <div>Loading...</div>
  </f7-block>

  <component :is="overviewPage.component" v-if="overviewPage" v-show="!inChatSession" :context="overviewPageContext" :class="{notready: !ready}" @command="onCommand" />
  <div class="empty-overview" v-else-if="!inChatSession">
    <empty-state-placeholder icon="house" title="overview.title" text="overview.text" />
    <f7-row class="display-flex justify-content-center">
      <f7-button large fill color="blue" external href="https://next.openhab.org/docs/" target="_blank" v-t="'home.overview.button.documentation'"></f7-button>
      <span style="width: 8px"></span>
      <f7-button large color="blue" external href="https://next.openhab.org/docs/tutorial/" target="_blank" v-t="'home.overview.button.tutorial'"></f7-button>
    </f7-row>
  </div>
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
  props: ['context', 'allowChat'],
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
      inChatSession: false,
      ready: true
    }
  },
  computed: {
    showHABot () {
      return this.$store.getters.apiEndpoint('habot') && this.allowChat && localStorage.getItem('openhab.ui:theme.home.hidechatinput') !== 'true'
    },
    overviewPage () {
      const page = this.$store.getters.page('overview')
      if (!page) return null
      if (page.component !== 'oh-layout-page') return null
      if (!page.slots || (!page.slots.default.length && !page.slots.masonry)) return null
      return page
    },
    overviewPageContext () {
      return {
        component: this.overviewPage,
        store: this.context.store,
        vars: {}
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
