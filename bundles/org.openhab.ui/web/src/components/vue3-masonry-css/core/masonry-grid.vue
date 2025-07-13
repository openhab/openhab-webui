<template>
  <component :is="render" />
</template>

<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, type VNode } from 'vue'
import { type MasonryProps } from '../types/props'
import { breakpointValue } from '../util/breakpoint-value'
import { findChildNodesWithClassName } from '../util/find-child-nodes'

const props = withDefaults(defineProps<MasonryProps>(), {
  columns: 2,
  gutter: 0,
  css: true,
  tag: 'div',
  columnTag: 'div',
  childTag: 'div'
})

const slots = defineSlots<{
  default(): VNode[];
}>()

const displayColumns = ref<number>(2)
const displayGutter = ref<string | number>(0)

const windowWidth = ref<number>(0)

/**
 * Recalculate how many columns to display based on window width and the value of the passed `:cols=` prop.
 */
const recalculate = () => {
  const prevWindowWidth = windowWidth.value
  windowWidth.value = (window ? window.innerWidth : null) ?? Infinity

  // Window resize gets also triggered on page height change which loading the page can result in multiple needled calculations. We prevent this here.
  if (prevWindowWidth === windowWidth.value) return

  recalculateColumnCount(windowWidth.value)
  recalculateGutterSize(windowWidth.value)
}

const recalculateColumnCount = (windowWidth: number) => {
  const newColumns = breakpointValue<number>(props.columns, windowWidth)

  // make sure we can return a valid value
  const validNewColumns = Math.max(1, newColumns ?? 0)

  displayColumns.value = validNewColumns
}

const recalculateGutterSize = (windowWidth: number) => {
  displayGutter.value = breakpointValue<string | number>(props.gutter, windowWidth)
}

const getChildItems = (): VNode[] => {
  const rawChildItems = slots.default() as VNode[]
  const childItems = findChildNodesWithClassName(rawChildItems, 'masonry-grid-item')
  return childItems
}

const getChildItemsInColumnsArray = () => {
  const childItems = getChildItems()

  const columns: VNode[][] = []
  // loop through child elements
  for (let i = 0, visibleItem = 0; i < childItems.length; i++, visibleItem++) {
    // get the column index the child will end up in
    const columnIndex = visibleItem % displayColumns.value

    // initialize array if not existing yet
    if (!columns[columnIndex]) {
      columns[columnIndex] = []
    }

    // add child item to column
    columns[columnIndex].push(childItems[i])
  }

  return columns
}

const gutterSize = computed(() => {
  if (typeof displayGutter.value === 'number') {
    return `${displayGutter.value}px`
  } else {
    return displayGutter.value
  }
})

//#region rendering
const renderChild = (element: VNode) => {
  const style = props.css
    ? {
      padding: `calc(${gutterSize.value} / 2)`
    }
    : undefined

  return h(
    props.childTag,
    {
      style,
      class: props.childClass,
      attrs: props.childAttr
    },
    element
  )
}

const renderColumn = (children: VNode[], key: string) => {
  const style = props.css
    ? {
      boxSizing: 'border-box',
      backgroundClip: 'padding-box',
      width: `${100 / displayColumns.value}%`
    }
    : undefined

  return h(
    props.columnTag,
    {
      key: key,
      style: style,
      class: props.columnClass,
      attrs: props.columnAttr
    },
    children
  )
}

const renderContainer = (columns: VNode[]) => {
  const style = props.css
    ? {
      display: ['-webkit-box', '-ms-flexbox', 'flex'],
      margin: `calc(-${gutterSize.value} / 2)`
    }
    : undefined

  return h(props.tag, { style, class: props.class }, columns)
}

const mounted = ref<boolean>(false)
const render = () => {
  if (!mounted.value) return
  const columnsContainingChildren = getChildItemsInColumnsArray()

  const columns = columnsContainingChildren.map((children, index) => {
    const childs = children.map(renderChild)
    return renderColumn(childs, `${index}-${columnsContainingChildren.length}`)
  })

  return renderContainer(columns)
}
//#endregion

onMounted(async () => {
  await nextTick()
  recalculate()
  mounted.value = true

  if (window) {
    window.addEventListener('resize', recalculate)
  }
})
onBeforeUnmount(() => {
  if (window) {
    window.removeEventListener('resize', recalculate)
  }
})
</script>
