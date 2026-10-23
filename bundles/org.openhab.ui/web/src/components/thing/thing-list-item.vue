<template>
  <f7-list-item
    media-item
    class="thinglist-item"
    :checkbox="selectionMode"
    :checked="selected"
    :value="thing.UID"
    :link="`${encodeURIComponent(thing.UID)}`"
    prevent-router
    @click="handleClick">
    <template #title>
      <span v-html="highlightMatches(thing.label, matches, 'label') || highlightMatches(thing.UID, matches, 'UID')"></span>
    </template>
    <template #footer>
      <div>
        <span v-html="highlightMatches(thing.UID, matches, 'UID')"></span>
        <clipboard-icon :value="thing.UID" tooltip="Copy UID" />
      </div>
    </template>
    <template v-if="!compact" #subtitle>
      <div v-if="showLocation && thing.location">
        <span v-html="highlightMatches(thing.location, matches, 'location')"></span>
        <f7-icon f7="placemark" color="gray" style="font-size: 16px; width: 16px; height: 16px" />
      </div>
    </template>
    <template #after>
      <div class="badge-with-marker">
        <f7-badge :color="thingStatusBadgeColor(thing.statusInfo)" :tooltip="thing.statusInfo.description || null">
          {{ thingStatusBadgeText(thing.statusInfo) }}
        </f7-badge>
        <span v-if="thing.statusInfo.status === 'ONLINE' && thing.statusInfo.description" class="badge-marker-dot"> </span>
      </div>
    </template>
    <template #after-title>
      <f7-icon v-if="!thing.editable" f7="lock_fill" size="1rem" color="gray" />
    </template>
  </f7-list-item>
</template>

<script setup lang="ts">
import type { FuseResultMatch } from 'fuse.js'
import type * as api from '@/api'

import ClipboardIcon from '@/components/util/clipboard-icon.vue'
import { thingStatusBadgeColor, thingStatusBadgeText } from '@/components/thing/thing-helpers'
import { highlightMatches } from '@/pages/list-helpers'

type ThingListItem = api.Thing & {
  editable: boolean
  statusInfo: api.ThingStatusInfo
}

const props = withDefaults(
  defineProps<{
    thing: ThingListItem
    matches?: readonly FuseResultMatch[]
    selectionMode: boolean
    selected: boolean
    compact?: boolean
    showLocation?: boolean
  }>(),
  {
    compact: false,
    showLocation: true
  }
)

const emit = defineEmits<{
  (event: 'toggle-selection', uid: string): void
  (event: 'activate', mouseEvent: MouseEvent, thing: ThingListItem): void
}>()

function handleClick(event: MouseEvent) {
  if (event.ctrlKey || event.metaKey) {
    emit('toggle-selection', props.thing.UID)
  } else {
    emit('activate', event, props.thing)
  }
}
</script>
