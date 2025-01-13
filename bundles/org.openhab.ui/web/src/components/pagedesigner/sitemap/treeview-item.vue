<template>
  <f7-treeview-item v-if="itemsReady" selectable :label="widgetConfigLabel()"
                    :icon-f7="widgetTypeIcon()"
                    :textColor="iconColor" :color="'blue'"
                    :selected="selected && selected === widget"
                    :opened="!widget.closed"
                    :toggle="canHaveChildren"
                    @treeview:open="setWidgetClosed(false)"
                    @treeview:close="setWidgetClosed(true)"
                    @click="select">
    <draggable :list="children" group="sitemap-treeview" animation="150" fallbackOnBody="true" swapThreshold="0.6"
               @start="onStart" @change="onChange" @end="onEnd">
      <sitemap-treeview-item class="sitemap-treeview-item" v-for="(childwidget, idx) in children"
                             :key="idx"
                             :includeItemName="includeItemName"
                             :widget="childwidget" :parentWidget="widget"
                             :itemsList="items"
                             @selected="(event) => $emit('selected', event)"
                             :selected="selected"
                             :sitemap="localSitemap"
                             :moveState="localMoveState" />
    </draggable>
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
import Draggable from 'vuedraggable'
import fastDeepEqual from 'fast-deep-equal/es6'

export default {
  name: 'sitemap-treeview-item',
  mixins: [SitemapMixin],
  props: ['includeItemName', 'widget', 'parentWidget', 'itemsList', 'selected', 'sitemap', 'moveState'],
  components: {
    Draggable,
    SitemapTreeviewItem: 'sitemap-treeview-item'
  },
  data () {
    return {
      localSitemap: this.sitemap ? this.sitemap : this.widget,
      localMoveState: this.moveState ? this.moveState : {}
    }
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
    },
    onStart (event) {
      console.debug('Drag start event:', event)
      this.$set(this.localMoveState, 'moving', true)
      this.$set(this.localMoveState, 'widget', this.widget.slots.widgets[event.oldIndex])
      this.$set(this.localMoveState, 'oldList', this.widget.slots.widgets)
      this.$set(this.localMoveState, 'oldIndex', event.oldIndex)
    },
    onChange (event) {
      console.debug('Drag change event:', event)
      if (event.added) {
        this.$set(this.localMoveState, 'moving', false)
        this.validateMove(event.added.newIndex)
      }
    },
    onEnd (event) {
      console.debug('Drag end event:', event)
      this.$set(this.localMoveState, 'moving', false)
      this.validateMove(event.newIndex)
    },
    validateMove (newIndex) {
      const widget = this.localMoveState.widget
      const parentWidget = this.findParent(widget, this.localSitemap)
      const newList = parentWidget.slots.widgets
      console.debug('New parent:', parentWidget)
      if (!this.allowedWidgetTypes(parentWidget, newIndex).map(wt => wt.type).includes(widget.component)) {
        this.$f7.toast.create({
          text: 'Move invalid',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        console.debug('Move invalid, restore in original position:', this.localMoveState)
        newList.splice(newIndex, 1)
        this.localMoveState.oldList.splice(this.localMoveState.oldIndex, 0, widget)
      } else {
        console.debug('Move valid')
      }
    },
    findParent (widget, parentWidget) {
      if (parentWidget.slots?.widgets) {
        for (const w of parentWidget.slots.widgets) {
          if (fastDeepEqual(widget, w)) {
            return parentWidget
          } else {
            const parent = this.findParent(widget, w)
            if (parent != null) return parent
          }
        }
      }
      return null
    },
    setWidgetClosed (closed) {
      this.$set(this.widget, 'closed', closed)
    }
  },
  computed: {
    iconColor () {
      return ''
    },
    children () {
      return this.widget.slots?.widgets || []
    },
    canHaveChildren () {
      return (this.LINKABLE_WIDGET_TYPES.includes(this.widget.component) && (this.children.length > 0 || this.localMoveState.moving)) === true
    }
  }
}
</script>
