<template>
  <f7-page class="developer-dock">
    <f7-navbar title="Developer Sidebar" subtitle="(Shift+Alt+D)" style="width: 100%" :color="$f7.data.themeOptions.dark === 'dark' ? '' : 'black'"></f7-navbar>
    <f7-segmented strong tag="p" style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)); margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left)); margin-top: 5px; margin-bottom: 5px">
      <f7-button :active="dockView === 'tools'" @click="dockView = 'tools'">Tools</f7-button>
      <f7-button :active="dockView === 'help'" @click="dockView = 'help'">Help</f7-button>
    </f7-segmented>
    <f7-segmented v-if="dockView === 'help'" strong tag="p" style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)); margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left)); margin-top: 0">
      <f7-button :active="activeHelpTab === 'quick'" icon-f7="cursor_rays" icon-size="18" @click="activeHelpTab = 'quick'" />
      <f7-button :active="activeHelpTab === 'current'" icon-f7="doc_richtext" icon-size="18" @click="activeHelpTab = 'current'" />
      <f7-button :active="activeHelpTab === 'faq'" icon-f7="question_diamond_fill" icon-size="18" @click="activeHelpTab = 'faq'" />
      <f7-button :active="activeHelpTab === 'binding'" icon-f7="bag_fill" icon-size="18" @click="activeHelpTab = 'binding'" />
    </f7-segmented>
    <f7-segmented v-if="dockView === 'tools'" strong tag="p" style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)); margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left)); margin-top: 0">
      <f7-button :active="activeTab === 'pin'" icon-f7="pin_fill" icon-size="18" @click="activeTab = 'pin'" />
      <f7-button :active="activeTab === 'events'" icon-f7="bolt_horizontal_fill" icon-size="18" @click="activeTab = 'events'" />
      <f7-button :active="activeTab === 'scripting'" icon-f7="pencil_ellipsis_rectangle" icon-size="18" @click="activeTab = 'scripting'" />
      <f7-button :active="activeTab === 'tools'" icon-f7="rectangle_stack_badge_plus" icon-size="18" @click="activeTab = 'tools'" />
    </f7-segmented>
    <developer-sidebar v-if="dockView === 'tools'" :activeTab="activeTab"/>
    <help-sidebar v-if="dockView === 'help'" :activeHelpTab="activeHelpTab"/>
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
import DeveloperSidebar from './developer-sidebar.vue'
import HelpSidebar from './help-sidebar.vue'

export default {
  components: {
    DeveloperSidebar,
    HelpSidebar
  },
  data () {
    return {
      dockView: 'tools',
      activeHelpTab: 'current',
      activeTab: 'pin'
    }
  }
}
</script>