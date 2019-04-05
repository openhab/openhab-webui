<template>
  <q-btn v-if="!hasPopover"
         :class="{'highlight-and-fade': this.model.highlight}"
         :icon="icon"
         :icon-right="iconRight"
         :disabled="disabled"
         :label="label"
         :size="(this.model.config.size) ? this.model.config.size : undefined"
         :color="color"
         :text-color="textColor"
         :dense="this.model.config.dense"
         :round="this.model.config.round"
         :outline="this.model.config.outline"
         :flat="this.model.config.flat"
         :glossy="this.model.config.glossy"
         :push="this.model.config.push"
         :rounded="this.model.config.rounded"
         :no-caps="this.model.config.noCaps"
         :no-ripple="this.model.config.noRipple"
         @click="click">
    <q-modal v-if="hasModal" v-model="showModal"
                :content-css="(!this.model.slots.modal[0].config.minimized) ? {minWidth: '80vw', minHeight: '80vh'} : null"
                :content-classes="(this.model.slots.modal[0].config.minimized) ? this.model.slots.modal[0].config.contentClasses : null"
                :maximized="this.model.slots.modal[0].config.maximized"
                :minimized="this.model.slots.modal[0].config.minimized"
                :position="this.model.slots.modal[0].config.position">
      <q-modal-layout v-if="!this.model.slots.modal[0].config.minimized"
                :content-class="this.model.slots.modal[0].config.contentClasses">
        <q-toolbar slot="header" v-if="!this.model.slots.modal[0].config.minimized"
                  :glossy="this.model.slots.modal[0].config.toolbarGlossy"
                  :inverted="this.model.slots.modal[0].config.toolbarInverted"
                  :color="this.model.slots.modal[0].config.toolbarColor"
                  :textColor="this.model.slots.modal[0].config.toolbarTextColor">
          <q-btn flat round dense v-close-overlay icon="arrow_back" />
          <q-toolbar-title>
            {{this.model.slots.modal[0].config.toolbarTitle}}
            <span slot="subtitle" v-if="this.model.slots.modal[0].config.toolbarSubtitle">
              {{this.model.slots.modal[0].config.toolbarSubtitle}}
            </span>
          </q-toolbar-title>
        </q-toolbar>
        <component v-for="(component, idx) in this.model.slots.modal[0].slots.main" :is="component.component" :model="component" :key="'modal-' + idx" />
      </q-modal-layout>
      <component v-else v-for="(component, idx) in this.model.slots.modal[0].slots.main" :is="component.component" :model="component" :key="'modal-' + idx" />
    </q-modal>
  </q-btn>
  <q-btn-dropdown v-else-if="hasPopover"
         :icon="this.model.config.icon"
         :icon-right="this.model.config.iconRight"
         :disabled="disabled"
         :label="label"
         :size="(this.model.config.size) ? this.model.config.size : undefined"
         :color="color"
         :text-color="textColor"
         :dense="this.model.config.dense"
         :round="this.model.config.round"
         :outline="this.model.config.outline"
         :flat="this.model.config.flat"
         :glossy="this.model.config.glossy"
         :push="this.model.config.push"
         :rounded="this.model.config.rounded"
         :no-caps="this.model.config.noCaps"
         :no-ripple="this.model.config.noRipple">
    <component v-for="(component, idx) in this.model.slots.popover" :is="component.component" :model="component" :key="'popover-' + idx" />
  </q-btn-dropdown>
</template>

<script>
// import HbComponents from 'components/index'

export default {
  name: 'HbBtn',
  props: ['model'],
  data () {
    return {
      showModal: false,
      showPopover: false
    }
  },
  beforeCreate () {
    this.$options.components.HbContainer = require('./HbContainer.vue').default
  },
  methods: {
    click () {
      if (this.hasPopover) {
        this.showPopover = true
      } else if (this.hasModal) {
        this.showModal = true
      } else if (this.model.config.item) {
        this.sendCmd()
      }
    },
    sendCmd () {
      this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: this.command })
    }
  },
  computed: {
    hasPopover () {
      return this.model.slots && this.model.slots.popover
    },
    hasModal () {
      return this.model.slots && this.model.slots.modal && this.model.slots.modal[0].component === 'HbModal' &&
             this.model.slots.modal[0].slots.main[0].component && this.model.slots.modal[0].slots.main[0]
    }
  },
  asyncComputed: {
    label () {
      return this.$expr(this.model.config.label)
    },
    command () {
      return this.$expr(this.model.config.command)
    },
    disabled () {
      return (this.model.config.disabled) ? this.$expr('=' + this.model.config.disabled) : false
    },
    color () {
      return this.$expr(this.model.config.color)
    },
    textColor () {
      return this.$expr(this.model.config.textColor)
    },
    icon () {
      return this.$expr(this.model.config.icon)
    },
    iconRight () {
      return this.$expr(this.model.config.iconRight)
    }
  }
}
</script>
