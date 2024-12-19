<template>
  <f7-treeview-item v-if="itemsReady" selectable :label="widgetConfigLabel()"
                    :icon-f7="widgetTypeIcon()"
                    :textColor="iconColor" :color="'blue'"
                    :selected="selected && selected === widget"
                    :opened="!widget.closed"
                    @click="select">
    <sitemap-treeview-item class="sitemap-treeview-item" v-for="(childwidget, idx) in children"
                           :key="idx"
                           :includeItemName="includeItemName"
                           :widget="childwidget" :parent-widget="widget"
                           :itemsList="items"
                           @selected="(event) => $emit('selected', event)"
                           :selected="selected" />
    <div slot="label" class="subtitle">
      {{ subtitle() }}
    </div>
  </f7-treeview-item>
</template>

<style lang="stylus">
.sitemap-tree
  .treeview
    .treeview-item-content
      width calc(100% - (var(--f7-treeview-toggle-size) + 5px))
    .subtitle
      overflow hidden
      text-overflow ellipsis
</style>

<script>
import SitemapMixin from '@/components/pagedesigner/sitemap/sitemap-mixin'

export default {
  name: 'sitemap-treeview-item',
  mixins: [SitemapMixin],
  props: ['includeItemName', 'widget', 'parentWidget', 'itemsList', 'selected'],
  components: {
    SitemapTreeviewItem: 'sitemap-treeview-item'
  },
  methods: {
    subtitle () {
      return this.widgetTypeLabel() + this.widgetConfigDescription(this.includeItemName)
    },
    select (event) {
      let self = this
      let $ = self.$$
      if ($(event.target).is('.treeview-toggle')) return
      this.$emit('selected', [this.widget, this.parentWidget])
    }
  },
  computed: {
    iconColor () {
      return ''
    },
    children () {
      if (!this.widget.slots || !this.widget.slots.widgets) return []
      return this.widget.slots.widgets
    }
  }
}
</script>
