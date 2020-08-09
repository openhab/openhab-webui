// definitions for the layout widgets

import { WidgetDefinition, po, pt } from '../helpers'

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
