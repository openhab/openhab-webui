<template>
  <component v-if="componentType && componentType.startsWith('f7-') && visible"
             :is="componentType"
             v-bind="config"
             @command="onCommand">
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template v-for="(slotComponents, slotName) in context.component.slots" #[slotName]>
      <ul :key="slotName" v-if="componentType === 'f7-list'">
        <generic-widget-component :context="childContext(slotComponent)"
                                  v-for="(slotComponent, idx) in slotComponents"
                                  :slot="slotName"
                                  :key="slotName + '-' + idx"
                                  @command="onCommand" />
      </ul>
      <generic-widget-component v-else
                                :context="childContext(slotComponent)"
                                v-for="(slotComponent, idx) in slotComponents"
                                :slot="slotName"
                                :key="slotName + '-' + idx"
                                @command="onCommand" />
    </template>
  </component>
  <oh-card v-else-if="componentType && componentType === 'oh-card' && visible" :context="context">
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template v-for="(slotComponents, slotName) in context.component.slots" #[slotName]>
      <generic-widget-component :context="childContext(slotComponent)"
                                v-for="(slotComponent, idx) in slotComponents"
                                :slot="slotName"
                                :key="slotName + '-' + idx"
                                @command="onCommand" />
    </template>
  </oh-card>
  <generic-widget-component v-else-if="componentType && componentType.startsWith('widget:') && visible" :context="childWidgetContext()" @command="onCommand" />
  <component v-else-if="componentType && componentType.startsWith('oh-') && visible"
             :is="componentType"
             :context="context"
             @command="onCommand" />
  <div v-else-if="componentType && componentType === 'Label' && visible" :class="config.class" :style="config.style">
    {{ config.text }}
  </div>
  <fragment v-else-if="componentType && componentType === 'Content'">
    {{ config.text }}
  </fragment>
  <pre v-else-if="componentType && componentType === 'Error' && visible" class="text-color-red" style="white-space: pre-wrap">{{ config.error }}</pre>
  <component v-else-if="visible" :is="componentType" v-bind="config">
    {{ config.content }}
    <template v-if="context.component.slots && context.component.slots.default">
      <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="'default-' + idx" />
    </template>
  </component>
</template>

<script>
import { Fragment } from 'vue-fragment'

import mixin from './widget-mixin'

import * as SystemWidgets from './system/index'
import * as StandardWidgets from './standard/index'
import * as StandardListWidgets from './standard/list'
import * as StandardCellWidgets from './standard/cell'
import * as LayoutWidgets from './layout/index'

export default {
  mixins: [mixin],
  components: {
    Fragment,
    ...SystemWidgets,
    ...StandardWidgets,
    ...StandardListWidgets,
    ...StandardCellWidgets,
    ...LayoutWidgets
  }
}
</script>
