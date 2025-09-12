<template>
  <f7-popover :target="el" :style="modalStyle">
    <component :is="componentType" :context="context" :class="{ notready: !ready }" />
  </f7-popover>
</template>

<style lang="stylus">
.notready
  visibility hidden
</style>

<script>
import modal from './modal-mixin'

export default {
  mixins: [modal]
}
</script>
