// defintions for the tab "widget"

import { WidgetDefinition, pt } from '../helpers'

export const OhTabDefinition = () => new WidgetDefinition('oh-tab', 'Tab', 'Displays a widget in a tab')
  .params([
    pt('title', 'Title', 'The title of the tab'),
    pt('icon', 'Icon', 'The icon on the tab: use <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'),
    pt('page', 'Page', 'The page to display').c('page'),
    pt('pageConfig', 'Page Configuration', 'The parameters (props) to configure the page, if any').c('props')
  ])
