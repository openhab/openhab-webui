<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar :title="createMode ? 'Create New Item': 'Edit Item'" back-link="Cancel">
      <f7-nav-right v-if="createMode || item.editable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
      <f7-link v-else slot="right" icon-f7="lock_fill" icon-only tooltip="This item is not editable through the UI" />
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block class="block-narrow" v-if="item.name || item.created === false">
          <f7-col v-if="item.editable === false">
            <div class="padding-left">
              Note: {{ notEditableMgs }}
            </div>
          </f7-col>
          <f7-col>
            <item-form :item="item" :items="items" :createMode="createMode" />
          </f7-col>
          <f7-col>
            <f7-block-title>Group Membership</f7-block-title>
            <f7-list v-if="ready">
              <item-picker title="Parent Group(s)" name="parent-groups" :value="item.groupNames" @input="(value) => item.groupNames = value" :items="items" :multiple="true" filterType="Group" />
            </f7-list>
          </f7-col>
          <f7-col v-if="item && item.type === 'Group'">
            <f7-block-title>Group Settings</f7-block-title>
            <group-form :item="item" :createMode="createMode" />
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <f7-icon v-if="item.editable === false" f7="lock" class="float-right margin" style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray" :tooltip="notEditableMgs" />
        <editor class="item-code-editor" mode="application/vnd.openhab.item+yaml" :value="itemYaml" @input="onEditorInput" :readOnly="item.editable === false" />
      </f7-tab>
    </f7-tabs>

    <div v-if="ready && createMode && currentTab === 'design'" class="if-aurora display-flex justify-content-center margin padding">
      <div class="flex-shrink-0">
        <f7-button class="padding-left padding-right" style="width: 150px" color="blue" large raised fill @click="save">
          Create
        </f7-button>
      </div>
    </div>
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
import * as Types from '@/assets/item-types.js'
import YAML from 'yaml'

import ItemForm from '@/components/item/item-form.vue'
import GroupForm from '@/components/item/group-form.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'

import DirtyMixin from '../dirty-mixin'
import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [DirtyMixin, ItemMixin],
  props: ['itemName', 'createMode'],
  components: {
    ItemPicker,
    ItemForm,
    GroupForm,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  data () {
    return {
      ready: false,
      item: {},
      itemYaml: '',
      items: [],
      types: Types,
      semanticClasses: this.$store.getters.semanticClasses,
      semanticClass: '',
      semanticProperty: '',
      pendingTag: '',
      currentTab: 'design',
      notEditableMgs: 'This Item is not editable because it has been provisioned from a file.'
    }
  },
  computed: {
    editable () {
      return this.createMode || this.item.editable
    }
  },
  watch: {
    item: {
      handler: function () {
        if (this.ready) {
          this.dirty = true
        }
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn () {
      if (this.createMode) {
        const newItem = {
          name: 'NewItem',
          label: 'New Item',
          category: '',
          type: 'String',
          groupNames: [],
          tags: [],
          created: false
        }
        this.$set(this, 'item', newItem)
        this.$oh.api.get('/rest/items?staticDataOnly=true').then((items) => {
          this.items = items
          this.ready = true
        })
      } else {
        const loadItem = this.$oh.api.get('/rest/items/' + this.itemName + '?metadata=.*')
        loadItem.then((data) => {
          this.item = data
          this.$nextTick(() => {
            this.ready = true
          })
        })
      }
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
    save () {
      if (this.currentTab === 'code') {
        if (!this.fromYaml()) return Promise.reject()
      }
      if (this.validateItemName(this.item.name) !== '') return this.$f7.dialog.alert('Please give the Item a valid name: ' + this.validateItemName(this.item.name)).open()
      if (!this.item.type || !this.types.ItemTypes.includes(this.item.type.split(':')[0])) return this.$f7.dialog.alert('Please give Item a valid type').open()

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
      this.dirty = true
    },
    toYaml () {
      const yamlObj = {
        label: this.item.label,
        type: this.item.type,
        category: this.item.category,
        groupNames: this.item.groupNames,
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
      if (!this.item.editable) return false
      try {
        const updatedItem = YAML.parse(this.itemYaml)
        if (updatedItem === null) return false
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
