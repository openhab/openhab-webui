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
      { value: 'options', label: 'Command options' },
      { value: 'rule', label: 'Run rule' },
      { value: 'popup', label: 'Open popup' },
      { value: 'popover', label: 'Open popover' },
      { value: 'sheet', label: 'Open sheet' },
      { value: 'photos', label: 'Open photo browser' },
      { value: 'group', label: 'Group details' },
      { value: 'analyzer', label: 'Analyze item(s)' },
      { value: 'url', label: 'External URL' }
    ]),
    pt(paramPrefix + 'actionUrl', 'Action URL', 'URL to navigate to').c('url')
      .v((value, configuration, configDescription, parameters) => {
        return ['url'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pi(paramPrefix + 'actionItem', 'Action Item', 'Item to perform the action on')
      .v((value, configuration, configDescription, parameters) => {
        return ['command', 'toggle', 'options'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionCommand', 'Action Command', 'Command to send to the item. If "toggle item" is selected as the action, only send the command when the state is different')
      .v((value, configuration, configDescription, parameters) => {
        return ['command', 'toggle'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionCommandAlt', 'Action Toggle Command', 'Command to send to the item when "toggle item" is selected as the action, and the item\'s state is equal to the command above')
      .v((value, configuration, configDescription, parameters) => {
        return ['toggle'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionOptions', 'Command Options', 'Comma-separated list of options; if omitted, retrieve the command options from the item dynamically. Use <code>value=label</code> format to provide a label different than the option.')
      .v((value, configuration, configDescription, parameters) => {
        return ['options'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionRule', 'Rule', 'Rule to run').c('rule')
      .v((value, configuration, configDescription, parameters) => {
        return ['rule'].indexOf(configuration[paramPrefix + 'action']) >= 0
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
    pt(paramPrefix + 'actionPhotos', 'Images to show', 'Array of URLs or objects representing the images. Auto-refresh is not supported.<br />Edit in YAML or provide a JSON array, e.g.<br /><code>[ "url1", { "item": "ImageItem1", "caption": "Camera" } ]</code><br />Objects are in the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photos-array">photos array format</a> with an additional <code>item</code> property to specify an item to view.')
      .v((value, configuration, configDescription, parameters) => {
        return ['photos'].indexOf(configuration[paramPrefix + 'action']) >= 0
      }),
    pt(paramPrefix + 'actionPhotoBrowserConfig', 'Photo browser configuration', 'Configuration for the photo browser.<br />Edit in YAML or provide a JSON object, e.g.<br /><code>{ "exposition": false, "type": "popup", "theme": "dark" }</code><br /> See <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/photo-browser.html#photo-browser-parameters">photo browser parameters</a> (not all are supported).')
      .v((value, configuration, configDescription, parameters) => {
        return ['photos'].indexOf(configuration[paramPrefix + 'action']) >= 0
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
    }),
    pt(paramPrefix + 'actionFeedback', 'Action feedback', 'Shows a toast popup when the action has been executed. Can either be a text to show or a JSON object including some of the <a class="external text-color-blue" target="_blank" href="https://framework7.io/docs/toast.html#toast-parameters">supported parameters</a>').a()
      .v((value, configuration, configDescription, parameters) => {
        return ['command', 'toggle', 'options', 'rule'].indexOf(configuration[paramPrefix + 'action']) >= 0
      })
  ]
}
