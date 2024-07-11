// definitions for the chart widgets
// TODO: migrate to WidgetDefinition

import { actionGroup, actionParams } from '../actions.js'
import { pg, pb, pt, pn, pi } from '../helpers.js'

const positionGroup = pg('position', 'Position', 'Each parameter accepts pixel values or percentages. Additionally, top accepts "top", "middle" and "bottom" to align the component vertically, and left accepts "left", "center" and "right" to align the component horizontally')

const componentRelationsGroup = pg('componentRelations', 'Axis and Coordinate System Assignments', '')

const nameDisplayGroup = pg('nameDisplay', 'Name Display', '')

const positionParameters = [
  { name: 'top', type: 'TEXT', label: 'Top', groupName: 'position' },
  { name: 'bottom', type: 'TEXT', label: 'Bottom', groupName: 'position' },
  { name: 'left', type: 'TEXT', label: 'Left', groupName: 'position' },
  { name: 'right', type: 'TEXT', label: 'Right', groupName: 'position' },
  { name: 'width', type: 'TEXT', label: 'Width', groupName: 'position' },
  { name: 'height', type: 'TEXT', label: 'Height', groupName: 'position' }
]

const orientParameter = pt('orient', 'Orientation', '')
  .o([
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' }
  ], true)

const showParameter = pb('show', 'Show', 'Whether to show or not this component')

const nameParameter = pt('name', 'Name', 'A name which will appear on tooltips and labels')

const itemParameter = pi('item', 'Item', 'The item whose persisted data to display')

const nameLocationParameter = pt('nameLocation', 'Name Location', 'Location of axis name')
  .g('nameDisplay')
  .o([
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End (default)' }
  ], true)

const nameGapParameter = pn('nameGap', 'Name Gap', 'Gap between axis name and axis line.').g('nameDisplay')

const nameRotateParameter = pt('nameRotate', 'Name Rotate', 'Rotation of axis name').g('nameDisplay')

const minParameter = pt('min', 'Min', 'Minimum boundary')

const maxParameter = pt('max', 'Max', 'Maximum boundary')

const gridIndexParameter = pn('gridIndex', 'Grid Index', 'The index of the grid for this axis')
  .c('chartGrid').g('componentRelations')

const calendarIndexParameter = pn('calendarIndex', 'Calendar Index', 'The index of the calendar for this series')
  .c('chartCalendar').g('componentRelations')

const xAxisIndexParameter = pn('xAxisIndex', 'X Axis Index', 'The index of the X axis for this series')
  .c('xAxis').g('componentRelations')

const yAxisIndexParameter = pn('yAxisIndex', 'Y Axis Index', 'The index of the Y axis for this series')
  .c('yAxis').g('componentRelations')

const persistenceServiceParameter = pt('service', 'Persistence Service', 'The identifier of the persistence service to retrieve the data from. Leave blank to the use the default.')
  .c('persistenceService').a()

const offsetAmountParameter = pn('offsetAmount', 'Offset Amount', 'Offset to <em>subtract</em> from the displayed period, use if you want to do period comparisons (see also Offset Unit).').a()

