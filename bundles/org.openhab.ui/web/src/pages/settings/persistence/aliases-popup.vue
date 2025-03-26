<template>
  <f7-popup ref="modulePopup" class="moduleconfig-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close />
        </f7-nav-left>
        <f7-nav-title>
          Configure aliases for Items
        </f7-nav-title>
        <f7-nav-right>
          <f7-link @click="updateModuleConfig">
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-padding">
        <f7-list>
          <item-picker class="alias-item-picker" title="Select Items" name="items" multiple="true" :value="currentItems" @input="updateItems($event)" />
        </f7-list>
        <f7-list>
          <li v-for="(a, idx) in currentAliases" class="swipeout" :key="Object.keys(a)[0]">
            <div class="alias swipeout-content">
              <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled"
                       icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                       @click="showSwipeout" />
              <f7-list-item class="alias-item" :title="Object.keys(a)[0]" />
              <f7-input class="alias-input"
                        type="text"
                        placeholder="alias"
                        validate pattern="[A-Za-z_][A-Za-z0-9_]*"
                        error-message="Required. Must not start with a number. A-Z,a-z,0-9,_ only"
                        :value="Object.values(a)[0]"
                        @input="updateAlias(idx, Object.keys(a)[0], $event.target.value)" />
            </div>
            <f7-swipeout-actions right>
              <f7-swipeout-button @click="(ev) => deleteAlias(idx, Object.keys(a)[0])" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                Delete
              </f7-swipeout-button>
            </f7-swipeout-actions>
          </li>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.alias
  display: inline-flex
  width: calc(100% - (var(--f7-list-item-padding-horizontal) + var(--f7-safe-area-left)))
  align-items: center
  background: var(--f7-list-bg-color)
  padding-left: calc(var(--f7-list-item-padding-horizontal) + var(--f7-safe-area-left))
.alias::after
  content: ''
  position: absolute
  background-color: var(--f7-list-item-border-color)
  display: block
  z-index: 15
  top: auto
  right: auto
  bottom: 0
  left: 0
  height: 1px
  width: 100%
  transform-origin: 50% 100%
  transform: scaleY(calc(1 / var(--f7-device-pixel-ratio)));
.alias-item
  width: 50%
  min-height: var(--f7-list-item-min-height)
  align-items: center
  display: flex
.alias-input
  width: 50%
  min-height: var(--f7-list-item-min-height)
  align-items: center
  display: flex
.alias-item .item-content .item-inner:after
    display: none !important
ul.alias-item-picker.item-picker-container
  padding-left: 0
  width: 100%
  .smart-select .item-after
    display: none
</style>

<script>
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  components: { ItemPicker },
  props: ['aliases'],
  emits: ['aliasesConfigUpdate'],
  computed: {
    currentItems () {
      const items = this.currentAliases.map((a) => Object.keys(a)[0])
      return [...items]
    }
  },
  data () {
    return {
      currentAliases: []
    }
  },
  created () {
    this.currentAliases = this.aliases
    this.currentAliases.sort((a, b) => this.aliasCompare(a, b))
  },
  methods: {
    updateItems (items) {
      const oldAliases = this.currentAliases.filter((a) => items.indexOf(Object.keys(a)[0]) >= 0)
      const newItems = items.filter((i) => this.currentItems.indexOf(i) < 0)
      const newAliases = newItems.map((i) => {
        const aliasObj = {}
        aliasObj[i] = null
        return aliasObj
      })
      const aliases = oldAliases.concat(newAliases)
      aliases.sort((a, b) => this.aliasCompare(a, b))
      this.currentAliases = [...aliases]
    },
    updateAlias (idx, item, alias) {
      const aliasObj = this.currentAliases[idx]
      aliasObj[Object.keys(aliasObj)[0]] = alias
    },
    deleteAlias (idx, item) {
      const aliases = this.currentAliases.splice(idx, 1)
      this.currentAliases = [...aliases]
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        this.$f7.swipeout.open(swipeoutElement)
      }
    },
    aliasCompare (a, b) {
      const aItem = Object.keys(a)[0]
      const bItem = Object.keys(b)[0]
      return aItem < bItem ? -1 : (aItem > bItem ? 1 : 0)
    },
    updateModuleConfig () {
      const aliases = this.currentAliases.map((a) => Object.values(a)[0])
      // Warn when no alias for item
      const idx = this.currentAliases.findIndex((a) => !Object.values(a)[0] || Object.values(a)[0] === '')
      if (idx >= 0) {
        this.$f7.dialog.alert('Empty alias for item ' + Object.keys(this.currentAliases[idx])[0] + '!')
        return
      }
      // Warn when validation errors remain
      if (aliases.some((a) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(a))) {
        this.$f7.dialog.alert('Validation errors for aliases!')
        return
      }
      // Warn when alias already exists
      for (let i = 0; i < aliases.length; i++) {
        const firstIdx = aliases.slice(0, i).indexOf(aliases[i])
        if (firstIdx >= 0) {
          this.$f7.dialog.alert('Alias ' + aliases[i] + ' for item ' + Object.keys(this.currentAliases[i])[0] + ' already exists for item ' + Object.keys(this.currentAliases[firstIdx])[0])
          return
        }
      }
      this.$f7.emit('aliasesConfigUpdate', this.currentAliases)
      this.$refs.modulePopup.close()
    }
  }
}
</script>
