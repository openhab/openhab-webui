const positionGroup = {
  name: 'position',
  label: 'Position'
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
  name: 'min',
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

export default {
  'oh-chart-grid': {
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
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-day-axis': {
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-week-axis': {
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-month-axis': {
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-year-axis': {
    props: {
      parameterGroups: [],
      parameters: [
        ...dateAxisParameters
      ]
    }
  },

  'oh-value-axis': {
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
    props: {
      parameterGroups: [],
      parameters: [
        ...axisNameParameters
      ]
    }
  },

  'oh-calendar-axis': {
    props: {
      parameterGroups: [],
      parameters: [
        ...positionParameters,
        orientParameter
      ]
    }
  },

  'oh-time-series': {
    props: {
      parameterGroups: [],
      parameters: [
        ...seriesParameters
      ]
    }
  },

  'oh-aggregate-series': {
    props: {
      parameterGroups: [],
      parameters: [
        ...seriesParameters
      ]
    }
  }

}
