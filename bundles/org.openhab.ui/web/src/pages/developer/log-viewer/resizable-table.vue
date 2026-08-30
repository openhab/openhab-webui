<template>
  <div
    ref="tableContainer"
    class="table-container resizable-table-container no-swipe-panel"
    :class="{ 'resize-hovering': columnResizeEnabled && (hoveredResizeHandle >= 0 || activeResizeHandle >= 0) }"
    @mousemove="handleTableMouseMove"
    @mouseleave="handleTableMouseLeave"
    @mousedown="handleTableMouseDown"
    @dblclick="handleTableDoubleClick"
    @touchstart="handleTableTouchStart">
    <div v-bind="containerProps" @scroll="emit('scroll', $event)" class="container">
      <div v-bind="wrapperProps" class="wrapper">
        <div
          v-if="columnResizeEnabled"
          class="resizable-table-header-overlay"
          :class="{ 'resizable-table-header-overlay-visible': showColumnHeaders }"
          :style="{ width: totalTableWidth + 'px' }">
          <div
            v-for="(col, i) in columns"
            :key="i"
            class="resizable-table-header-cell"
            :class="{ 'resizable-table-header-cell-sticky': i === 0 }"
            :style="{ width: columnWidths[i] + 'px' }">
            <span>{{ col.label }}</span>
          </div>
        </div>
        <table
          ref="dataTable"
          class="resizable-table"
          :style="columnResizeEnabled ? { tableLayout: 'fixed', width: totalTableWidth + 'px' } : { width: '100%' }"
          @click.prevent.stop="onTableClick">
          <colgroup v-if="columnResizeEnabled">
            <col v-for="(width, i) in columnWidths" :key="i" :style="{ width: width + 'px' }" />
          </colgroup>
          <tbody>
            <slot v-for="{ data: item, index } in listDisplayed" :key="getItemKey(item)" name="row" :item="item" :index="index" />
          </tbody>
        </table>
      </div>
    </div>
    <div
      v-if="columnResizeEnabled && resizeGuideLeft !== null"
      class="resizable-table-guide"
      :class="{ 'resizable-table-guide-active': activeResizeHandle >= 0 }"
      :style="{ left: resizeGuideLeft + 'px', top: 0 + 'px', height: '100%' }"
      aria-hidden="true" />
  </div>
</template>

<style lang="stylus">
.resizable-table-container
  display block
  position relative
  .container
    overflow auto
    height 100%

.resizable-table-container.resize-hovering
  cursor col-resize

.resizable-table
  position relative
  border-collapse collapse
  table-layout auto

.resizable-table-header-overlay
  position sticky
  top 0
  z-index 4
  display flex
  align-items stretch
  height 31px
  margin-bottom -31px
  opacity 0
  transform translateY(-100%)
  transition opacity 0.12s ease, transform 0.12s ease
  pointer-events none

.resizable-table-header-overlay-visible
  opacity 1
  transform translateY(0)

.resizable-table-header-cell
  background var(--f7-bars-bg-color)
  color var(--f7-bars-text-color)
  box-sizing border-box
  padding 5px
  padding-right 14px
  text-align left
  font-weight bold
  box-shadow 0 1px 0 rgba(128, 128, 128, 0.3)
  user-select none
  white-space nowrap
  overflow hidden
  flex 0 0 auto

.resizable-table-header-cell-sticky
  position sticky
  left 0
  z-index 1

.resizable-table-guide
  position absolute
  width 2px
  transform translateX(-1px)
  background rgba(90, 90, 90, 0.95)
  box-shadow 0 0 0 1px rgba(255, 255, 255, 0.55)
  border-radius 1px
  opacity 0.9
  z-index 6
  pointer-events none
  transition opacity 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease

.resizable-table-guide-active
  background var(--f7-theme-color)
  box-shadow 0 0 0 1px rgba(255, 255, 255, 0.7)
  opacity 1

body.col-resizing .resizable-table-container
  *
    user-select none
    cursor col-resize !important

@media (pointer coarse)
  .resizable-table-guide
    opacity 0.8
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { useVirtualList, useStorage, debounceFilter } from '@vueuse/core'

