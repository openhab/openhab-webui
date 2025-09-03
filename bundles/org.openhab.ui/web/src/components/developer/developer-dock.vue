<template>
  <f7-page class="developer-dock">
    <f7-navbar :title="title" :subtitle="subtitle" :color="uiOptionsStore.getDarkMode() === 'dark' ? '' : 'black'" />
    <f7-segmented strong
                  tag="p"
                  style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right));
                    margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left));
                    margin-top: 5px;
                    margin-bottom: 5px;">
      <f7-button :active="dockView === 'tools'"
                 @click="f7.emit('selectDeveloperDock', { dock: 'tools' })">
        Tools
      </f7-button>
      <f7-button :active="dockView === 'help'"
                 @click="f7.emit('selectDeveloperDock', { dock: 'help' })">
        Help
      </f7-button>
    </f7-segmented>
    <f7-segmented v-if="dockView === 'tools'"
                  strong
                  tag="p"
                  style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)); margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left)); margin-top: 0">
      <f7-button :active="activeToolTab === 'pin'"
                 icon-f7="pin_fill"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'tools', toolTab: 'pin'})"
                 tooltip="Pinned Objects" />
      <f7-button :active="activeToolTab === 'events'"
                 icon-f7="bolt_horizontal_fill"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'tools', toolTab: 'events'})"
                 tooltip="Event Monitor" />
      <f7-button :active="activeToolTab === 'scripting'"
                 icon-f7="pencil_ellipsis_rectangle"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'tools', toolTab: 'scripting'})"
                 tooltip="Code Tools" />
      <f7-button :active="activeToolTab === 'tools'"
                 icon-f7="rectangle_stack_badge_plus"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'tools', toolTab: 'tools' })"
                 tooltip="Create ..." />
    </f7-segmented>
    <f7-segmented v-if="dockView === 'help'"
                  strong
                  tag="p"
                  style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)); margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left)); margin-top: 0">
      <f7-button :active="activeHelpTab === 'current'"
                 icon-f7="doc_richtext"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'current' })"
                 tooltip="Page Help" />
      <f7-button :active="activeHelpTab === 'binding'"
                 icon-f7="bag_fill"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'binding' })"
                 tooltip="Add-on Docs" />
      <f7-button :active="activeHelpTab === 'faq'"
                 icon-f7="question_diamond_fill"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'faq' })"
                 tooltip="FAQ" />
      <f7-button :active="activeHelpTab === 'quick'"
                 icon-f7="cursor_rays"
                 icon-size="18"
                 @click="f7.emit('selectDeveloperDock', { dock: 'help', helpTab: 'quick' })"
                 tooltip="Quick Start" />
    </f7-segmented>
    <developer-sidebar v-if="dockView === 'tools'" :activeToolTab="activeToolTab" :searchFor="searchFor" />
    <help-sidebar v-if="dockView === 'help'" :activeHelpTab="activeHelpTab" />
  </f7-page>
</template>

<style lang="stylus">
.panel-right.panel-in-breakpoint:before
  position absolute
  left 0
  top 0
  height 100%
  width 1px
  background rgba(0,0,0,0.1)
  content ''
  z-index 6000

.developer-dock
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */
</style>

<script>
import { f7 } from 'framework7-vue'
import { nextTick } from 'vue'
import { mapStores } from 'pinia'

import DeveloperSidebar from './developer-sidebar.vue'
import HelpSidebar from './help-sidebar.vue'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  props: {
    dock: String,
    helpTab: String,
    toolTab: String,
    searchFor: String
  },
  components: {
    DeveloperSidebar,
    HelpSidebar
  },
  setup () {
    return {
      f7
    }
  },
  data () {
    return {
      ready: false
    }
  },
  computed: {
    // work-around styling issues when lazy-loading the developer-dock by setting (sub)title after component creation
    title () {
      if (!this.ready) return ''
      return 'Developer Sidebar'
    },
    subtitle () {
      if (!this.ready) return ''
      return '(Shift+Alt+D)'
    },
    dockView () {
      return this.dock
    },
    activeHelpTab () {
      return (this.helpTab || 'current')
    },
    activeToolTab () {
      return (this.toolTab || 'pin')
    },
    ...mapStores(useUIOptionsStore)
  },
  created () {
    nextTick(() => {
      this.ready = true
    })
  }
}
</script>
