<template>
  <f7-treeview-item selectable :label="widget.config.label"
    :icon-ios="icon('ios')" :icon-aurora="icon('aurora')" :icon-md="icon('md')"
    :textColor="iconColor" :color="'blue'"
    :selected="selected && selected === widget"
    :opened="!widget.closed"
    @click="select">
    <sitemap-treeview-item v-for="(childwidget, idx) in children"
      :key="idx"
      :widget="childwidget" :parent-widget="widget"
      @selected="(event) => $emit('selected', event)"
      :selected="selected" />
    <div slot="label" class="subtitle"> {{subtitle()}}</div>
  </f7-treeview-item>
</template>

<script>
export default {
  props: ['widget', 'parentWidget', 'selected'],
  methods: {
    icon (theme) {
      switch (this.widget.component) {
        case 'Switch':
          return 'f7:power'
        case 'Selection':
          return 'f7:text_justify'
        case 'Slider':
          return 'f7:slider_horizontal_3'
        case 'List':
          return 'f7:square_list'
        case 'Setpoint':
          return 'f7:plus_slash_minus'
        case 'Video':
          return 'f7:videocam'
        case 'Chart':
          return 'f7:chart_bar_square'
        case 'Webview':
          return 'f7:globe'
        case 'Colorpicker':
          return 'f7:drop'
        case 'Mapview':
          return 'f7:map'
        case 'Default':
          return 'f7:rectangle'
        case 'Text':
          return 'f7:textformat'
        case 'Group':
          return 'f7:square_stack_3d_down_right'
        case 'Image':
          return 'f7:photo'
        case 'Frame':
          return 'f7:macwindow'
        default:
          return 'f7:slider_horizontal_below_rectangle'
      }
    },
    subtitle () {
      return this.widget.component + ((this.widget.config && this.widget.config.item) ? ': ' + this.widget.config.item : '')
    },
    select (event) {
      var self = this
      var $ = self.$$
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
