<template>
  <template v-if="visible">
    <!-- Render oh-swiper instead of f7-swiper as f7-swiper changes from F7 v5 -> v7 would require changing widgets,
    oh-swiper does the necessary adjustments so existing widgets continue to work fine -->
    <oh-swiper v-if="componentType === 'f7-swiper'" :context="context" ref="component" />

    <component v-else-if="componentType && componentType.startsWith('f7-')"
               ref="component"
               :is="componentType"
               v-bind="config">
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template v-for="(slotComponents, slotName) in context.component.slots" :key="slotName" #[slotName]>
        <ul v-if="componentType === 'f7-list'">
          <generic-widget-component v-for="(slotComponent, idx) in slotComponents"
                                    :context="childContext(slotComponent)"
                                    :key="slotName + '-' + idx" />
        </ul>
        <template v-else>
          <generic-widget-component v-for="(slotComponent, idx) in slotComponents"
                                    :context="childContext(slotComponent)"
                                    :key="slotName + '-' + idx" />
        </template>
      </template>
    </component>
    <oh-card v-else-if="componentType && componentType === 'oh-card'" :context="context" ref="component">
      <template v-for="(slotComponents, slotName) in context.component.slots" :key="slotName" #[slotName]>
        <generic-widget-component v-for="(slotComponent, idx) in slotComponents"
                                  :context="childContext(slotComponent)"
                                  :key="slotName + '-' + idx " />
      </template>
    </oh-card>
    <generic-widget-component v-else-if="componentType && componentType.startsWith('widget:')"
                              ref="component"
                              :context="childWidgetContext()" />
    <component v-else-if="componentType && componentType.startsWith('oh-')"
               ref="component"
               :is="componentType"
               :context="context" />
    <!-- Label renders text inside <div> element -->
    <div
      v-else-if="componentType && componentType === 'Label'"
      :class="config.class"
      :style="config.style"
      ref="component">
      {{ config.text }}
    </div>
    <!-- Content renders text without any additional container -->
    <template
      v-else-if="componentType && componentType === 'Content'">
      {{ config.text }}
    </template>
    <pre v-else-if="componentType && componentType === 'Error'" class="text-color-red" style="white-space: pre-wrap">{{ config.error }}</pre>
    <component v-else
               :is="componentType"
               v-bind="config"
               ref="component">
      {{ config.content }}
      <template v-if="context.component.slots && context.component.slots.default">
        <generic-widget-component v-for="(slotComponent, idx) in context.component.slots.default"
                                  :context="childContext(slotComponent)"
                                  :key="'default-' + idx" />
      </template>
    </component>
  </template>
</template>

<script setup>
import * as SystemWidgets from './system/index'
import * as StandardWidgets from './standard/index'
import * as StandardListWidgets from './standard/list'
import * as StandardCellWidgets from './standard/cell'
import * as LayoutWidgets from './layout/index'
import OhContext from './system/oh-context.vue'
</script>

<script>
import mixin from './widget-mixin'

export default {
  inheritAttrs: false,
  mixins: [mixin],
  components: {
    ...SystemWidgets,
    ...StandardWidgets,
    ...StandardListWidgets,
    ...StandardCellWidgets,
    ...LayoutWidgets,
    OhContext
  }
}
</script>
