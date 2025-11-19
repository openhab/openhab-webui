<template>
  <f7-treeview class="model-treeview">
    <draggable :disabled="!canDragDrop ? true : null"
               :list="children"
               :group="{ name: 'model-treeview', put: allowDrop }"
               animation="150"
               forceFallBack="true"
               fallbackOnBody="true"
               fallbackThreshold="5"
               scrollSensitivity="200"
               delay="400"
               delayOnTouchOnly="true"
               touchStartThreshold="10"
               invertSwap="true"
               sort="false"
               ghost-class="model-sortable-ghost"
               @start="onDragStart"
               @change="onDragChange"
               @end="onDragEnd"
               :move="onDragMove">
      <model-treeview-item v-for="node in children"
                           :key="node.item.name"
                           :model="node"
                           :parentNode="model"
                           :rootNode="model"
                           :includeItemName="includeItemName"
                           :includeItemTags="includeItemTags"
                           :canDragDrop="canDragDrop"
                           @selected="nodeSelected"
                           @clear-selected="clearSelection"
                           :selected="selected"
                           @checked="(item, check) => $emit('checked', item, check)"
                           @reload="$emit('reload')" />
      <!-- Drop zone for adding at root level -->
      <div v-if="canDragDrop" class="root-drop-zone">
        <!-- empty space to catch drops outside children -->
      </div>
    </draggable>
  </f7-treeview>
</template>

<style lang="stylus">
.model-treeview
  --f7-treeview-item-height 40px
  .treeview-item-label
    font-size 10pt
    white-space nowrap
    overflow-x hidden
  .semantic-class
    font-size 8pt
    color var(--f7-list-item-footer-text-color)
  .model-sortable-ghost
    visibility hidden      /* Don't show, but don't use display none as this will misalign the dragged item relative to the cursor, style to have 0 total height */
    position absolute
    z-index -1
    pointer-events none
    height 0 !important
    margin 0 !important
    padding 0 !important
    border none !important
  .root-drop-zone
    height 40px
    margin-top 4px
</style>

<script>
import { reactive, provide } from 'vue'
import { VueDraggableNext as Draggable } from 'vue-draggable-next'

import ModelTreeviewItem from '@/components/model/treeview-item.vue'
import ModelDragDropMixin from '@/pages/settings/model/model-dragdrop-mixin'

export default {
  mixins: [ModelDragDropMixin],
  props: {
    rootNodes: Array,
    selected: Object,
    includeItemName: Boolean,
    includeItemTags: Boolean,
    canDragDrop: Boolean
  },
  emits: ['reload', 'checked', 'selected', 'clear-selected'],
  components: {
    Draggable,
    ModelTreeviewItem
  },
  setup () {
    const moveState = reactive({
      moving: false,
      canAdd: false,
      canRemove: false,
      dragEnd: true,
      dragFinished: false,
      saving: false,
      cancelled: false,
      moveConfirmed: false,
      adding: false,
      removing: false,
      node: null,
      newParent: null,
      oldParent: null,
      oldIndex: null,
      dragStartTimestamp: null,
      nodesToUpdate: [],
      moveDelayedOpen: null,
      moveTarget: null,
      movedNode: null,
      toNode: null
    })

    provide('moveState', moveState)

    return {
      moveState
    }
  },
  computed: {
    model () {
      return {
        class: '',
        children: {
          locations: this.rootNodes.filter((n) => n.class.startsWith('Location')),
          equipment: this.rootNodes.filter((n) => n.class.startsWith('Equipment')),
          points: this.rootNodes.filter((n) => n.class.startsWith('Point')),
          groups: this.rootNodes.filter((n) => !n.class && n.item.type === 'Group'),
          items: this.rootNodes.filter((n) => !n.class && n.item.type !== 'Group')
        },
        opened: true,
        item: null
      }
    },
    rootNode () {
      return this.model
    }
  },
  methods: {
    nodeSelected (node) {
      this.$emit('selected', node)
    }
  }
}
</script>
