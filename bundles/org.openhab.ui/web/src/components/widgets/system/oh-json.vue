<template>

      <editor class="widget-component-editor"
              mode="json"
              :value="jsonFormatted"
              :readOnly="true"
              @input="onEditorInput" />



</template>

<script>
import { f7 } from 'framework7-vue'

import { defineAsyncComponent, nextTick } from 'vue'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhJsonDefinition } from '@/assets/definitions/widgets/system'
import DirtyMixin from '@/pages/settings/dirty-mixin'

export default {
  props: {
    context: Object
  },
  widget: OhJsonDefinition,
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  mixins: [DirtyMixin],
    components: {
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')),
  },
  data () {
    return {
      ignoreInput: false,
      delayCommand: false,
      pendingCommand: null,
      lastCommand: null,
      init: false
    }
  },
  mounted () {
    if (this.json) {
      this.initJson();
    }
  },
  beforeUnmount () {
  },
  computed: {
    json () {
      const state = this.context.store[this.config.item].state  
      return state;
    },
    jsonFormatted () {
      const state = this.context.store[this.config.item].state  
      try {
        return JSON.stringify(JSON.parse(state), null, 2);
      } catch (e) {
        return state;
      }
    }

  },
  watch: {
  },
  methods: {
    initJson () {
    },
    onEditorInput (value) {
      this.widgetDefinition = value
      if (!this.loading) {
        this.dirty = true
      }
    },

  }
}
</script>
