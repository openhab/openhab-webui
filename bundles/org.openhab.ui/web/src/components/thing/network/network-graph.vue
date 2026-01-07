<template>
  <div class="network-fit">
    <chart
      v-if="chartOptions"
      :option="chartOptions"
      :theme="isDarkMode ? 'dark' : undefined"
      autoresize />
    <div v-if="graph" class="network-legend" :class="{ dark: isDarkMode }">
      <div class="legend-title">
        {{ graph.title }}
      </div>

      <!-- Node Roles -->
      <div v-if="graph.legend.nodeRoles.length" class="legend-section">
        <div class="legend-subtitle">Node Roles</div>
        <div v-for="role in graph.legend.nodeRoles" :key="role.id" class="legend-item">
          <span class="legend-node" :style="{ 'border-color': role.color }" />
          <span>{{ role.label }}</span>
        </div>
      </div>

      <!-- Link Quality -->
      <div v-if="graph.legend.linkQualities.length" class="legend-section">
        <div class="legend-subtitle">Link Quality</div>
        <div v-for="quality in graph.legend.linkQualities" :key="quality.value" class="legend-item">
          <span
            class="legend-line"
            :style="{ background: quality.color, height: quality.width + 'px' }" />
          <span>{{ quality.label }} ({{ quality.value }})</span>
        </div>
      </div>

      <!-- Link Types -->
      <div v-if="graph.legend.linkTypes.length" class="legend-section">
        <div class="legend-subtitle">Connections</div>
        <div v-for="linkType in graph.legend.linkTypes" :key="linkType.id" class="legend-item">
          <span class="legend-arrow">{{ getLinkSymbol(linkType) }}</span>
          <span>{{ linkType.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
.network-fit
  position absolute
  left 0
  top var(--f7-navbar-height)
  height calc(100% - var(--f7-navbar-height))
  width 100%
  display flex
  align-items center
  justify-content center

  .echarts
    width calc(100% - 20px)
    height 100%

  .network-legend
    position absolute
    top 10px
    right 10px
    background rgba(255, 255, 255, 0.95)
    border-radius 8px
    padding 12px 16px
    font-size 12px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.15)
    z-index 10
    max-width 180px

    &.dark
      background rgba(30, 30, 30, 0.95)
      color #e0e0e0

      .legend-subtitle
        color #aaa

    .legend-title
      font-weight bold
      font-size 13px
      margin-bottom 10px
      padding-bottom 6px
      border-bottom 1px solid rgba(128, 128, 128, 0.3)

    .legend-section
      margin-bottom 10px

      &:last-child
        margin-bottom 0

    .legend-subtitle
      font-weight 600
      font-size 11px
      color #666
      margin-bottom 6px
      text-transform uppercase
      letter-spacing 0.5px

    .legend-item
      display flex
      align-items center
      gap 8px
      margin-bottom 4px

      &:last-child
        margin-bottom 0

    .legend-node
      width 16px
      height 16px
      border-radius 50%
      background #4CAF50
      border 3px solid
      flex-shrink 0

    .legend-line
      width 24px
      height 4px
      border-radius 2px
      flex-shrink 0

    .legend-arrow
      width 24px
      text-align center
      font-weight bold
      font-size 14px
      flex-shrink 0
</style>

<script>
import { mapStores } from 'pinia'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart } from 'echarts/charts'
import { TooltipComponent, ToolboxComponent } from 'echarts/components'
import 'echarts/theme/dark.js'
import VChart from 'vue-echarts'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

use([CanvasRenderer, GraphChart, TooltipComponent, ToolboxComponent])

