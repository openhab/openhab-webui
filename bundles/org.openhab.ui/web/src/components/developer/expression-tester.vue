<template>
  <f7-block class="no-margin no-padding">
    <f7-block-title class="padding-horizontal">
      Widgets Expression Tester
    </f7-block-title>
    <f7-list media-list>
      <f7-list-input type="textarea"
                     title="Expression"
                     placeholder="Try '=2+3' or '=items.MyItem.state'"
                     v-model:value="testExpression" />
    </f7-list>
    <f7-block strong v-if="result">
      <div :class="config.class" :style="config.style">
        {{ result }}
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
    result () {
      return this.evaluateExpression('tester', this.testExpression)
    }
  }
}
</script>
