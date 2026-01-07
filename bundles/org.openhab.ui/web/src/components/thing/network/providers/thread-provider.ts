/**
 * Thread Network Graph Provider
 *
 * Transforms Matter/Thread thing data into a unified NetworkGraph format
 */

import type {
  NetworkGraph,
  NetworkGraphProvider,
  NetworkNode,
  NetworkLink,
  NetworkLegend
} from '../types'

/**
 * Thread routing roles from Matter spec (ThreadNetworkDiagnostics cluster)
 */
const RoutingRole = {
  UNSPECIFIED: 0,
  UNASSIGNED: 1,
  SLEEPY_END_DEVICE: 2,
  END_DEVICE: 3,
  REED: 4,
  ROUTER: 5,
  LEADER: 6
} as const

/**
 * Color constants for node borders based on device role
 */
const RoleColors: Record<string, string> = {
  leader: '#FFD700',
  border_router: '#FF9800',
  router: '#2196F3',
  reed: '#00BCD4',
  end_device: '#9C27B0',
  sleepy_end_device: '#673AB7',
  unknown: '#9E9E9E'
}

/**
 * Size constants for nodes based on role
 */
const RoleSizes: Record<string, number> = {
  leader: 55,
  border_router: 50,
  router: 45,
  reed: 38,
  end_device: 30,
  sleepy_end_device: 30,
  unknown: 30
}

/**
 * LQI color mapping
 */
const LqiColors: Record<number, string> = {
  3: '#4CAF50',
  2: '#8BC34A',
  1: '#FFC107',
  0: '#F44336'
}

const LqiWidths: Record<number, number> = {
  3: 4,
  2: 3,
  1: 2,
  0: 2
}

interface ProcessedNode extends NetworkNode {
  ownRloc16: number | null
  ownExtAddress: string | null
  isRouter: boolean
  isBorderRouter: boolean
  routingRole: number
  neighbors: any[]
  routes: any[]
}

/**
 * Thread Network Graph Provider
 */
export class ThreadNetworkProvider implements NetworkGraphProvider {
  readonly title = 'Thread Network Map'

  private static readonly LEGEND: NetworkLegend = {
    nodeRoles: [
      { id: 'leader', label: 'Leader', color: RoleColors.leader, size: RoleSizes.leader },
      {
        id: 'border_router',
        label: 'Border Router',
        color: RoleColors.border_router,
        size: RoleSizes.border_router
      },
      { id: 'router', label: 'Router', color: RoleColors.router, size: RoleSizes.router },
      { id: 'reed', label: 'REED', color: RoleColors.reed, size: RoleSizes.reed },
      {
        id: 'end_device',
        label: 'End Device',
        color: RoleColors.end_device,
        size: RoleSizes.end_device
      },
      {
        id: 'sleepy_end_device',
        label: 'Sleepy End Device',
        color: RoleColors.sleepy_end_device,
        size: RoleSizes.sleepy_end_device
      }
    ],
    linkQualities: [
      { value: 3, label: 'Excellent', color: LqiColors[3], width: LqiWidths[3] },
      { value: 2, label: 'Good', color: LqiColors[2], width: LqiWidths[2] },
      { value: 1, label: 'Fair', color: LqiColors[1], width: LqiWidths[1] },
      { value: 0, label: 'Poor', color: LqiColors[0], width: LqiWidths[0] }
    ],
    linkTypes: [
      { id: 'peer', label: 'Router Link', symbol: 'double_arrow' },
      { id: 'hierarchical', label: 'Parent → Child', symbol: 'arrow' }
    ]
  }

