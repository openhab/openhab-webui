<template>
  <f7-card v-if="model" @page:beforein="onPageBeforeIn" @page:beforeout="onPageBeforeOut">
    <f7-card-content>
      <f7-list media-list accordion-list>
        <ul>
          <item v-if="!createMode" :item="model.item" :link="'/settings/items/' + model.item.name" :context="context" :no-tags="editMode" />
          <!-- <f7-list-button v-if="!editMode && !createMode" color="blue" title="Edit Item" @click="editMode = true">Edit Item</f7-list-button> -->
        </ul>
      </f7-list>

      <div class="padding-top" v-if="editMode">
        <item-form :item="editedItem" :hide-type="true" :force-semantics="forceSemantics" />
      </div>
      <div class="padding-top" v-else-if="createMode">
        <item-form :item="editedItem" :items="items" :createMode="true" :force-semantics="forceSemantics" />
      </div>
    </f7-card-content>
    <f7-card-footer v-if="createMode || editMode" key="item-card-buttons">
      <f7-button v-if="createMode" color="blue" fill raised @click="create">
        Create
      </f7-button>
      <f7-button v-else color="blue" fill raised @click="save" v-show="model.item.editable">
        Save
      </f7-button>
      <f7-button v-if="model.item.editable" color="blue" @click="cancel">
        Cancel
      </f7-button>
      <f7-button v-else color="blue" @click="cancel" icon-ios="material:expand_less" icon-md="material:expand_less" icon-aurora="material:expand_less">
        Hide Details
      </f7-button>
    </f7-card-footer>
    <f7-card-footer v-else key="item-card-buttons-edit-mode">
      <f7-button v-if="model.item.editable" color="blue" @click="edit" icon-ios="material:expand_more" icon-md="material:expand_more" icon-aurora="material:expand_more">
        Edit
      </f7-button>
      <f7-button v-if="model.item.editable" color="red" @click="remove">
        Remove
      </f7-button>
      <f7-button v-else color="blue" @click="edit" icon-ios="material:expand_more" icon-md="material:expand_more" icon-aurora="material:expand_more">
        View Details
      </f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<script>
import Item from '@/components/item/item.vue'
import ItemForm from '@/components/item/item-form.vue'

import ItemMixin from '@/components/item/item-mixin'

export default {
  mixins: [ItemMixin],
  props: ['model', 'links', 'items', 'context'],
  components: {
    Item,
    ItemForm
  },
  data () {
    return {
      editMode: false,
      createMode: false,
      forceSemantics: false,
      editedItem: {}
    }
  },
  mounted () {
    this.onModelChange()
  },
  methods: {
    onPageBeforeIn () {
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
      if (ev.keyCode === 46) { // delete key
        this.remove()
        ev.stopPropagation()
        ev.preventDefault()
      }
    },
    onModelChange () {
      this.editMode = false
      this.createMode = false
      this.forceSemantics = false
      if (this.model.item.created === false) {
        this.$set(this, 'editedItem', Object.assign({}, this.model.item))
        this.createMode = true
        if (this.model.item.metadata && this.model.item.metadata.semantics) {
          this.forceSemantics = true
        }
      }
    },
    save () {
      this.editMode = false
      this.saveItem(this.editedItem).then(() => {
        this.$f7.toast.create({
          text: 'Item updated',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.$emit('item-updated', this.editedItem)
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Item not saved: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    create () {
      this.editMode = false

      // TODO properly validate item
      if (!this.editedItem.name) return

      this.saveItem(this.editedItem).then(() => {
        this.$f7.toast.create({
          text: 'Item created',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.$set(this.model, 'item', this.editedItem)
        this.model.item.created = true
        this.model.item.editable = true
        this.$emit('item-created', this.model.item)
        this.onModelChange()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Item not saved: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    remove () {
      const vm = this

      this.$f7.dialog.confirm(
        'Remove ' + this.model.item.name + '?',
        'Remove Item',
        () => {
          vm.doRemove()
        }
      )
    },
    doRemove () {
      this.editMode = false

      this.$oh.api.delete('/rest/items/' + this.model.item.name).then((data) => {
        this.$f7.toast.create({
          text: 'Item removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.model.item.created = true
        this.model.item.editable = true
        this.$emit('item-removed', this.model.item)
        this.onModelChange()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Item not removed: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    edit () {
      this.editMode = true
      this.$set(this, 'editedItem', Object.assign({}, this.model.item))
    },
    cancel () {
      if (this.createMode) {
        this.$emit('cancel-create')
      }
      this.createMode = false
      this.editMode = false
      this.$set(this, 'editedItem', {})
    }
  },
  watch: {
    model () {
      this.onModelChange()
    }
  }
}
</script>
