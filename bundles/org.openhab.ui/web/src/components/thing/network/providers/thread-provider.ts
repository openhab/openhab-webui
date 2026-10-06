/**
 * Thread Network Graph Provider
 *
 * Transforms Matter/Thread thing data into a unified NetworkGraph format.
 *
 * Only Thread devices commissioned to openHAB report diagnostics. The rest of the mesh, such as border routers
 * without Matter, is rebuilt from what those devices see in their neighbor and route tables.
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

enum RoleColors {
  leader = '#FFD700',
  border_router = '#FF9800',
  router = '#2196F3',
  reed = '#00BCD4',
  end_device = '#9C27B0',
  sleepy_end_device = '#673AB7',
  detached = '#616161',
  unknown = '#9E9E9E'
}

enum RoleSizes {
  leader = 55,
  border_router = 50,
  router = 45,
  reed = 38,
  end_device = 30,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  sleepy_end_device = 30,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  detached = 38,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  unknown = 30
}

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

const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#4CAF50',
  OFFLINE: '#F44336'
}
const NON_FABRIC_COLOR = '#FFC107'

/** Route table next hop value for "no next hop", used for the device itself and its direct links */
const NO_NEXT_HOP = 63

const PROP = {
  routingRole: 'ThreadNetworkDiagnostics-routingRole',
  neighborTable: 'ThreadNetworkDiagnostics-neighborTable',
  routeTable: 'ThreadNetworkDiagnostics-routeTable',
  networkName: 'ThreadNetworkDiagnostics-networkName',
  extendedPanId: 'ThreadNetworkDiagnostics-extendedPanId',
  extAddress: 'ThreadNetworkDiagnostics-extAddress',
  rloc16: 'ThreadNetworkDiagnostics-rloc16',
  leaderRouterId: 'ThreadNetworkDiagnostics-leaderRouterId',
  networkInterfaces: 'GeneralDiagnostics-networkInterfaces',
  threadFeatures: 'NetworkCommissioning-supportedThreadFeatures',
  brInterfaceEnabled: 'ThreadBorderRouterManagement-interfaceEnabled'
}

interface NeighborEntry {
  extAddress: string | null
  rloc16: number | null
  lqi?: number
  averageRssi?: number
  lastRssi?: number
  rxOnWhenIdle?: boolean
  isChild?: boolean
}

interface RouteEntry {
  extAddress: string | null
  rloc16: number | null
  nextHop?: number
  pathCost?: number
  lqiIn?: number
  lqiOut?: number
  allocated?: boolean
  linkEstablished?: boolean
}

interface ThreadNode {
  id: string
  label: string
  thing?: api.EnrichedThing
  networkKey: string | null
  networkName?: string
  extAddress: string | null
  rloc16: number | null
  routingRole: RoutingRole
  isBorderRouter: boolean
  /** Border router with its Thread interface turned off, so it is not part of any mesh */
  detached: boolean
  neighbors: NeighborEntry[]
  routes: RouteEntry[]
  /** Fabric node ids that reported this device, for devices not in openHAB */
  seenBy: Set<string>
  /** A device not in openHAB that was reported as a router */
  routerHint: boolean
  rxOnWhenIdle?: boolean
}

interface EdgeSide {
  quality?: number
  rssi?: number
  /** The reporting side lists the other side as its child */
  parentOfOther?: boolean
  /** The RLOC16 the reporting side has for the other side differs from its current one */
  stale?: boolean
  pathCost?: number
}

interface Edge {
  a: ThreadNode
  b: ThreadNode
  fromA?: EdgeSide
  fromB?: EdgeSide
}

/**
 * Converts the forms an extended address takes in thing properties into 16 uppercase hex digits.
 * Current bindings write hex strings. Older ones wrote decimal numbers, which lose precision when parsed as
 * JSON numbers, so those are a best effort only.
 */
export function normalizeExtAddress(value: unknown): string | null {
  if (value === undefined || value === null) return null
  let big: bigint | null = null
  if (typeof value === 'bigint') {
    big = value
  } else if (typeof value === 'number') {
    if (Number.isFinite(value)) big = BigInt(Math.round(value))
  } else if (typeof value === 'string') {
    const str = value.trim()
    if (/^[0-9a-fA-F]{16}$/.test(str)) big = BigInt('0x' + str)
    else if (/^\d+$/.test(str)) big = BigInt(str)
  }
  if (big === null || big <= 0n) return null
  return big.toString(16).toUpperCase().padStart(16, '0')
}

