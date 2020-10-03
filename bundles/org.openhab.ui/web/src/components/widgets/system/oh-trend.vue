<template>
  <trend :key="'trend' + config.item" v-if="showTrend" :style="config.style" :width="trendWidth" class="trend" :data="trendData" :gradient="trendGradient" :stroke-width="trendStrokeWidth" auto-draw smooth />
</template>

<script>
import mixin from '../widget-mixin'
import { OhTrendDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  props: ['width'],
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
      const sampling = this.config.trendSampling || 60
      return this.$oh.api.get('/rest/persistence/items/' + this.config.trendItem).then((resp) => {
        if (resp.data && resp.data.length) {
          let data = []
          for (let i = 0; i < resp.data.length; i += sampling) {
            data.push(parseFloat(resp.data[i].state))
          }
          this.trendData = data
          this.showTrend = true
        }
      })
    }
  }
}
</script>
