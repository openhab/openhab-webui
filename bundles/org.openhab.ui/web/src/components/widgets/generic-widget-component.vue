<template>
  <component v-if="componentType && componentType.startsWith('f7-') && visible" :is="componentType" v-bind="config" @command="onCommand">
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template v-for="(slotComponents, slotName) in context.component.slots" v-slot:[slotName]>
      <ul :key="slotName" v-if="componentType === 'f7-list'">
        <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in slotComponents" :key="slotName + '-' + idx" @command="onCommand" />
      </ul>
      <generic-widget-component v-else :context="childContext(slotComponent)" v-for="(slotComponent, idx) in slotComponents" :key="slotName + '-' + idx" @command="onCommand" />
    </template>
  </component>
  <generic-widget-component v-else-if="componentType && componentType.startsWith('widget:') && visible" :context="childWidgetContext()" @command="onCommand" />
  <component v-else-if="componentType && componentType.startsWith('oh-') && visible" :is="componentType" :context="context" @command="onCommand" />
  <div v-else-if="componentType && componentType === 'Label' && visible" :class="config.class" :style="config.style">{{config.text}}</div>
  <pre v-else-if="componentType && componentType === 'Error' && visible" class="text-color-red" style="white-space: pre-wrap">{{config.error}}</pre>
</template>

<script>
import mixin from './widget-mixin'

import * as SystemWidgets from './system/index'
import * as StandardWidgets from './standard/index'
import * as StandardListWidgets from './standard/list'
import * as StandardCellWidgets from './standard/cell'
import * as LayoutWidgets from './layout/index'

export default {
  mixins: [mixin],
  components: {
    ...SystemWidgets,
    ...StandardWidgets,
    ...StandardListWidgets,
    ...StandardCellWidgets,
    ...LayoutWidgets
  }
}
</script>
