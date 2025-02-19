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
          <li v-for="(a, idx) in currentAliases" class="swipeout">
            <span class="alias swipeout-content">
              <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled"
                            icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                            @click="showSwipeout" />
              <item-picker class="alias-item-picker" :title="Object.keys(a)[0]" :name="'item' + idx" :value="Object.keys(a)[0]" @input="updateAlias(idx, $event, null)" />
              <f7-input class="alias-input" type="text" placeholder="alias [A-Za-z_][A-Za-z0-9_]*"
                        validate-on-blur pattern="[A-Za-z_][A-Za-z0-9_]*"
                        :value="Object.values(a)[0]" @change="updateAlias(idx, null, $event.target.value)" />
            </span>
            <f7-swipeout-actions right>
              <f7-swipeout-button @click="(ev) => deleteAlias(idx)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                Delete
              </f7-swipeout-button>
            </f7-swipeout-actions>
          </li>
          <li>
            <span class="alias">
              <item-picker class="alias-item-picker alias-item-picker-new" title="Select Item" :name="'item' + currentAliases.length" value="" @input="updateAlias(null, $event, null)" />
              <f7-input class="alias-input" type="text" placeholder="alias [A-Za-z_][A-Za-z0-9_]*"
                        validate-on-blur pattern="[A-Za-z_][A-Za-z0-9_]*"
                        value="" @change="updateAlias(null, '', $event.target.value)" />
            </span>
          </li>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
span.alias
  display: inline-flex
  padding-left: 2px
  width: 100%
  align-items: center
  background: var(--f7-list-bg-color)
ul.alias-item-picker.alias-item-picker-new.item-picker-container
  padding-left: 18px
ul.alias-item-picker.item-picker-container
  padding-left: 0
  width: 55%
  .smart-select .item-after
    display: none
.alias-input
  width: 45%
  min-height: var(--f7-list-item-min-height)
  align-items: center
  display: flex
ul.alias-item-picker .item-picker .item-content .item-inner::after
  display: none
</style>

<script>
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  components: { ItemPicker },
  props: ['aliases'],
  emits: ['aliasesConfigUpdate'],
  data () {
    return {
      currentAliases: this.aliases || []
    }
  },
  methods: {
    updateAlias (idx, item, alias) {
      const aliasObj = {}
      if (idx === null) {
        aliasObj[item] = alias
        if (this.validateAlias(idx, item, alias)) {
          this.currentAliases.push(aliasObj)
        }
      } else {
        if (item) {
          aliasObj[item] = Object.values(this.currentAliases[idx])[0]
        } else {
          aliasObj[Object.keys(this.currentAliases[idx])[0]] = alias
        }
        if (this.validateAlias(idx, item, alias)) {
          this.currentAliases.splice(idx, 1, aliasObj)
        }
      }
    },
    validateAlias (idx, item, alias) {
      if (item && item !== '') {
        const index1 = this.currentAliases.findIndex((a) => Object.keys(a)[0] === item)
        if (index1 !== -1 && (idx === null || idx !== index1)) {
          this.$f7.dialog.alert('An alias for the item already exists!')
          return false
        }
      }
      if (alias && alias !== '') {
        const index2 = this.currentAliases.findIndex((a) => Object.values(a)[0] === alias)
        if (index2 !== -1 && (idx === null || idx !== index2)) {
          this.$f7.dialog.alert('An alias with the same name already exists for another item!')
          return false
        }
      }
      return true
    },
    deleteAlias (idx) {
      this.currentAliases.splice(idx, 1)
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
      // Ignore when item not set
      let aliases = this.currentAliases.filter((a) => Object.keys(a)[0] !== '')
      // Warn when no alias for item
      const idx = aliases.findIndex((a) => Object.values(a)[0] === null)
      if  (idx >= 0) {
        this.$f7.dialog.alert('Empty alias for item ' + Object.keys(aliases[idx])[0] +'!')
        return
      }
      this.$f7.emit('aliasesConfigUpdate', aliases)
      this.$refs.modulePopup.close()
    }
  }
}
</script>
