<template>
  <component v-if="componentType && componentType.startsWith('f7-') && visible"
             :is="componentType"
             v-bind="config"
             @command="onCommand">
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <template v-for="(slotComponents, slotName) in context.component.slots" :key="slotName" #[slotName]>
      <ul v-if="componentType === 'f7-list'">
        <generic-widget-component v-for="(slotComponent, idx) in slotComponents"
                                  :context="childContext(slotComponent)"
                                  :key="slotName + '-' + idx"
                                  @command="onCommand" />
      </ul>
      <template v-else>
        <generic-widget-component v-for="(slotComponent, idx) in slotComponents"
                                  :context="childContext(slotComponent)"
                                  :key="slotName + '-' + idx"
                                  @command="onCommand" />
      </template>
    </template>
  </component>
  <oh-card v-else-if="componentType && componentType === 'oh-card' && visible" :context="context">
    <template v-for="(slotComponents, slotName) in context.component.slots" :key="slotName" #[slotName]>
      <generic-widget-component v-for="(slotComponent, idx) in slotComponents"
                                :context="childContext(slotComponent)"
                                :key="slotName + '-' + idx "
                                @command="onCommand" />
    </template>
  </oh-card>
  <generic-widget-component v-else-if="componentType && componentType.startsWith('widget:') && visible"
                            :context="childWidgetContext()"
                            @command="onCommand" />
  <component v-else-if="componentType && componentType.startsWith('oh-') && visible"
             :is="componentType"
             :context="context"
             @command="onCommand" />
  <!-- Label renders text inside <div> element -->
  <div v-else-if="componentType && componentType === 'Label' && visible" :class="config.class" :style="config.style">
    {{ config.text }}
  </div>
  <!-- Content renders text without any additional container -->
  <template v-else-if="componentType && componentType === 'Content'">
    {{ config.text }}
  </template>
  <pre v-else-if="componentType && componentType === 'Error' && visible" class="text-color-red" style="white-space: pre-wrap">{{ config.error }}</pre>
  <component v-else-if="visible" :is="componentType" v-bind="config">
    {{ config.content }}
    <template v-if="context.component.slots && context.component.slots.default">
      <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                                :context="childContext(slotComponent)"
                                :key="'default-' + idx" />
    </template>
  </component>
</template>

<script>
import { defineAsyncComponent } from 'vue'

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
    ...LayoutWidgets,
    // TODO-V3.1: OhContext won't render in production build unless we async import here -> circular import ???
    OhContext: defineAsyncComponent(() => import('./system/oh-context.vue'))
  }
}
</script>
