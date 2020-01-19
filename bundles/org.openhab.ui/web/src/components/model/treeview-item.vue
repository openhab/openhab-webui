<template>
  <f7-treeview-item selectable :label="(model.item.created === false) ? '(New Item)' : (model.item.label || model.item.name)"
    :icon-ios="icon('ios')" :icon-aurora="icon('aurora')" :icon-md="icon('md')"
    :textColor="iconColor" :color="(model.item.created !== false) ? 'blue' :'orange'"
    :selected="selected && selected.item.name === model.item.name"
    :opened="model.opened"
    @click="select">
    <model-treeview-item v-for="node in [model.children.locations,
          model.children.equipments, model.children.points,
          model.children.groups, model.children.items].flat()"
      :key="node.item.name"
      :model="node" @selected="(event) => $emit('selected', event)"
      :selected="selected" />
    <div slot="label" class="semantic-class"> {{className()}}</div>
  </f7-treeview-item>
</template>

<script>
export default {
  props: ['model', 'selected'],
  methods: {
    icon (theme) {
      if (this.model.class.indexOf('Location') === 0) {
        return (theme === 'md') ? 'material:place' : 'f7:placemark'
      } else if (this.model.class.indexOf('Equipment') === 0) {
        return (theme === 'md') ? 'material:highlight' : 'f7:lightbulb'
      } else if (this.model.class.indexOf('Point') === 0) {
        return (theme === 'md') ? 'material:flash_on' : 'f7:bolt_fill'
      } else if (this.model.item.type === 'Group') {
        return (theme === 'md') ? 'material:folder' : 'f7:folder'
      } else {
        return 'material:label_outline'
      }
    },
    className () {
      if (!this.model.item.metadata) return
      const semantics = this.model.item.metadata.semantics
      const property = (semantics.config && semantics.config.relatesTo)
        ? semantics.config.relatesTo : null
      return this.model.class.substring(this.model.class.lastIndexOf('_') + 1) +
        ((property) ? ' (' + property.replace('Property_', '') + ')' : '')
    },
    select (event) {
      var self = this
      var $ = self.$$
      if ($(event.target).is('.treeview-toggle')) return
      this.$emit('selected', this.model)
    }
  },
  computed: {
    iconColor () {
      return (this.model.item.metadata) ? '' : 'gray'
    }
  }
}
</script>
