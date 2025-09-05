<template>
  <f7-treeview-item selectable
                    :label="tag.label + (showNames && tag.name ? ' (' + tag.name + ')': '')"
                    :icon-ios="icon('ios')"
                    :icon-aurora="icon('aurora')"
                    :icon-md="icon('md')"
                    :iconColor="iconColor"
                    :textColor="iconColor"
                    :selected="!picker && selected"
                    :opened="expandedTags[tag.uid]"
                    :toggle="canHaveChildren"
                    @treeview:open="setTagOpened(true)"
                    @treeview:close="setTagOpened(false)"
                    @click="select">
    <draggable :disabled="!canDragDrop ? true : null"
               :list="children"
               group="semantic-tags-treeview"
               filter=".non-draggable"
               animation="150"
               fallbackOnBody="true"
               swapThreshold="0.6"
               @start="onDragStart"
               @change="onDragChange"
               @end="onDragEnd"
               :move="onDragMove">
      <semantics-treeview-item v-for="(childTag, idx) in children"
                               :key="idx"
                               :tag="childTag"
                               :semanticTags="semanticTags"
                               :expandedTags="expandedTags"
                               :showNames="showNames"
                               :showSynonyms="showSynonyms"
                               :canDragDrop="canDragDrop"
                               :picker="picker"
                               @selected="(event) => $emit('selected', event)"
                               :selectedTag="selectedTag"
                               :moveState="moveState"
                               :class="{ 'non-draggable': !childTag.editable }" />
    </draggable>
    <template #label>
      <div v-if="showSynonyms" class="synonyms-class">
        {{ synonyms }}
      </div>
    </template>
    <template #content-start>
      <f7-radio v-if="picker"
                name="semantic-tag-radio"
                :checked="selected"
                @change="select" />
    </template>
    <template #content-end>
      <f7-badge v-if="tag.description"
                class="semantic-tag-tooltip-badge"
                :tooltip="tooltip">
        <f7-icon class="tooltip-icon"
                 f7="info_circle"
                 ios="f7:info_circle"
                 md="material:info"
                 color="gray" />
      </f7-badge>
    </template>
  </f7-treeview-item>
</template>

<style lang="stylus">
.semantic-tag-tooltip-badge
  background: transparent
</style>

<script>
import { VueDraggableNext as Draggable } from 'vue-draggable-next'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export default {
  name: 'semantics-treeview-item',
  props: {
    semanticTags: Array,
    expandedTags: Array,
    tag: Object,
    picker: Boolean,
    showNames: Boolean,
    showSynonyms: Boolean,
    canDragDrop: Boolean,
    selectedTag: Object,
    moveState: {
      type: Object,
      default: () => ({
        moving: false,
        moveDelayedOpen: null,
        moveTarget: null
      })
    }
  },
  emits: ['selected'],
  components: {
    Draggable,
    SemanticsTreeviewItem: 'semantics-treeview-item'
  },
  computed: {
    children () {
      return this.semanticTags.filter((tag) => (tag.parent === this.tag.uid)).sort((t1, t2) => {
        return t1.label.localeCompare(t2.label)
      })
    },
    iconColor () {
      return (this.tag.editable || this.picker) ? (useUIOptionsStore().getDarkMode() === 'dark' ? 'white' : 'black') : 'gray'
    },
    canHaveChildren () {
      return (this.children.length > 0 || this.moveState.moving) === true
    },
    synonyms () {
      return this.tag?.synonyms?.join(', ') || ''
    },
    tooltip () {
      let tooltip = this.tag.description
      if (this.synonyms) {
        tooltip = tooltip + '<br>(' + this.synonyms + ')'
      }
      return tooltip
    },
    selected () {
      return this.selectedTag && this.selectedTag.uid === this.tag.uid
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
      } else if (type === 'None') {
        return ''
      } else {
        return 'material:label_outline'
      }
    },
    select (event) {
      if (this.$$(event.target).is('.treeview-toggle')) return
      this.$emit('selected', this.tag)
    },
    setTagOpened (opened, uid) {
      const tagUid = uid || this.tag.uid
      this.expandedTags[tagUid] = opened
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
      if (this.moveState.moveTarget && !this.moveState.moveTarget.opened) {
        this.moveState.moveDelayedOpen = setTimeout(() => {
          this.setTagOpened(true, this.moveState.moveTarget.uid)
        }, 1000)
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
