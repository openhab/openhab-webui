<template>
  <div>
    <chart
      ref="chart"
      v-if="ready"
      :options="options"
      class="oh-chart-page-chart"
      :class="{ 'with-tabbar': context.tab }"
      :theme="$f7.data.themeOptions.dark === 'dark' ? 'dark' : undefined" autoresize></chart>
    <f7-menu class="padding float-right">
      <f7-menu-item @click="earlierPeriod()" icon-f7="chevron_left" />
      <f7-menu-item v-if="!context.component.config.chartType" dropdown :text="period">
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item v-for="p in ['h', '2h', '4h', '12h', 'D', '2D', '3D', 'W', '2W', 'M', '2M', '4M', '6M', 'Y']"
            :key="p" @click="setPeriod(p)" href="#" :text="p"></f7-menu-dropdown-item>
        </f7-menu-dropdown>
      </f7-menu-item>
      <f7-menu-item @click="laterPeriod()" icon-f7="chevron_right" />
    </f7-menu>
  </div>
</template>

<style lang="stylus">
.oh-chart-page-chart
  position absolute
  background-color white
  overflow-x hidden
  top calc(var(--f7-navbar-height))
  width 100%
  height calc(100% - var(--f7-navbar-height)) !important
  &.with-tabbar
    height calc(100% - var(--f7-navbar-height) - var(--f7-tabbar-labels-height)) !important
  .echarts
    width calc(100% - 20px)
    height 100%
</style>

<script>
import mixin from '../widget-mixin'
import chart from './chart-mixin'

// import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markPoint'
import 'echarts/lib/component/markArea'
import 'echarts/lib/component/visualMap'
import 'echarts/lib/component/calendar'

import ECharts from 'vue-echarts/components/ECharts'

export default {
  mixins: [mixin, chart],
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
  mounted () {
    this.ready = true
  },
  methods: {

  }
}
</script>
