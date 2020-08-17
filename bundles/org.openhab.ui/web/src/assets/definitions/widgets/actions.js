// parameter group & parameters definitions for actions
import { po, pt, pi } from './helpers'

export const actionGroup = (label, description, groupPrefix) => {
  groupPrefix = (groupPrefix) ? groupPrefix += '_' : ''
  return {
    name: groupPrefix + 'actions',
    label: label || 'Action',
    description: description || 'Action to perform when the element is clicked'
  }
}

export const actionParams = (groupName, paramPrefix) => {
  paramPrefix = (paramPrefix) ? paramPrefix += '_' : ''
  if (!groupName) groupName = 'actions'
  return [
    po(paramPrefix + 'action', 'Action', 'Type of action to perform', [
      { value: 'navigate', label: 'Navigate to page' },
      { value: 'command', label: 'Send command' },
      { value: 'toggle', label: 'Toggle item' },
      { value: 'popup', label: 'Open popup' },
      { value: 'popover', label: 'Open popover' },
      { value: 'sheet', label: 'Open sheet' },
      { value: 'group', label: 'Group details' },
      { value: 'analyzer', label: 'Analyze item(s)' },
      { value: 'url', label: 'External URL' }
    ]),
    pt(paramPrefix + 'actionUrl', 'Action URL', 'URL to navigate to').c('url')
      .v((value, configuration, configDescription, parameters) => {
        return ['url'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pi(paramPrefix + 'actionItem', 'Action Item', 'Item to perform the aciton on')
      .v((value, configuration, configDescription, parameters) => {
        return ['command', 'toggle'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionCommand', 'Action Command', 'Command to send to the item. If "toggle item" is selected as the action, only send the command when the state is different')
      .v((value, configuration, configDescription, parameters) => {
        return ['command', 'toggle'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionCommandAlt', 'Action Toggle Command', 'Command to send to the item when "toggle item" is selected as the action, and the item\'s state is equal to the command above')
      .v((value, configuration, configDescription, parameters) => {
        return ['toggle'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionPage', 'Page', 'Page to navigate to').c('page')
      .v((value, configuration, configDescription, parameters) => {
        return ['navigate'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    po(paramPrefix + 'actionPageTransition', 'Transition Effect', 'Use a specific <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/view.html#custom-page-transitions">page transition animation</a>', [
      { value: 'f7-circle', label: 'Circle' },
      { value: 'f7-cover', label: 'Cover' },
      { value: 'f7-cover-v', label: 'Cover from bottom' },
      { value: 'f7-dive', label: 'Dive' },
      { value: 'f7-fade', label: 'Fade' },
      { value: 'f7-flip', label: 'Flip' },
      { value: 'f7-parallax', label: 'Parallax' },
      { value: 'f7-push', label: 'Push' }
    ]).v((value, configuration, configDescription, parameters) => {
      return ['navigate'].indexOf(configuration[paramPrefix + 'action']) >= 0
    }),
    pt(paramPrefix + 'actionModal', 'Modal Page or Widget', 'Page or widget to display in the modal').c('pagewidget')
      .v((value, configuration, configDescription, parameters) => {
        return ['popup', 'popover', 'sheet'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionModalConfig', 'Modal component configuration', 'Configuration (prop values) for the target modal page or widget').c('props')
      .v((value, configuration, configDescription, parameters) => {
        return ['navigate', 'popup', 'popover', 'sheet'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pi(paramPrefix + 'actionGroupPopupItem', 'Group Popup Item', 'Group item whose members to show in a popup')
      .v((value, configuration, configDescription, parameters) => {
        return ['group'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pi(paramPrefix + 'actionAnalyzerItems', 'Item(s) to Analyze', 'Start analyzing with the specified (set of) item(s)').m()
      .v((value, configuration, configDescription, parameters) => {
        return ['analyzer'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    po(paramPrefix + 'actionAnalyzerChartType', 'Chart Type', 'The initial analyzing period - dynamic or a predefined fixed period: day, week, month or year', [
      { value: '', label: 'Dynamic' },
      { value: 'day', label: 'Day' },
      { value: 'isoWeek', label: 'Week (starting on Mondays)' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' }
    ]).v((value, configuration, configDescription, parameters) => {
      return ['analyzer'].indexOf(configuration[paramPrefix + 'action']) >= 0
    }),
    po(paramPrefix + 'actionAnalyzerCoordSystem', 'Initial Coordinate System', 'The initial coordinate system of the analyzer - time, aggregate or calendar (only time is supported for dynamic periods)', [
      { value: 'time', label: 'Time' },
      { value: 'aggregate', label: 'Aggregate' },
      { value: 'calendar', label: 'Calendar' }
    ]).v((value, configuration, configDescription, parameters) => {
      return ['analyzer'].indexOf(configuration[paramPrefix + 'action']) >= 0
    })
  ]
}
