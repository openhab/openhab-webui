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
        <f7-link class="left" icon-f7="arrow_uturn_left_circle" @click="updateCommandFromCurrentState">
          Set to current state
        </f7-link>
        <f7-link class="right" icon-f7="arrowtriangle_right_circle" @click="testCommand">
          Test command
        </f7-link>
      </f7-toolbar>
      <f7-block class="no-padding">
        <f7-col v-if="ready">
          <f7-list no-hairlines-md>
            <f7-list-input
              label="Command"
              floating-label
              :value="command"
              @input="command = $event.target.value"
              type="text" />
            <ul v-if="commandSuggestions.length">
              <f7-list-item radio :checked="command === suggestion.command" v-for="suggestion in commandSuggestions" :key="suggestion.command"
                            :title="suggestion.label" @click="command = suggestion.command" />
            </ul>
          </f7-list>
        </f7-col>
      </f7-block>
      <f7-block class="scene-item-control" strong>
        <f7-col>
          <div ref="colorpicker" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
</style>

<script>
export default {
  components: {
  },
  props: ['rule', 'module'],
  data () {
    return {
      ready: false,
      itemName: null,
      item: null,
      command: null,
      colorpicker: null,
      control: null
    }
  },
  methods: {
    itemConfigOpened () {
      this.itemName = this.module.configuration.itemName
      this.command = this.module.configuration.command
      this.$oh.api.get('/rest/items/' + this.itemName).then((item) => {
        this.item = item
        this.initializeControl()
        this.ready = true
      })
    },
    itemConfigClosed () {
      if (this.colorpicker) this.colorpicker.destroy()
      this.$f7.emit('sceneItemConfigClosed')
      this.$emit('closed')
    },
    updateItemConfig () {
      if (this.colorpicker) this.colorpicker.destroy()
      this.$f7.emit('sceneItemConfigUpdate', [this.itemName, this.command])
      this.$emit('update', [this.itemName, this.command])
      this.itemConfigClosed()
    },
    updateCommandFromCurrentState () {
      this.$oh.api.getPlain('/rest/items/' + this.itemName + '/state?metadata=semantics,widget').then((state) => {
        this.$set(this, 'command', state)
        this.$f7.toast.create({
          text: `Updated desired state of ${this.itemName} to ${state}`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    testCommand () {
      this.$oh.api.postPlain('/rest/items/' + this.itemName, this.command, 'text/plain', 'text/plain').then((state) => {
        this.$f7.toast.create({
          text: `Sent comment ${this.command} to ${this.itemName}`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    initializeControl () {
      if (this.item.commandDescription && this.item.commandDescription.commandOptions) return // no control if command options
      if (this.item.type === 'Color') {
        this.control = 'colorpicker'
        const vm = this
        this.colorpicker = this.$f7.colorPicker.create(Object.assign({}, this.config, {
          containerEl: this.$refs.colorpicker,
          modules: ['wheel'],
          value: (this.command.split(',').length === 3) ? { hsb: this.color } : null,
          on: {
            change (colorpicker, value) {
              let command = [...value.hsb]
              command[0] = Math.round(command[0]) % 360
              command[1] = Math.round(command[1] * 100)
              command[2] = Math.round(command[2] * 100)
              command = command.join(',')
              vm.command = command
            }
          }
        }))
      } else {

      }
    }
  },
  computed: {
    commandSuggestions () {
      if (!this.item) return []
      let type = (this.item.type === 'Group' && this.item.groupType) ? this.item.groupType : this.item.type

      if (this.item.commandDescription && this.item.commandDescription.commandOptions) {
        return this.item.commandDescription.commandOptions
      }
      if (type === 'Switch') {
        return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Rollershutter') {
        return ['UP', 'DOWN', 'STOP'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Contact') {
        return ['UP', 'DOWN', 'STOP'].map((c) => { return { command: c, label: c } })
      }
      if (type === 'Color') {
        return ['ON', 'OFF'].map((c) => { return { command: c, label: c } })
      }

      return []
    },
    color () {
      if (this.item.type === 'Color' && this.command && this.command.split(',').length === 3) {
        let color = this.command.split(',')
        color[0] = parseInt(color[0])
        color[1] = color[1] / 100
        color[2] = color[2] / 100
        return color
      }
      return null
    }
  }
}
</script>
