<template>
  <f7-popup ref="propSheet"
            close-on-escape
            class="widgetprops-popup"
            @popup:closed="propsSheetClosed">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left"
                   icon-md="material:arrow_back"
                   icon-aurora="f7:arrow_left"
                   class="popup-close" />
        </f7-nav-left>
        <f7-nav-title>Set Component Props</f7-nav-title>
        <f7-nav-right>
          <f7-link class="popup-close" @click="updateProps">
            Done
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block v-if="props">
        <f7-col>
          <config-sheet
            :parameterGroups="props.parameterGroups || []"
            :parameters="props.parameters || []"
            :configuration="config" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script>
export default {
  components: {
    'config-sheet': () => import(/* webpackChunkName: "config-sheet" */ '@/components/config/config-sheet.vue')
  },
  props: {
    props: Object,
    config: Object
  },
  methods: {
    propsSheetClosed () {
      this.$f7.emit('propsEditorClosed')
    },
    updateProps () {
      this.$f7.emit('propsEditorUpdate', this.config)
    }
  }
}
</script>
