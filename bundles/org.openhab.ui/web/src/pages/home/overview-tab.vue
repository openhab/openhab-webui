<template>
  <div :style="pageStyle">
    <div class="hint-apps" v-if="!overviewPage && !userStore.user && !showHABot">
      <p>
        <em>
          <f7-icon
            class="float-right margin-left margin-bottom"
            f7="arrow_turn_right_up"
            size="20" />{{ $t('home.tip.otherApps') }}
        </em>
      </p>
    </div>
    <f7-block class="block-narrow">
      <habot v-if="showHABot" @session-started="inChatSession = true" @session-end="inChatSession = false" />
    </f7-block>

    <f7-block v-if="!ready" class="text-align-center">
      <f7-preloader />
      <div>Loading...</div>
    </f7-block>

    <template v-else>
      <component v-if="overviewPage"
                 :is="overviewPage.component"
                 v-show="!inChatSession"
                 :context="overviewPageContext"
                 :class="{ notready: !ready }"
                 :f7router
                 @command="onCommand" />
      <div v-else-if="!inChatSession" class="empty-overview">
        <empty-state-placeholder icon="house" title="overview.title" text="overview.text" />
        <f7-row v-if="!userStore.isAdmin() || $f7dim.width < 1280" class="display-flex justify-content-center">
          <f7-button large
                     fill
                     color="blue"
                     external
                     :href="`${runtimeStore.websiteUrl}/link/docs`"
                     target="_blank"
                     :text="$t('home.overview.button.documentation')" />
          <span style="width: 8px" />
          <f7-button large
                     color="blue"
                     external
                     :href="`${runtimeStore.websiteUrl}/link/tutorial`"
                     target="_blank"
                     :text="$t('home.overview.button.tutorial')" />
        </f7-row>
        <f7-row v-else class="display-flex justify-content-center">
          <f7-button large
                     fill
                     color="blue"
                     @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'quick' })"
                     :text="$t('home.overview.button.quickstart')" />
        </f7-row>
      </div>
    </template>
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
import { defineAsyncComponent } from 'vue'
import { f7 } from 'framework7-vue'
import { mapStores } from 'pinia'

import OhLayoutPage from '@/components/widgets/layout/oh-layout-page.vue'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  props: {
    context: Object,
    allowChat: Boolean,
    f7router: Object
  },
  components: {
    OhLayoutPage,
    'empty-state-placeholder': EmptyStatePlaceholder,
    habot: defineAsyncComponent(() => import(/* webpackChunkName: "habot" */ '../../components/home/habot.vue'))
  },
  setup () {
    return { f7 }
  },
  data () {
    return {
      inChatSession: false
    }
  },
  computed: {
    ready () {
      return useComponentsStore().ready && useStatesStore().ready
    },
    showHABot () {
      return (useRuntimeStore().apiEndpoint('habot') && this.allowChat && !useUIOptionsStore().hideChatInput)
    },
    overviewPage () {
      const page = useComponentsStore().page('overview')
      if (page) {
        if (page.component === 'oh-layout-page') return page
        if (page.slots) {
          if (page.slots.default && page.slots.default.length) return page
          if (page.slots.masonry || page.slots.canvas || page.slots.grid) return page
        }
      }
      return null
    },
    overviewPageContext () {
      return {
        component: this.overviewPage,
        store: this.context.store,
        vars: (this.overviewPage && this.overviewPage.config && this.overviewPage.config.defineVars) ? this.overviewPage.config.defineVars : {}
      }
    },
    pageStyle () {
      if (!this.overviewPage) return null
      return this.overviewPage.config.style
    },
    ...mapStores(useUserStore,  useStatesStore, useComponentsStore, useUIOptionsStore, useRuntimeStore)
  },
  methods: {
    onCommand (itemName, command) {
      useStatesStore().sendCommand(itemName, command)
    }
  }
}
</script>
