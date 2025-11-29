<template>
  <f7-popup>
    <f7-page :style="modalStyle">
      <f7-navbar
        :title="(context.component.config && context.component.config.label) ? context.component.config.label : ''"
        :back-link="$t('dialogs.back')" />

      <f7-toolbar v-if="page && page.component === 'oh-tabs-page' && visibleToCurrentUser"
                  tabbar
                  labels
                  bottom>
        <f7-link v-for="(tab, idx) in page.slots.default"
                 :key="idx"
                 :tab-link="'#tab-' + idx"
                 @click="onTabChange(idx)"
                 :tab-link-active="currentTab === idx"
                 :icon-ios="tab.config.icon"
                 :icon-md="tab.config.icon"
                 :icon-aurora="tab.config.icon"
                 :text="tab.config.title" />
      </f7-toolbar>

      <f7-tabs v-if="page && page.component === 'oh-tabs-page' && visibleToCurrentUser" :class="{ notready: !ready }">
        <f7-tab v-for="(tab, idx) in page.slots.default"
                id="'tab-' + idx"
                :key="idx"
                :tab-active="currentTab === idx">
          <component v-if="currentTab === idx" :is="tabComponent(tab)" :context="tabContext(tab)" />
        </f7-tab>
      </f7-tabs>
      <component v-else-if="visibleToCurrentUser"
                 :is="componentType"
                 :context="context"
                 :class="{ notready: !ready }" />
      <empty-state-placeholder v-if="page && !visibleToCurrentUser"
                               icon="multiply_circle_fill"
                               title="page.unavailable.title"
                               text="page.unavailable.text" />
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.notready
  visibility hidden
</style>

<script>
import modal from './modal-mixin'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { useViewArea } from '@/composables/useViewArea.ts'

export default {
  mixins: [modal],
  props: {
    uid: String,
    el: Object,
    modalConfig: Object
  },
  components: {
    EmptyStatePlaceholder
  },
  setup () {
    useViewArea()
  }
}
</script>
