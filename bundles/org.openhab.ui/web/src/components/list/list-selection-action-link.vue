<template>
  <f7-link v-if="theme.md" v-bind="$attrs" :class="{ disabled }" icon-color="white" />
  <f7-link v-else v-bind="$attrs" :class="{ disabled }" :text="textWithCount" />
</template>

<style lang="stylus" scoped>
.disabled
  color: gray
</style>

<script setup lang="ts">
import { theme } from 'framework7-vue'
import { computed } from 'vue'

const props = defineProps<{
  text: string
  count?: number
}>()

const disabled = computed(() => props.count === 0)
const textWithCount = computed(() => (props.count === undefined ? props.text : `${props.text} [${props.count}]`))
</script>
