/**
 * Thread Network Graph Provider
 *
 * Transforms Matter/Thread thing data into a unified NetworkGraph format
 */

import type { NetworkGraph, NetworkGraphProvider, NetworkNode, NetworkLink, NetworkLegend } from '../types'
import * as api from '@/api'

/**
 * Thread routing roles from Matter spec (ThreadNetworkDiagnostics cluster)
 */
enum RoutingRole {
  UNSPECIFIED = 0,
  UNASSIGNED = 1,
  SLEEPY_END_DEVICE = 2,
  END_DEVICE = 3,
  REED = 4,
  ROUTER = 5,
  LEADER = 6
}

/**
 * Color constants for node borders based on device role
 */
enum RoleColors {
  leader = '#FFD700',
  border_router = '#FF9800',
  router = '#2196F3',
  reed = '#00BCD4',
  end_device = '#9C27B0',
  sleepy_end_device = '#673AB7',
  unknown = '#9E9E9E'
}

/**
 * Size constants for nodes based on role
 */
enum RoleSizes {
  leader = 55,
  border_router = 50,
  router = 45,
  reed = 38,
  end_device = 30,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  sleepy_end_device = 30,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  unknown = 30
}

/**
 * LQI color mapping
 */
enum LqiColors {
  _3 = '#4CAF50',
  _2 = '#8BC34A',
  _1 = '#FFC107',
  _0 = '#F44336'
}

enum LqiWidths {
  _3 = 4,
  _2 = 3,
  _1 = 2,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  _0 = 2
}

interface Route {
  allocated: boolean
  linkEstablished: boolean
  nextHop: number
  lqiIn?: number
  lqiOut?: number
  pathCost?: number
  rloc16: number
  extAddress: string
}
interface UnknownDevice {
  extAddress: string
  seenBy: string[]
  isRouter: boolean
  isChild: boolean
  rloc16: number | null
  bestLqi: number | null
  lqi?: number
  averageRssi?: number
  lastRssi?: number
  rxOnWhenIdle?: boolean
  fullThreadDevice?: boolean
}

interface ProcessedNode extends NetworkNode {
  ownRloc16: number | null
  ownExtAddress: string | null
  isRouter: boolean
  isBorderRouter: boolean
  routingRole: RoutingRole
  neighbors: UnknownDevice[]
  routes: Route[]
}

/**
 * Thread Network Graph Provider
 */
export class ThreadNetworkProvider implements NetworkGraphProvider {
  readonly title = 'Thread Network Map'

  private static readonly LEGEND: NetworkLegend = {
    nodeRoles: [
      { id: 'leader', label: 'Leader', color: RoleColors.leader, size: RoleSizes.leader },
      { id: 'border_router', label: 'Border Router', color: RoleColors.border_router, size: RoleSizes.border_router },
      { id: 'router', label: 'Router', color: RoleColors.router, size: RoleSizes.router },
      { id: 'reed', label: 'REED', color: RoleColors.reed, size: RoleSizes.reed },
      { id: 'end_device', label: 'End Device', color: RoleColors.end_device, size: RoleSizes.end_device },
      {
        id: 'sleepy_end_device',
        label: 'Sleepy End Device',
        color: RoleColors.sleepy_end_device,
        size: RoleSizes.sleepy_end_device
      },
      { id: 'unknown', label: 'Non-Fabric Device', color: RoleColors.unknown, size: RoleSizes.unknown }
    ],
    linkQualities: [
      { value: 3, label: 'Excellent', color: LqiColors._3, width: LqiWidths._3 },
      { value: 2, label: 'Good', color: LqiColors._2, width: LqiWidths._2 },
      { value: 1, label: 'Fair', color: LqiColors._1, width: LqiWidths._1 },
      { value: 0, label: 'Poor', color: LqiColors._0, width: LqiWidths._0 }
    ],
    linkTypes: [
      { id: 'peer', label: 'Router Link', symbol: 'double_arrow' },
      { id: 'hierarchical', label: 'Parent → Child', symbol: 'arrow' },
      { id: 'route_table', label: 'Inferred (Route Table)', symbol: 'double_arrow', lineStyle: 'dashed' },
      { id: 'non_fabric', label: 'Non-Fabric / Offline', symbol: 'double_arrow', lineStyle: 'dashed' }
    ]
  }