export default {
  name: 'NetworkGraph',
  components: {
    chart: VChart
  },
  props: {
    /**
     * The NetworkGraph object from a provider
     */
    graph: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapStores(useUIOptionsStore),
    isDarkMode () {
      return this.uiOptionsStore.getDarkMode() === 'dark'
    },
    chartOptions () {
      if (!this.graph) return null

      return {
        tooltip: {
          formatter: this.formatTooltip,
          confine: true
        },
        backgroundColor: this.isDarkMode ? '#121212' : undefined,
        series: [this.buildSeries()]
      }
    }
  },
  methods: {
    getLinkSymbol (linkType) {
      switch (linkType.symbol) {
        case 'double_arrow': return '↔'
        case 'arrow': return '→'
        case 'none': return '—'
        default: return '—'
      }
    },
    buildSeries () {
      const nodes = this.graph.nodes.map((node) => this.buildNodeData(node))
      const links = this.graph.links.map((link) => this.buildLinkData(link))

      const opts = this.graph.displayOptions || {}

      return {
        type: 'graph',
        layout: 'force',
        force: {
          initLayout: 'force',
          gravity: opts.gravity ?? 0.5,
          repulsion: opts.repulsion ?? 2000,
          edgeLength: opts.edgeLength ?? 150,
          layoutAnimation: opts.layoutAnimation ?? true
        },
        data: nodes,
        links: links,
        label: {
          show: true,
          position: opts.labelPosition ?? 'bottom',
          fontSize: opts.fontSize ?? 14,
          formatter: (params) => {
            const content = opts.labelContent ?? 'label'
            return content === 'id' ? params.data.nodeId : params.data.label
          }
        },
        roam: true,
        lineStyle: {
          width: opts.lineWidth ?? 2,
          curveness: opts.lineCurveness ?? 0.2,
          opacity: opts.lineOpacity ?? 0.8
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 6
          }
        },
        symbolSize: opts.symbolSize ?? 35,
        itemStyle: {
          borderWidth: 3
        }
      }
    },
    buildNodeData (node) {
      const roleInfo = this.getRoleInfo(node.role)
      const secondaryRoleInfo = node.secondaryRole ? this.getRoleInfo(node.secondaryRole) : null

      return {
        name: node.id,
        label: node.label,
        value: node.label,
        nodeId: node.id,
        role: node.role,
        roleLabel: this.formatRoleLabel(node),
        properties: node.properties,
        symbolSize: roleInfo.size,
        itemStyle: {
          color: node.statusColor || '#4CAF50',
          borderColor: roleInfo.color,
          borderWidth: node.role === 'leader' ? 5 : 3
        },
        // Store secondary role info for tooltip
        secondaryRole: secondaryRoleInfo
      }
    },
    getRoleInfo (roleId) {
      const role = this.graph.legend.nodeRoles.find((r) => r.id === roleId)
      return role || { color: '#9E9E9E', size: 30, label: 'Unknown' }
    },
    formatRoleLabel (node) {
      const roleInfo = this.getRoleInfo(node.role)
      if (node.secondaryRole) {
        const secondaryInfo = this.getRoleInfo(node.secondaryRole)
        return `${roleInfo.label} (${secondaryInfo.label})`
      }
      return roleInfo.label
    },
    buildLinkData (link) {
      const sourceNode = this.graph.nodes.find((n) => n.id === link.source)
      const targetNode = this.graph.nodes.find((n) => n.id === link.target)

      const linkTypeInfo = this.graph.legend.linkTypes.find((t) => t.id === link.type)
      const qualityInfo = link.quality !== undefined
        ? this.graph.legend.linkQualities.find((q) => q.value === link.quality)
        : null

      let symbol, symbolSize
      switch (linkTypeInfo?.symbol) {
        case 'double_arrow':
          symbol = ['arrow', 'arrow']
          symbolSize = [8, 8]
          break
        case 'arrow':
          symbol = ['circle', 'arrow']
          symbolSize = [6, 12]
          break
        default:
          symbol = null
          symbolSize = null
      }

      return {
        source: link.source,
        target: link.target,
        sourceLabel: sourceNode?.label || link.source,
        targetLabel: targetNode?.label || link.target,
        linkType: link.type,
        linkTypeLabel: linkTypeInfo?.label || link.type,
        quality: link.quality,
        properties: link.properties,
        symbol,
        symbolSize,
        lineStyle: {
          color: qualityInfo?.color || '#9E9E9E',
          width: qualityInfo?.width || 2,
          type: linkTypeInfo?.lineStyle || 'solid'
        }
      }
    },
    formatTooltip (params) {
      if (params.dataType === 'node') {
        return this.formatNodeTooltip(params.data)
      } else if (params.dataType === 'edge') {
        return this.formatEdgeTooltip(params.data)
      }
      return ''
    },
    formatNodeTooltip (data) {
      let tooltip = `<strong>${data.label}</strong>`

      if (data.nodeId) {
        tooltip += `<br/><span style="color: #888">ID: ${data.nodeId}</span>`
      }

      if (data.roleLabel) {
        tooltip += `<br/>Role: ${data.roleLabel}`
      }

      if (data.properties) {
        if (data.properties.network) {
          tooltip += `<br/>Network: ${data.properties.network}`
        }
        if (data.properties.rloc16) {
          tooltip += `<br/>RLOC16: ${data.properties.rloc16}`
        }
      }

      return tooltip
    },
    formatEdgeTooltip (data) {
      let tooltip = `<strong>${data.sourceLabel}</strong> ↔ <strong>${data.targetLabel}</strong>`

      if (data.linkTypeLabel) {
        tooltip += `<br/>${data.linkTypeLabel}`
      }

      if (data.quality !== undefined) {
        const qualityInfo = this.graph.legend.linkQualities.find((q) => q.value === data.quality)
        tooltip += `<br/>Quality: ${data.quality} (${qualityInfo?.label || 'Unknown'})`
      }

      if (data.properties?.rssi !== undefined && data.properties.rssi !== null) {
        tooltip += `<br/>RSSI: ${data.properties.rssi} dBm`
      }

      return tooltip
    }
  }
}
</script>
