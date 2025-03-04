<template>
  <f7-treeview-item selectable :label="(model.item.created === false) ? '(New Item)' : (model.item.label ? (includeItemName ? model.item.label + ' (' + model.item.name + ')' : model.item.label) : model.item.name)"
                    :icon-ios="icon('ios')" :icon-aurora="icon('aurora')" :icon-md="icon('md')"
                    :textColor="iconColor" :color="(model.item.created !== false) ? 'blue' :'orange'"
                    :selected="selected && selected.item.name === model.item.name"
                    :opened="model.opened" :toggle="canHaveChildren"
                    @click="select">
    <draggable :disabled="!canDragDrop || !model.item.editable" :list="children" group="model-treeview" animation="150"
               scrollSensitivity="200" delay="400" delayOnTouchOnly="true" invertSwap="true"
               @start="onDragStart" @change="onDragChange" @end="onDragEnd" :move="onDragMove">
      <model-treeview-item v-for="(node, index) in children"
                           :key="node.item.name + '_' + index"
                           :model="node"
                           :parentNode="model"
                           @selected="(event) => $emit('selected', event)"
                           :selected="selected"
                           :includeItemName="includeItemName" :includeItemTags="includeItemTags"
                           :canDragDrop="canDragDrop"
                           :moveState="moveState"
                           @checked="(item, check) => $emit('checked', item, check)"
                           @reload="$emit('reload')" />
    </draggable>
    <div slot="label" class="semantic-class">
      {{ className() }}
      <template v-if="includeItemTags">
        <div class="semantic-class chip" v-for="tag in getNonSemanticTags(model.item)" :key="tag" style="height: 16px; margin-left: 4px">
          <div class="chip-media bg-color-blue" style="height: 16px; width: 16px">
            <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" style="font-size: 8px; height: 16px; line-height: 16px" />
          </div>
          <div class="chip-label" style="height: 16px; line-height: 16px">
            {{ tag }}
          </div>
        </div>
      </template>
    </div>
    <f7-checkbox slot="content-start" v-if="model.checkable"
                 :checked="model.checked === true" :disabled="model.disabled" @change="check" />
  </f7-treeview-item>
</template>

<script>
import ItemMixin from '@/components/item/item-mixin'
import ModelDragDropMixin from '@/pages/settings/model/model-dragdrop-mixin'
import Draggable from 'vuedraggable'

export default {
  name: 'model-treeview-item',
  mixins: [ItemMixin, ModelDragDropMixin],
  props: ['model', 'parentNode', 'selected', 'includeItemName', 'includeItemTags', 'canDragDrop'],
  emits: ['reload'],
  components: {
    Draggable,
    ModelTreeviewItem: 'model-treeview-item'
  },
  methods: {
    icon (theme) {
      if (this.model.class?.indexOf('Location') === 0) {
        return (theme === 'md') ? 'material:place' : 'f7:placemark'
      } else if (this.model.class?.indexOf('Equipment') === 0) {
        return (theme === 'md') ? 'material:payments' : 'f7:cube_box'
      } else if (this.model.class?.indexOf('Point') === 0) {
        return (theme === 'md') ? 'material:flash_on' : 'f7:bolt_fill'
      } else if (this.model.item.type === 'Group') {
        return (theme === 'md') ? 'material:folder' : 'f7:folder'
      } else {
        return 'material:label_outline'
      }
    },
    className () {
      if (!this.model.item.metadata || !this.model.item.metadata.semantics) return
      const semantics = this.model.item.metadata.semantics
      const property = (semantics.config && semantics.config.relatesTo)
        ? semantics.config.relatesTo : null
      return this.model.class.substring(this.model.class.lastIndexOf('_') + 1) +
        ((property) ? ' (' + property.replace('Property_', '') + ')' : '')
    },
    select (event) {
      let self = this
      if (self.dragDropActive) return // avoid opening item properties during drag drop
      let $ = self.$$
      if ($(event.target).is('.treeview-toggle')) return
      if ($(event.target).is('.checkbox') || $(event.target).is('.icon-checkbox') || $(event.target).is('input')) return
      this.$emit('selected', this.model)
      if (this.model.checkable && !this.children.length) this.check({ target: { checked: !this.model.checked } })
    },
    check (event) {
      if (this.model.disabled) return
      this.model.checked = event.target.checked
      this.$emit('checked', this.model, event.target.checked)
    }
  }
}
</script>
