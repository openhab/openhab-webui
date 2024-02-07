<template>
  <f7-treeview class="model-treeview">
    <model-treeview-item v-for="node in rootNodes"
                         :key="node.item.name" :model="node"
                         :includeItemName="includeItemName" :includeItemTags="includeItemTags"
                         @selected="nodeSelected" :selected="selectedItem"
                         @checked="(item, check) => $emit('checked', item, check)" />
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
</style>

<script>
export default {
  props: ['rootNodes', 'selectedItem', 'includeItemName', 'includeItemTags'],
  methods: {
    nodeSelected (node) {
      this.$emit('selected', node)
    }
  }
}
</script>
