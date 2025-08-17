<template>
  <f7-sheet :style="modalStyle">
    <f7-toolbar>
      <div class="left padding-left">
        {{ (context.component.config && context.component.config.label) ? context.component.config.label : '' }}
      </div>
      <div class="right">
        <f7-link sheet-close>
          Close
        </f7-link>
      </div>
    </f7-toolbar>

    <component v-if="visibleToCurrentUser"
               :is="componentType"
               :context="context"
               :class="{notready: !ready}" />
    <empty-state-placeholder v-if="page && !visibleToCurrentUser"
                             icon="multiply_circle_fill"
                             title="page.unavailable.title"
                             text="page.unavailable.text" />
  </f7-sheet>
</template>

<style lang="stylus">
.notready
  visibility hidden
</style>

<script>
import modal from './modal-mixin'

export default {
  mixins: [modal],
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue')
  }
}
</script>
