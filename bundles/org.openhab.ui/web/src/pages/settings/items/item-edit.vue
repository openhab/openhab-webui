<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar :title="pageTitle + dirtyIndicator" :back-link="editable ? 'Cancel': 'Back'">
      <f7-nav-right v-show="ready">
        <f7-link v-if="!editable" icon-f7="lock_fill" icon-only :tooltip="notEditableMsg" />
        <f7-link v-else-if="$theme.md" icon-md="material:save" icon-only @click="save()" />
        <f7-link v-else @click="save()">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs v-if="ready">
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block class="block-narrow" v-if="item.name || item.created === false">
          <f7-col v-if="!editable">
            <div class="padding-left">
              Note: {{ notEditableMsg }}
            </div>
          </f7-col>
          <f7-col>
            <item-form ref="itemForm" :item="item" :items="items" :createMode="createMode" />
          </f7-col>

          <div class="flex-shrink-0 if-aurora display-flex justify-content-center">
            <f7-button text="Create" v-if="createMode" style="width: 150px" class="margin-horizontal" color="blue" raised fill @click="save" />
            <f7-button text="Save" v-else-if="editable" style="width: 150px" class="margin-horizontal" color="blue" raised fill @click="save" />
            <f7-button :text="editable ? 'Cancel' : 'Back'" color="blue" @click="$f7router.back()" />
          </div>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <f7-icon v-if="!editable" f7="lock" class="float-right margin" style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray" :tooltip="notEditableMsg" />
        <editor class="item-code-editor" mode="application/vnd.openhab.item+yaml" :value="itemYaml" @input="onEditorInput" :readOnly="!editable" />
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.item-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import * as Types from '@/assets/item-types.js'
import YAML from 'yaml'

import ItemForm from '@/components/item/item-form.vue'

import DirtyMixin from '../dirty-mixin'
import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [DirtyMixin, ItemMixin],
  props: ['itemName', 'createMode', 'itemCopy'],
  components: {
    ItemForm,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  data () {
    return {
      ready: false,
      loading: false,
      item: {},
      savedItem: {},
      itemYaml: '',
      items: [],
      types: Types,
      semanticClasses: this.$store.getters.semanticClasses,
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
    item: {
      handler: function () {
        if (!this.loading) { // ignore changes during loading
          const itemClone = cloneDeep(this.item)
          delete itemClone.functionKey
          this.dirty = !fastDeepEqual(itemClone, this.savedItem)
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
        this.$set(this, 'item', newItem)
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
          this.$nextTick(() => {
            this.ready = true
            this.loading = false
          })
        })
      }
    },
    save () {
      if (!this.editable) return
      if (this.currentTab === 'code') {
        if (!this.fromYaml()) return
      }
      if (this.validateItemName(this.item.name) !== '') return this.$f7.dialog.alert('Please give the Item a valid name: ' + this.validateItemName(this.item.name)).open()
      if (!this.item.type || !this.types.ItemTypes.includes(this.item.type.split(':')[0])) return this.$f7.dialog.alert('Please give Item a valid type').open()

      const typeChange = this.$refs.itemForm.typeChanged()
      const dimensionChange = this.$refs.itemForm.dimensionChanged()
      const unitChange = this.$refs.itemForm.unitChanged()
      if (typeChange || dimensionChange || unitChange) {
        const title = 'WARNING: ' + (typeChange ? 'Type' : (dimensionChange ? 'Dimension' : 'Unit')) + ' Changed'
        const text = (typeChange || dimensionChange) ? `Existing links to channels ${dimensionChange ? 'with dimensions ' : ''}may no longer be valid!` : 'Changing the internal unit can corrupt your persisted data and affect rules!'
        return this.$f7.dialog.create({
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
          this.$f7.toast.create({
            text: 'Item created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.item.created = true
          this.item.editable = true
        } else {
          this.$f7.toast.create({
            text: 'Item updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }

        this.dirty = false
        this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Item not saved: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    onEditorInput (value) {
      this.itemYaml = value
    },
    toYaml () {
      const yamlObj = {
        label: this.item.label,
        type: this.item.type,
        category: this.item.category || '',
        groupNames: this.item.groupNames || [],
        tags: this.item.tags
        // metadata: this.item.metadata
      }
      if (this.item.type === 'Group') {
        yamlObj.groupType = this.item.groupType || 'None'
        yamlObj.function = this.item.function || 'None'
      }
      this.itemYaml = YAML.stringify(yamlObj)
    },
    fromYaml () {
      if (!this.editable) return false
      try {
        const updatedItem = YAML.parse(this.itemYaml)
        if (updatedItem === null) return false
        if (updatedItem.groupNames == null) updatedItem.groupNames = []
        if (updatedItem.tags == null) updatedItem.tags = []
        this.$set(this.item, 'label', updatedItem.label)
        this.$set(this.item, 'type', updatedItem.type)
        this.$set(this.item, 'category', updatedItem.category)
        this.$set(this.item, 'groupNames', updatedItem.groupNames)
        this.$set(this.item, 'groupType', updatedItem.groupType)
        this.$set(this.item, 'function', updatedItem.function)
        this.$set(this.item, 'tags', updatedItem.tags)
        // this.$set(this.item, 'metadata', updatedItem.metadata)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
