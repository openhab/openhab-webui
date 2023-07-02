<template>
  <f7-block class="no-margin no-padding">
    <f7-block-title class="padding-horizontal">
      Widgets Expression Tester
    </f7-block-title>
    <f7-list media-list>
      <f7-list-input type="textarea" title="Expression" placeholder="Try '=2+3' or '=items.MyItem.state'" :value="testExpression" @input="(evt) => testExpression = evt.target.value" />
    </f7-list>
    <f7-block strong v-if="testExpression">
      <div :class="config.class" :style="config.style">
        {{ (config.text === undefined) ? 'undefined' : config.text }}
      </div>
    </f7-block>
  </f7-block>
</template>

<script>
import Mixin from '@/components/widgets/widget-mixin'

export default {
  mixins: [Mixin],
  data () {
    return {
      testExpression: ''
    }
  },
  computed: {
    context () {
      return {
        component: {
          config: {
            style: {
              fontFamily: 'monospace'
            },
            noBorder: true,
            noShadow: true,
            text: this.testExpression.toString()
          }
        },
        editmode: true,
        vars: {},
        store: this.$store.getters.trackedItems
      }
    }
  }
}
</script>
