export default {
  data () {
    return {
      items: [],
      itemsReady: false
    }
  },
  created () {
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
    this.WIDGET_TYPES_REQUIRING_ITEM = ['Group', 'Chart', 'Switch', 'Mapview', 'Slider', 'Selection', 'Setpoint', 'Input', 'Colorpicker', 'Colortemperaturepicker', 'Default']
    this.WIDGET_TYPES_SHOWING_VALUE = ['Text', 'Switch', 'Selection', 'Slider', 'Setpoint', 'Input', 'Default', 'Group']
    
    this.REGEX_PERIOD = /^((P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])-)?-?(P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?|\d*[YMWDh])$/
    this.REGEX_DECIMAL_PATTERN = /^(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?(?:';'|[^;])*(?:;(?:'[0#.,;E]?'|[^0#.,;E'])*((#[,#]*|0)[,0]*)(\.(0+#*|#+))?(?:E0+)?.*)?$/
    this.REGEX_MAPPING = /^\s*("[^\n"]*"|\w+)\s*=\s*("[^\n"]*"|\w+)\s*(=\s*("[^\n"]*"|\w+))?$/u
    this.REGEX_MAPPING_SWITCH = /^\s*("[^\n"]*"|\w+)\s*(:\s*("[^\n"]*"|\w+)\s*)?=\s*("[^\n"]*"|\w+)\s*(=\s*("[^\n"]*"|\w+))?$/u
    this.REGEX_RULE_VISIBILITY = /^(\s*((\w+\s*)?(==|>=|<=|!=|>|<)\s*)?("[^\n"]*"|\w+)\s*AND)*\s*((\w+\s*)?(==|>=|<=|!=|>|<)\s*)?("[^\n"]*"|\w+)\s*$/u
    this.REGEX_RULE = /^(((\s*((\w+\s*)?(==|>=|<=|!=|>|<)\s*)?("[^\n"]*"|\w+)\s*AND)*\s*((\w+\s*)?(==|>=|<=|!=|>|<)\s*)?("[^\n"]*"|\w+)\s*)?\s*=)?\s*("#?(\w|:|-)+"|#?(\w|:|-)+)$/u

    this.ADDITIONAL_CONTROLS = {
      Image: ['url', 'refresh'],
      Video: ['url', 'encoding'],
      Chart: ['service', 'period', 'refresh', 'legend', 'forceAsItem', 'yAxisDecimalPattern'],
      Webview: ['url', 'height'],
      Mapview: ['height'],
      Slider: ['switchEnabled', 'releaseOnly', 'minValue', 'maxValue', 'step'],
      Setpoint: ['minValue', 'maxValue', 'step'],
      Colortemperaturepicker: ['minValue', 'maxValue'],
      Input: ['inputHint'],
      Button: ['row', 'column', 'stateless', 'cmd', 'releaseCmd'],
      Default: ['height']
    }
    this.ENCODING_DEFS = [
      { key: 'mjpeg', value: 'MJPEG Video' },
      { key: 'HLS', value: 'HTTP Live Streaming' }
    ]
    this.INPUT_HINT_DEFS = [
      { key: 'text', value: 'Text' },
      { key: 'number', value: 'Number' },
      { key: 'date', value: 'Date' },
      { key: 'time', value: 'Time' },
      { key: 'datetime', value: 'Date and Time' }
    ]

    if (!this.itemsList || !this.itemsList.length) {
      this.$oh.api.get('/rest/items?staticDataOnly=true').then((items) => {
        this.items = items
        this.itemsReady = true
      })
    } else {
      this.items = this.itemsList
      this.itemsReady = true
    }
  },
  methods: {
    widgetTypeDef (component) {
      const componentType = component ?? this.widget.component
      return this.WIDGET_TYPES.find(w => w.type === componentType)
    },
    widgetTypeIcon (component) {
      return this.widgetTypeDef(component).icon
    },
    widgetTypeLabel (component) {
      return this.widgetTypeDef(component).label ?? this.widgetTypeDef(component).type
    },
    widgetConfigLabel () {
      return this.widget.config.label ?? ((this.widget.component === 'Button') ? this.widget.config.cmd : '')
    },
    widgetItemLabel (includeItemName) {
      const item = this.items.find(i => i.name === this.widget.config.item)
      return item.label + (includeItemName ? ' (' + item.name + ')' : '')
    },
    widgetConfigDescription (includeItemName) {
      const buttonPosition = this.widget.component === 'Button' ? ' (' + (this.widget.config?.row ?? '-') + ',' + (this.widget.config?.column ?? '-') + ')' : ''
      return (this.widget.config?.item ? ': ' + this.widgetItemLabel(includeItemName) : '') + buttonPosition
    }
  }
}