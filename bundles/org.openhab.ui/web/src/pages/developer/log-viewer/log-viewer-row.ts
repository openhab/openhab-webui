// High-performance functional component for rendering a single log entry row in the log viewer table.

import { h, type FunctionalComponent } from 'vue'
import { type EnrichedLogEntry, type LogHighlightFilter } from './types'

interface LogTableRowProps {
  item: EnrichedLogEntry
  textMode: boolean
  highlightFilters: LogHighlightFilter[]
}

/**
 * Utility to escape unsafe HTML characters and prevent XSS from log payloads.
 */
function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/**
 * Render text highlighting based on active highlight filters.
 * @param text The text to be highlighted
 * @param highlightFilters The active highlight filters
 */
function highlightText(text: string, highlightFilters?: LogHighlightFilter[]): string {
  if (!highlightFilters || highlightFilters.length === 0) {
    return text // Skip if no filters are active
  }

  // Apply each filter with its respective color
  highlightFilters.forEach((filter) => {
    // Escape regex special characters so users can search for things like "[WARN]"
    const regexSafeFilter = filter.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${regexSafeFilter})`, 'gi')
    text = text.replace(regex, `<span class="filter-highlight bg-color-${filter.color}">$1</span>`)
  })
  return text
}

export const LogTableRow: FunctionalComponent<LogTableRowProps> = (props) => {
  const { item, textMode, highlightFilters } = props
  const rowClass = ['table-rows', item.level.toLowerCase()]
  const escapedMessage = highlightText(escapeHtml(item.message), highlightFilters)

  if (!textMode) {
    return h('tr', { class: rowClass, 'data-id': item.sequence }, [
      h('td', { class: 'time details-trigger' }, `${item.time}`),
      h('td', { class: 'level' }, [h('span', {}, item.level)]),
      h('td', { class: 'logger' }, [
        h('span', { class: 'logger', title: item.loggerName, innerHTML: highlightText(item.loggerName, highlightFilters) })
      ]),
      h('td', {
        class: 'msg details-trigger',
        innerHTML: escapedMessage // Replaces v-html
      })
    ])
  }

  return h('tr', { class: rowClass, 'data-id': item.sequence }, [
    h(
      'td',
      { class: 'text' },
      h('div', { class: 'textline' }, [
        h('span', { class: 'time details-trigger' }, `${item.time}`),
        ' [',
        h('span', { class: `level ${item.level.toLowerCase()}` }, item.level.padEnd(5)),
        '] [',
        h('span', { class: 'logger', title: item.loggerName, innerHTML: highlightText(item.loggerName, highlightFilters) }),
        '] - ',
        h('span', {
          class: `msg ${item.level.toLowerCase()}`,
          innerHTML: escapedMessage // Replaces v-html
        })
      ])
    )
  ])
}

// Explicitly register props so Vue knows how to unpack them
LogTableRow.props = {
  item: { type: Object, required: true },
  textMode: { type: Boolean, required: true },
  highlightFilters: { type: Array as () => LogHighlightFilter[], required: false }
}
