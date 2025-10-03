<template>
  <div>
    <template v-if="!config.layoutType || config.layoutType === 'responsive'">
      <oh-block v-for="(component, idx) in context.component.slots.default"
                v-bind="$attrs"
                :key="idx"
                :context="childContext(component)"
                style="z-index: 5000 !important" />
      <f7-block v-if="context.editmode">
        <f7-list>
          <f7-list-button color="blue" @click="$emit('add-block', context.component)">
            Add Block
          </f7-list-button>
        </f7-list>
      </f7-block>

      <hr v-if="context.editmode">
      <f7-block v-if="context.component.slots.masonry && context.component.slots.masonry.length"
                style="z-index: auto !important">
        <oh-masonry v-bind="$attrs" :context="childContext(context.component.slots.masonry[0])" />
      </f7-block>
      <template v-else-if="context.editmode">
        <f7-block>
          <f7-list>
            <f7-list-button color="blue" @click="$emit('add-masonry', context.component)">
              Add Masonry
            </f7-list-button>
          </f7-list>
        </f7-block>
      </template>
      <div v-if="context.editmode && !$fullscreen.isFullscreen"
           style="height: calc(var(--f7-toolbar-height) + var(--f7-safe-area-bottom) + 40px)" />
    </template>
    <template v-else-if="config.layoutType === 'fixed' && (!config.fixedType || config.fixedType === 'grid')">
      <oh-grid-layout :context="context" />
    </template>
    <template v-else-if="config.layoutType === 'fixed' && config.fixedType === 'canvas'">
      <oh-canvas-layout :context="context" @action="$emit('action', $event)" />
    </template>
  </div>
</template>

<style lang="stylus"></style>

<script>
import mixin from '../widget-mixin'
import OhBlock from './oh-block.vue'
import OhMasonry from './oh-masonry.vue'
import OhGridLayout from './oh-grid-layout.vue'
import OhCanvasLayout from './oh-canvas-layout.vue'

export default {
  emits: ['action', 'add-block', 'add-masonry'],
  mixins: [mixin],
  components: {
    OhBlock,
    OhMasonry,
    OhGridLayout,
    OhCanvasLayout
  }
}
</script>