/**
 * Parses a neighbor or route table property. Older bindings wrote extended addresses as JSON numbers, which are
 * converted to hex from the raw text, as JSON.parse would round them and a decimal string could look like hex.
 */
export function parseTable(value: string | undefined): Record<string, unknown>[] {
  const parsed = parseJson(
    value?.replace(
      /("extAddress"\s*:\s*)(\d+)(?:\.0+)?(?=\s*[,}])/g,
      (_match, key: string, digits: string) => `${key}"${BigInt(digits).toString(16).toUpperCase().padStart(16, '0')}"`
    )
  )
  return Array.isArray(parsed) ? parsed.filter((e): e is Record<string, unknown> => !!e && typeof e === 'object') : []
}

function toInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? Math.round(n) : null
}

function toBool(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function routerIdOf(rloc16: number): number {
  return rloc16 >> 10
}

function isRouterRloc(rloc16: number): boolean {
  return (rloc16 & 0x1ff) === 0
}

function formatRloc(rloc16: number): string {
  return `0x${rloc16.toString(16).toUpperCase().padStart(4, '0')}`
}

function parseRoutingRole(value: string | undefined): RoutingRole {
  if (!value) return RoutingRole.UNSPECIFIED
  const str = String(value).toUpperCase().trim()
  const num = parseInt(str, 10)
  if (!isNaN(num) && num >= 0 && num <= 6) return num
  return str in RoutingRole ? RoutingRole[str as keyof typeof RoutingRole] : RoutingRole.UNSPECIFIED
}

function parseJson(value: string | undefined): unknown {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/** Reads the extended address of the Thread interface from the GeneralDiagnostics NetworkInterfaces property. */
export function threadInterfaceExtAddress(value: string | undefined): string | null {
  const interfaces = parseJson(value)
  if (!Array.isArray(interfaces)) return null
  for (const iface of interfaces as { type?: unknown; hardwareAddress?: unknown }[]) {
    if (!iface || (iface.type !== 'THREAD' && iface.type !== 4)) continue
    const hw = iface.hardwareAddress as string | number[] | { value?: unknown; data?: unknown } | undefined
    if (typeof hw === 'string') return normalizeExtAddress(hw)
    const bytes = Array.isArray(hw) ? hw : (hw?.value ?? hw?.data)
    if (Array.isArray(bytes) && bytes.length >= 8) {
      return bytes
        .slice(-8)
        .map((b) => (Number(b) & 0xff).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    }
  }
  return null
}

/**
 * The extended PAN ID of the thing's Thread network, in hex. The diagnostics property is always decimal. A border
 * router that just joined may not have reported diagnostics yet, so the extended PAN ID of its operational dataset,
 * kept in the thing configuration in hex, is used instead.
 */
function extendedPanIdOf(thing: api.EnrichedThing): string | null {
  const xpan = thing.properties[PROP.extendedPanId]
  if (xpan && /^\d+$/.test(xpan)) return BigInt(xpan).toString(16).toUpperCase().padStart(16, '0')
  const datasetXpan = datasetConfig(thing).extendedPanId
  if (typeof datasetXpan === 'string' && /^[0-9a-fA-F]{16}$/.test(datasetXpan)) return datasetXpan.toUpperCase()
  return null
}

function datasetNetworkName(thing: api.EnrichedThing): string | undefined {
  const name = datasetConfig(thing).networkName
  return typeof name === 'string' && name ? name : undefined
}

/** Border router things keep their operational dataset in the thing configuration */
function datasetConfig(thing: api.EnrichedThing): Record<string, unknown> {
  return thing.configuration ?? {}
}

/**
 * Gives every device a network key, so devices on the same network end up in one group. Devices that only report a
 * network name take the extended PAN ID of another device with that name, so one network is never split in two.
 */
function assignNetworkKeys(nodes: ThreadNode[], xpans: Map<ThreadNode, string | null>): void {
  const xpanByName = new Map<string, string>()
  nodes.forEach((n) => {
    const xpan = xpans.get(n)
    if (xpan && n.networkName && !xpanByName.has(n.networkName)) xpanByName.set(n.networkName, xpan)
  })
  nodes.forEach((n) => {
    if (n.detached) return
    const xpan = xpans.get(n)
    n.networkKey = xpan ?? (n.networkName ? (xpanByName.get(n.networkName) ?? `name:${n.networkName}`) : null)
  })
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
      { id: 'detached', label: 'Thread Disabled', color: RoleColors.detached, size: RoleSizes.detached },
      { id: 'unknown', label: 'Unknown Role', color: RoleColors.unknown, size: RoleSizes.unknown }
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
      { id: 'asymmetric', label: 'One-sided or Stale', symbol: 'double_arrow', lineStyle: 'dashed' }
    ]
  }

  buildGraph(things: api.EnrichedThing[], bridgeUID: string, focusUID?: string): NetworkGraph {
    const xpans = new Map<ThreadNode, string | null>()
    const fabricNodes = things
      .filter(
        (t) =>
          (t.bridgeUID === bridgeUID || t.UID === bridgeUID) &&
          t.UID.startsWith('matter:node') &&
          t.properties &&
          (t.properties[PROP.neighborTable] !== undefined ||
            t.properties[PROP.routingRole] !== undefined ||
            t.properties[PROP.brInterfaceEnabled] !== undefined)
      )
      .map((t) => {
        const node = this.createFabricNode(t)
        xpans.set(node, node.detached ? null : extendedPanIdOf(t))
        return node
      })
    assignNetworkKeys(fabricNodes, xpans)

    // RLOC16s are only unique within a network, so each network is resolved on its own
    const networks = new Map<string | null, ThreadNode[]>()
    for (const node of fabricNodes) {
      const members = networks.get(node.networkKey)
      if (members) members.push(node)
      else networks.set(node.networkKey, [node])
    }
    networks.forEach((members, networkKey) => {
      if (networkKey !== null) resolveOwnRloc16(members)
    })
    // Extended addresses are unique across networks, so a device is only ever drawn once
    const index = new NodeIndex(fabricNodes)

    const edges = new Map<string, Edge>()
    networks.forEach((members, networkKey) => {
      // Devices in no network have Thread turned off, their tables are left over from before
      if (networkKey === null) return
      const resolver = new NodeResolver(members, index)
      for (const node of members) {
        this.addNeighborEdges(node, resolver, edges)
        this.addRouteEdges(node, resolver, edges)
      }
      // Route tables list every router in the partition, also those only reachable through other routers
      for (const node of members.filter((n) => !isEndDevice(n))) {
        for (const route of node.routes) {
          if (route.allocated && route.nextHop !== NO_NEXT_HOP) {
            resolver.resolve(route.extAddress, route.rloc16, node, { router: true })
          }
        }
      }
      this.markLeader(members, resolver)
    })
    this.dropSupersededParentLinks(edges)

    const networkKeys = [...networks.keys()].filter((key): key is string => key !== null)
    const primaryKey = this.largestNetwork(networks)
    const primaryName = networks.get(primaryKey)?.find((n) => n.networkName)?.networkName

    return {
      networkType: 'thread',
      networkId: bridgeUID,
      title: networkKeys.length === 1 && primaryName ? `${primaryName} Network Map` : 'Thread Network Map',
      legend: ThreadNetworkProvider.LEGEND,
      nodes: index.nodes.map((n) =>
        this.toNetworkNode(
          n,
          // Only name the network on the map when there is more than one to tell apart
          networkKeys.length > 1 && n.networkKey !== null && n.networkKey !== primaryKey,
          !!focusUID && n.thing?.UID === focusUID
        )
      ),
      links: [...edges.values()].map((e) => this.toNetworkLink(e)),
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

  private createFabricNode(thing: api.EnrichedThing): ThreadNode {
    const props = thing.properties
    const uidParts = thing.UID.split(':')
    const id = uidParts.length >= 4 && uidParts[3] ? uidParts[3] : thing.UID
    const routingRole = parseRoutingRole(props[PROP.routingRole])
    const features = parseJson(props[PROP.threadFeatures]) as { isBorderRouterCapable?: boolean } | null
    const brEnabled = props[PROP.brInterfaceEnabled]

    return {
      id,
      label: thing.label || id,
      thing,
      networkKey: null,
      networkName: props[PROP.networkName] || datasetNetworkName(thing),
      extAddress: normalizeExtAddress(props[PROP.extAddress]) || threadInterfaceExtAddress(props[PROP.networkInterfaces]),
      rloc16: toInt(props[PROP.rloc16]),
      routingRole,
      isBorderRouter: brEnabled !== undefined || features?.isBorderRouterCapable === true,
      detached: brEnabled === 'false' && routingRole <= RoutingRole.UNASSIGNED,
      neighbors: parseTable(props[PROP.neighborTable]).map((n) => ({
        extAddress: normalizeExtAddress(n.extAddress),
        rloc16: toInt(n.rloc16),
        lqi: toInt(n.lqi) ?? undefined,
        averageRssi: toInt(n.averageRssi) ?? undefined,
        lastRssi: toInt(n.lastRssi) ?? undefined,
        rxOnWhenIdle: toBool(n.rxOnWhenIdle),
        isChild: toBool(n.isChild)
      })),
      routes: parseTable(props[PROP.routeTable]).map((r) => ({
        extAddress: normalizeExtAddress(r.extAddress),
        rloc16: toInt(r.rloc16),
        nextHop: toInt(r.nextHop) ?? undefined,
        pathCost: toInt(r.pathCost) ?? undefined,
        lqiIn: toInt(r.lqiIn) ?? undefined,
        lqiOut: toInt(r.lqiOut) ?? undefined,
        allocated: toBool(r.allocated),
        linkEstablished: toBool(r.linkEstablished)
      })),
      seenBy: new Set(),
      routerHint: false
    }
  }

  /**
   * The network with the most openHAB devices, whose nodes are not labelled with their network name. Ties go to the
   * lowest key, so the result does not depend on the order things are listed in.
   */
  private largestNetwork(networks: Map<string | null, ThreadNode[]>): string | null {
    let best: string | null = null
    let max = 0
    networks.forEach((members, key) => {
      if (key === null) return
      if (members.length > max || (members.length === max && best !== null && key < best)) {
        max = members.length
        best = key
      }
    })
    return best
  }

  private addNeighborEdges(node: ThreadNode, resolver: NodeResolver, edges: Map<string, Edge>): void {
    for (const neighbor of node.neighbors) {
      const target = resolver.resolve(neighbor.extAddress, neighbor.rloc16, node, {
        router: neighbor.rloc16 !== null && isRouterRloc(neighbor.rloc16),
        rxOnWhenIdle: neighbor.rxOnWhenIdle
      })
      if (!target || target === node) continue
      const rssi = neighbor.averageRssi ?? neighbor.lastRssi
      this.addSide(edges, node, target, {
        quality: neighbor.lqi,
        // 127 is the "no measurement" value for RSSI
        rssi: rssi !== undefined && rssi !== 127 ? rssi : undefined,
        parentOfOther: neighbor.isChild === true,
        stale: isStale(neighbor.rloc16, target)
      })
    }
  }

  /** Route table entries with an established link are direct router-to-router links. */
  private addRouteEdges(node: ThreadNode, resolver: NodeResolver, edges: Map<string, Edge>): void {
    if (isEndDevice(node)) return
    for (const route of node.routes) {
      if (!route.allocated || !route.linkEstablished || route.rloc16 === node.rloc16) continue
      const target = resolver.resolve(route.extAddress, route.rloc16, node, { router: true })
      if (!target || target === node) continue
      const lqis = [route.lqiIn, route.lqiOut].filter((q): q is number => q !== undefined && q > 0)
      this.addSide(edges, node, target, {
        quality: lqis.length ? Math.min(...lqis) : undefined,
        pathCost: route.pathCost,
        stale: isStale(route.rloc16, target)
      })
    }
  }

  private addSide(edges: Map<string, Edge>, from: ThreadNode, to: ThreadNode, side: EdgeSide): void {
    const key = [from.id, to.id].sort().join('|')
    let edge = edges.get(key)
    if (!edge) {
      edge = { a: from, b: to }
      edges.set(key, edge)
    }
    const slot = edge.a === from ? 'fromA' : 'fromB'
    const existing = edge[slot]
    // A device can list the same peer in both its neighbor and route table
    edge[slot] = existing
      ? {
          quality: existing.quality ?? side.quality,
          rssi: existing.rssi ?? side.rssi,
          parentOfOther: existing.parentOfOther || side.parentOfOther,
          stale: existing.stale || side.stale,
          pathCost: existing.pathCost ?? side.pathCost
        }
      : side
  }

  /**
   * An end device has exactly one parent, and a router listing it as a child is authoritative. Sleepy devices are
   * rarely re-read, so links that only the child reports, to any other router, are left over from an earlier parent.
   */
  private dropSupersededParentLinks(edges: Map<string, Edge>): void {
    const parentOf = new Map<ThreadNode, ThreadNode>()
    edges.forEach((e) => {
      if (e.fromA?.parentOfOther && canBeChild(e.b)) parentOf.set(e.b, e.a)
      if (e.fromB?.parentOfOther && canBeChild(e.a)) parentOf.set(e.a, e.b)
    })
    edges.forEach((e, key) => {
      for (const [child, other, fromChild, fromOther] of [
        [e.a, e.b, e.fromA, e.fromB],
        [e.b, e.a, e.fromB, e.fromA]
      ] as const) {
        const parent = parentOf.get(child)
        if (parent && parent !== other && fromChild && !fromOther) edges.delete(key)
      }
    })
  }

  /** Devices not in openHAB do not report a role, so the leader is found through the reported leader router id. */
  private markLeader(members: ThreadNode[], resolver: NodeResolver): void {
    if (members.some((n) => n.routingRole === RoutingRole.LEADER)) return
    for (const member of members) {
      const leaderId = toInt(member.thing?.properties[PROP.leaderRouterId])
      const leader = leaderId !== null ? resolver.byRouterId(leaderId) : undefined
      if (leader && !leader.thing) {
        leader.routingRole = RoutingRole.LEADER
        return
      }
    }
  }

  private roleOf(node: ThreadNode): { role: string; secondaryRole?: string } {
    if (node.detached) return { role: 'detached', secondaryRole: 'border_router' }
    switch (node.routingRole) {
      case RoutingRole.LEADER:
        return { role: 'leader', secondaryRole: node.isBorderRouter ? 'border_router' : undefined }
      case RoutingRole.ROUTER:
        return { role: node.isBorderRouter ? 'border_router' : 'router' }
      case RoutingRole.REED:
        return { role: 'reed' }
      case RoutingRole.END_DEVICE:
        return { role: 'end_device' }
      case RoutingRole.SLEEPY_END_DEVICE:
        return { role: 'sleepy_end_device' }
    }
    if (node.isBorderRouter) return { role: 'border_router' }
    if (node.routerHint || (node.rloc16 !== null && isRouterRloc(node.rloc16))) return { role: 'router' }
    if (node.rxOnWhenIdle === false) return { role: 'sleepy_end_device' }
    if (node.rloc16 !== null || node.rxOnWhenIdle === true) return { role: 'end_device' }
    return { role: 'unknown' }
  }

  private toNetworkNode(node: ThreadNode, showNetwork: boolean, focused: boolean): NetworkNode {
    const { role, secondaryRole } = this.roleOf(node)
    const properties: Record<string, string | number | boolean> = {}
    if (node.thing) {
      properties.thingUID = node.thing.UID
      properties.nodeId = node.id
    } else {
      properties.seenBy = node.seenBy.size
    }
    if (node.networkName) properties.network = node.networkName
    if (node.rloc16 !== null) properties.rloc16 = formatRloc(node.rloc16)
    if (node.extAddress) properties.extAddress = node.extAddress

    let label = node.label
    if (node.detached) label = `${label} (Thread disabled)`
    else if (showNetwork && node.networkName) label = `${label} (${node.networkName})`

    const thingStatus = node.thing?.statusInfo?.status
    return {
      id: node.id,
      label,
      role,
      secondaryRole,
      status: node.thing ? (thingStatus === 'ONLINE' ? 'online' : 'offline') : 'unknown',
      statusColor: node.thing ? STATUS_COLORS[thingStatus ?? ''] || '#9E9E9E' : NON_FABRIC_COLOR,
      ...(focused && { focused }),
      properties
    }
  }

  private toNetworkLink(edge: Edge): NetworkLink {
    const { a, b, fromA, fromB } = edge
    let source = a
    let target = b
    let type: NetworkLink['type'] = 'peer'

    const aIsChild = this.isChildOf(a, b, fromA, fromB)
    const bIsChild = this.isChildOf(b, a, fromB, fromA)
    if (aIsChild !== bIsChild) {
      type = 'hierarchical'
      if (aIsChild) {
        source = b
        target = a
      }
    }

    const qualities = [fromA?.quality, fromB?.quality].filter((q): q is number => q !== undefined)
    const rssis = [fromA?.rssi, fromB?.rssi].filter((r): r is number => r !== undefined)
    const stale = !!(fromA?.stale || fromB?.stale)
    // Only devices in openHAB report tables, so links to other devices are always one-sided.
    // A parent's child entry needs no confirmation from the child.
    const confirmedByParent = !!((fromA?.parentOfOther && canBeChild(b)) || (fromB?.parentOfOther && canBeChild(a)))
    const oneSided = (!fromA || !fromB) && !!a.thing && !!b.thing && !confirmedByParent
    const offline = [a, b].some((n) => n.thing && n.thing.statusInfo?.status !== 'ONLINE')
    const dashed = stale || oneSided || offline

    const properties: Record<string, string | number | boolean> = {}
    if (rssis.length) properties.rssi = Math.min(...rssis)
    const pathCost = fromA?.pathCost ?? fromB?.pathCost
    if (pathCost !== undefined) properties.pathCost = pathCost
    if (stale) properties.stale = true
    if (oneSided) properties.reportedBy = (fromA ? a : b).label

    return {
      source: source.id,
      target: target.id,
      type: dashed && type === 'peer' ? 'asymmetric' : type,
      // Show the weaker direction, as that limits the link
      quality: qualities.length ? Math.min(...qualities) : undefined,
      ...(dashed && { lineStyle: 'dashed' as const }),
      properties
    }
  }

  /** Whether `node` is the child in its link to `other`. */
  private isChildOf(node: ThreadNode, other: ThreadNode, fromNode?: EdgeSide, fromOther?: EdgeSide): boolean {
    if (fromOther?.parentOfOther && canBeChild(node)) return true
    if (fromNode?.parentOfOther && canBeChild(other)) return false
    if (isEndDevice(node) || node.routingRole === RoutingRole.REED) return true
    return (
      node.rloc16 !== null &&
      other.rloc16 !== null &&
      !isRouterRloc(node.rloc16) &&
      isRouterRloc(other.rloc16) &&
      routerIdOf(node.rloc16) === routerIdOf(other.rloc16)
    )
  }
}

function isEndDevice(node: ThreadNode): boolean {
  return node.routingRole === RoutingRole.SLEEPY_END_DEVICE || node.routingRole === RoutingRole.END_DEVICE
}

/**
 * Routers keep child entries until they time out, so a device that has since become a router can still be listed as
 * a child of its old parent.
 */
function canBeChild(node: ThreadNode): boolean {
  if (node.routingRole === RoutingRole.ROUTER || node.routingRole === RoutingRole.LEADER) return false
  return node.rloc16 === null || !isRouterRloc(node.rloc16)
}

/** Only openHAB devices have an RLOC16 of their own to compare with, others take it from whoever reported them */
function isStale(reportedRloc16: number | null, target: ThreadNode): boolean {
  return !!target.thing && reportedRloc16 !== null && target.rloc16 !== null && reportedRloc16 !== target.rloc16
}

/** RLOC16 0 is router 0, but tables also use 0 for unused entries, which then have no extended address either */
function validRloc16(rloc16: number | null, extAddress: string | null): number | null {
  return rloc16 !== null && (rloc16 !== 0 || extAddress !== null) ? rloc16 : null
}

/**
 * Fills in the RLOC16 of devices that do not report it (the attribute is optional before Matter 1.4).
 * The device's own route table entry is trusted first, then what routers report for its extended address.
 */
function resolveOwnRloc16(members: ThreadNode[]): void {
  for (const node of members) {
    if (node.rloc16 !== null) continue
    const self = selfRoute(node)
    const rloc16 = self ? validRloc16(self.rloc16, self.extAddress ?? node.extAddress) : null
    if (self && rloc16 !== null) {
      node.rloc16 = rloc16
      node.extAddress ??= self.extAddress
    }
  }
  const routers = members.filter((n) => n.routingRole >= RoutingRole.ROUTER)
  for (const node of members) {
    if (node.rloc16 !== null || !node.extAddress) continue
    const observed = routers
      .filter((r) => r !== node)
      .flatMap((r) => r.neighbors)
      .find((n) => n.extAddress === node.extAddress && n.rloc16 !== null)
    if (observed) node.rloc16 = observed.rloc16
  }
}

/**
 * A router lists itself with no next hop and no link. Direct neighbors also have no next hop but do have a link.
 * An allocated but unreachable router looks the same as the device itself, so the entry is only trusted when it
 * matches the known extended address or is the only candidate.
 */
function selfRoute(node: ThreadNode): RouteEntry | undefined {
  const candidates = node.routes.filter((r) => r.allocated && r.nextHop === NO_NEXT_HOP && !r.linkEstablished)
  const match = node.extAddress ? candidates.find((r) => r.extAddress === node.extAddress) : undefined
  return match ?? (candidates.length === 1 ? candidates[0] : undefined)
}

/**
 * Every device on the map. openHAB devices are drawn once whichever network reports them, other devices once per
 * network that reports them.
 */
class NodeIndex {
  readonly nodes: ThreadNode[] = []
  private readonly fabricByExt = new Map<string, ThreadNode>()
  private readonly othersByExt = new Map<string, ThreadNode>()

  constructor(fabricNodes: ThreadNode[]) {
    for (const node of fabricNodes) {
      this.nodes.push(node)
      if (node.extAddress && !this.fabricByExt.has(node.extAddress)) this.fabricByExt.set(node.extAddress, node)
    }
  }

  /**
   * The node with this extended address in the given network. Returns null for an openHAB device that is in another
   * network or has Thread turned off, as we know where it really is.
   */
  find(extAddress: string, networkKey: string | null): ThreadNode | null | undefined {
    const fabric = this.fabricByExt.get(extAddress)
    if (fabric) return fabric.networkKey === networkKey ? fabric : null
    return this.othersByExt.get(`${networkKey}|${extAddress}`)
  }

  addOther(node: ThreadNode): void {
    this.nodes.push(node)
    this.setExtAddress(node)
  }

  setExtAddress(node: ThreadNode): void {
    const key = `${node.networkKey}|${node.extAddress}`
    if (node.extAddress && !this.othersByExt.has(key)) this.othersByExt.set(key, node)
  }
}

/**
 * Maps extended addresses and RLOC16s seen in the tables of one Thread network to nodes, and creates nodes for
 * devices not in openHAB. RLOC16 values are only unique within a partition, so they are looked up per network.
 */
class NodeResolver {
  private readonly byRloc = new Map<number, ThreadNode>()

  constructor(
    members: ThreadNode[],
    private readonly index: NodeIndex
  ) {
    members.forEach((n) => this.addRloc(n))
  }

  byRouterId(routerId: number): ThreadNode | undefined {
    return this.byRloc.get(routerId << 10)
  }

  resolve(
    extAddress: string | null,
    rloc16: number | null,
    reporter: ThreadNode,
    hints: { router?: boolean; rxOnWhenIdle?: boolean }
  ): ThreadNode | undefined {
    const validRloc = validRloc16(rloc16, extAddress)
    const found = extAddress ? this.index.find(extAddress, reporter.networkKey) : undefined
    // The entry points at an openHAB device known to be elsewhere, so it is left over from before
    if (found === null) return undefined
    let node = found
    if (!node && validRloc !== null) {
      const candidate = this.byRloc.get(validRloc)
      // RLOC16s get reassigned, so a match is ignored when the extended addresses disagree
      if (candidate && !(extAddress && candidate.extAddress && candidate.extAddress !== extAddress)) node = candidate
    }
    if (!node) {
      if (!extAddress && validRloc === null) return undefined
      node = {
        id: `thread_${reporter.networkKey}_${extAddress ?? formatRloc(validRloc as number)}`,
        label: 'Thread Device (not in openHAB)',
        networkKey: reporter.networkKey,
        networkName: reporter.networkName,
        extAddress,
        rloc16: validRloc,
        routingRole: RoutingRole.UNSPECIFIED,
        isBorderRouter: false,
        detached: false,
        neighbors: [],
        routes: [],
        seenBy: new Set(),
        routerHint: false
      }
      this.index.addOther(node)
      this.addRloc(node)
    }
    if (!node.thing) {
      node.seenBy.add(reporter.id)
      if (hints.router) {
        node.routerHint = true
        node.label = 'Thread Router (not in openHAB)'
      }
      if (hints.rxOnWhenIdle !== undefined) node.rxOnWhenIdle = hints.rxOnWhenIdle
      if (!node.extAddress && extAddress) {
        node.extAddress = extAddress
        this.index.setExtAddress(node)
      }
      if (node.rloc16 === null && validRloc !== null) {
        node.rloc16 = validRloc
        this.addRloc(node)
      }
    }
    return node
  }

  private addRloc(node: ThreadNode): void {
    if (node.rloc16 !== null && !this.byRloc.has(node.rloc16)) this.byRloc.set(node.rloc16, node)
  }
}

export const threadNetworkProvider = new ThreadNetworkProvider()
