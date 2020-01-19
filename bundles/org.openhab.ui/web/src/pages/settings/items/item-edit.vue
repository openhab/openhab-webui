<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar :title="createMode ? 'Create New Item': 'Edit Item'" back-link="Cancel">
      <f7-nav-right>
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-block class="block-narrow" v-if="item.name || item.created === false">
      <f7-col v-if="item.editable === false">
        <div class="padding-left">Note: this item is not editable because it has been created with textual configuration.</div>
      </f7-col>
      <f7-col>
        <item-form :item="item" :enable-name="createMode"></item-form>
      </f7-col>
      <f7-col>
        <f7-block-title>Group Membership</f7-block-title>
        <f7-list v-if="ready">
          <item-picker title="Parent Group(s)" name="parent-groups" :value="item.groupNames" @input="(value) => item.groupNames = value" :multiple="true" filterType="Group"></item-picker>
        </f7-list>
      </f7-col>
      <f7-col v-if="item && item.type === 'Group'">
        <f7-block-title>Group Settings</f7-block-title>
        <group-form :item="item"></group-form>
      </f7-col>
      <f7-col class="tags-editor">
        <f7-block-title>Non-Semantic Tags</f7-block-title>
        <tag-input :item="item"></tag-input>
      </f7-col>
      <f7-col>
        <!-- <f7-list>
          <f7-list-button color="blue" title="Edit Channel Links"></f7-list-button>
        </f7-list> -->
        <!-- <f7-list>
          <f7-list-button color="red" title="Delete this Item"></f7-list-button>
        </f7-list> -->
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<script>
import * as Types from '@/assets/item-types.js'
import * as SemanticClasses from '@/assets/semantics.js'

import ItemForm from '@/components/item/item-form.vue'
import GroupForm from '@/components/item/group-form.vue'
import TagInput from '@/components/tags/tag-input.vue'
import ItemPicker from '@/components/config/controls/item-picker.vue'

export default {
  props: ['itemName', 'createMode'],
  components: {
    ItemPicker,
    ItemForm,
    GroupForm,
    TagInput
  },
  data () {
    return {
      ready: false,
      item: {},
      types: Types,
      semanticClasses: SemanticClasses,
      semanticClass: '',
      semanticProperty: '',
      pendingTag: ''
    }
  },
  created () {
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
        this.ready = true
      } else {
        const loadItem = this.$oh.api.get('/rest/items/' + this.itemName + '?metadata=semantics')
        loadItem.then((data) => {
          if (!data.groupType) data.groupType = 'None'
          this.item = data
          this.ready = true
        })
      }
    },
    save () {
      // TODO properly validate item
      if (!this.item.name) return
      if (this.item.groupType === 'None') delete this.item.groupType

      this.$oh.api.put('/rest/items/' + this.item.name, this.item).then((data) => {
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
        this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Item not saved: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    }
  }
}
</script>