  buildGraph(things: api.EnrichedThing[], bridgeUID: string): NetworkGraph {
    const matterNodes = things.filter(
      (t) =>
        (t.bridgeUID === bridgeUID || t.UID === bridgeUID) &&
        t.UID.startsWith('matter:node') &&
        t.properties &&
        (t.properties['ThreadNetworkDiagnostics-neighborTable'] || t.properties['ThreadNetworkDiagnostics-routingRole'] !== undefined)
    )

    const processedNodes: ProcessedNode[] = []
    const nodesByRloc16 = new Map<number, ProcessedNode>()
    const nodesByExtAddr = new Map<string, ProcessedNode>()

    matterNodes.forEach((thing) => {
      const node = this.createNode(thing)
      processedNodes.push(node)

      if (node.ownRloc16 && !nodesByRloc16.has(node.ownRloc16)) {
        nodesByRloc16.set(node.ownRloc16, node)
      }
      if (node.ownExtAddress) {
        nodesByExtAddr.set(node.ownExtAddress, node)
      }
    })

    // Infer rloc16 for end devices
    this.inferEndDeviceRloc16(processedNodes, nodesByRloc16)

    // Discover unknown devices from neighbor tables and create nodes for them
    const unknowns = this.discoverUnknownDevices(processedNodes, nodesByExtAddr, nodesByRloc16)
    const unknownNodes = this.createUnknownNodes(unknowns, nodesByExtAddr, nodesByRloc16)
    const allProcessedNodes = [...processedNodes, ...unknownNodes]

    // Create neighbor-table links (unknown nodes are now in the maps)
    const processedLinkKeys = new Set<string>()
    const neighborLinks = this.createLinks(allProcessedNodes, nodesByRloc16, nodesByExtAddr, processedLinkKeys)

    // Create route-table links for connections not already found in neighbor tables
    const routeTableLinks = this.createRouteTableLinks(processedNodes, nodesByRloc16, nodesByExtAddr, processedLinkKeys)

    const allLinks = [...neighborLinks, ...routeTableLinks]

    // Find the primary (most common) network name and annotate cross-network nodes
    const networkName = this.getPrimaryNetworkName(processedNodes)
    processedNodes.forEach((n) => {
      const nodeNetwork = n.properties?.network as string | undefined
      if (nodeNetwork && nodeNetwork !== networkName) {
        n.label = `${n.label} (${nodeNetwork})`
      }
    })

    // Convert to output format
    const nodes: NetworkNode[] = allProcessedNodes.map((n) => ({
      id: n.id,
      label: n.label,
      role: n.role,
      secondaryRole: n.secondaryRole,
      status: n.status,
      statusColor: n.statusColor,
      properties: n.properties
    }))

    return {
      networkType: 'thread',
      networkId: bridgeUID,
      title: `${networkName} Network Map`,
      legend: ThreadNetworkProvider.LEGEND,
      nodes,
      links: allLinks,
      displayOptions: {
        gravity: 0.4,
        repulsion: 4000,
        edgeLength: 250,
        layoutAnimation: true,
        symbolSize: 40,
        fontSize: 12,
        lineWidth: 3,
        lineCurveness: 0.2,
        lineOpacity: 0.9
      }
    }
  }

