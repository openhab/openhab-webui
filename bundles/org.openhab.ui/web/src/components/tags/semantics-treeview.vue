<template>
  <f7-treeview class="semantics-treeview">
    <semantics-treeview-item v-for="(childTag, idx) in rootTags"
                             :key="idx" :tag="childTag"
                             :semanticTags="semanticTags"
                             :expandedTags="expandedTags"
                             :showNames="showNames"
                             :showSynonyms="showSynonyms"
                             :canDragDrop="!!canDragDrop"
                             :picker="!!picker"
                             @selected="tagSelected" :selectedTag="selectedTag" />
  </f7-treeview>
</template>

<style lang="stylus">
.semantics-treeview
  --f7-treeview-tag-height 40px
  .treeview-item-label
    font-size 10pt
    white-space nowrap
    overflow-x hidden
  .synonyms-class
    font-size 8pt
    color var(--f7-list-item-footer-text-color)
</style>

<script>
import SemanticsTreeviewItem from '@/components/tags/treeview-item.vue'

export default {
  props: ['semanticTags', 'expandedTags', 'showNames', 'showSynonyms', 'picker', 'selectedTag', 'canDragDrop', 'propertyMode', 'limitToClass', 'hideNone'],
  components: {
    SemanticsTreeviewItem
  },
  data () {
    const tags = []
    if (this.picker && !this.hideNone) {
      tags.push('None')
    }
    if (this.propertyMode) {
      tags.push('Property')
      this.$set(this.expandedTags, 'Property', true)
    } else if (this.limitToClass) {
      tags.push(this.limitToClass)
      this.$set(this.expandedTags, this.limitToClass, true)
    } else {
      tags.push('Location', 'Equipment', 'Point', 'Property')
    }
    return {
      rootTags: tags.map((cls) => this.semanticTags.find((tag) => tag.uid === cls) || { uid: 'None', label: 'None' })
    }
  },
  methods: {
    tagSelected (tag) {
      this.$emit('selected', tag)
    }
  }
}
</script>
