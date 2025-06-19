<template>
  <f7-treeview class="semantics-treeview">
    <semantics-treeview-item v-for="childTag in rootTags"
                             :key="childTag.uid" :tag="childTag"
                             :semanticTags="semanticTags"
                             :expandedTags="expandedTags"
                             :showNames="showNames"
                             @selected="tagSelected" :selected="selected" />
  </f7-treeview>
</template>

<style lang="stylus">
.semantics-treeview
  --f7-treeview-tag-height 40px
  .treeview-tag-label
    font-size 10pt
    white-space nowrap
    overflow-x hidden
</style>

<script>
import SemanticsTreeviewItem from '@/components/tags/treeview-item.vue'

export default {
  props: ['semanticTags', 'expandedTags', 'showNames', 'selected'],
  components: {
    SemanticsTreeviewItem
  },
  data () {
    return {
      rootTags: ['Location', 'Equipment', 'Point', 'Property'].map((cls) => this.semanticTags.find((tag) => tag.uid === cls))
    }
  },
  methods: {
    tagSelected (tag) {
      this.$emit('selected', tag)
    }
  }
}
</script>
