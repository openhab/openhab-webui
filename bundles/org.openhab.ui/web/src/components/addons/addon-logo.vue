<template>
  <div>
    <f7-icon
      v-show="!logoLoaded || svgLogoError || pngLogoError"
      :size="size"
      color="gray"
      :f7="addonIcon"
      class="default-icon"
      style="padding-left: 0; opacity: 0.2; position: absolute" />
    <img
      v-if="!svgLogoError"
      :class="lazy ? 'lazy logo' : 'logo'"
      :style="imgStyle"
      :src="imageUrl('svg')"
      :data-src="imageUrl('svg')"
      @load.once="!lazy && (logoLoaded = true)"
      @error.once="svgLogoError = true"
      @lazy:load.once="lazy && (logoLoaded = true)"
      @lazy:error.once="svgLogoError = true" />
    <img
      v-else-if="!pngLogoError"
      class="logo"
      :style="imgStyle"
      :src="imageUrl('png')"
      @load="logoLoaded = true"
      @error="pngLogoError = true" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type StyleValue } from 'vue'
import * as api from '@/api'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore.ts'
import { AddonIcons, type AddonType } from '@/assets/addon-store'

const runtimeStore = useRuntimeStore()

// props
const props = defineProps<{ addon: api.Addon, size?: string | number, lazy?: boolean }>()

// data
const addonIcon = AddonIcons[props.addon.type as AddonType]
const logoLoaded = ref<boolean>(false)
const svgLogoError = ref<boolean>(false)
const pngLogoError = ref<boolean>(false)

// computed
const imgStyle = computed<StyleValue>(() => ({ visibility: logoLoaded.value ? 'visible' : 'hidden' }))

// methods
type LogoType = 'svg' | 'png'

const imageUrl = (type: LogoType) => {
  if (props.addon.imageLink) return props.addon.imageLink.replace(/^\/\//, 'https://')
  return `${runtimeStore.docSrcUrl}/images/addons/${props.addon.id}.${type}`
}
</script>
