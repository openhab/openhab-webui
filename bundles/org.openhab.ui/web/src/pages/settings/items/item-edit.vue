<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content :title="pageTitle + dirtyIndicator"
                      :back-link="editable ? 'Cancel' : 'Back'"
                      :editable
                      :save-link="`Save${$device.desktop ? ' (Ctrl-S)' : ''}`"
                      @save="save()"
                      :f7router />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design')" :tab-link-active="currentTab === 'design'" tab-link="#design">
        Design
      </f7-link>
      <f7-link @click="switchTab('code')" :tab-link-active="currentTab === 'code'" tab-link="#code">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs v-if="ready">
      <f7-tab id="design" :tab-active="currentTab === 'design'">
        <f7-block class="block-narrow" v-if="item.name || item.created === false">
          <f7-col v-if="!editable">
            <div class="padding-left">
              Note: {{ notEditableMsg }}
            </div>
          </f7-col>
          <f7-col>
            <item-form ref="itemForm"
                       :item="item"
                       :items="items"
                       :createMode="createMode" />
          </f7-col>

          <div class="flex-shrink-0 if-aurora display-flex justify-content-center">
            <f7-button v-if="createMode"
                       text="Create"
                       style="width: 150px"
                       class="margin-horizontal"
                       color="blue"
                       raised
                       fill
                       @click="save" />
            <f7-button v-else-if="editable"
                       text="Save"
                       style="width: 150px"
                       class="margin-horizontal"
                       color="blue"
                       raised
                       fill
                       @click="save" />
            <f7-button :text="editable ? 'Cancel' : 'Back'" color="blue" @click="f7router.back()" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" :tab-active="currentTab === 'code'">
        <code-editor v-if="ready"
                     ref="codeEditor"
                     object-type="items"
                     :object="item"
                     :object-id="item.name"
                     :read-only="!editable"
                     :read-only-msg="notEditableMsg"
                     @parsed="updateItem"
                     @changed="onCodeChanged" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.item-code-editor.v-codemirror
  position absolute
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - var(--f7-navbar-height, 56px) - var(--f7-tabbar-height, 48px))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'

import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import * as Types from '@/assets/item-types.js'

import ItemForm from '@/components/item/item-form.vue'

