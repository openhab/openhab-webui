<template>
  <q-btn flat icon="timeline" label="Analyze" @click="showAnalyzer = true" :class="{'highlight-and-fade': this.model.highlight}">
    <q-modal v-model="showAnalyzer" :content-css="{minWidth: '80vw', minHeight: '80vh'}" @show="opened()" maximized>
      <analyze ref="analyzer" v-if="showAnalyzer" :model="model"></analyze>
    </q-modal>
  </q-btn>
</template>

<script>
import Analyze from 'layouts/analyze/Analyze.vue'

export default {
  props: ['model'],
  components: {
    Analyze
  },
  data () {
    return {
      showAnalyzer: false
    }
  },
  methods: {
    opened () {
      this.$refs.analyzer.initChart()
    }
  }
}
</script>