  private createNode(thing: api.EnrichedThing): ProcessedNode {
    const props = thing.properties
    const routingRole = this.parseRoutingRole(props['ThreadNetworkDiagnostics-routingRole'] || '')
    const isBorderRouter = props['ThreadBorderRouterManagement-interfaceEnabled'] !== undefined

    const uidParts = thing.UID.split(':')
    const matterNodeId = uidParts.length >= 4 && uidParts[3] ? uidParts[3] : thing.UID

    const neighbors = this.parseJsonProperty<UnknownDevice>(props['ThreadNetworkDiagnostics-neighborTable'] || '')
    const routes = this.parseJsonProperty<Route>(props['ThreadNetworkDiagnostics-routeTable'] || '')
    const networkName = props['ThreadNetworkDiagnostics-networkName']

    const ownIdentity = this.getOwnIdentity(routes)
    const ownRloc16 = ownIdentity?.rloc16 || null
    const thingExtAddress = this.normalizeExtAddress(props['ThreadNetworkDiagnostics-extAddress'] || '') as string
    const ownExtAddress = thingExtAddress || ownIdentity?.extAddress || null

    const isRouter = isBorderRouter || routingRole >= RoutingRole.ROUTER || ownRloc16 !== null

    const { role, secondaryRole } = this.getRoleInfo(routingRole, isBorderRouter, isRouter)

    return {
      id: matterNodeId,
      label: thing.label || matterNodeId,
      role,
      secondaryRole,
      status: thing.statusInfo?.status === 'ONLINE' ? 'online' : 'offline',
      statusColor: this.getStatusColor(thing.statusInfo),
      properties: {
        thingUID: thing.UID,
        nodeId: matterNodeId,
        ...(networkName && { network: networkName }),
        ...(ownRloc16 && { rloc16: `0x${ownRloc16.toString(16).toUpperCase().padStart(4, '0')}` })
      },
      ownRloc16,
      ownExtAddress,
      isRouter,
      isBorderRouter,
      routingRole,
      neighbors,
      routes
    }
  }

  private getRoleInfo(routingRole: RoutingRole, isBorderRouter: boolean, isRouter: boolean): { role: string; secondaryRole?: string } {
    if (routingRole === RoutingRole.LEADER) {
      return isBorderRouter ? { role: 'leader', secondaryRole: 'border_router' } : { role: 'leader' }
    }
    if (isBorderRouter) return { role: 'border_router' }
    if (isRouter && routingRole < RoutingRole.ROUTER) return { role: 'router' }

    switch (routingRole) {
      case RoutingRole.ROUTER:
        return { role: 'router' }
      case RoutingRole.REED:
        return { role: 'reed' }
      case RoutingRole.END_DEVICE:
        return { role: 'end_device' }
      case RoutingRole.SLEEPY_END_DEVICE:
        return { role: 'sleepy_end_device' }
      default:
        return { role: 'end_device' }
    }
  }

  private parseRoutingRole(value: string): RoutingRole {
    if (value === undefined || value === null || value === '') {
      return RoutingRole.UNSPECIFIED
    }

    const valueString = String(value).toUpperCase().trim()

    const parsed = parseInt(valueString, 10)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
      return parsed as RoutingRole
    }

    const strValue = valueString as keyof typeof RoutingRole
    if (strValue in RoutingRole) {
      return RoutingRole[strValue]
    }

