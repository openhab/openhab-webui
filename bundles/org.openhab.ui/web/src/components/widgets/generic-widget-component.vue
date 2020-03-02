<template>
  <component v-if="componentType && componentType.startsWith('f7-')" :is="componentType" v-bind="config" @command="onCommand">
    <template v-for="(slotComponents, slotName) in context.component.slots" v-slot:[slotName]>
      <ul v-if="componentType === 'f7-list'">
        <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in slotComponents" :key="idx" @command="onCommand" />
      </ul>
      <generic-widget-component v-else :context="childContext(slotComponent)" v-for="(slotComponent, idx) in slotComponents" :key="idx" @command="onCommand" />
    </template>
  </component>
  <generic-widget-component v-else-if="componentType && componentType.startsWith('widget:')" :context="childWidgetContext()" @command="onCommand" />
  <component v-else-if="componentType && componentType.startsWith('oh-')" :is="componentType" :context="context" @command="onCommand" />
  <div v-else-if="componentType && componentType === 'Label'" :class="config.class" :style="config.style">{{config.text}}</div>
  <pre v-else-if="componentType && componentType === 'Error'" class="text-color-red" style="white-space: pre-wrap">{{config.error}}</pre>
</template>

<script>
import mixin from './widget-mixin'

import * as SystemWidgets from './system/index'
import * as StandardWidgets from './standard/index'
import * as LayoutWidgets from './layout/index'

console.log(SystemWidgets)
export default {
  mixins: [mixin],
  components: {
    ...SystemWidgets,
    ...StandardWidgets,
    ...LayoutWidgets
  }
}
</script>