  buildGraph(things: any[], bridgeUID: string): NetworkGraph {
    const matterNodes = things.filter(
      t =>
        (t.bridgeUID === bridgeUID || t.UID === bridgeUID) &&
        t.UID.startsWith('matter:node') &&
        t.properties &&
        (t.properties['ThreadNetworkDiagnostics-neighborTable'] ||
          t.properties['ThreadNetworkDiagnostics-routingRole'] !== undefined)
    )

    const processedNodes: ProcessedNode[] = []
    const nodesByRloc16 = new Map<number, ProcessedNode>()
    const nodesByExtAddr = new Map<string, ProcessedNode>()

    matterNodes.forEach(thing => {
      const node = this.createNode(thing)
      processedNodes.push(node)

      if (node.ownRloc16) {
        nodesByRloc16.set(node.ownRloc16, node)
      }
      if (node.ownExtAddress) {
        nodesByExtAddr.set(node.ownExtAddress, node)
      }
    })

    // Infer rloc16 for end devices
    this.inferEndDeviceRloc16(processedNodes, nodesByRloc16)

    const links = this.createLinks(processedNodes, nodesByRloc16, nodesByExtAddr)

    // Get network name from first node that has it
    const networkName =
      (processedNodes.find(n => n.properties?.network)?.properties?.network as string) || 'Thread'

    // Convert to output format
    const nodes: NetworkNode[] = processedNodes.map(n => ({
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
      links,
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

  private createNode(thing: any): ProcessedNode {
    const props = thing.properties
    const routingRole = this.parseRoutingRole(props['ThreadNetworkDiagnostics-routingRole'])
    const isBorderRouter = props['ThreadBorderRouterManagement-interfaceEnabled'] !== undefined

    const uidParts = thing.UID.split(':')
    const matterNodeId = uidParts.length >= 4 ? uidParts[3] : thing.UID

    const neighbors = this.parseJsonProperty(props['ThreadNetworkDiagnostics-neighborTable'])
    const routes = this.parseJsonProperty(props['ThreadNetworkDiagnostics-routeTable'])
    const networkName = props['ThreadNetworkDiagnostics-networkName']

    const ownIdentity = this.getOwnIdentity(routes)
    const ownRloc16 = ownIdentity?.rloc16 || null
    const ownExtAddress = ownIdentity?.extAddress || null

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

  private getRoleInfo(
    routingRole: number,
    isBorderRouter: boolean,
    isRouter: boolean
  ): { role: string; secondaryRole?: string } {
    if (routingRole === RoutingRole.LEADER) {
      return isBorderRouter
        ? { role: 'leader', secondaryRole: 'border_router' }
        : { role: 'leader' }
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

  private parseRoutingRole(value: any): number {
    if (value === undefined || value === null || value === '') {
      return RoutingRole.UNSPECIFIED
    }

    const parsed = parseInt(String(value), 10)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
      return parsed
    }

    const strValue = String(value).toUpperCase().trim()
    switch (strValue) {
      case 'LEADER':
        return RoutingRole.LEADER
      case 'ROUTER':
        return RoutingRole.ROUTER
      case 'REED':
        return RoutingRole.REED
      case 'END_DEVICE':
        return RoutingRole.END_DEVICE
      case 'SLEEPY_END_DEVICE':
        return RoutingRole.SLEEPY_END_DEVICE
      case 'UNASSIGNED':
        return RoutingRole.UNASSIGNED
      default:
        return RoutingRole.UNSPECIFIED
    }
  }

  private parseJsonProperty(value: any): any[] {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }

  private normalizeExtAddress(extAddr: any): string | null {
    if (!extAddr) return null
    const str = String(extAddr)
    return str === '0' || str === '' ? null : str
  }

  private getOwnIdentity(routes: any[]): { rloc16: number; extAddress: string | null } | null {
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

  private getStatusColor(statusInfo: any): string {
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

  private inferEndDeviceRloc16(
    nodes: ProcessedNode[],
    nodesByRloc16: Map<number, ProcessedNode>
  ): void {
    nodes.forEach(nodeData => {
      if (nodeData.ownRloc16) return
      if (!nodeData.neighbors || nodeData.neighbors.length === 0) return

      const parentNeighbor = nodeData.neighbors[0]
      if (!parentNeighbor || parentNeighbor.rloc16 == null) {
        return
      }
      const parentRloc16 = parentNeighbor.rloc16
      const parentNode = nodesByRloc16.get(parentRloc16)

      if (parentNode && parentNode.neighbors) {
        const childEntry = parentNode.neighbors.find(
          (n: any) => n.isChild && !nodesByRloc16.has(n.rloc16)
        )
        if (childEntry) {
          nodeData.ownRloc16 = childEntry.rloc16
          nodesByRloc16.set(childEntry.rloc16, nodeData)
        }
      }
    })
  }

  private createLinks(
    nodes: ProcessedNode[],
    nodesByRloc16: Map<number, ProcessedNode>,
    nodesByExtAddr: Map<string, ProcessedNode>
  ): NetworkLink[] {
    const links: NetworkLink[] = []
    const processedLinks = new Set<string>()

    nodes.forEach(nodeData => {
      if (!nodeData.neighbors) return

      nodeData.neighbors.forEach((neighbor: any) => {
        let targetNode = nodesByRloc16.get(neighbor.rloc16)
        if (!targetNode) {
          const neighborExtAddr = this.normalizeExtAddress(neighbor.extAddress)
          if (neighborExtAddr) {
            targetNode = nodesByExtAddr.get(neighborExtAddr)
          }
        }

        if (!targetNode) return

        const linkKey = [nodeData.id, targetNode.id].sort().join('|')
        if (processedLinks.has(linkKey)) return
        processedLinks.add(linkKey)

        const link = this.createLinkData(nodeData, targetNode, neighbor)
        links.push(link)
      })
    })

    return links
  }

  private createLinkData(
    sourceNode: ProcessedNode,
    targetNode: ProcessedNode,
    neighbor: any
  ): NetworkLink {
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

    return {
      source,
      target,
      type,
      quality: neighbor.lqi,
      properties: {
        rssi: neighbor.averageRssi || neighbor.lastRssi
      }
    }
  }
}

export const threadNetworkProvider = new ThreadNetworkProvider()
