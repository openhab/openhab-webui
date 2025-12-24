<template>
  <div class="network-fit">
    <chart :option="finalOptions" :theme="uiOptionsStore.getDarkMode() === 'dark' ? 'dark' : undefined" autoresize />
    <div class="network-legend" :class="{ dark: uiOptionsStore.getDarkMode() === 'dark' }">
      <div class="legend-title">
        Thread Network Legend
      </div>
      <div class="legend-section">
        <div class="legend-subtitle">
          Node Roles
        </div>
        <div class="legend-item">
          <span class="legend-node" style="border-color: #FFD700" />
          <span>Leader</span>
        </div>
        <div class="legend-item">
          <span class="legend-node" style="border-color: #FF9800" />
          <span>Border Router</span>
        </div>
        <div class="legend-item">
          <span class="legend-node" style="border-color: #2196F3" />
          <span>Router</span>
        </div>
        <div class="legend-item">
          <span class="legend-node" style="border-color: #00BCD4" />
          <span>REED</span>
        </div>
        <div class="legend-item">
          <span class="legend-node" style="border-color: #9C27B0" />
          <span>End Device</span>
        </div>
        <div class="legend-item">
          <span class="legend-node" style="border-color: #673AB7" />
          <span>Sleepy End Device</span>
        </div>
      </div>
      <div class="legend-section">
        <div class="legend-subtitle">
          Link Quality (LQI)
        </div>
        <div class="legend-item">
          <span class="legend-line" style="background: #4CAF50" />
          <span>Excellent (3)</span>
        </div>
        <div class="legend-item">
          <span class="legend-line" style="background: #8BC34A" />
          <span>Good (2)</span>
        </div>
        <div class="legend-item">
          <span class="legend-line" style="background: #FFC107" />
          <span>Fair (1)</span>
        </div>
        <div class="legend-item">
          <span class="legend-line" style="background: #F44336" />
          <span>Poor (0)</span>
        </div>
      </div>
      <div class="legend-section">
        <div class="legend-subtitle">
          Connections
        </div>
        <div class="legend-item">
          <span class="legend-arrow">→</span>
          <span>Parent → Child</span>
        </div>
        <div class="legend-item">
          <span class="legend-arrow">↔</span>
          <span>Router Link</span>
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

    .dark .legend-subtitle
      color #aaa

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
import ThingStatus from '@/components/thing/thing-status-mixin'

use([CanvasRenderer, GraphChart, TooltipComponent, ToolboxComponent])

/**
 * Thread routing roles from Matter spec (ThreadNetworkDiagnostics cluster)
 */
const RoutingRole = {
  UNSPECIFIED: 0,
  UNASSIGNED: 1,
  SLEEPY_END_DEVICE: 2,
  END_DEVICE: 3,
  REED: 4,        // Router Eligible End Device
  ROUTER: 5,
  LEADER: 6
}

/**
 * Color constants for node borders based on device role
 */
const RoleColors = {
  BORDER_ROUTER: '#FF9800',  // Orange
  LEADER: '#FFD700',         // Gold
  ROUTER: '#2196F3',         // Blue
  REED: '#00BCD4',           // Cyan/Teal
  END_DEVICE: '#9C27B0',     // Purple
  SLEEPY_END_DEVICE: '#673AB7', // Deep Purple
  UNKNOWN: '#9E9E9E'         // Gray
}

/**
 * Color constants for link quality indicator (LQI)
 */
const LqiColors = {
  EXCELLENT: '#4CAF50',
  GOOD: '#8BC34A',
  FAIR: '#FFC107',
  POOR: '#F44336',
  UNKNOWN: '#9E9E9E'
}