    return RoutingRole.UNSPECIFIED
  }

  private parseJsonProperty<T>(value: string): T[] {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      return JSON.parse(value) as T[]
    } catch {
      return []
    }
  }

  private normalizeExtAddress(extAddr: string): string | null {
    if (!extAddr) return null
    const str = String(extAddr)
    return str === '0' || str === '' || str === 'null' ? null : str
  }

  private getOwnIdentity(routes: Route[]): { rloc16: number; extAddress: string | null } | null {
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
  }

  private isNeighborSelf(node: ProcessedNode, neighbor: UnknownDevice): boolean {
    if (node.ownRloc16 && neighbor.rloc16 === node.ownRloc16) return true
    if (node.ownExtAddress) {
      const neighborExt = this.normalizeExtAddress(neighbor.extAddress)
      if (neighborExt && neighborExt === node.ownExtAddress) return true
    }
    return false
  }

  private getStatusColor(statusInfo: api.ThingStatusInfo): string {
    if (!statusInfo) return '#9E9E9E'
    switch (statusInfo.status) {
      case 'ONLINE':
        return '#4CAF50'
      case 'OFFLINE':
        return '#F44336'
      case 'UNKNOWN':
        return '#9E9E9E'
      default:
        return '#9E9E9E'
    }
  }

  private getPrimaryNetworkName(nodes: ProcessedNode[]): string {
    const counts = new Map<string, number>()
    nodes.forEach((n) => {
      const name = n.properties?.network as string | undefined
      if (name) counts.set(name, (counts.get(name) || 0) + 1)
    })
    let primary = 'Thread'
    let max = 0
    counts.forEach((count, name) => {
      if (count > max) {
        max = count
        primary = name
      }
    })
    return primary
  }

  private inferEndDeviceRloc16(nodes: ProcessedNode[], nodesByRloc16: Map<number, ProcessedNode>): void {
    nodes.forEach((nodeData) => {
      if (nodeData.ownRloc16) return
      if (!nodeData.neighbors || nodeData.neighbors.length === 0) return

      const parentNeighbor = nodeData.neighbors[0]
      if (!parentNeighbor || parentNeighbor.rloc16 == null) {
        return
      }
      const parentRloc16 = parentNeighbor.rloc16
      const parentNode = nodesByRloc16.get(parentRloc16)

      if (parentNode && parentNode.neighbors) {
        const childEntry = parentNode.neighbors.find((n) => n.isChild && n.rloc16 !== null && !nodesByRloc16.has(n.rloc16))
        if (childEntry && childEntry.rloc16 !== null) {
          nodeData.ownRloc16 = childEntry.rloc16
          nodesByRloc16.set(childEntry.rloc16, nodeData)
        }
      }
    })
  }

  private createLinks(
    nodes: ProcessedNode[],
    nodesByRloc16: Map<number, ProcessedNode>,
    nodesByExtAddr: Map<string, ProcessedNode>,
    processedLinkKeys: Set<string>
  ): NetworkLink[] {
    const links: NetworkLink[] = []

    nodes.forEach((nodeData) => {
      if (!nodeData.neighbors) return

      nodeData.neighbors.forEach((neighbor) => {
        if (this.isNeighborSelf(nodeData, neighbor)) return

        const neighborExtAddr = this.normalizeExtAddress(neighbor.extAddress)
        let targetNode = neighborExtAddr ? nodesByExtAddr.get(neighborExtAddr) : undefined
        if (!targetNode) {
          targetNode = nodesByRloc16.get(neighbor.rloc16 || -1)
        }

        if (!targetNode) return
        if (targetNode.id === nodeData.id) return

        const linkKey = [nodeData.id, targetNode.id].sort().join('|')
        if (processedLinkKeys.has(linkKey)) return
        processedLinkKeys.add(linkKey)

        const link = this.createLinkData(nodeData, targetNode, neighbor)
        links.push(link)
      })
    })

    return links
  }

  private createLinkData(sourceNode: ProcessedNode, targetNode: ProcessedNode, neighbor: UnknownDevice): NetworkLink {
    let type: NetworkLink['type'] = 'peer'
    let source = sourceNode.id
    let target = targetNode.id

    if (neighbor.isChild) {
      type = 'hierarchical'
    } else if (sourceNode.isRouter && targetNode.isRouter) {
      type = 'peer'
    } else if (!sourceNode.isRouter && targetNode.isRouter) {
      type = 'hierarchical'
      source = targetNode.id
      target = sourceNode.id
    }

    const involvesUnknown = sourceNode.status === 'unknown' || targetNode.status === 'unknown'
    const involvesOffline = sourceNode.status === 'offline' || targetNode.status === 'offline'

    return {
      source,
      target,
      type,
      quality: neighbor.lqi,
      ...((involvesUnknown || involvesOffline) && { lineStyle: 'dashed' as const }),
      properties: {
        rssi: neighbor.averageRssi || neighbor.lastRssi || -1
      }
    }
  }

  private discoverUnknownDevices(
    processedNodes: ProcessedNode[],
    nodesByExtAddr: Map<string, ProcessedNode>,
    nodesByRloc16: Map<number, ProcessedNode>
  ): Map<string, UnknownDevice> {
    const unknowns = new Map<string, UnknownDevice>()

    processedNodes.forEach((node) => {
      if (!node.neighbors) return

      node.neighbors.forEach((neighbor) => {
        if (this.isNeighborSelf(node, neighbor)) return

        const extAddr = this.normalizeExtAddress(neighbor.extAddress)
        if (!extAddr) return

        // Skip if this ext address belongs to a known node
        if (nodesByExtAddr.has(extAddr)) return

        // Also skip if the RLOC16 matches a known node
        if (neighbor.rloc16 && nodesByRloc16.has(neighbor.rloc16)) return

        const existing = unknowns.get(extAddr)
        if (existing) {
          if (!existing.seenBy.includes(node.id)) {
            existing.seenBy.push(node.id)
          }
          if (neighbor.lqi !== undefined && (existing.bestLqi === null || neighbor.lqi > existing.bestLqi)) {
            existing.bestLqi = neighbor.lqi
          }
        } else {
          unknowns.set(extAddr, {
            extAddress: extAddr,
            seenBy: [node.id],
            isRouter: neighbor.rxOnWhenIdle === true && neighbor.fullThreadDevice === true,
            rloc16: neighbor.rloc16 ?? null,
            bestLqi: neighbor.lqi ?? null,
            isChild: neighbor.isChild === true
          })
        }
      })
    })

    return unknowns
  }

  private createUnknownNodes(
    unknowns: Map<string, UnknownDevice>,
    nodesByExtAddr: Map<string, ProcessedNode>,
    nodesByRloc16: Map<number, ProcessedNode>
  ): ProcessedNode[] {
    const nodes: ProcessedNode[] = []

    unknowns.forEach((device, extAddr) => {
      const nodeId = `unknown_${extAddr}`
      const role = device.isRouter ? 'router' : 'unknown'

      const node: ProcessedNode = {
        id: nodeId,
        label: device.isRouter ? 'Non-Fabric Router' : 'Non-Fabric Device',
        role,
        secondaryRole: undefined,
        status: 'unknown',
        statusColor: '#FFC107',
        properties: {
          extAddress: extAddr,
          ...(device.rloc16 && {
            rloc16: `0x${device.rloc16.toString(16).toUpperCase().padStart(4, '0')}`
          }),
          seenBy: device.seenBy.length
        },
        ownRloc16: device.rloc16,
        ownExtAddress: extAddr,
        isRouter: device.isRouter,
        isBorderRouter: false,
        routingRole: device.isRouter ? RoutingRole.ROUTER : RoutingRole.UNSPECIFIED,
        neighbors: [],
        routes: []
      }

      nodes.push(node)
      nodesByExtAddr.set(extAddr, node)
      if (device.rloc16) {
        nodesByRloc16.set(device.rloc16, node)
      }
    })

    return nodes
  }

  private createRouteTableLinks(
    processedNodes: ProcessedNode[],
    nodesByRloc16: Map<number, ProcessedNode>,
    nodesByExtAddr: Map<string, ProcessedNode>,
    processedLinkKeys: Set<string>
  ): NetworkLink[] {
    const links: NetworkLink[] = []

    processedNodes.forEach((nodeData) => {
      if (!nodeData.routes || nodeData.routes.length === 0) return

      nodeData.routes.forEach((route) => {
        // Skip the node's own identity entry
        if (route.nextHop === 63) return

        // Only process established, allocated routes
        if (!route.linkEstablished || !route.allocated) return

        const targetRloc16 = route.rloc16
        if (!targetRloc16) return

        const routeExtAddr = this.normalizeExtAddress(route.extAddress)
        let targetNode = routeExtAddr ? nodesByExtAddr.get(routeExtAddr) : undefined
        if (!targetNode) {
          targetNode = nodesByRloc16.get(targetRloc16)
        }

        if (!targetNode) return
        if (targetNode.id === nodeData.id) return

        const linkKey = [nodeData.id, targetNode.id].sort().join('|')
        if (processedLinkKeys.has(linkKey)) return
        processedLinkKeys.add(linkKey)

        // Compute average of lqiIn and lqiOut
        let quality: number | undefined
        if (route.lqiIn !== undefined && route.lqiOut !== undefined && route.lqiIn > 0 && route.lqiOut > 0) {
          quality = Math.round((route.lqiIn + route.lqiOut) / 2)
        } else if (route.lqiIn !== undefined && route.lqiIn > 0) {
          quality = route.lqiIn
        } else if (route.lqiOut !== undefined && route.lqiOut > 0) {
          quality = route.lqiOut
        }

        links.push({
          source: nodeData.id,
          target: targetNode.id,
          type: 'peer',
          quality,
          lineStyle: 'dashed',
          properties: {
            fromRouteTable: true,
            ...(route.pathCost !== undefined && { pathCost: route.pathCost })
          }
        })
      })
    })

    return links
  }
}

export const threadNetworkProvider = new ThreadNetworkProvider()
