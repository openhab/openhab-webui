import { pt, pb, pi, pn } from '../helpers.js'

export default () => [
  pt('for', 'Current element variable', 'Name of the variable holding the current element in the iteration, it will be propagated to the children components in the default slot. ' +
    '2 additional variables with the <code>"_idx"</code> and <code>"_source"</code> suffixes will also be defined to hold the current index and source array, respectively.'),
  pt('sourceType', 'Source type', 'What to iterate on')
    .o([
      { value: 'array', label: 'Array (default) in the "in" parameter' },
      { value: 'range', label: 'Range of integers defined by "rangeStart", "rangeStop", "rangeStep"' },
      { value: 'itemsInGroup', label: 'Member of the group defined in the "groupItem" parameter' },
      { value: 'itemsWithTags', label: 'Items with tags in the "itemTags" parameter' },
      { value: 'itemStateOptions', label: 'State options of the item specified in "itemOptions"' },
      { value: 'itemCommandOptions', label: 'Command options of the item specified in "itemOptions"' },
      { value: 'rulesWithTags', label: 'Rules with tags in the "ruleTags" parameter' }
    ]),
  pt('in', 'Source array', 'Source array (for "array" source type)'),
  pn('rangeStart', 'Range Start', 'Start of range (for "range" source type)'),
  pn('rangeStop', 'Range Stop', 'End of range (for "range" source type)'),
  pn('rangeStep', 'Range Step', 'Step of range (for "range" source type)'),
  pi('groupItem', 'Group Item', 'Group item to whose members will be iterated (for "itemsInGroup" source type)'),
  pt('itemTags', 'Item Tags', 'Iterate over items with the given tags (comma-separated, for "itemsWithTags" source type)'),
  pt('ruleTags', 'Rule Tags', 'Iterate over rules with the given tags (comma-separated, for "rulesWithTags" source type)'),
  pt('itemOptions', 'Item with Options', 'Iterate over the state options or command options of this item (for "itemStateOptions" or "itemCommandOptions" source type)'),
  pt('fetchMetadata', 'Fetch Item Metadata Namespaces', 'Fetch the metadata from these namespaces (for "itemsInGroup" and "itemsWithTags" source types)'),
  pt('filter', 'Filter expression', 'Specify an expression WITHOUT THE = PREFIX to filter the resulting array'),
  pt('map', 'Map expression', 'Specify an expression WITHOUT THE = PREFIX to transform the resulting array elements'),
  pb('listContainer', 'List container', 'The child components will be wrapped in a <code>ul</code> HTML elements instead of a <code>div</code>'),
  pt('containerClasses', 'Classes of the container', 'Add these CSS classes to the container'),
  pt('containerStyle', 'Styles of the container', 'Add these CSS styles to the container'),
  pb('fragment', 'No container (fragment)', 'Render all children directly under the repeater\'s parent, without any container'),
  pb('cacheSource', 'Suppress source refresh', 'For loaded sources (e.g. with Items or rules), the source array will be cached and not refreshed on page updates')
]