import DirtyMixin from '../dirty-mixin'
import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [DirtyMixin, ItemMixin],
  props: {
    itemName: String,
    createMode: Boolean,
    itemCopy: Object,
    f7router: Object
  },
  components: {
    ItemForm,
    CodeEditor: defineAsyncComponent(() => import(/* webpackChunkName: "code-editor" */ '@/components/config/controls/code-editor.vue'))
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: false,
      loading: false,
      item: {},
      savedItem: {},
      itemDirty: false,
      codeDirty: false,
      items: [],
      types: Types,
      semanticClass: '',
      semanticProperty: '',
      pendingTag: '',
      currentTab: 'design',
      notEditableMsg: 'This Item is not editable because it has been provisioned from a file.'
    }
  },
  computed: {
    editable () {
      return this.createMode || (this.item && this.item.editable)
    },
    pageTitle () {
      if (this.createMode) {
        return 'Create New Item'
      }
      if (!this.ready) {
        return ''
      }
      return this.editable ? 'Edit Item' : 'Item Details'
    }
  },
  watch: {
    itemDirty: function () { this.dirty = this.itemDirty || this.codeDirty },
    codeDirty: function () { this.dirty = this.itemDirty || this.codeDirty },
    item: {
      handler: function () {
        if (!this.loading) { // ignore changes during loading
          const itemClone = cloneDeep(this.item)
          delete itemClone.functionKey
          this.itemDirty = !fastDeepEqual(itemClone, this.savedItem)
        }
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
    },
    onPageBeforeOut () {
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    keyDown (ev) {
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        this.save()
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    switchTab (newTab) {
      if (this.currentTab === newTab) return

      // We can't prevent the tab switch here. Instead, we'll switch back if parsing fails
      this.currentTab = newTab

      if (newTab === 'code') {
        this.$refs.codeEditor.generateCode()
      } else if (this.codeDirty) {
        this.$refs.codeEditor.parseCode(
          () => {
            this.codeDirty = false
          },
          () => {
            this.currentTab = 'code'
            f7.tab.show('#code')
          }
        )
      }
    },
    onCodeChanged (codeDirty) {
      this.codeDirty = codeDirty
    },
    load () {
      if (this.loading) return
      this.loading = true
      if (this.createMode) {
        const newItem = this.itemCopy || {
          name: '',
          label: '',
          category: '',
          type: 'String',
          groupNames: [],
          tags: [],
          created: false
        }
        this.item = newItem
        this.savedItem = cloneDeep(this.item)
        this.$oh.api.get('/rest/items?staticDataOnly=true').then((items) => {
          this.items = items
          this.ready = true
          this.loading = false
        })
      } else {
        this.$oh.api.get('/rest/items/' + this.itemName + '?metadata=.*').then((data) => {
          this.item = data
          this.savedItem = cloneDeep(this.item)
          nextTick(() => {
            this.ready = true
            this.loading = false
          })
        })
      }
    },
    save () {
      if (!this.editable) return

      if (this.currentTab === 'code' && this.codeDirty) {
        this.$refs.codeEditor.parseCode(() => {
          this.codeDirty = false
          this.save()
          this.$refs.codeEditor.generateCode()
        })
        return
      }

      if (this.validateItemName(this.item.name) !== '')
        return f7.dialog.alert('Please give the Item a valid name: ' + this.validateItemName(this.item.name)).open()
      if (!this.item.type || !this.types.ItemTypes.includes(this.item.type.split(':')[0]))
        return f7.dialog.alert('Please give Item a valid type').open()

      const typeChange = this.$refs.itemForm.typeChanged()
      const dimensionChange = this.$refs.itemForm.dimensionChanged()
      const unitChange = this.$refs.itemForm.unitChanged()
      if (typeChange || dimensionChange || unitChange) {
        const title = 'WARNING: ' + (typeChange ? 'Type' : (dimensionChange ? 'Dimension' : 'Unit')) + ' Changed'
        const text = (typeChange || dimensionChange)
          ? `Existing links to channels ${dimensionChange ? 'with dimensions ' : ''}may no longer be valid!`
          : 'Changing the internal unit can corrupt your persisted data and affect rules!'
        return f7.dialog.create({
          title,
          text,
          buttons: [
            { text: 'Cancel', color: 'gray', close: true, onClick: () => this.$refs.itemForm.revertChange() },
            { text: 'Save Anyway', color: 'red', close: true, onClick: () => this.doSave() }
          ],
          destroyOnClose: true
        }).open()
      } else {
        this.doSave()
      }
    },
    doSave () {
      this.saveItem(this.item).then(() => {
        if (this.createMode) {
          f7.toast.create({
            text: 'Item created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.item.created = true
          this.item.editable = true
        } else {
          f7.toast.create({
            text: 'Item updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }

        this.itemDirty = this.codeDirty = false
        if (this.createMode) {
          this.f7router.navigate('/settings/items/' + this.item.name, {
            reloadCurrent: true
          })
        } else {
          this.f7router.back()
        }
      }).catch((err) => {
        f7.toast.create({
          text: 'Item not saved: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    updateItem (updatedItem) {
      if (!this.editable) return false
      try {
        if (updatedItem === null) return false
        if (updatedItem.groupNames == null) updatedItem.groupNames = []
        if (updatedItem.tags == null) updatedItem.tags = []
        this.item.label = updatedItem.label
        this.item.type = updatedItem.type
        this.item.category = updatedItem.category
        this.item.groupNames = updatedItem.groupNames
        this.item.groupType = updatedItem.groupType
        this.item.function = updatedItem.function
        this.item.tags = updatedItem.tags
        // this.item.metadata = updatedItem.metadata
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
