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
          <li v-for="i in currentItems" class="swipeout" :key="i">
            <div class="alias swipeout-content">
              <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled"
                       icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                       @click="showSwipeout" />
              <f7-list-item class="alias-item" :title="i" />
              <f7-input class="alias-input"
                        type="text"
                        placeholder="alias"
                        validate pattern="[A-Za-z_][A-Za-z0-9_]*"
                        error-message="Required. Must not start with a number. A-Z,a-z,0-9,_ only"
                        :value="currentAliases[i]"
                        @input="updateAlias(i, $event.target.value)" />
            </div>
            <f7-swipeout-actions right>
              <f7-swipeout-button @click="(ev) => deleteAlias(i)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
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
      return Object.entries(this.currentAliases).filter(([i, a]) => !!a || a === '').map(([i, a]) => i)
    }
  },
  data () {
    return {
      currentAliases: {}
    }
  },
  created () {
    this.currentAliases = Object.keys(this.aliases)
      .sort()
      .reduce((obj, key) => {
        obj[key] = this.aliases[key]
        return obj
      }, {})
  },
  methods: {
    updateItems (items) {
      const aliases = this.currentAliases
      Object.keys(aliases)
        .filter((i) => !items.includes(i))
        .forEach((i) => { delete aliases[i] })
      items
        .filter((i) => !Object.keys(aliases).includes(i))
        .forEach((i) => { aliases[i] = '' })
      this.currentAliases = Object.keys(aliases)
        .sort()
        .reduce((obj, key) => {
          obj[key] = aliases[key]
          return obj
        }, {})
    },
    updateAlias (item, alias) {
      this.$set(this.currentAliases, item, alias)
    },
    deleteAlias (item) {
      this.$set(this.currentAliases, item, undefined)
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
    updateModuleConfig () {
      const aliases = Object.entries(this.currentAliases).reduce((acc, [i, a]) => {
        if (!!a || a === '') {
          acc[i] = a
        }
        return acc
      }, {})
      // Warn when no alias for item
      const entry = Object.entries(aliases).find(([i, a]) => a === '')
      if (entry) {
        this.$f7.dialog.alert('Empty alias for item ' + entry[0] + '!')
        return
      }
      // Warn when validation errors remain
      if (Object.values(aliases).some((a) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(a))) {
        this.$f7.dialog.alert('Validation errors for aliases!')
        return
      }
      // Warn when alias already exists
      const entries = Object.entries(aliases)
      for (let idx = 1; idx < entries.length; idx++) {
        const firstIdx = entries.slice(0, idx).findIndex(([i, a]) => a === entries[idx][1])
        if (firstIdx >= 0) {
          this.$f7.dialog.alert('Alias ' + entries[idx][1] + ' for item ' + entries[idx][0] + ' already exists for item ' + entries[firstIdx][0])
          return
        }
      }
      this.$f7.emit('aliasesConfigUpdate', aliases)
      this.$refs.modulePopup.close()
    }
  }
}
</script>
