<template>
  <div ref="page" :class="scopedCssUid">
    <template v-if="!config.layoutType || config.layoutType === 'responsive'">
      <oh-block v-for="(component, idx) in defaultSlots" v-bind="$attrs" :key="idx" :context="childContext(component)" />
      <f7-block v-if="context.editmode">
        <f7-list>
          <f7-list-button color="blue" @click="$emit('add-block', context.component)"> Add Block </f7-list-button>
        </f7-list>
      </f7-block>

      <hr v-if="context.editmode" />
      <f7-block v-if="masonrySlots && masonrySlots.length" style="z-index: auto !important">
        <oh-masonry v-bind="$attrs" :context="childContext(masonrySlots[0])" />
      </f7-block>
      <template v-else-if="context.editmode">
        <f7-block>
          <f7-list>
            <f7-list-button color="blue" @click="$emit('add-masonry', context.component)"> Add Masonry </f7-list-button>
          </f7-list>
        </f7-block>
      </template>
      <div
        v-if="context.editmode && !$fullscreen.isFullscreen"
        style="height: calc(var(--f7-toolbar-height) + var(--f7-safe-area-bottom) + 40px)" />
    </template>
    <template v-else-if="config.layoutType === 'fixed' && (!config.fixedType || config.fixedType === 'grid')">
      <oh-grid-layout :context="context" />
    </template>
    <template v-else-if="config.layoutType === 'fixed' && config.fixedType === 'canvas'">
      <oh-canvas-layout :context="context" :f7router @action="$emit('action', $event)" />
    </template>
  </div>
</template>

<style lang="stylus"></style>

<script setup lang="ts">
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhBlock from './oh-block.vue'
import OhMasonry from './oh-masonry.vue'
import OhGridLayout from './oh-grid-layout.vue'
import OhCanvasLayout from './oh-canvas-layout.vue'
import type { WidgetContext } from '../types'
import type { Router } from 'framework7'
import { computed } from 'vue'

const props = defineProps<{
  context: WidgetContext,
  f7router: Router.Router
}>()

const emits = defineEmits(['action', 'add-block', 'add-masonry'])

const { config, childContext, scopedCssUid, defaultSlots } = useWidgetContext(props.context)

const masonrySlots = computed(() => 'slots' in props.context.component && props.context.component.slots.masonry || [])
</script>
