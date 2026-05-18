export const SITEMAP_OPERATOR_OPTIONS = ['', '==', '!=', '>=', '<=', '>', '<']

export default {
  data() {
    return {
      items: [],
      itemsReady: false
    }
  },
  created() {
    this.WIDGET_TYPES = [
      { type: 'Sitemap', icon: 'slider_horizontal_below_rectangle' },
      { type: 'Text', icon: 'textformat' },
      { type: 'Switch', icon: 'power' },
      { type: 'Selection', icon: 'text_justify' },
      { type: 'Slider', icon: 'slider_horizontal_3' },
      { type: 'Frame', icon: 'macwindow' },
      { type: 'Setpoint', icon: 'plus_slash_minus' },
      { type: 'Input', icon: 'text_cursor' },
      { type: 'Buttongrid', label: 'Button Grid', icon: 'square_grid_3x2' },
      { type: 'Button', icon: 'square_fill_line_vertical_square' },
      { type: 'Default', icon: 'rectangle' },
      { type: 'Group', icon: 'square_stack_3d_down_right' },
      { type: 'Chart', icon: 'chart_bar_square' },
      { type: 'Webview', label: 'Web View', icon: 'globe' },
      { type: 'Colorpicker', label: 'Color Picker', icon: 'drop' },
      { type: 'Colortemperaturepicker', label: 'Color Temperature Picker', icon: 'thermometer' },
      { type: 'Mapview', label: 'Map View', icon: 'map' },
      { type: 'Image', icon: 'photo' },
      { type: 'Video', icon: 'videocam' }
    ]
    this.LINKABLE_WIDGET_TYPES = ['Sitemap', 'Text', 'Frame', 'Group', 'Image', 'Buttongrid']
    this.WIDGET_TYPES_NOT_REQUIRING_ITEM = ['Frame', 'Text', 'Image', 'Video', 'Webview', 'Buttongrid']
    this.WIDGET_TYPES_SHOWING_VALUE = ['Text', 'Switch', 'Selection', 'Slider', 'Setpoint', 'Input', 'Default', 'Group']

    this.REGEX_PERIOD =
      /^((P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])-)?-?(P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])$/
    this.REGEX_DECIMAL_PATTERN =
      /^(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?(?:';'|[^;])*(?:;(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?.*)?$/

    this.ADDITIONAL_CONTROLS = {
      Image: ['url', 'refresh'],
      Video: ['url', 'encoding'],
      Chart: ['service', 'period', 'refresh', 'legend', 'forceAsItem', 'yAxisDecimalPattern', 'interpolation'],
      Webview: ['url', 'height'],
      Mapview: ['height'],
      Slider: ['switchSupport', 'releaseOnly', 'minValue', 'maxValue', 'step'],
      Setpoint: ['minValue', 'maxValue', 'step'],
      Colortemperaturepicker: ['minValue', 'maxValue'],
      Input: ['inputHint'],
      Button: ['row', 'column', 'stateless', 'command', 'releaseCommand'],
      Default: ['height']
    }
    this.ENCODING_DEFS = [
      { key: 'mjpeg', value: 'MJPEG Video' },
      { key: 'hls', value: 'HTTP Live Streaming' }
    ]
    this.INPUT_HINT_DEFS = [
      { key: 'text', value: 'Text' },
      { key: 'number', value: 'Number' },
      { key: 'date', value: 'Date' },
      { key: 'time', value: 'Time' },
      { key: 'datetime', value: 'Date and Time' }
    ]
    this.INTERPOLATION_DEFS = [
      { key: 'linear', value: 'Linear' },
      { key: 'step', value: 'Step' }
    ]
    this.LEGEND_DEFS = [
      { key: true, value: 'Always show legend' },
      { key: false, value: 'Never show legend' }
    ]
    this.MAX_BUTTONGRID_COLUMNS = 12

    if (!this.itemsList) {
      this.$oh.api.get('/rest/items?staticDataOnly=true').then((items) => {
        this.items = items
        this.itemsReady = true
      })
    } else {
      this.items = this.itemsList ?? []
      this.itemsReady = true
    }
  },
  methods: {
    allowedWidgetTypes(parentWidget) {
      let types = this.WIDGET_TYPES.filter((w) => w.type !== 'Sitemap')
      // Button only allowed inside Buttongrid
      if (parentWidget.type === 'Buttongrid') return types.filter((t) => t.type === 'Button')
      types = types.filter((t) => t.type !== 'Button')
      // No frames in frame
      if (parentWidget.type === 'Frame') return types.filter((t) => t.type !== 'Frame')
      // Linkable widget types only contain frames or none at all
      if (this.LINKABLE_WIDGET_TYPES.includes(parentWidget.type)) {
        if (parentWidget.widgets?.length > 0) {
          if (parentWidget.widgets.find((w) => w.type === 'Frame')) {
            return types.filter((t) => t.type === 'Frame')
          } else {
            return types.filter((t) => t.type !== 'Frame')
          }
        }
      }
      return types
    },
    canAddChildren(widget) {
      if (!widget) return false
      if (widget.type === 'Buttongrid') {
        const buttons = widget.buttons
        if (Array.isArray(buttons) && buttons.length) return false
      }
      return this.LINKABLE_WIDGET_TYPES.includes(widget.type)
    },
    widgetTypeDef(type) {
      const widgetType = type ?? this.widget.type
      return this.WIDGET_TYPES.find((w) => w.type === widgetType)
    },
    widgetTypeIcon(type) {
      return this.widgetTypeDef(type).icon
    },
    widgetTypeLabel(type) {
      return this.widgetTypeDef(type).label ?? this.widgetTypeDef(type).type
    },
    widgetConfigLabel() {
      return this.widget.label ?? (this.widget.type === 'Button' ? this.widget.command : '')
    },
    widgetItemLabel(includeItemName) {
      const item = this.items.find((i) => i.name === this.widget.item)
      return (item?.label || this.widget.item) + (includeItemName && item ? ` (${item.name})` : '')
    },
    widgetConfigDescription(includeItemName) {
      const buttonPosition = this.widget.type === 'Button' ? ` (${this.widget.row ?? '-'},${this.widget.column ?? '-'})` : ''
      return (this.widget.item ? ': ' + this.widgetItemLabel(includeItemName) : '') + buttonPosition
    }
  }
}
