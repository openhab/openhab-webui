<template>
  <chart
    ref="chart"
    v-if="ready"
    :options="options"
    class="oh-chart-page-chart"
    :class="{ 'with-tabbar': context.tab,
      'oh-plan-white-background': config.backgroundColor === 'white',
      'oh-plan-blackwhite-background': config.backgroundColor === 'blackwhite',
      'oh-plan-dark-mode-invert': config.darkModeInvert,
    }"
    :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined" autoresize></chart>
</template>

<style lang="stylus">
.oh-chart-page-chart
  position absolute
  background-color white
  top calc(var(--f7-navbar-height))
  width 100%
  height calc(100% - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100% - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important
  &.oh-plan-white-background, &.oh-plan-blackwhite-background
    background-color white
  .echarts
    width calc(100% - 20px)
    height 100%
</style>

<script>
import mixin from '../widget-mixin'

import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/title'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markPoint'
import 'echarts/lib/component/visualMap'

import ECharts from 'vue-echarts/components/ECharts'

export default {
  mixins: [mixin],
  components: {
    'chart': ECharts
  },
  widget: {
    name: 'oh-chart-page',
    label: 'Chart',
    description: 'Visualizes historical series',
    props: {
      parameterGroups: [
        {
          name: 'background',
          label: 'Background'
        }
      ],
      parameters: [
        {
          // name: 'options',
          // label: 'ECharts Options',
          // type: 'TEXT',
          // context: 'script',
          // description: 'The ECharts options'
        }
      ]
    }
  },
  data () {
    return {
      ready: false
    }
  },
  computed: {
    options () {
      // temporary
      return this.config.options
    }
  },
  mounted () {
    this.ready = true
  },
  methods: {

  }
}
</script>
