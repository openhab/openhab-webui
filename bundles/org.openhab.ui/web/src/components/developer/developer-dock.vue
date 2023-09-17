<template>
  <f7-page class="developer-dock">
    <f7-navbar title="Developer Sidebar" subtitle="(Shift+Alt+D)" style="width: 100%" :color="$f7.data.themeOptions.dark === 'dark' ? '' : 'black'"></f7-navbar>
    <f7-segmented strong tag="p" style="margin-right: calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)); margin-left: calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left)); margin-top: 5px; margin-bottom: 5px">
      <f7-button :active="dockView === 'tools'" @click="dockView = 'tools'">Tools</f7-button>
      <f7-button :active="dockView === 'help'" @click="dockView = 'help'">Help</f7-button>
    </f7-segmented>
    <developer-sidebar v-if="dockView === 'tools'"/>
    <help-sidebar v-if="dockView === 'help'"/>
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
      dockView: 'tools'
    }
  }
}
</script>