/**
 * Reusable table shell with persisted resizable columns and virtualized scrolling. This component does not know anything about the row model, and does not render rows itself.
 *
 * Usage expectations:
 * - The parent owns row rendering and renders the row slot
 * - The parent listens for `auto-size-column` when column width depends on row data. A helper function 'autoSizeColumns' is exposed to compute widths based on sample text and table layout.
 * - Width persistence is keyed by `storageKey`, so callers should pass a stable, feature-specific key.
 * - Parent is responsible for applying styles to the table and its cells, including borders, padding, and text wrapping.
 *
 * This component intentionally does not know anything about the row model. It only owns
 * column widths, hover/drag/touch resize behavior, the temporary header overlay, and the
 * DOM handles needed by parents that manage table body content themselves.
 */
type TableColumnDef = {
  label: string
  width?: string
  maxWidth?: string
}

/**
 * Public configuration surface for the table shell.
 *
 * `columnResizeEnabled` controls whether the component uses explicit column widths and
 * shows the resize affordance.
 */
const props = withDefaults(
  defineProps<{
    columns: TableColumnDef[]
    columnResizeEnabled: boolean
    storageKey: string
    defaultColumnWidths: number[]
    minColumnWidth?: number
    list: unknown[]
    getItemKey: (item: unknown) => string | number
    lineHeight: number
  }>(),
  {
    minColumnWidth: 40
  }
)

/**
 * `scroll` lets the parent react to viewport changes.
 * `auto-size-column` lets the parent compute width from its own data model.
 */
const emit = defineEmits<{
  scroll: [event: Event]
  'auto-size-column': [colIndex: number]
  tableClick: [event: MouseEvent]
}>()

const resizeHoverDistance = 6
const dataTableRef = useTemplateRef('dataTable')
const dataTableContainerRef = useTemplateRef('tableContainer')

// useVirtualList snapshots a plain array once; pass a computed so it stays reactive to prop reassignment
const listSource = computed(() => props.list)
const {
  list: listDisplayed,
  containerProps,
  wrapperProps,
  scrollTo
} = useVirtualList(listSource, {
  itemHeight: () => props.lineHeight
})

const columnWidths = useStorage<number[]>(props.storageKey, props.defaultColumnWidths, localStorage, {
  flush: 'sync',
  writeDefaults: false,
  serializer: {
    read: (raw) => {
      try {
        const parsed = JSON.parse(raw)
        return isValidColumnWidths(parsed) ? parsed : [...props.defaultColumnWidths]
      } catch {
        return [...props.defaultColumnWidths]
      }
    },
    write: (value) => JSON.stringify(value)
  },
  eventFilter: debounceFilter(500)
})

// --- Column resize state & handlers ---
let resizingIndex = -1
let resizeStartX = 0
let resizeStartWidth = 0
const activeResizeHandle = ref(-1)
const hoveredResizeHandle = ref(-1)
const isHoveringTableTop = ref(false)

function beginResize(clientX: number, colIndex: number) {
  resizingIndex = colIndex
  resizeStartX = clientX
  resizeStartWidth = columnWidths.value[colIndex]
  activeResizeHandle.value = colIndex
}

function startResize(event: MouseEvent, colIndex: number) {
  beginResize(event.clientX, colIndex)
  document.body.classList.add('col-resizing')
  document.body.style.cursor = 'col-resize'
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event: MouseEvent) {
  if (resizingIndex < 0 || !props.columnResizeEnabled) return
  columnWidths.value[resizingIndex] = Math.max(props.minColumnWidth, resizeStartWidth + (event.clientX - resizeStartX))
}