export default {
  mixins: [ThingStatus],
  props: {
    bridgeUID: String
  },
  components: {
    chart: VChart
  },
  computed: {
    finalOptions () {
      return {
        tooltip: {
          formatter: this.formatTooltip,
          confine: true
        },
        backgroundColor: this.uiOptionsStore.getDarkMode() === 'dark' ? '#121212' : undefined,
        series: this.series
      }
    },
    ...mapStores(useUIOptionsStore)
  },
  methods: {
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

      if (data.matterNodeId) {
        tooltip += `<br/><span style="color: #888">Node ID: ${data.matterNodeId}</span>`
      }

      if (data.roleLabel) {
        tooltip += `<br/>Role: ${data.roleLabel}`
      }

      if (data.networkName) {
        tooltip += `<br/>Network: ${data.networkName}`
      }

      if (data.ownRloc16) {
        tooltip += `<br/>RLOC16: 0x${data.ownRloc16.toString(16).toUpperCase().padStart(4, '0')}`
      }

      return tooltip
    },
    formatEdgeTooltip (data) {
      let tooltip = `<strong>${data.sourceLabel}</strong> ↔ <strong>${data.targetLabel}</strong>`

      if (data.relationship) {
        tooltip += `<br/>${data.relationship}`
      }

      if (data.lqi !== undefined) {
        const lqiLabels = ['Poor', 'Fair', 'Good', 'Excellent']
        tooltip += `<br/>LQI: ${data.lqi}/3 (${lqiLabels[data.lqi] || 'Unknown'})`
      }

      if (data.rssi !== undefined && data.rssi !== null) {
        tooltip += `<br/>RSSI: ${data.rssi} dBm`
      }

      return tooltip
    },
    parseJsonProperty (value) {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return JSON.parse(value)
      } catch (e) {
        return []
      }
    },
    getRoleLabel (routingRole, isBorderRouter, isRouter) {
      // Leader is the most important role so check first
      if (routingRole === RoutingRole.LEADER) {
        return isBorderRouter ? 'Leader (Border Router)' : 'Leader'
      }
      if (isBorderRouter) return 'Border Router'
      if (isRouter && routingRole < RoutingRole.ROUTER) return 'Router'
      switch (routingRole) {
        case RoutingRole.ROUTER: return 'Router'
        case RoutingRole.REED: return 'REED'
        case RoutingRole.END_DEVICE: return 'End Device'
        case RoutingRole.SLEEPY_END_DEVICE: return 'Sleepy End Device'
        case RoutingRole.UNASSIGNED: return 'Unassigned'
        default: return 'End Device'
      }
    },

    /**
     * Get node size based on device role
     */
    getNodeSize (routingRole, isBorderRouter, isRouter) {
      if (isBorderRouter) return 50
      if (isRouter) return 45
      switch (routingRole) {
        case RoutingRole.LEADER: return 55
        case RoutingRole.ROUTER: return 45
        case RoutingRole.REED: return 38
        default: return 30
      }
    },

    getBorderColor (routingRole, isBorderRouter, isRouter) {
      if (routingRole === RoutingRole.LEADER) return RoleColors.LEADER
      if (isBorderRouter) return RoleColors.BORDER_ROUTER
      if (isRouter) return RoleColors.ROUTER
      switch (routingRole) {
        case RoutingRole.ROUTER: return RoleColors.ROUTER
        case RoutingRole.REED: return RoleColors.REED
        case RoutingRole.END_DEVICE: return RoleColors.END_DEVICE
        case RoutingRole.SLEEPY_END_DEVICE: return RoleColors.SLEEPY_END_DEVICE
        default: return RoleColors.UNKNOWN
      }
    },

    /**
     * Get link color based on Link Quality Indicator (LQI)
     */
    getLinkColor (lqi) {
      switch (lqi) {
        case 3: return LqiColors.EXCELLENT
        case 2: return LqiColors.GOOD
        case 1: return LqiColors.FAIR
        case 0: return LqiColors.POOR
        default: return LqiColors.UNKNOWN
      }
    },

    /**
     * Get link width based on LQI
     */
    getLinkWidth (lqi) {
      return Math.max(2, (lqi || 0) + 1)
    },

    /**
     * Normalize a Thread extended address to string format
     */
    normalizeExtAddress (extAddr) {
      if (!extAddr) return null
      const str = String(extAddr)
      return str === '0' || str === '' ? null : str
    },

    /**
     * Extract a device's own identity (rloc16 and extAddress) from its route table.
     * Routers have a self-entry with nextHop=63 (63 means "no forwarding needed").
     */
    getOwnIdentity (routes) {
      if (!routes || routes.length === 0) return null

      for (const route of routes) {
        if (route.allocated && route.nextHop === 63) {
          return {
            rloc16: route.rloc16,
            extAddress: this.normalizeExtAddress(route.extAddress)
          }
        }
      }

      return null
    },

    /**
     * Parse routing role from property value
     * Handles both numeric values (0-6) and string names (e.g., "LEADER", "ROUTER")
     */
    parseRoutingRole (value) {
      if (value === undefined || value === null || value === '') {
        return RoutingRole.UNSPECIFIED
      }

      const parsed = parseInt(String(value), 10)
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
        return parsed
      }

      const strValue = String(value).toUpperCase().trim()
      switch (strValue) {
        case 'LEADER': return RoutingRole.LEADER
        case 'ROUTER': return RoutingRole.ROUTER
        case 'REED': return RoutingRole.REED
        case 'END_DEVICE': return RoutingRole.END_DEVICE
        case 'SLEEPY_END_DEVICE': return RoutingRole.SLEEPY_END_DEVICE
        case 'UNASSIGNED': return RoutingRole.UNASSIGNED
        case 'UNSPECIFIED': return RoutingRole.UNSPECIFIED
        default: return RoutingRole.UNSPECIFIED
      }
    },

    createNodeData (thing) {
      const props = thing.properties
      const routingRole = this.parseRoutingRole(props['ThreadNetworkDiagnostics-routingRole'])
      const isBorderRouter = props['ThreadBorderRouterManagement-interfaceEnabled'] !== undefined

      const uidParts = thing.UID.split(':')
      const matterNodeId = uidParts.length >= 4 ? uidParts[3] : thing.UID

      const neighbors = this.parseJsonProperty(props['ThreadNetworkDiagnostics-neighborTable'])
      const routes = this.parseJsonProperty(props['ThreadNetworkDiagnostics-routeTable'])
      const networkName = props['ThreadNetworkDiagnostics-networkName']

      // Get device's own identity from route table
      const ownIdentity = this.getOwnIdentity(routes)
      const ownRloc16 = ownIdentity?.rloc16 || null
      const ownExtAddress = ownIdentity?.extAddress || null

      // Determine if device is a router as it not super clear from the spec how to do this
      // Has ThreadBorderRouterManagement cluster (border router)
      // Has routingRole >= ROUTER
      // Has a self-entry in route table (only routers have this)
      const isRouter = isBorderRouter ||
        routingRole >= RoutingRole.ROUTER ||
        ownRloc16 !== null

      const roleLabel = this.getRoleLabel(routingRole, isBorderRouter, isRouter)

      return {
        name: matterNodeId,
        label: thing.label || matterNodeId,
        matterNodeId: matterNodeId,
        thingUID: thing.UID,
        routingRole: routingRole,
        isBorderRouter: isBorderRouter,
        isRouter: isRouter,
        ownRloc16: ownRloc16,
        ownExtAddress: ownExtAddress,
        roleLabel: roleLabel,
        networkName: networkName,
        symbolSize: this.getNodeSize(routingRole, isBorderRouter, isRouter),
        itemStyle: {
          color: this.thingStatusBadgeColor(thing.statusInfo),
          borderColor: this.getBorderColor(routingRole, isBorderRouter, isRouter),
          borderWidth: routingRole === RoutingRole.LEADER ? 5 : 3
        },
        neighbors: neighbors,
        routes: routes
      }
    },

    /**
     * Infer rloc16 for end devices from their parent router's neighbor table
     */
    inferEndDeviceRloc16 (nodes, nodesByRloc16) {
      nodes.forEach((nodeData) => {
        if (nodeData.ownRloc16) return // Already has rloc16
        if (!nodeData.neighbors || nodeData.neighbors.length === 0) return

        // End device typically has only one neighbor (its parent)
        const parentNeighbor = nodeData.neighbors[0]
        const parentRloc16 = parentNeighbor.rloc16
        const parentNode = nodesByRloc16.get(parentRloc16)

        if (parentNode && parentNode.neighbors) {
          // Look for this device as a child in the parent's neighbor table
          const childEntry = parentNode.neighbors.find((n) =>
            n.isChild && !nodesByRloc16.has(n.rloc16)
          )
          if (childEntry) {
            nodeData.ownRloc16 = childEntry.rloc16
            nodesByRloc16.set(childEntry.rloc16, nodeData)
          }
        }
      })
    },

    /**
     * Create links between nodes based on neighbor tables
     */
    createLinks (nodes, nodesByRloc16, nodesByExtAddr) {
      const links = []
      const processedLinks = new Set()

      nodes.forEach((nodeData) => {
        if (!nodeData.neighbors) return

        nodeData.neighbors.forEach((neighbor) => {
          // Find target node by rloc16 (most reliable) or extAddress (fallback)
          let targetNode = nodesByRloc16.get(neighbor.rloc16)
          if (!targetNode) {
            const neighborExtAddr = this.normalizeExtAddress(neighbor.extAddress)
            if (neighborExtAddr) {
              targetNode = nodesByExtAddr.get(neighborExtAddr)
            }
          }

          if (!targetNode) return

          // Prevent duplicate links
          const linkKey = [nodeData.name, targetNode.name].sort().join('|')
          if (processedLinks.has(linkKey)) return
          processedLinks.add(linkKey)

          // Determine relationship and direction
          const link = this.createLinkData(nodeData, targetNode, neighbor)
          links.push(link)
        })
      })

      return links
    },
    createLinkData (sourceNodeData, targetNodeData, neighbor) {
      let relationship = 'Neighbor'
      let sourceNode = sourceNodeData
      let targetNode = targetNodeData

      const sourceIsRouter = sourceNodeData.isRouter
      const targetIsRouter = targetNodeData.isRouter

      if (neighbor.isChild) {
        relationship = 'Parent → Child'
      } else if (sourceIsRouter && targetIsRouter) {
        // Both are routers: bidirectional peer link
        relationship = 'Router Link'
      } else if (!sourceIsRouter && targetIsRouter) {
        relationship = 'Parent → Child'
        sourceNode = targetNodeData
        targetNode = sourceNodeData
      }

      const isRouterLink = relationship === 'Router Link'

      return {
        source: sourceNode.name,
        target: targetNode.name,
        sourceLabel: sourceNode.label,
        targetLabel: targetNode.label,
        lqi: neighbor.lqi,
        rssi: neighbor.averageRssi || neighbor.lastRssi,
        relationship: relationship,
        symbol: isRouterLink ? ['arrow', 'arrow'] : ['circle', 'arrow'],
        symbolSize: isRouterLink ? [8, 8] : [6, 12],
        lineStyle: {
          color: this.getLinkColor(neighbor.lqi),
          width: this.getLinkWidth(neighbor.lqi),
          type: 'solid'
        }
      }
    }
  },

  asyncComputed: {
    /**
     * Fetch Thread devices and build the network graph series
     */
    series () {
      const graph = {
        type: 'graph',
        layout: 'force',
        force: {
          initLayout: 'force',
          gravity: 0.4,
          repulsion: 4000,
          edgeLength: 250,
          layoutAnimation: true
        },
        data: [],
        links: [],
        label: {
          show: true,
          position: 'bottom',
          fontSize: 12,
          formatter: (params) => params.data.label
        },
        roam: true,
        lineStyle: {
          width: 3,
          curveness: 0.2,
          opacity: 0.9
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 6
          }
        },
        symbolSize: 40,
        itemStyle: {
          borderWidth: 3
        }
      }

      return this.$oh.api.get('/rest/things').then((data) => {
        const matterNodes = data.filter((t) =>
          (t.bridgeUID === this.bridgeUID || t.UID === this.bridgeUID) &&
          t.UID.startsWith('matter:node') &&
          t.properties &&
          (t.properties['ThreadNetworkDiagnostics-neighborTable'] ||
           t.properties['ThreadNetworkDiagnostics-routingRole'] !== undefined)
        )

        const nodesByRloc16 = new Map()
        const nodesByExtAddr = new Map()

        matterNodes.forEach((thing) => {
          const nodeData = this.createNodeData(thing)
          graph.data.push(nodeData)

          if (nodeData.ownRloc16) {
            nodesByRloc16.set(nodeData.ownRloc16, nodeData)
          }
          if (nodeData.ownExtAddress) {
            nodesByExtAddr.set(nodeData.ownExtAddress, nodeData)
          }
        })

        // infer rloc16 for end devices
        this.inferEndDeviceRloc16(graph.data, nodesByRloc16)

        // create links between nodes
        graph.links = this.createLinks(graph.data, nodesByRloc16, nodesByExtAddr)

        return [graph]
      })
    }
  }
}
</script>