const offsetUnitParameter = pt('offsetUnit', 'Offset Unit', 'Offset to <em>subtract</em> from the displayed period, use if you want to do period comparisons (see also Offset Amount).')
  .a()
  .c('offsetUnit')
  .o([
    { value: 'hour', label: 'Hour' },
    { value: 'minute', label: 'Minute' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' }
  ], true)

const axisNameParameters = [
  nameParameter,
  nameLocationParameter,
  nameGapParameter,
  nameRotateParameter
]

const dateAxisParameters = [
  ...axisNameParameters,
  gridIndexParameter
]

const seriesParameters = [
  nameParameter,
  itemParameter,
  persistenceServiceParameter,
  offsetAmountParameter,
  offsetUnitParameter
]

const seriesTypesLabels = {
  line: 'Line',
  bar: 'Bar',
  gauge: 'Gauge',
  heatmap: 'Heatmap',
  pie: 'Pie',
  scatter: 'Scatter'
}

const seriesTypeParameter = (...types) => {
  return {
    name: 'type',
    type: 'TEXT',
    label: 'Type',
    description: 'The type of the series.<br/><em>Note: <code>heatmap</code> needs a configured visual map or uses the default and is not supported for time series!</em>',
    limitToOptions: true,
    options: types.map((o) => { return { value: o, label: seriesTypesLabels[o] } })
  }
}

const aggregationFunctionParameter = pt('aggregationFunction', 'Aggregation Function', 'How to reduce the data points in a same aggregation cluster to a single value. If not specified, the average function will be used.')
  .o([
    { value: 'average', label: 'Average' },
    { value: 'sum', label: 'Sum' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'first', label: 'First (earliest)' },
    { value: 'last', label: 'Last (latest)' },
    { value: 'diff_first', label: 'Difference of firsts' },
    { value: 'diff_last', label: 'Difference of lasts' }
  ], true)

const dimensionTypesOptions = [
  { value: 'minute', label: 'Minute of Hour' },
  { value: 'hour', label: 'Hour of Day' },
  { value: 'isoWeekday', label: 'Day of Week (starting on Monday)' },
  { value: 'weekday', label: 'Day of Week (starting on Sunday)' },
  { value: 'date', label: 'Day of Month' },
  { value: 'month', label: 'Month of Year' }
]

export default {
  'oh-chart-grid': {
    label: 'Cartesian Grid',
    docLink: 'https://echarts.apache.org/en/option.html#grid',
    props: {
      parameterGroups: [positionGroup],
      parameters: [
        ...positionParameters,
        {
          name: 'show',
          type: 'BOOLEAN',
          label: 'Show'
        },
        {
          name: 'containLabel',
          type: 'BOOLEAN',
          label: 'Contain label',
          description: 'Whether the grid region contains the axis tick labels',
          docLink: 'https://echarts.apache.org/en/option.html#grid.containLabel'
        }
      ]
    }
  },

  'oh-category-axis': {
    label: 'Category Axis',
    docLink: 'https://echarts.apache.org/en/option.html#xAxis',
    props: {
      parameterGroups: [nameDisplayGroup, componentRelationsGroup],
      parameters: [
        ...dateAxisParameters,
        {
          name: 'categoryType',
          label: 'Categories',
          type: 'TEXT',
          description: 'Type of categories to display',
          required: true,
          limitToOptions: true,
          options: [
            { value: 'hour', label: 'Minutes of hour' },
            { value: 'day', label: 'Hours of day' },
            { value: 'week', label: 'Days of week' },
            { value: 'month', label: 'Days of month' },
            { value: 'year', label: 'Months of year' }
          ]
        },
        {
          name: 'weekdayFormat',
          label: 'Weekday Format',
          type: 'TEXT',
          description: 'Format of weekdays labels',
          required: true,
          limitToOptions: true,
          options: [
            { value: 'default', label: 'Long (default)' },
            { value: 'short', label: 'Short' },
            { value: 'min', label: 'Minimal' }
          ],
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.categoryType === 'week'
          }
        },
        {
          name: 'startonSunday',
          label: 'Start Week on Sunday',
          type: 'BOOLEAN',
          description: 'Check to start the week on Sundays instead of Mondays',
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.categoryType === 'week'
          }
        },
        {
          name: 'monthFormat',
          label: 'Month Format',
          type: 'TEXT',
          description: 'Format of months labels',
          required: true,
          limitToOptions: true,
          options: [
            { value: 'default', label: 'Long (default)' },
            { value: 'short', label: 'Short' }
          ],
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.categoryType === 'year'
          }
        },
        gridIndexParameter
      ]
    }
  },

  'oh-value-axis': {
    label: 'Value Axis',
    docLink: 'https://echarts.apache.org/en/option.html#yAxis',
    props: {
      parameterGroups: [nameDisplayGroup, componentRelationsGroup],
      parameters: [
        ...axisNameParameters,
        minParameter,
        maxParameter,
        {
          name: 'scale',
          label: 'Do Not Force Scale to Include Zero',
          type: 'BOOLEAN',
          description: 'If checked the scale will not necessarily include the origin (has no effect if min or max are set explicitely)'
        },
        gridIndexParameter
      ]
    }
  },

  'oh-time-axis': {
    label: 'Time Axis',
    docLink: 'https://echarts.apache.org/en/option.html#xAxis',
    props: {
      parameterGroups: [nameDisplayGroup, componentRelationsGroup],
      parameters: [
        ...axisNameParameters,
        gridIndexParameter
      ]
    }
  },

  'oh-calendar-axis': {
    label: 'Calendar',
    docLink: 'https://echarts.apache.org/en/option.html#calendar',
    props: {
      parameterGroups: [nameDisplayGroup, componentRelationsGroup, actionGroup()],
      parameters: [
        ...positionParameters,
        orientParameter,
        gridIndexParameter,
        ...actionParams()
      ]
    }
  },

  'oh-data-series': {
    label: 'Data Series',
    docLink: 'https://echarts.apache.org/en/option.html#series',
    props: {
      parameterGroups: [actionGroup()],
      parameters: [
        seriesTypeParameter('gauge', 'pie'),
        ...actionParams()
      ]
    }
  },

  'oh-time-series': {
    label: 'Time Series',
    docLink: 'https://echarts.apache.org/en/option.html#series',
    props: {
      parameterGroups: [componentRelationsGroup, actionGroup()],
      parameters: [
        ...seriesParameters,
        seriesTypeParameter('line', 'bar', 'heatmap', 'scatter'),
        xAxisIndexParameter,
        yAxisIndexParameter,
        ...actionParams()
      ]
    }
  },

  'oh-aggregate-series': {
    label: 'Aggregate Series',
    docLink: 'https://echarts.apache.org/en/option.html#series',
    props: {
      parameterGroups: [componentRelationsGroup, actionGroup()],
      parameters: [
        ...seriesParameters,
        seriesTypeParameter('line', 'bar', 'heatmap', 'scatter'),
        {
          name: 'dimension1',
          label: 'First Dimension',
          type: 'TEXT',
          description: 'The largest data point cluster size.<br />It should be consistent with the chart type, and match the type of a category axis where this series will appear.',
          limitToOptions: true,
          options: dimensionTypesOptions
        },
        {
          name: 'dimension2',
          label: 'Second Dimension',
          type: 'TEXT',
          description: 'The smallest data point cluster size.<br />Set only when you have 2 category axes (for instance day of the week and hour of the day), and make sure to match the type of the 2nd axis.',
          limitToOptions: true,
          options: dimensionTypesOptions
        },
        {
          name: 'transpose',
          label: 'Transpose',
          type: 'BOOLEAN',
          description: 'Enable when the first dimension should be mapped to the Y axis instead of the X axis'
        },
        aggregationFunctionParameter,
        xAxisIndexParameter,
        yAxisIndexParameter,
        ...actionParams()
      ]
    }
  },

  'oh-calendar-series': {
    label: 'Calendar Series',
    docLink: 'https://echarts.apache.org/en/option.html#series',
    props: {
      parameterGroups: [componentRelationsGroup, actionGroup()],
      parameters: [
        ...seriesParameters,
        seriesTypeParameter('heatmap', 'scatter'),
        aggregationFunctionParameter,
        calendarIndexParameter,
        ...actionParams()
      ]
    }
  },

  'oh-chart-tooltip': {
    label: 'Tooltip',
    docLink: 'https://echarts.apache.org/en/option.html#tooltip',
    props: {
      parameterGroups: [],
      parameters: [
        showParameter,
        orientParameter,
        {
          name: 'confine',
          label: 'Confine',
          type: 'BOOLEAN',
          description: 'Keep the tooltip within the chart bounds'
        }
      ]
    }
  },

  'oh-chart-visualmap': {
    label: 'Visual Map',
    docLink: 'https://echarts.apache.org/en/option.html#visualMap',
    props: {
      parameterGroups: [
        {
          name: 'boundariesGroup',
          label: 'Boundaries',
          description: 'Values considered in range for this visual map (by default [0, 200])<br/><strong>These cannot be determined from the series and have to be defined manually!</strong>'
        },
        {
          name: 'appearanceGroup',
          label: 'Appearance'
        },
        positionGroup
      ],
      parameters: [
        showParameter,
        Object.assign({}, minParameter, { groupName: 'boundariesGroup' }),
        Object.assign({}, maxParameter, { groupName: 'boundariesGroup' }),
        {
          name: 'type',
          label: 'Type',
          type: 'TEXT',
          description: 'Type of visual map - continuous or piecewise',
          limitToOptions: true,
          groupName: 'appearanceGroup',
          options: [
            { value: 'continuous', label: 'Continuous' },
            { value: 'piecewise', label: 'Piecewise' }
          ]
        },
        Object.assign({}, orientParameter, { groupName: 'appearanceGroup' }),
        {
          name: 'calculable',
          label: 'Show handles',
          type: 'BOOLEAN',
          groupName: 'appearanceGroup',
          description: 'Show handles to filter data in continuous mode',
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.type !== 'piecewise'
          }
        },
        {
          name: 'pieces',
          label: 'Number of pieces',
          type: 'INTEGER',
          groupName: 'appearanceGroup',
          description: 'Number of pieces in piecewise mode',
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.type === 'piecewise'
          }
        },
        {
          name: 'presetPalette',
          label: 'Preset color palette',
          type: 'TEXT',
          groupName: 'appearanceGroup',
          description: 'Choose from a selection of preset color palettes for the values in range. The default is a yellow (low) to red (high) gradient',
          limitToOptions: true,
          options: [
            { value: 'greenred', label: 'Green-Yellow-Red' },
            { value: 'whiteblue', label: 'White-Blue' },
            { value: 'bluered', label: 'Blue-red' }
          ]
        },
        ...positionParameters
      ]
    }
  },

  'oh-chart-datazoom': {
    label: 'Data Zoom',
    docLink: 'https://echarts.apache.org/en/option.html#dataZoom',
    props: {
      parameterGroups: [Object.assign({}, positionGroup, { description: 'Applicable only to slider types' })],
      parameters: [
        {
          name: 'type',
          label: 'Type',
          type: 'TEXT',
          required: true,
          description: 'Type: slider (default) or inside (allows to zoom with the mousewheel or a pinch gesture)',
          limitToOptions: true,
          options: [
            { value: 'slider', label: 'Slider' },
            { value: 'inside', label: 'Inside' }
          ]
        },
        Object.assign({}, showParameter, {
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.type === 'slider'
          }
        }),
        Object.assign({}, orientParameter, {
          visible: (value, configuration, configDescription, parameters) => {
            return configuration.type === 'slider'
          }
        }),
        ...positionParameters.map((o) => {
          return Object.assign({}, o, {
            groupName: null,
            visible: (value, configuration, configDescription, parameters) => {
              return configuration.type === 'slider'
            }
          })
        })
      ]
    }
  },

  'oh-chart-legend': {
    label: 'Legend',
    docLink: 'https://echarts.apache.org/en/option.html#legend',
    props: {
      parameterGroups: [positionGroup],
      parameters: [

        showParameter,
        orientParameter,
        ...positionParameters
      ]
    }
  },

  'oh-chart-title': {
    label: 'Title',
    docLink: 'https://echarts.apache.org/en/option.html#title',
    props: {
      parameterGroups: [positionGroup],
      parameters: [
        showParameter,
        {
          name: 'text',
          type: 'TEXT',
          label: 'Title'
        },
        {
          name: 'subtext',
          type: 'TEXT',
          label: 'Subtitle'
        },
        ...positionParameters
      ]
    }
  },

  'oh-chart-toolbox': {
    label: 'Toolbox',
    docLink: 'https://echarts.apache.org/en/option.html#toolbox',
    props: {
      parameterGroups: [positionGroup],
      parameters: [
        showParameter,
        {
          name: 'presetFeatures',
          type: 'TEXT',
          label: 'Features',
          multiple: true,
          required: true,
          limitToOptions: true,
          options: [
            { value: 'saveAsImage', label: 'Save as Image' },
            { value: 'restore', label: 'Restore' },
            { value: 'dataView', label: 'Data Table' },
            { value: 'dataZoom', label: 'Drag Range to Zoom' },
            { value: 'magicType', label: 'Change Chart Type' }
          ]
        },
        ...positionParameters
      ]
    }
  }

}
