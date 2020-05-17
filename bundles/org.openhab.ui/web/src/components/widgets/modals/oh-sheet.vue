<template>
  <f7-sheet>
    <f7-toolbar>
      <div class="left padding-left">{{(page) ? page.config.label : ''}}</div>
      <div class="right"><f7-link sheet-close>Close</f7-link></div>
    </f7-toolbar>

    <component v-if="visibleToCurrentUser" :is="componentType" :context="context" :class="{notready: !ready}" />
    <empty-state-placeholder v-if="page && !visibleToCurrentUser" icon="multiply_circle_fill" title="page.unavailable.title" text="page.unavailable.text" />

  </f7-sheet>
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
