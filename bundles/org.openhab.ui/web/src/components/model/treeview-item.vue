<template>
  <f7-treeview-item selectable :label="label"
                    :icon-ios="icon('ios')" :icon-aurora="icon('aurora')" :icon-md="icon('md')"
                    :textColor="iconColor" :color="(model.item.created !== false) ? 'blue' :'orange'"
                    :selected="selected && selected.item.name === model.item.name"
                    :opened="model.opened" :toggle="canHaveChildren"
                    @treeview:open="model.opened = true" @treeview:close="model.opened = false" @click="select">
    <draggable :disabled="!canDragDrop" :list="children" :group="{ name: 'model-treeview', put: allowDrop }" animation="150" forceFallback="true" fallbackOnBody="true" fallbackThreshold="5"
               scrollSensitivity="200" delay="400" delayOnTouchOnly="true" touchStartThreshold="10" invertSwap="true" sort="false" ghost-class="model-sortable-ghost"
               @start="onDragStart" @change="onDragChange" @end="onDragEnd" :move="onDragMove">
      <template v-if="model.opened">
        <model-treeview-item v-for="node in children"
                             :key="node.item.name"
                             :model="node"
                             :parentNode="model"
                             :rootNode="rootNode"
                             @selected="(event) => $emit('selected', event)"
                             :selected="selected"
                             :includeItemName="includeItemName" :includeItemTags="includeItemTags"
                             :canDragDrop="canDragDrop"
                             :moveState="moveState"
                             @checked="(item, check) => $emit('checked', item, check)"
                             @reload="$emit('reload')" />
      </template>
    </draggable>
    <div slot="label" class="semantic-class">
      {{ className }}
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
  props: ['model', 'parentNode', 'rootNode', 'selected', 'includeItemName', 'includeItemTags', 'canDragDrop'],
  emits: ['reload'],
  components: {
    Draggable,
    ModelTreeviewItem: 'model-treeview-item'
  },
  computed: {
    label () {
      const item = this.model.item
      if (item.created === false) return '(New Item)'
      if (item.label) return this.includeItemName ? `${item.label} (${item.name})` : item.label
      return item.name
    },
    className () {
      if (!this.model.item.metadata || !this.model.item.metadata.semantics) return ''
      const semantics = this.model.item.metadata.semantics
      const property = (semantics.config && semantics.config.relatesTo)
        ? semantics.config.relatesTo : null
      return this.model.class.substring(this.model.class.lastIndexOf('_') + 1) +
        ((property) ? ' (' + property.replace('Property_', '') + ')' : '')
    }
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
