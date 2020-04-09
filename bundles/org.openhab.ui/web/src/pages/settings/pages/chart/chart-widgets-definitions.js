const positionGroup = {
  name: 'position',
  label: 'Position',
  description: 'Each parameter accepts pixel values, or percentages. Additionally, top accepts "top", "middle" and "bottom" and left accepts "left", "center", "right" to align the component vertically or horizontally'
}

const positionParameters = [
  { name: 'top', type: 'TEXT', label: 'Top', groupName: 'position' },
  { name: 'bottom', type: 'TEXT', label: 'Bottom', groupName: 'position' },
  { name: 'left', type: 'TEXT', label: 'Left', groupName: 'position' },
  { name: 'right', type: 'TEXT', label: 'Right', groupName: 'position' },
  { name: 'width', type: 'TEXT', label: 'Width', groupName: 'position' },
  { name: 'height', type: 'TEXT', label: 'Height', groupName: 'position' }
]

const orientParameter = {
  name: 'orient',
  type: 'TEXT',
  label: 'Orientation',
  limitToOptions: true,
  options: [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' }
  ]
}

const showParameter = {
  name: 'show',
  type: 'BOOLEAN',
  label: 'Show',
  description: 'Whether to show or not this component'
}

const nameParameter = {
  name: 'name',
  type: 'TEXT',
  label: 'Name',
  description: 'A name which will appear on tooltips and labels'
}

const itemParameter = {
  name: 'item',
  type: 'TEXT',
  context: 'item',
  label: 'Item',
  description: 'The item whose persisted data to display'
}

const nameLocationParameter = {
  name: 'nameLocation',
  type: 'TEXT',
  label: 'Name Location',
  description: 'Location of axis name',
  limitToOptions: true,
  options: [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End (default)' }
  ]
}

const nameGapParameter = {
  name: 'nameGap',
  type: 'INTEGER',
  label: 'Name Gap',
  description: 'Gap between axis name and axis line.'
}

const nameRotateParameter = {
  name: 'nameRotate',
  type: 'TEXT',
  label: 'Name Rotate',
  description: 'Rotation of axis name'
}

const minParameter = {
  name: 'min',
  type: 'TEXT',
  label: 'Min',
  description: 'Minimum boundary'
}

const maxParameter = {
  name: 'max',
  type: 'TEXT',
  label: 'Max',
  description: 'Maximum boundary'
}

const axisNameParameters = [
  nameParameter,
  nameLocationParameter,
  nameGapParameter,
  nameRotateParameter
]

const dateAxisParameters = [
  ...axisNameParameters
]

const seriesParameters = [
  nameParameter,
  itemParameter
]

const seriesTypesLabels = {
  line: 'Line',
  bar: 'Bar',
  heatmap: 'Heatmap',
  scatter: 'Scatter'
}

const seriesTypeParameter = (...types) => {
  return {
    name: 'type',
    type: 'TEXT',
    label: 'Type',
    description: 'The type of the series.<br/><em>Note: heatmap needs a configured visual map and is not supported for time series</em>',
    limitToOptions: true,
    options: types.map((o) => { return { value: o, label: seriesTypesLabels[o] } })
  }
}

const aggregationFunctionParameter = {
  name: 'aggregationFunction',
  type: 'TEXT',
  label: 'Aggregation Function',
  description: 'How to reduce the data points in a same aggregation cluster to a single value. If not specified, the average function will be used.',
  limitToOptions: true,
  options: [
    { value: 'average', label: 'Average' },
    { value: 'sum', label: 'Sum' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'first', label: 'First (earliest)' },
    { value: 'last', label: 'Last (latest)' },
    { value: 'diff_first', label: 'Difference of firsts' },
    { value: 'diff_last', label: 'Difference of lasts' }
  ]
}

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

  'oh-hour-axis': {
    label: 'Minute of Hour Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-day-axis': {
    label: 'Hour of Day Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-week-axis': {
    label: 'Day of Week Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-month-axis': {
    label: 'Day of Month Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-year-axis': {
    label: 'Month of Year Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-value-axis': {
    label: 'Value Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...axisNameParameters,
        minParameter,
        maxParameter
      ]
    }
  },

  'oh-time-axis': {
    label: 'Time Axis',
    props: {
      parameterGroups: [],
      parameters: [
        ...axisNameParameters
      ]
    }
  },

  'oh-calendar-axis': {
    label: 'Calendar',
    props: {
      parameterGroups: [],
      parameters: [
        ...positionParameters,
        orientParameter
      ]
    }
  },

  'oh-time-series': {
    label: 'Time Series',
    props: {
      parameterGroups: [],
      parameters: [
        ...seriesParameters,
        seriesTypeParameter('line', 'bar', 'heatmap', 'scatter')
      ]
    }
  },

  'oh-aggregate-series': {
    label: 'Aggregate Series',
    props: {
      parameterGroups: [],
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
        aggregationFunctionParameter

      ]
    }
  },

  'oh-calendar-series': {
    label: 'Calendar Series',
    props: {
      parameterGroups: [],
      parameters: [
        ...seriesParameters,
        seriesTypeParameter('heatmap', 'scatter'),
        aggregationFunctionParameter
      ]
    }
  },

  'oh-chart-tooltip': {
    label: 'Tooltip',
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
          description: 'Show handles to filter data in continuous mode'
        },
        {
          name: 'pieces',
          label: 'Number of pieces',
          type: 'INTEGER',
          groupName: 'appearanceGroup',
          description: 'Number of pieces in piecewise mode'
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
    props: {
      parameterGroups: [Object.assign({}, positionGroup, { description: 'Applicable only for sliders' })],
      parameters: [
        {
          name: 'type',
          label: 'Type',
          type: 'TEXT',
          description: 'Type: slider (default) or inside (allows to zoom with the mousewheel or a pinch gesture)',
          limitToOptions: true,
          options: [
            { value: 'slider', label: 'Slider' },
            { value: 'inside', label: 'Inside' }
          ]
        },
        Object.assign({}, showParameter, { description: 'Applicable only for sliders' }),
        Object.assign({}, orientParameter, { description: 'Applicable only for sliders' }),
        ...positionParameters
      ]
    }
  },

  'oh-chart-legend': {
    label: 'Data Zoom',
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
