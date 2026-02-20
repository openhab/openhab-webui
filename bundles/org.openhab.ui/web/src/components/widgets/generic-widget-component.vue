<template>
  <template v-if="visible">
    <!-- Render oh-swiper instead of f7-swiper as f7-swiper changes from F7 v5 -> v7 would require changing widgets,
    oh-swiper does the necessary adjustments so existing widgets continue to work fine -->
    <oh-swiper v-if="componentType === 'f7-swiper'" v-bind="$attrs" :context="context" :class="scopedCssUid" ref="component" />

    <component
      :is="componentType"
      v-else-if="componentType && componentType.startsWith('f7-')"
      ref="component"
      v-bind="{ ...$attrs, ...config }"
      :class="scopedCssUid">
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template v-for="(slotComponents, slotName) in context.component.slots" :key="slotName" #[slotName]>
        <ul v-if="componentType === 'f7-list'" v-bind="$attrs">
          <generic-widget-component
            v-for="(slotComponent, idx) in slotComponents"
            :context="childContext(slotComponent)"
            :key="slotName + '-' + idx" />
        </ul>
        <template v-else>
          <generic-widget-component
            v-for="(slotComponent, idx) in slotComponents"
            :context="childContext(slotComponent)"
            :key="slotName + '-' + idx" />
        </template>
      </template>
    </component>
    <oh-card
      v-else-if="componentType && componentType === 'oh-card'"
      ref="component"
      v-bind="$attrs"
      :context="context"
      :class="scopedCssUid">
      <template v-for="(slotComponents, slotName) in context.component.slots" :key="slotName" #[slotName]>
        <generic-widget-component
          v-for="(slotComponent, idx) in slotComponents"
          :context="childContext(slotComponent)"
          :key="slotName + '-' + idx " />
      </template>
    </oh-card>
    <generic-widget-component
      v-else-if="componentType && componentType.startsWith('widget:')"
      ref="component"
      v-bind="isChild ? null : $attrs"
      :is-child="true"
      :context="childWidgetContext()"
      :class="scopedCssUid" />
    <component
      v-bind="$attrs"
      :is="componentType"
      v-else-if="componentType && componentType.startsWith('oh-')"
      ref="component"
      :context="context"
      :class="scopedCssUid" />
    <!-- Label renders text inside <div> element -->
    <Label
      v-else-if="componentType && componentType === 'Label'"
      ref="component"
      v-bind="$attrs"
      :context="context"
      :class="scopedCssUid" />
    <!-- Content renders text without any additional container -->
    <template v-else-if="componentType && componentType === 'Content'">
      {{ config.text }}
    </template>
    <pre
      v-else-if="componentType && componentType === 'Error'"
      class="text-color-red"
      style="white-space: pre-wrap"
      >{{ config.error }}</pre
    >
    <component :is="componentType" v-else ref="component" v-bind="{ ...$attrs, ...config }" :class="scopedCssUid">
      {{ config.content }}
      <template v-if="context.component.slots && context.component.slots.default">
        <generic-widget-component
          v-for="(slotComponent, idx) in context.component.slots.default"
          :context="childContext(slotComponent)"
          :key="'default-' + idx" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import type { WidgetContext } from '@/components/widgets/types'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(defineProps<{
  context: WidgetContext,
  isChild?: boolean
}>(), { isChild: false })

const { config, childContext, childWidgetContext, scopedCssUid, visible, componentType } = useWidgetContext(props.context)
</script>
