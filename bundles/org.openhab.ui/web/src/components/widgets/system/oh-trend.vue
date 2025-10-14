<template>
  <trend v-if="showTrend"
         :key="'trend' + config.item"
         :style="config.style"
         :width="trendWidth"
         class="trend"
         :data="trendData"
         :gradient="trendGradient"
         :gradientDirection="trendGradientDirection"
         :stroke-width="trendStrokeWidth"
         auto-draw
         smooth />
</template>

<script>
import mixin from '../widget-mixin'
import { OhTrendDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  props: {
    width: [Number, String]
  },
  widget: OhTrendDefinition,
  data () {
    return {
      trendData: [],
      showTrend: false
    }
  },
  computed: {
    trendItem () {
      return this.config.trendItem
    },
    trendWidth () {
      return this.width || this.config.trendWidth
    },
    trendGradient () {
      return this.config.trendGradient || ['#2196f3', '#5ac8fa']
    },
    trendGradientDirection () {
      return this.config.trendGradientDirection || 'top'
    },
    trendStrokeWidth () {
      return this.config.trendStrokeWidth || 3
    }
  },
  mounted () {
    this.buildTrend()
  },
  watch: {
    trendItem (item) {
      this.buildTrend()
    }
  },
  methods: {
    buildTrend () {
      this.trendData = []
      this.showTrend = false
      if (!this.trendItem) return []
      const sampling = typeof this.config.trendSampling === 'number' ? this.config.trendSampling : 60
      return this.$oh.api.get('/rest/persistence/items/' + this.config.trendItem).then((resp) => {
        if (resp.data && resp.data.length) {
          let data = []
          for (let i = resp.data.length - 1; i >= 0; i -= sampling) {
            data.push(parseFloat(resp.data[i].state))
          }
          this.trendData = data.reverse()
          this.showTrend = true
        }
      })
    }
  }
}
</script>
