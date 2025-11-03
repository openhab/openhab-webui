export const PredefinedStrategies =
  ['everyChange', 'everyUpdate', 'restoreOnStartup', 'forecast']

export const CommonCronStrategies = [
  {
    name: 'everyMinute',
    cronExpression: '0 * * ? * *'
  },
  {
    name: 'everyHour',
    cronExpression: '0 0 * * * ?'
  },
  {
    name: 'everyDay',
    cronExpression: '0 0 0 * * ?'
  }
]

const filterInvertedParameter = {
  advanced: false,
  description: 'Whether to invert the above filter, i.e. persist values that do not equal the above values or are outside of the specified range',
  label: 'Inverted',
  name: 'inverted',
  required: false,
  type: 'BOOLEAN'
}

/**
 * Filter configuration is completely based on these definitions.
 * However, please note that some for some filter types validation and checks are added to persistence-edit.vue in editFilter(), saveFilter() and filter-popup.vue.
 *
 * @type {[{footerFn: (function(*): string|*), configDescriptionParameters: [{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean}], name: string, label: string},{footerFn: (function(*): string), configDescriptionParameters: [{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{limitToOptions: boolean, advanced: boolean, multiple: boolean, name: string, options: [{label: string, value: string},{label: string, value: string},{label: string, value: string},{label: string, value: string}], description: string, label: string, type: string, required: boolean}], name: string, label: string},{footerFn: (function(*): string), configDescriptionParameters: [{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean}], name: string, label: string},{footerFn: (function(*): string), configDescriptionParameters: [{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean},{advanced: boolean, name: string, description: string, label: string, type: string, required: boolean}], name: string, label: string}]}
 */
export const FilterTypes = [
  {
    name: 'thresholdFilters',
    label: 'Threshold',
    configDescriptionParameters: [
      {
        advanced: false,
        description: 'Difference to last stored value that must be exceeded to persist a new value',
        label: 'Value',
        name: 'value',
        required: true,
        type: 'DECIMAL'
      },
      {
        advanced: false,
        description: 'Whether the difference is relative (i.e. in percent)',
        label: 'Relative',
        name: 'relative',
        required: false,
        type: 'BOOLEAN'
      },
      {
        advanced: false,
        description: 'Unit of the given value, only used for UoM Items and if relative is disabled',
        label: 'Unit',
        name: 'unit',
        required: false,
        type: 'TEXT'
      }
    ],
    footerFn: (f) => f.relative ? f.value + ' %' : (f.unit ? f.value + ' ' + f.unit : f.value)
  },
  {
    name: 'timeFilters',
    label: 'Time',
    configDescriptionParameters: [
      {
        advanced: false,
        description: 'Amount of time that must have passed since the last value has been persisted',
        label: 'Value',
        name: 'value',
        required: true,
        type: 'DECIMAL'
      },
      {
        advanced: false,
        description: 'Time unit (defaults to seconds)',
        label: 'Unit',
        limitToOptions: true,
        multiple: false,
        name: 'unit',
        options: [
          { label: 'seconds', value: 's' },
          { label: 'minutes', value: 'm' },
          { label: 'hours', value: 'h' },
          { label: 'days', value: 'd' }
        ],
        required: false,
        type: 'TEXT'
      }
    ],
    footerFn: (f) => f.value + ' ' + (f.unit || 's')
  },
  {
    name: 'equalsFilters',
    label: 'Equals/Not Equals',
    configDescriptionParameters: [
      {
        advanced: false,
        description: 'Enter values separated by comma (use point <code>.</code> as decimal point), e.g. <code>one, two, three</code>, to be persisted',
        label: 'Values',
        name: 'values',
        required: true,
        type: ''
      },
      filterInvertedParameter
    ],
    footerFn: (f) => (f.inverted === true ? 'not ' : '') + 'equals ' + f.values.join(', ')
  },
  {
    name: 'includeFilters',
    label: 'Include/Exclude',
    configDescriptionParameters: [
      {
        advanced: false,
        description: 'Lower bound of the range of values to be persisted',
        label: 'Lower Bound',
        name: 'lower',
        required: true,
        type: 'DECIMAL'
      },
      {
        advanced: false,
        description: 'Upper bound of the range of values to be persisted',
        label: 'Upper Bound',
        name: 'upper',
        required: true,
        type: 'DECIMAL'
      },
      {
        advanced: false,
        description: 'Unit of the given bounds, only used for UoM Items',
        label: 'Unit',
        name: 'unit',
        required: false,
        type: 'TEXT'
      },
      filterInvertedParameter
    ],
    footerFn: (f) => (f.inverted === true ? ']' : '[') + f.lower + ';' + f.upper + (f.inverted === true ? '[' : ']' + (f.unit ? ' ' + f.unit : ''))
  }
]
