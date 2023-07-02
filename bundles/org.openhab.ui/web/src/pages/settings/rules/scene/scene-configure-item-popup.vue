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
      <f7-block v-show="control" class="scene-item-control" strong>
        <f7-col>
          <div v-show="control === 'colorpicker'" class="scene-item-control-colorpicker" ref="colorpicker" />
          <div v-if="control === 'toggle'" class="scene-item-control-toggle">
            <f7-toggle :checked="command === 'ON'" @toggle:change="(value) => command = (value) ? 'ON' : 'OFF'" />
          </div>
          <div v-else-if="control === 'slider'" class="scene-item-control-slider">
            <f7-range v-bind="sliderConfig" :value="command" @range:change="command = $event.toString()" />
          </div>
          <div v-else-if="control === 'rollershutter'" class="scene-item-control-rollershutter">
            <f7-segmented round outline strong class="rollershutter-controls">
              <f7-button @click="command = 'UP'" large icon-f7="arrowtriangle_left" icon-size="24" icon-color="gray" />
              <f7-button @click="command = 'STOP'" large icon-f7="stop" icon-size="24" icon-color="red" />
              <f7-button @click="command = 'DOWN'" large icon-f7="arrowtriangle_right" icon-size="24" icon-color="gray" />
            </f7-segmented>
          </div>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.scene-item-control
  .scene-item-control-toggle
    text-align center
    padding-top calc(var(--f7-toggle-width))
    padding-bottom calc(var(--f7-toggle-width))
    .toggle
      transform scale(2) rotate(-90deg)
      transform-origin center

  .scene-item-control-slider
    width 100%
    height: 300px
    display flex
    flex-direction column
    justify-content center
    --f7-range-bar-size 150px
    --f7-range-knob-size 0px
    --f7-range-label-size 60px
    --f7-range-label-font-size 40px

  .scene-item-control-rollershutter
    width 100%
    height 200px
    display flex
    flex-direction column
    justify-content center
    .rollershutter-controls
      width 150px
      transform rotate(90deg)
      transform-origin center

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
      if (this.item.type === 'Color' || this.item.groupType === 'Color') {
        this.control = 'colorpicker'
        const vm = this
        this.$nextTick(() => {
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
        })
      } else if (this.item.type === 'Switch' || this.item.groupType === 'Switch') {
        this.control = 'toggle'
      } else if (this.item.type === 'Dimmer' || this.item.groupType === 'Dimmer') {
        this.control = 'slider'
      } else if (this.item.type === 'Rollershutter' || this.item.groupType === 'Rollershutter') {
        this.control = 'rollershutter'
      } else if (this.item.type === 'Number' || this.item.groupType === 'Number') {
        if (this.item.tags.find((t) => [
          'ColorTemperature',
          'Temperature',
          'Brightness',
          'Level',
          'SoundVolume',
          'Setpoint'
        ].includes(t))) {
          this.control = 'slider'
        }
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
    },
    sliderConfig () {
      if (!this.item) return {}
      const sd = this.item.stateDescription || { minimum: 0, maximum: 100, step: 1 }
      return {
        vertical: true,
        label: true,
        scale: true,
        min: sd.minimum,
        max: sd.maximum,
        step: sd.step
      }
    }
  }
}
</script>
