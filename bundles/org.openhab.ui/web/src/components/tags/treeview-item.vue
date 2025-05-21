<template>
  <f7-treeview-item selectable :label="tag.label + (showNames ? ' (' + tag.name + ')': '')"
                    :icon-ios="icon('ios')" :icon-aurora="icon('aurora')" :icon-md="icon('md')"
                    :iconColor="iconColor"
                    :textColor="iconColor"
                    :selected="selected && selected === tag"
                    :opened="expandedTags[tag.uid]"
                    :toggle="canHaveChildren"
                    @treeview:open="setTagOpened(true)"
                    @treeview:close="setTagOpened(false)"
                    @click="select">
    <draggable :list="children" group="semantic-tags-treeview" filter=".non-draggable" animation="150" fallbackOnBody="true" swapThreshold="0.6"
               @start="onDragStart" @change="onDragChange" @end="onDragEnd" :move="onDragMove">
      <semantics-treeview-item v-for="(childTag, idx) in children"
                               :key="idx"
                               :tag="childTag"
                               :semanticTags="semanticTags"
                               :expandedTags="expandedTags"
                               :showNames="showNames"
                               @selected="(event) => $emit('selected', event)"
                               :selected="selected"
                               :moveState="moveState"
                               :class="{ 'non-draggable': !childTag.editable }" />
    </draggable>
  </f7-treeview-item>
</template>

<script>
import Draggable from 'vuedraggable'

export default {
  name: 'semantics-treeview-item',
  props: {
    semanticTags: Array,
    expandedTags: Array,
    tag: Object,
    showNames: Boolean,
    selected: Object,
    moveState: {
      type: Object,
      default: () => ({
        moving: false,
        moveDelayedOpen: null,
        moveTarget: null
      })
    }
  },
  components: {
    Draggable,
    SemanticsTreeviewItem: 'semantics-treeview-item'
  },
  computed: {
    children () {
      return this.semanticTags.filter((tag) => (tag.parent === this.tag.uid)).sort((t1, t2) => {
        if (t1.uid > t2.uid) return 1
        if (t1.uid < t2.uid) return -1
        return 0
      })
    },
    iconColor () {
      return (this.tag.editable) ? (this.$f7.data.themeOptions.dark === 'dark' ? 'white' : 'black') : 'gray'
    },
    canHaveChildren () {
      return (this.children.length > 0 || this.moveState.moving) === true
    }
  },
  methods: {
    icon (theme) {
      const type = this.tag.uid.split('_')[0]
      if (type === 'Location') {
        return (theme === 'md') ? 'material:place' : 'f7:placemark'
      } else if (type === 'Equipment') {
        return (theme === 'md') ? 'material:payments' : 'f7:cube_box'
      } else if (type === 'Point') {
        return (theme === 'md') ? 'material:flash_on' : 'f7:bolt_fill'
      } else {
        return 'material:label_outline'
      }
    },
    select (event) {
      let self = this
      let $ = self.$$
      if ($(event.target).is('.treeview-toggle')) return
      this.$emit('selected', this.tag)
    },
    setTagOpened (opened, uid) {
      const tagUid = uid || this.tag.uid
      this.$set(this.expandedTags, tagUid, opened)
    },
    onDragStart (event) {
      console.debug('Drag start event:', event)
      this.moveState.moving = true
    },
    onDragChange (event) {
      console.debug('Drag change event:', event)
      if (event.added) {
        const tag = event.added.element
        const oldUid = tag.uid
        const newUid = this.tag.uid + '_' + tag.name
        this.semanticTags.filter((t) => t.uid.startsWith(oldUid)).forEach((t) => {
          const uid = t.uid
          t.uid = t.uid.replace(oldUid, newUid)
          t.parent = t.uid.slice(0, t.uid.lastIndexOf('_'))
          this.setTagOpened(!!this.expandedTags[uid], t.uid)
        })
      }
    },
    onDragMove (event) {
      console.debug('Drag move - event:', event)
      // Cancel opening previous group we moved over as we moved away from it
      const movedToSamePlace = event.relatedContext?.element?.uid === this.moveState.moveTarget?.uid
      if (!movedToSamePlace) {
        clearTimeout(this.moveState.moveDelayedOpen)
        this.moveState.moveDelayedOpen = null
      }
      this.moveState.moveTarget = event.relatedContext?.element
      // Open group if not open yet, with a delay so you don't open it if you just drag over it
      if (!this.moveState.moveTarget?.opened) {
        const element = event.relatedContext.element
        this.moveState.moveDelayedOpen = setTimeout(() => {
          this.setTagOpened(true, element.uid)
        }, 1000, element)
      }
      return true
    },
    onDragEnd (event) {
      console.debug('Drag end event:', event)
      this.moveState.moving = false
    }
  }
}
</script>
