<template>
  <f7-page class="developer-dock">
    <f7-navbar title="Developer Sidebar" subtitle="(Shift+Alt+D)" style="width: 100%" :color="$f7.data.themeOptions.dark === 'dark' ? '' : 'black'">
      <!--
      <f7-navbar-right>
        <f7-menu-item icon-f7="line_horizontal_3" dropdown>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item href="#" text="Tools"></f7-menu-dropdown-item>
            <f7-menu-dropdown-item href="#" text="Help"></f7-menu-dropdown-item>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-navbar-right>
      -->
    </f7-navbar>
    <f7-row class="align-items-stretch">
      <f7-col resizable class="display-flex flex-direction-column" style="padding: 0px; border: none; min-width: 50px; background-color: transparent">
        <f7-row resizable style="height: 50%; min-height: 50px; margin: 0">
          <developer-sidebar />
        </f7-row>
        <f7-row resizable style="height: 50%; min-height: 50px; margin: 0">
          <help-sidebar />
        </f7-row>
      </f7-col>
    </f7-row>
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
}
</script>