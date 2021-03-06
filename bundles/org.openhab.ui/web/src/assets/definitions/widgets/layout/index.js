// definitions for the layout widgets

import { WidgetDefinition, po, pt, pn, pb, pg } from '../helpers.js'

export function OhBlockDescription () {
  return new WidgetDefinition('oh-block', 'Layout Grid Block', 'A block in a grid layout')
    .params([
      pt('title', 'Title', 'Title of the block, displayed above it')
    ])
}

export function OhGridRowDefinition () {
  return new WidgetDefinition('oh-grid-row', 'Layout Grid Row', 'A row in a grid layout')
}

export function OhGridColDefinition () {
  const columnOptions = [5, 10, 15, 20, 25, 30, 33, 35, 40, 45,
    50, 55, 60, 65, 66, 70, 75, 80, 85, 90, 95, 100].map((c) => {
    return {
      value: c.toString(),
      label: `${c} %`
    }
  })

  return new WidgetDefinition('oh-grid-col', 'Layout Grid Column', 'A column in a grid layout')
    .params([
      po('width', 'Width', 'Standard Width', columnOptions),
      po('xsmall', 'Width (XS)', 'Column width when app width >= 480px', columnOptions),
      po('small', 'Width (S)', 'Column width when app width >= 568px', columnOptions),
      po('medium', 'Width (M)', 'Column width when app width >= 720px', columnOptions),
      po('large', 'Width (L)', 'Column width when app width >= 1024px', columnOptions),
      po('xlarge', 'Width (XL)', 'Column width when app width >= 1200px', columnOptions)
    ])
}

export function OhMasonryDefinition () {
  return new WidgetDefinition('oh-masonry', 'Masonry Layout', 'Arranges widgets automatically depending on the screen size')
    .params([
      po('flavor', 'Flavor', 'Choose the implementation of the masonry layout', [
        { value: 'vue-masonry-css', label: 'vue-masonry-css' },
        { value: 'css-grid', label: 'CSS Grid (no library)' }
      ])
    ])
}

export function OhGridLayoutDefinition () {
  return new WidgetDefinition('oh-grid-layout', 'Fixed Grid Layout', 'Arranges widgets on a grid of squares with user-defined sizes')
    .paramGroup(pg('layout', 'Layout Settings'), [
      pn('colNum', 'Number of Columns', 'Number of columns across the page (default 16, limited to a minimum widget width of 50px)'),
      pn('margin', 'Margin', 'Margin between items and to screen (default 10)'),
      pb('verticalCompact', 'Vertical Compact', 'Automatically align items from top to bottom (default false)')
        .v((value, configuration, configDescription, parameters) => { return configuration.layoutType !== 'fixed' })
    ])
    .paramGroup(pg('screenSettings', 'Screen Settings'), [
      pn('screenWidth', 'Screen Width', 'Screen width in pixels (default 1280)')
        .v((value, configuration, configDescription, parameters) => { return configuration.layoutType === 'fixed' }),
      pn('screenHeight', 'Screen Height', 'Screen width in pixels (default 720)')
        .v((value, configuration, configDescription, parameters) => { return configuration.layoutType === 'fixed' }),
      pb('scale', 'Scaling', 'Scale content to other screen widths (can lead to unexpected styling issues) (default false)')
        .v((value, configuration, configDescription, parameters) => { return configuration.layoutType === 'fixed' })
    ])
    .paramGroup(pg('appearance', 'Appearance'), [
      pb('hideNavbar', 'Hide Navigation bar', 'Hide navigation bar on top when page is displayed (You can additionally hide the sidebar using its pin icon) (default false)')
        .v((value, configuration, configDescription, parameters) => { return configuration.layoutType === 'fixed' }),
      pb('hideSidebarIcon', 'Hide Sidebar Icon', 'Don\'t show a menu icon in the top left corner when the sidebar is closed (default false)')
        .v((value, configuration, configDescription, parameters) => { return configuration.hideNavbar === true }),
      pb('showFullscreenIcon', 'Show Fullscreen Icon', 'Show a fullscreen icon on the top right corner (default false)')
    ])
}
