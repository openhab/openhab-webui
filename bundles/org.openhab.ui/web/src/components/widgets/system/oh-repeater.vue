<template>
  <span v-if="error" class="text-color-red">{{ error }}</span>
  <ul v-else-if="config.listContainer" v-bind="$attrs" :class="config.containerClasses" :style="config.containerStyle">
    <generic-widget-component v-for="ctx in childrenContexts" :context="ctx" :key="ctx.loop![forKey + '_key']" />
  </ul>
  <!-- render without any additional container -->
  <template v-else-if="config.fragment">
    <!-- if parent is oh-swiper, render inside f7-swiper-slide -->
    <template v-if="context.parent && ['oh-swiper', 'f7-swiper'].includes(context.parent.component.component)">
      <f7-swiper-slide v-for="ctx in childrenContexts" v-bind="$attrs" :key="ctx.loop![forKey + '_key']">
        <generic-widget-component :context="ctx" />
      </f7-swiper-slide>
    </template>
    <!-- else render -->
    <template v-else>
      <generic-widget-component v-for="ctx in childrenContexts" v-bind="$attrs" :context="ctx" :key="ctx.loop![forKey + '_key']" />
    </template>
  </template>
  <div v-else :class="config.containerClasses" :style="config.containerStyle">
    <generic-widget-component v-for="ctx in childrenContexts" v-bind="$attrs" :context="ctx" :key="ctx.loop![forKey + '_key']" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { computedAsync } from '@vueuse/core'
import { OhRepeaterDefinition } from '@/assets/definitions/widgets/system'
import { compareItems, compareRules } from '@/components/widgets/widget-order'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import type { WidgetContext } from '../types'
import { OhRepeater } from '@/types/components/widgets'

import * as api from '@/api'
import { ApiError } from '@/js/hey-api'

type SourceTypeElement = api.EnrichedItem | api.EnrichedGroupItem | api.EnrichedRule | api.StateOption | api.CommandOption | string | number
type SourceArray = SourceTypeElement[] | null

// define*
const props = defineProps<{
  context: WidgetContext
}>()

defineOptions({ inheritAttrs: false, widget: OhRepeaterDefinition })

// Composables
const { config, childContext, evaluateExpression, defaultSlots } = useWidgetContext(computed(() => props.context))

// Data/State
const error = ref<string | null>(null)
const sourceCache = ref<SourceArray | null>(null)
const sourceType = ref<OhRepeater.SourceType | null>(null)
const forKey = ref<string | null>(null)

// Computed properties
const childrenContexts = computed(() => {
  const { filter, map } = config.value

  const iterationContext = (ctx: WidgetContext, el: SourceTypeElement, idx: number, source: SourceArray) => {
    // takes the context with the added variables
    const loopVars = ctx.loop ? { ...ctx.loop } : {}
    loopVars[forKey.value!] = el
    loopVars[forKey.value! + '_idx'] = idx
    loopVars[forKey.value! + '_source'] = source
    // add a unique key for this iteration (used for v-for key) to ensure the vue component is properly reused when the source changes
    loopVars[forKey.value! + '_key'] = getKey(el)
    ctx.loop = loopVars

    return ctx
  }

  let _source = source.value
  if (!Array.isArray(_source)) return []

  if (filter) {
    _source = _source.filter((el, idx, source) =>
      evaluateExpression('filterExpr', '=' + filter, iterationContext(childContext(props.context.component), el, idx, source))
    )
  }
  if (map) {
    _source = _source.map((el, idx, source) =>
      evaluateExpression('mapExpr', '=' + map, iterationContext(childContext(props.context.component), el, idx, source))
    )
  }

  let contexts = []
  let idx = 0
  const ds = defaultSlots.value as api.UiComponent[]
  for (let i of _source) {
    contexts.push(
      ...ds.map((c) => {
        return iterationContext(childContext(c), i, idx, _source)
      })
    )

    idx++
  }

  return contexts
})

const source = computedAsync(async (): Promise<SourceArray> => {
  const cfg = config.value
  if (cfg.cacheSource && sourceCache.value != null) return sourceCache.value

  error.value = null
  forKey.value = null
  if (!cfg.for) {
    error.value = 'oh-repeater: "for" is not defined'
    console.warn(error.value)
    return []
  }
  forKey.value = cfg.for

  if (!cfg.sourceType) {
    sourceType.value = OhRepeater.SourceType.array
    console.debug('oh-repeater: sourceType is not defined, defaulting to "array"')
  } else {
    if (Object.values(OhRepeater.SourceType).includes(cfg.sourceType)) {
      sourceType.value = cfg.sourceType as OhRepeater.SourceType
    } else {
      error.value = `oh-repeater: invalid sourceType "${cfg.sourceType}"`
      console.warn(error.value)
      sourceType.value = null
      return []
    }
  }

  let sourceResult
  try {
    switch (sourceType.value) {
      case OhRepeater.SourceType.range:
        const start = cfg.rangeStart || 0
        const stop = isNaN(cfg.rangeStop) ? 10 : cfg.rangeStop
        const step = cfg.rangeStep || 1
        return Array(Math.floor((stop + step - start) / step))
          .fill(start)
          .map((x, y) => x + y * step)
      case OhRepeater.SourceType.itemsWithTags:
        sourceResult = await getItemsWithTags()
        break
      case OhRepeater.SourceType.itemsInGroup:
        sourceResult = await getItemsInGroup()
        break
      case OhRepeater.SourceType.itemStateOptions:
        sourceResult = await getItemStateOptions()
        break
      case OhRepeater.SourceType.itemCommandOptions:
        sourceResult = await getItemCommandOptions()
        break
      case OhRepeater.SourceType.rulesWithTags:
        sourceResult = await getRulesWithTags()
        break
      case OhRepeater.SourceType.array:
      default:
        if (!('in' in cfg)) {
          error.value = 'oh-repeater: "in" must be defined when sourceType "array", none, or invalid'
          console.warn(error.value)
          return []
        }
        if (!cfg.in) {
          return []
        }
        return cfg.in
    }
  } catch (e) {
    console.error('oh-repeater: error fetching source data', e)
    return []
  }

  sourceCache.value = config.value.cacheSource ? sourceResult : null
  return sourceResult
})

