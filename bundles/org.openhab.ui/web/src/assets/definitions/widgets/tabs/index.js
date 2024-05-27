// defintions for the tab "widget"

import { WidgetDefinition, pt } from '../helpers.js'

export const OhTabDefinition = () => new WidgetDefinition('oh-tab', 'Tab', 'Displays a widget in a tab')
  .params([
    pt('title', 'Title', 'Title of the tab'),
    pt('icon', 'Icon', 'Use <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>) or <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>)'),
    pt('badge', 'Badge', 'Badge text to display').a(),
    pt('badgeColor', 'Badge Color', 'Color of the badge').a(),
    pt('page', 'Page', 'Page to display').c('page'),
    pt('pageConfig', 'Page Configuration', 'Parameters (props) to configure the page, if any').c('props')
  ])