function stopResize() {
  if (resizingIndex < 0) return
  resizingIndex = -1
  activeResizeHandle.value = -1
  document.body.classList.remove('col-resizing')
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

function startResizeTouch(event: TouchEvent, colIndex: number) {
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  beginResize(touch.clientX, colIndex)
  document.addEventListener('touchmove', handleResizeTouch, { passive: false })
  document.addEventListener('touchend', stopResizeTouch)
  document.addEventListener('touchcancel', stopResizeTouch)
}

function handleResizeTouch(event: TouchEvent) {
  if (resizingIndex < 0 || event.touches.length !== 1) return
  event.preventDefault()
  const touch = event.touches[0]
  if (!props.columnResizeEnabled) return
  columnWidths.value[resizingIndex] = Math.max(props.minColumnWidth, resizeStartWidth + (touch.clientX - resizeStartX))
}

function stopResizeTouch() {
  if (resizingIndex < 0) return
  resizingIndex = -1
  activeResizeHandle.value = -1
  document.removeEventListener('touchmove', handleResizeTouch)
  document.removeEventListener('touchend', stopResizeTouch)
  document.removeEventListener('touchcancel', stopResizeTouch)
}

function clearResizeHoverState() {
  if (resizingIndex >= 0) {
    stopResize()
    stopResizeTouch()
  }
  hoveredResizeHandle.value = -1
  activeResizeHandle.value = -1
  isHoveringTableTop.value = false
}

function updateTableHoverState(clientX: number, clientY: number) {
  if (!props.columnResizeEnabled) {
    clearResizeHoverState()
    return
  }

  const tableContainer = dataTableContainerRef.value
  if (!tableContainer) return

  const rect = tableContainer.getBoundingClientRect()
  const withinContainer = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

  if (!withinContainer) {
    if (resizingIndex < 0) {
      hoveredResizeHandle.value = -1
    }
    isHoveringTableTop.value = false
    return
  }

  isHoveringTableTop.value = clientY - rect.top <= props.lineHeight

  if (resizingIndex >= 0) return

  const cursorX = clientX - rect.left + tableContainer.scrollLeft
  let closestCol = -1
  let closestDist = Infinity

  for (const border of columnBorders.value) {
    const dist = Math.abs(cursorX - border.left)
    if (dist < closestDist) {
      closestDist = dist
      closestCol = border.index
    }
  }

  hoveredResizeHandle.value = closestDist <= resizeHoverDistance ? closestCol : -1
}

function handleTableMouseMove(event: MouseEvent) {
  updateTableHoverState(event.clientX, event.clientY)
}

function handleTableMouseLeave() {
  if (!props.columnResizeEnabled) return
  if (resizingIndex >= 0) return
  hoveredResizeHandle.value = -1
  isHoveringTableTop.value = false
}

function handleTableMouseDown(event: MouseEvent) {
  if (!props.columnResizeEnabled) return
  if (event.button !== 0 || hoveredResizeHandle.value < 0) return
  event.preventDefault()
  event.stopPropagation()
  startResize(event, hoveredResizeHandle.value)
}

function handleTableDoubleClick(event: MouseEvent) {
  if (!props.columnResizeEnabled) return
  if (hoveredResizeHandle.value < 0) return
  event.preventDefault()
  event.stopPropagation()
  emit('auto-size-column', hoveredResizeHandle.value)
}

function handleTableTouchStart(event: TouchEvent) {
  if (!props.columnResizeEnabled) return
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  updateTableHoverState(touch.clientX, touch.clientY)
  if (hoveredResizeHandle.value < 0) return
  startResizeTouch(event, hoveredResizeHandle.value)
}

/**
 * Imperative helpers exposed for parents that manage tbody content themselves.
 *
 * This keeps the resizable shell reusable while still supporting existing code paths that
 * append/remove rows manually or need direct access to the scroll container and table node.
 */
function resetColumnWidths() {
  if (!props.columnResizeEnabled) return
  columnWidths.value = [...props.defaultColumnWidths]
  localStorage.removeItem(props.storageKey)
}

function setColumnWidth(colIndex: number, width: number) {
  if (!props.columnResizeEnabled) return
  if (colIndex < 0 || colIndex >= columnWidths.value.length) return
  columnWidths.value[colIndex] = Math.max(props.minColumnWidth, width)
}

function getTableBody(): HTMLTableSectionElement | null {
  return dataTableRef.value?.tBodies?.[0] ?? null
}

function getTableElement(): HTMLTableElement | null {
  return dataTableRef.value ?? null
}

function getContainerElement(): HTMLDivElement | null {
  return dataTableContainerRef.value ?? null
}

const totalTableWidth = computed(() => columnWidths.value.reduce((sum, width) => sum + width, 0))

const columnBorders = computed(() => {
  let offset = 0
  return columnWidths.value.map((width, index) => {
    offset += width
    return {
      index,
      left: offset
    }
  })
})

const resizeGuideLeft = computed(() => {
  const guideIndex = activeResizeHandle.value >= 0 ? activeResizeHandle.value : hoveredResizeHandle.value
  if (guideIndex < 0) return null
  return columnBorders.value[guideIndex]?.left ?? null
})

const showColumnHeaders = computed(() => isHoveringTableTop.value || hoveredResizeHandle.value >= 0 || activeResizeHandle.value >= 0)

watch(
  () => props.columnResizeEnabled,
  (columnResizeEnabled) => {
    if (!columnResizeEnabled) {
      clearResizeHoverState()
    }
  }
)

function onTableClick(event: MouseEvent) {
  if (showColumnHeaders.value) {
    event.stopPropagation()
    event.preventDefault()
    return
  }

  const selection = window.getSelection()?.toString().trim() ?? ''
  if (selection.length > 0) {
    return
  }

  emit('tableClick', event)
}

// --- Lifecycle ---
onBeforeUnmount(() => {
  clearResizeHoverState()
})

// --- Methods ---

function isValidColumnWidths(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === props.defaultColumnWidths.length && value.every((n) => typeof n === 'number' && n > 0)
}

function scrollToBottom() {
  scrollTo(Number.MAX_SAFE_INTEGER)
}

/**
 * Creates an offscreen clone of the table and measures the widths of each column based on the provided sample text.
 * @param sampleTexts Optional array of sample texts to set in the first row of the cloned table for width measurement.
 */
function autoSizeColumns(sampleTexts?: string[], widthMode: 'max-content' | '100%' = '100%'): number[] {
  const originalTable = dataTableRef.value ?? null
  if (!originalTable) return []

  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'absolute',
    visibility: 'hidden',
    top: '0',
    left: '0',
    width: '100%',
    overflow: 'auto',
    'scrollbar-gutter': widthMode === '100%' ? 'stable both-edges' : 'auto'
  })

  const clonedTable = originalTable.cloneNode(true) as HTMLTableElement
  clonedTable.style.tableLayout = 'auto'
  clonedTable.style.width = '100%'
  clonedTable.style.minWidth = '0'

  const allCells = Array.from(clonedTable.querySelectorAll('th, td')) as HTMLElement[]
  allCells.forEach((cell) => {
    if ('width' in cell.style) {
      cell.style.removeProperty('width')
    }
  })

  const clonedRow = clonedTable.querySelector('tr')
  if (clonedRow && sampleTexts && sampleTexts.length > 0) {
    const cells = Array.from(clonedRow.children) as HTMLElement[]
    cells.forEach((cell, index) => {
      if (sampleTexts[index]) {
        cell.textContent = sampleTexts[index]
      }
      cell.style.width = props.columns[index]?.width ?? 'auto'
      if (props.columns[index]?.maxWidth) {
        cell.style.maxWidth = props.columns[index].maxWidth
      }
    })
  }

  const clonedColGroup = clonedTable.querySelector('colgroup')
  if (clonedColGroup) {
    clonedColGroup.remove()
  }

  container.appendChild(clonedTable)
  dataTableContainerRef.value?.appendChild(container)

  const autoColumnWidths: number[] = []
  if (clonedRow) {
    const cells = Array.from(clonedRow.children) as HTMLElement[]

    cells.forEach((cell, index) => {
      // Add a 2px fractional buffer to prevent layout text-wrapping glitches
      const idealWidth = Math.ceil(cell.getBoundingClientRect().width) + 2

      // Enforce systemic safety boundaries
      const finalWidth = Math.min(Math.max(idealWidth, props.minColumnWidth), 6000)
      autoColumnWidths[index] = finalWidth
    })
  }

  dataTableContainerRef.value?.removeChild(container)

  return autoColumnWidths
}

defineExpose({
  getTableBody,
  getTableElement,
  getContainerElement,
  resetColumnWidths,
  setColumnWidth,
  clearResizeHoverState,
  scrollTo,
  scrollToBottom,
  autoSizeColumns
})
</script>
