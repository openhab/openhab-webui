<template>
  <div v-bind="config">{{ config.text }}</div>
</template>

<script>
import mixin from './widget-mixin'

export default {
    mixins: [mixin]
}
</script>
