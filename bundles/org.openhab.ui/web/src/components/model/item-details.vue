<template>
  <f7-card v-if="model">
    <f7-card-content>
      <f7-list media-list>
        <ul>
          <item v-if="!createMode" :item="model.item" :link="'/settings/items/' + model.item.name" />
          <!-- <f7-list-button v-if="!editMode && !createMode" color="blue" title="Edit Item" @click="editMode = true">Edit Item</f7-list-button> -->
        </ul>
      </f7-list>

      <div class="padding-top" v-if="editMode">
        <item-form :item="model.item" :hide-type="true" :force-semantics="forceSemantics"></item-form>
      </div>
      <div class="padding-top" v-else-if="createMode">
        <item-form :item="model.item" :enable-name="true" :force-semantics="forceSemantics"></item-form>
      </div>
    </f7-card-content>
    <f7-card-footer v-if="createMode || editMode" key="item-card-buttons">
      <f7-button v-if="createMode" color="blue" fill raised @click="create">Create</f7-button>
      <f7-button v-else color="blue" fill raised @click="save">Save</f7-button>
      <f7-button v-if="createMode || editMode" color="blue" @click="cancel">Cancel</f7-button>
    </f7-card-footer>
    <f7-card-footer v-else key="item-card-buttons-edit-mode">
      <f7-button v-if="!editMode && !createMode" color="blue" @click="editMode = true" icon-ios="material:expand_more" icon-md="material:expand_more" icon-aurora="material:expand_more">Edit</f7-button>
      <f7-button v-if="!editMode && !createMode" color="red" @click="remove">Remove</f7-button>
    </f7-card-footer>
  </f7-card>
</template>

<script>
import Item from '@/components/item/item.vue'
import ItemForm from '@/components/item/item-form.vue'

export default {
  props: ['model', 'links'],
  components: {
    Item,
    ItemForm
  },
  data () {
    return {
      editMode: false,
      createMode: false,
      forceSemantics: false
    }
  },
  mounted () {
    this.onModelChange()
  },
  methods: {
    onModelChange () {
      this.editMode = false
      this.createMode = false
      this.forceSemantics = false
      if (this.model.item.created === false) {
        this.createMode = true
        if (this.model.item.metadata && this.model.item.metadata.semantics) {
          this.forceSemantics = true
        }
      }
    },
    save () {
      this.editMode = false
      this.$oh.api.put('/rest/items/' + this.model.item.name, this.model.item).then((data) => {
        this.$f7.toast.create({
          text: 'Item updated',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
      this.$emit('item-updated', this.model.item)
    },
    create () {
      this.editMode = false

      // TODO properly validate item
      if (!this.model.item.name) return

      this.$oh.api.put('/rest/items/' + this.model.item.name, this.model.item).then((data) => {
        this.$f7.toast.create({
          text: 'Item created',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.model.item.created = true
        this.model.item.editable = true
        this.$emit('item-created', this.model.item)
        this.onModelChange()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Item not created: ' + err,
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
    cancel () {
      if (this.createMode) {
        this.$emit('cancel-create')
      }
      this.createMode = false
      this.editMode = false
    }
  },
  watch: {
    model () {
      this.onModelChange()
    }
  }
}
</script>