// Methods
function simpleHash(obj: object | string): string {
  const str = JSON.stringify(obj)
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return (hash >>> 0).toString(36)
}

function getKey(el: SourceTypeElement): string {
  let key = 'repeater-'
  switch (sourceType.value) {
    case OhRepeater.SourceType.itemsWithTags:
    case OhRepeater.SourceType.itemsInGroup:
      return key + (el as api.EnrichedItem).name
    case OhRepeater.SourceType.rulesWithTags:
      return key + (el as api.EnrichedRule).uid
    case OhRepeater.SourceType.itemStateOptions:
      return key + simpleHash(el as api.StateOption)
    case OhRepeater.SourceType.itemCommandOptions:
      return key + simpleHash(el as api.CommandOption)
    case OhRepeater.SourceType.range:
    case OhRepeater.SourceType.array:
    default:
      // For primitive values (numbers, strings, etc.), keep the simple string key.
      // For objects, use a hash to avoid multiple elements sharing "[object Object]" as a key.
      if (el !== null && typeof (el as any) === 'object') {
        return key + simpleHash(el as object)
      }
      return key + String(el)
  }
}

async function getItemsWithTags() {
  const cfg = config.value
  if (!('itemTags' in cfg)) {
    error.value = 'oh-repeater: itemTags must be defined when sourceType is itemsWithTags'
    console.warn(error.value)
    return []
  }
  if (!cfg.itemTags) {
    console.warn('oh-repeater: itemTags is empty')
    return []
  }

  const sourceResult = await api.getItems({ metadata: cfg.fetchMetadata, tags: cfg.itemTags }).catch((e) => {
    if (e instanceof ApiError && e.response.status === 404) {
      console.warn(`oh-repeater: no items found with tags "${cfg.itemTags}"`)
    } else {
      throw e
    }
  })
  if (!sourceResult) return []
  return sourceResult.sort(compareItems)
}

async function getItemsInGroup() {
  const cfg = config.value
  if (!('groupItem' in cfg)) {
    error.value = 'oh-repeater: groupItem must be defined when sourceType is itemsInGroup'
    console.warn(error.value)
    return []
  }
  if (!cfg.groupItem) {
    console.warn('oh-repeater: groupItem is empty')
    return []
  }
  const sourceResult = await api.getItemByName({ itemName: cfg.groupItem, metadata: cfg.fetchMetadata }).catch((e) => {
    if (e instanceof ApiError && e.response.status === 404) {
      error.value = `oh-repeater: group item "${cfg.groupItem}" not found`
      console.warn(error.value)
    } else {
      throw e
    }
  })
  if (!sourceResult || !('members' in sourceResult) || !Array.isArray(sourceResult.members)) return []
  return sourceResult.members.sort(compareItems)
}

async function getItemStateOptions() {
  const cfg = config.value
  if (!('itemOptions' in cfg)) {
    error.value = 'oh-repeater: itemOptions must be defined when sourceType is itemStateOptions'
    console.warn(error.value)
    return []
  }
  if (!cfg.itemOptions) {
    console.warn('oh-repeater: itemOptions is empty')
    return []
  }
  const sourceResult = await api.getItemByName({ itemName: cfg.itemOptions }).catch((e) => {
    if (e instanceof ApiError && e.response.status === 404) {
      error.value = `oh-repeater: item "${cfg.itemOptions}" not found`
      console.warn(error.value)
    } else {
      throw e
    }
  })
  if (!sourceResult) return []
  if (!('stateDescription' in sourceResult) || !sourceResult.stateDescription || !Array.isArray(sourceResult.stateDescription.options)) {
    console.warn(`oh-repeater: item "${cfg.itemOptions}" does not have state options`)
    return []
  }
  return sourceResult.stateDescription.options
}

async function getItemCommandOptions() {
  const cfg = config.value
  if (!('itemOptions' in cfg)) {
    error.value = 'oh-repeater: itemOptions must be defined when sourceType is itemCommandOptions'
    console.warn(error.value)
    return []
  }
  if (!cfg.itemOptions) {
    console.warn('oh-repeater: itemOptions is empty')
    return []
  }
  const sourceResult = await api.getItemByName({ itemName: cfg.itemOptions }).catch((e) => {
    if (e instanceof ApiError && e.response.status === 404) {
      console.warn(`oh-repeater: item "${cfg.itemOptions}" not found`)
    } else {
      throw e
    }
  })
  if (!sourceResult) return []
  if (!sourceResult.commandDescription) {
    console.warn(`oh-repeater: item "${cfg.itemOptions}" does not have command options`)
    return []
  }

  return sourceResult.commandDescription.commandOptions
}

async function getRulesWithTags() {
  const cfg = config.value
  if (!('ruleTags' in cfg)) {
    error.value = 'oh-repeater: ruleTags must be defined when sourceType is rulesWithTags'
    console.warn(error.value)
    return []
  }
  if (!cfg.ruleTags) {
    console.warn('oh-repeater: ruleTags is empty')
    return []
  }

  // getRulesWithTags does not handle comma separate tags
  const ruleTags = (cfg.ruleTags as string)
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  const sourceResult = await api.getRules({ summary: true, tags: ruleTags })
  if (!sourceResult) return []

  return sourceResult.sort(compareRules)
}
</script>
