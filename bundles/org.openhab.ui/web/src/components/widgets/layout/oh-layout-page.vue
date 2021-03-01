<template>
  <div>
    <f7-block v-if="context.editmode &&
                !(context.component.slots.default && context.component.slots.default.length) &&
                !(context.component.slots.masonry && context.component.slots.masonry.length) &&
                !['responsive', 'fixed'].includes(config.layoutType)"
              class="block-narrow margin-bottom" inset>
      <f7-block-title class="margin text-align-center">Choose a layout style</f7-block-title>
      <f7-row class="text-align-center align-items-stretch">
        <f7-col width="50" class="elevation-2 elevation-hover-6 elevation-pressed-1" style="background-color: var(--f7-card-bg-color)">
          <f7-link @click="$emit('set-layout-type', 'responsive', context.component)" class="flex-direction-column padding" style="color: var(--f7-theme-color-text-color)">
            <f7-icon size="70px" f7="rectangle_3_offgrid"></f7-icon>
            <div class="margin-bottom">Responsive</div>
            <div class="margin-top">Create a page that automatically adjusts to the size of the screen. Suitable for use with any device.</div>
          </f7-link>
        </f7-col>
        <f7-col width="50" class="elevation-2 elevation-hover-6 elevation-pressed-1" style="background-color: var(--f7-card-bg-color)">
          <f7-link @click="$emit('set-layout-type', 'fixed', context.component)" class="flex-direction-column padding" style="color: var(--f7-theme-color-text-color)">
            <f7-icon size="70px" f7="rectangle"></f7-icon>
            <div class="margin-bottom">Fixed</div>
            <div class="margin-top">Create a panel-like page for a specific screen size. Suitable for e.g. wall mounted tablets.</div>
          </f7-link>
        </f7-col>
      </f7-row>
    </f7-block>

    <template v-else>
      <template v-if="config.layoutType !== 'fixed'">
        <oh-block v-for="(component, idx) in context.component.slots.default"
                  :key="idx"
                  :context="childContext(component)"
                  v-on="$listeners"
                  style="z-index: 5000 !important"
        ></oh-block>
        <f7-block v-if="context.editmode">
          <f7-list>
            <f7-list-button color="blue" @click="$emit('add-block', context.component)">Add Block</f7-list-button>
          </f7-list>
        </f7-block>

        <hr v-if="context.editmode" />
        <f7-block v-if="context.component.slots.masonry && context.component.slots.masonry.length">
          <oh-masonry
            :context="childContext(context.component.slots.masonry[0])"
            v-on="$listeners" />
        </f7-block>
        <template v-else-if="context.editmode">
          <f7-block>
            <f7-list>
              <f7-list-button color="blue" @click="$emit('add-masonry', context.component)">Add Masonry</f7-list-button>
            </f7-list>
          </f7-block>
        </template>

        <!-- <hr v-if="context.editmode" />
        <oh-grid-layout v-if="context.component.slots.grid && context.component.slots.grid.length" :context="context"></oh-grid-layout>
        <template v-else-if="context.editmode">
          <f7-block>
            <f7-list>
              <f7-list-button color="blue" @click="$emit('add-grid-item', context.component)">Add Grid</f7-list-button>
            </f7-list>
          </f7-block>
        </template> -->

      </template>
      <template v-else>
        <oh-grid-layout :context="context"></oh-grid-layout>
      </template>
    </template>
  </div>
</template>

<style lang="stylus">
</style>

<script>
import mixin from '../widget-mixin'
import OhBlock from './oh-block.vue'
import OhMasonry from './oh-masonry.vue'
import OhGridLayout from './oh-grid-layout.vue'

export default {
  mixins: [mixin],
  components: {
    OhBlock,
    OhMasonry,
    OhGridLayout
  }
}
</script>
