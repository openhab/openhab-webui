<template>
  <f7-popup ref="sceneItemPopup" class="sceneitemconfig-popup" close-on-escape @popup:open="itemConfigOpened" @popup:closed="itemConfigClosed">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
        </f7-nav-left>
        <f7-nav-title>
          Configure Item:
          {{ itemName }}
        </f7-nav-title>
        <f7-nav-right>
          <f7-link @click="updateItemConfig" popup-close>
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar bottom>
        <f7-link class="left" @click="selectedItem = null" icon-f7="arrow_uturn_left_circle">
          Set to current state
        </f7-link>
        <f7-link class="right" @click="selectedItem = null" icon-f7="arrowtriangle_right_circle">
          Test command
        </f7-link>
      </f7-toolbar>
      <f7-block>
        <f7-col v-if="ready">
          <f7-list no-hairlines-md>
            <f7-list-input
              label="Command"
              floating-label
              :value="command"
              @input="command = $event.target.value"
              type="text" />
          </f7-list>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>

export default {
  components: {
  },
  props: ['rule', 'module'],
  data () {
    return {
      ready: false,
      itemName: null,
      command: null
    }
  },
  methods: {
    itemConfigOpened () {
      this.itemName = this.module.configuration.itemName
      this.command = this.module.configuration.command
      this.ready = true
    },
    itemConfigClosed () {
      this.$f7.emit('sceneItemConfigClosed')
      this.$emit('closed')
    },
    updateItemConfig () {
      this.$f7.emit('sceneItemConfigUpdate', [this.itemName, this.command])
      this.$emit('update', [this.itemName, this.command])
      this.itemConfigClosed()
    }
  },
  computed: {
  }
}
</script>
