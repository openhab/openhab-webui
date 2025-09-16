<template>
  <f7-treeview-item v-if="itemsReady"
                    selectable
                    :label="widgetConfigLabel()"
                    :icon-f7="widgetTypeIcon()"
                    :textColor="iconColor"
                    :color="'blue'"
                    :selected="selected && selected === widget ? true : null"
                    :opened="!widget.closed"
                    :toggle="canHaveChildren"
                    @treeview:open="setWidgetClosed(false)"
                    @treeview:close="setWidgetClosed(true)"
                    @click="select">
    <draggable :disabled="!dropAllowed(widget) ? true : null"
               :list="children"
               group="sitemap-treeview"
               animation="150"
               fallbackOnBody="true"
               swapThreshold="0.6"
               scrollSensitivity="200"
               delay="400"
               delayOnTouchOnly="true"
               touchStartThreshold="10"
               @start="onStart"
               @end="onEnd"
               :move="onMove">
      <sitemap-treeview-item v-for="(childwidget, idx) in children"
                             class="sitemap-treeview-item"
                             :key="idx"
                             :includeItemName="includeItemName"
                             :widget="childwidget"
                             :parentWidget="widget"
                             :itemsList="items"
                             @selected="(event) => $emit('selected', event)"
                             :selected="selected"
                             :sitemap="localSitemap"
                             :moveState="localMoveState" />
    </draggable>
    <template #label>
      <div class="subtitle">
        {{ subtitle }}
      </div>
    </template>
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
import { VueDraggableNext as Draggable } from 'vue-draggable-next'

export default {
  name: 'sitemap-treeview-item',
  mixins: [SitemapMixin],
  props: {
    includeItemName: Boolean,
    widget: Object,
    parentWidget: Object,
    itemsList: Array,
    selected: Object,
    sitemap: Object,
    moveState: Object
  },
  components: {
    Draggable,
    SitemapTreeviewItem: 'sitemap-treeview-item'
  },
  emits: ['selected'],
  data () {
    return {
      localSitemap: this.sitemap ? this.sitemap : this.widget,
      localMoveState: this.moveState ? this.moveState : {}
    }
  },
  methods: {
    select (event) {
      let self = this
      if (this.$$(event.target).is('.treeview-toggle')) return
      this.$emit('selected', [this.widget, this.parentWidget])
    },
    onStart (event) {
      console.debug('Drag start event:', event)
      this.localMoveState.moving = true
      this.localMoveState.widget = this.widget.slots.widgets[event.oldIndex]
      this.localMoveState.newParent = this.parentWidget
    },
    onMove (event) {
      console.debug('Drag move event:', event)
      const newParent = event.relatedContext?.element?.parent
      if (newParent) {
        this.localMoveState.newParent = newParent
      }
    },
    onEnd (event) {
      console.debug('Drag end event:', event)
      const widget = this.localMoveState.widget
      const parentWidget = this.localMoveState.newParent
      if (widget && parentWidget) {
        widget.parent = parentWidget
      }
      this.localMoveState.moving = false
      this.localMoveState.widget = null
      this.localMoveState.newParent = null
    },
    dropAllowed (widget) {
      if (!this.canAddChildren(widget)) return false
      if (!this.localMoveState.widget || this.allowedWidgetTypes(widget).map((wt) => wt.type).includes(this.localMoveState.widget.component)) {
        return true
      }
      return false
    },
    setWidgetClosed (closed) {
      this.widget.closed = closed
    }
  },
  computed: {
    subtitle () {
      return this.widgetTypeLabel() + this.widgetConfigDescription(this.includeItemName)
    },
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
