import { describe, it, expect } from 'vitest'
import type * as api from '@/api'
import { ThreadNetworkProvider, normalizeExtAddress, parseTable, threadInterfaceExtAddress } from './thread-provider'

const BRIDGE = 'matter:controller:main'
const OPENHAB_XPAN = '13313443025771977573'

function thing(nodeId: string, label: string, properties: Record<string, string>, status = 'ONLINE'): api.EnrichedThing {
  return {
    UID: `matter:node:main:${nodeId}`,
    bridgeUID: BRIDGE,
    label,
    properties,
    statusInfo: { status }
  } as unknown as api.EnrichedThing
}

function threadInterfaces(hex: string): string {
  const bytes = hex.match(/../g)!.map((b) => {
    const v = parseInt(b, 16)
    return v > 127 ? v - 256 : v
  })
  return JSON.stringify([{ name: 'OT_DEF', hardwareAddress: { value: bytes }, type: 'THREAD' }])
}

// Property values as written by the binding before extended addresses were written as hex
const otbr1 = thing('8990737056875903883', 'OTBR 1', {
  'ThreadNetworkDiagnostics-routingRole': 'LEADER',
  'ThreadNetworkDiagnostics-networkName': 'openHAB-Thread',
  'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
  'ThreadNetworkDiagnostics-neighborTable':
    '[{"extAddress":13706561541729176713,"age":0,"rloc16":29696,"lqi":3,"averageRssi":-66,"lastRssi":-68,"rxOnWhenIdle":true,"fullThreadDevice":true,"isChild":false}]',
  'ThreadNetworkDiagnostics-routeTable':
    '[{"extAddress":13706561541729176713,"rloc16":29696,"routerId":29,"nextHop":63,"pathCost":0,"lqiIn":3,"lqiOut":3,"allocated":true,"linkEstablished":true},{"extAddress":0,"rloc16":30720,"routerId":30,"nextHop":63,"pathCost":0,"lqiIn":0,"lqiOut":0,"allocated":true,"linkEstablished":false}]',
  'GeneralDiagnostics-networkInterfaces': threadInterfaces('9a7356fdec978bee'),
  'ThreadBorderRouterManagement-interfaceEnabled': 'true'
})

const otbr2 = thing('6034757055397416245', 'OTBR 2', {
  'ThreadNetworkDiagnostics-routingRole': 'UNSPECIFIED',
  'ThreadNetworkDiagnostics-neighborTable': '[]',
  'ThreadNetworkDiagnostics-routeTable': '[]',
  'ThreadBorderRouterManagement-interfaceEnabled': 'false'
})

// Inovelli's tables were written through the event path, with string addresses and float numbers
const inovelli = thing('4051119783777903364', 'Inovelli', {
  'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
  'ThreadNetworkDiagnostics-networkName': 'openHAB-Thread',
  'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
  'ThreadNetworkDiagnostics-neighborTable':
    '[{"extAddress":"11129334752758696942","age":8.0,"rloc16":30720.0,"lqi":3.0,"averageRssi":-65.0,"lastRssi":-66.0,"rxOnWhenIdle":true,"fullThreadDevice":true,"isChild":false}]',
  'ThreadNetworkDiagnostics-routeTable':
    '[{"extAddress":"13706561541729176713","rloc16":29696.0,"routerId":29.0,"nextHop":63.0,"allocated":true,"linkEstablished":false},{"extAddress":"11129334752758696942","rloc16":30720.0,"routerId":30.0,"nextHop":63.0,"lqiIn":3.0,"lqiOut":3.0,"allocated":true,"linkEstablished":true}]'
})

// Sleepy lock that still reports its parent's previous RLOC16
const yale = thing('13575229458429237692', 'Yale Lock', {
  'ThreadNetworkDiagnostics-routingRole': 'SLEEPY_END_DEVICE',
  'ThreadNetworkDiagnostics-networkName': 'openHAB-Thread',
  'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
  'ThreadNetworkDiagnostics-neighborTable':
    '[{"extAddress":13706561541729176713,"age":18,"rloc16":34816,"lqi":3,"averageRssi":-61,"lastRssi":-61,"rxOnWhenIdle":true,"fullThreadDevice":true,"isChild":false}]',
  'ThreadNetworkDiagnostics-routeTable':
    '[{"extAddress":13706561541729176713,"rloc16":34816,"routerId":34,"nextHop":0,"pathCost":0,"lqiIn":3,"lqiOut":3,"allocated":true,"linkEstablished":true}]',
  'GeneralDiagnostics-networkInterfaces': threadInterfaces('cea728c021f5f77c')
})

// Leader of a different (Amazon) Thread network
const onvis = thing('15293994528543138036', 'Onvis S4', {
  'ThreadNetworkDiagnostics-routingRole': 'LEADER',
  'ThreadNetworkDiagnostics-networkName': 'AMZN-Thread-0805',
  'ThreadNetworkDiagnostics-extendedPanId': '9780521099496381992',
  'ThreadNetworkDiagnostics-neighborTable':
    '[{"extAddress":15174641707131712183,"rloc16":43008,"lqi":3,"averageRssi":-53,"rxOnWhenIdle":true,"isChild":false}]',
  'ThreadNetworkDiagnostics-routeTable':
    '[{"extAddress":0,"rloc16":0,"routerId":0,"nextHop":63,"allocated":true,"linkEstablished":false},{"extAddress":15174641707131712183,"rloc16":43008,"routerId":42,"nextHop":63,"lqiIn":3,"lqiOut":3,"allocated":true,"linkEstablished":true}]'
})

const things = [otbr1, otbr2, inovelli, yale, onvis]

describe('ThreadNetworkProvider', () => {
  const provider = new ThreadNetworkProvider()

  it('links the border router to the router it lists by extended address', () => {
    const graph = provider.buildGraph(things, BRIDGE, inovelli.UID)
    const link = graph.links.find(
      (l) => [l.source, l.target].sort().join() === ['4051119783777903364', '8990737056875903883'].sort().join()
    )
    expect(link).toBeDefined()
    expect(link!.type).toBe('peer')
    expect(link!.lineStyle).toBeUndefined()
    expect(link!.quality).toBe(3)
  })

  it('does not create a duplicate node for a border router in openHAB', () => {
    const graph = provider.buildGraph(things, BRIDGE, inovelli.UID)
    expect(graph.nodes.filter((n) => n.status === 'unknown' && n.properties!.network === 'openHAB-Thread')).toHaveLength(0)
  })

  it('takes a router own RLOC16 from its route table entry without a link', () => {
    const graph = provider.buildGraph(things, BRIDGE, inovelli.UID)
    expect(graph.nodes.find((n) => n.id === '8990737056875903883')!.properties!.rloc16).toBe('0x7800')
    expect(graph.nodes.find((n) => n.id === '4051119783777903364')!.properties!.rloc16).toBe('0x7400')
  })

  it('shows every network whichever thing it is opened from', () => {
    const fromInovelli = provider.buildGraph(things, BRIDGE, inovelli.UID)
    const fromOnvis = provider.buildGraph(things, BRIDGE, onvis.UID)
    expect(fromInovelli.title).toBe('Thread Network Map')
    expect(fromInovelli.nodes.map((n) => n.id).sort()).toEqual(fromOnvis.nodes.map((n) => n.id).sort())
    expect(fromInovelli.links).toEqual(fromOnvis.links)
    // Nodes outside the largest network are labelled with their network
    expect(fromInovelli.nodes.find((n) => n.id === '15293994528543138036')!.label).toBe('Onvis S4 (AMZN-Thread-0805)')
    expect(fromInovelli.nodes.find((n) => n.id === '4051119783777903364')!.label).toBe('Inovelli')
  })

  it('marks the thing the map was opened from as focused', () => {
    const graph = provider.buildGraph(things, BRIDGE, onvis.UID)
    expect(graph.nodes.filter((n) => n.focused).map((n) => n.id)).toEqual(['15293994528543138036'])
    expect(provider.buildGraph(things, BRIDGE).nodes.some((n) => n.focused)).toBe(false)
  })

  it('names the map after the network when there is only one', () => {
    expect(provider.buildGraph([otbr1, inovelli, yale], BRIDGE).title).toBe('openHAB-Thread Network Map')
  })

  it('shows a border router with Thread turned off as detached', () => {
    const graph = provider.buildGraph(things, BRIDGE, inovelli.UID)
    const node = graph.nodes.find((n) => n.id === '6034757055397416245')!
    expect(node.role).toBe('detached')
    expect(graph.links.some((l) => l.source === node.id || l.target === node.id)).toBe(false)
  })

  it('places a border router that has not reported diagnostics yet by its dataset', () => {
    const joined = {
      ...otbr2,
      properties: { ...otbr2.properties, 'ThreadBorderRouterManagement-interfaceEnabled': 'true' },
      configuration: { extendedPanId: 'B8C2D9E4F08A5B65' }
    } as unknown as api.EnrichedThing
    const graph = provider.buildGraph([otbr1, joined, inovelli, yale, onvis], BRIDGE, inovelli.UID)
    expect(graph.nodes.find((n) => n.id === '6034757055397416245')?.role).toBe('border_router')
  })

  it('draws a sleepy device under its parent and marks an outdated RLOC16 as stale', () => {
    const graph = provider.buildGraph(things, BRIDGE, inovelli.UID)
    const link = graph.links.find((l) => l.target === '13575229458429237692')!
    expect(link.source).toBe('4051119783777903364')
    expect(link.type).toBe('hierarchical')
    expect(link.lineStyle).toBe('dashed')
    expect(link.properties!.stale).toBe(true)
  })

  it('trusts the router that lists a device as its child over the child stale table', () => {
    const parent = {
      ...otbr1,
      properties: {
        ...otbr1.properties,
        'ThreadNetworkDiagnostics-neighborTable':
          '[{"extAddress":"BE377D1A0ACC4C89","rloc16":29696,"lqi":3,"isChild":false},{"extAddress":"CEA728C021F5F77C","rloc16":30722,"lqi":3,"rxOnWhenIdle":false,"isChild":true}]'
      }
    } as unknown as api.EnrichedThing
    const graph = provider.buildGraph([parent, otbr2, inovelli, yale], BRIDGE, inovelli.UID)
    const yaleLinks = graph.links.filter((l) => l.source === '13575229458429237692' || l.target === '13575229458429237692')
    expect(yaleLinks).toHaveLength(1)
    expect(yaleLinks[0].source).toBe('8990737056875903883')
    expect(yaleLinks[0].type).toBe('hierarchical')
    expect(yaleLinks[0].lineStyle).toBeUndefined()
    expect(graph.nodes.find((n) => n.id === '13575229458429237692')!.properties!.rloc16).toBe('0x7802')
  })

  it('adds routers that are not in openHAB from neighbor tables', () => {
    const graph = provider.buildGraph(things, BRIDGE, onvis.UID)
    const unknown = graph.nodes.find((n) => n.status === 'unknown')!
    expect(unknown.role).toBe('router')
    expect(unknown.properties!.extAddress).toBe('D297283BE369B2B7')
    expect(graph.links.find((l) => l.source === '15293994528543138036' || l.target === '15293994528543138036')).toBeDefined()
  })

  it('adds routers known only from route tables', () => {
    const tbr = thing('1', 'Router', {
      'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-extAddress': '0000000000000001',
      'ThreadNetworkDiagnostics-rloc16': '1024',
      'ThreadNetworkDiagnostics-neighborTable': '[]',
      'ThreadNetworkDiagnostics-routeTable':
        '[{"extAddress":"0000000000000000","rloc16":2048,"routerId":2,"nextHop":5,"pathCost":2,"allocated":true,"linkEstablished":false}]'
    })
    const graph = provider.buildGraph([tbr], BRIDGE)
    expect(graph.nodes.find((n) => n.id === 'rloc_B8C2D9E4F08A5B65_0x0800')?.role).toBe('router')
  })

  it('reads hex extended addresses written by the binding', () => {
    const a = thing('1', 'A', {
      'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-extAddress': '9A7356FDEC978BEE',
      'ThreadNetworkDiagnostics-neighborTable': '[{"extAddress":"BE377D1A0ACC4C89","rloc16":29696,"lqi":2,"isChild":false}]'
    })
    const b = thing('2', 'B', {
      'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-extAddress': 'BE377D1A0ACC4C89',
      'ThreadNetworkDiagnostics-neighborTable': '[{"extAddress":"9A7356FDEC978BEE","rloc16":30720,"lqi":3,"isChild":false}]'
    })
    const graph = provider.buildGraph([a, b], BRIDGE)
    expect(graph.nodes).toHaveLength(2)
    expect(graph.links).toHaveLength(1)
    expect(graph.links[0].quality).toBe(2)
    expect(graph.links[0].lineStyle).toBeUndefined()
  })

  it('ignores the leftover tables of a border router with Thread turned off', () => {
    const disabled = thing('6034757055397416245', 'OTBR 2', {
      ...otbr2.properties,
      'ThreadNetworkDiagnostics-neighborTable': '[{"extAddress":"9A7356FDEC978BEE","rloc16":30720,"lqi":3,"isChild":false}]',
      'ThreadNetworkDiagnostics-routeTable':
        '[{"extAddress":"BE377D1A0ACC4C89","rloc16":29696,"nextHop":30,"allocated":true,"linkEstablished":true}]'
    })
    const graph = provider.buildGraph([otbr1, disabled, inovelli, yale], BRIDGE)
    expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length)
    expect(graph.nodes.filter((n) => n.status === 'unknown')).toHaveLength(0)
    expect(graph.links.some((l) => l.source === '6034757055397416245' || l.target === '6034757055397416245')).toBe(false)
  })

  it('puts a device that only reports its network name in the same network', () => {
    const nameOnly = thing('7', 'Name Only', {
      'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
      'ThreadNetworkDiagnostics-networkName': 'openHAB-Thread',
      'ThreadNetworkDiagnostics-extAddress': '1111111111111111',
      'ThreadNetworkDiagnostics-neighborTable': '[{"extAddress":"9A7356FDEC978BEE","rloc16":30720,"lqi":3,"isChild":false}]'
    })
    const graph = provider.buildGraph([otbr1, inovelli, nameOnly], BRIDGE)
    expect(graph.title).toBe('openHAB-Thread Network Map')
    expect(new Set(graph.nodes.map((n) => n.id)).size).toBe(graph.nodes.length)
    expect(graph.nodes.filter((n) => n.status === 'unknown')).toHaveLength(0)
  })

  it('keeps the links of a router that its old parent still lists as a child', () => {
    const oldParent = thing('1', 'Old Parent', {
      'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-extAddress': '000000000000000A',
      'ThreadNetworkDiagnostics-rloc16': '1024',
      'ThreadNetworkDiagnostics-neighborTable': '[{"extAddress":"000000000000000B","rloc16":1025,"lqi":3,"isChild":true}]'
    })
    const promoted = thing('2', 'Promoted', {
      'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-extAddress': '000000000000000B',
      'ThreadNetworkDiagnostics-rloc16': '2048',
      'ThreadNetworkDiagnostics-neighborTable':
        '[{"extAddress":"00000000000000C1","rloc16":3072,"lqi":3,"isChild":false},{"extAddress":"00000000000000C2","rloc16":4096,"lqi":2,"isChild":false}]'
    })
    const graph = provider.buildGraph([oldParent, promoted], BRIDGE)
    const linkTo = (other: string) => graph.links.find((l) => [l.source, l.target].sort().join() === ['2', other].sort().join())
    expect(linkTo('thread_00000000000000C1')).toMatchObject({ type: 'peer' })
    expect(linkTo('thread_00000000000000C2')).toMatchObject({ type: 'peer' })
    expect(linkTo('1')).toMatchObject({ type: 'asymmetric', lineStyle: 'dashed', properties: { stale: true } })
  })

  it('treats router 0 as a valid router', () => {
    const leader = thing('1', 'Leader', {
      'ThreadNetworkDiagnostics-routingRole': 'LEADER',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-extAddress': '000000000000000A',
      'ThreadNetworkDiagnostics-neighborTable': '[{"extAddress":"000000000000000B","rloc16":1,"lqi":3,"isChild":true}]',
      'ThreadNetworkDiagnostics-routeTable':
        '[{"extAddress":"000000000000000A","rloc16":0,"routerId":0,"nextHop":63,"allocated":true,"linkEstablished":false}]'
    })
    const graph = provider.buildGraph([leader], BRIDGE)
    expect(graph.nodes.find((n) => n.id === '1')!.properties!.rloc16).toBe('0x0000')
    expect(graph.links[0]).toMatchObject({ source: '1', target: 'thread_000000000000000B', type: 'hierarchical' })
  })

  it('draws the same map whatever order the things come in', () => {
    const reporter = (id: string, ext: string, reportedRloc: number) =>
      thing(id, `R${id}`, {
        'ThreadNetworkDiagnostics-routingRole': 'ROUTER',
        'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
        'ThreadNetworkDiagnostics-extAddress': ext,
        'ThreadNetworkDiagnostics-neighborTable': `[{"extAddress":"00000000000000FF","rloc16":${reportedRloc},"lqi":3,"isChild":false}]`
      })
    const x = reporter('1', '0000000000000001', 3072)
    const y = reporter('2', '0000000000000002', 4096)
    const forward = provider.buildGraph([x, y], BRIDGE)
    const reverse = provider.buildGraph([y, x], BRIDGE)
    const style = (graph: ReturnType<typeof provider.buildGraph>) =>
      graph.links.map((l) => `${[l.source, l.target].sort().join()}:${l.lineStyle ?? 'solid'}`).sort()
    expect(style(forward)).toEqual(style(reverse))
    expect(forward.links.every((l) => l.lineStyle === undefined)).toBe(true)
  })

  it('does not add routers from the route table of an end device', () => {
    const endDevice = thing('1', 'End Device', {
      'ThreadNetworkDiagnostics-routingRole': 'END_DEVICE',
      'ThreadNetworkDiagnostics-extendedPanId': OPENHAB_XPAN,
      'ThreadNetworkDiagnostics-neighborTable': '[]',
      'ThreadNetworkDiagnostics-routeTable':
        '[{"extAddress":"0000000000000000","rloc16":7168,"routerId":7,"nextHop":3,"allocated":true,"linkEstablished":false}]'
    })
    const graph = provider.buildGraph([endDevice], BRIDGE)
    expect(graph.nodes.map((n) => n.id)).toEqual(['1'])
  })

  it('labels the same network whatever order the things come in', () => {
    const other = thing('9', 'Other', {
      'ThreadNetworkDiagnostics-routingRole': 'LEADER',
      'ThreadNetworkDiagnostics-networkName': 'Other-Thread',
      'ThreadNetworkDiagnostics-extendedPanId': '1',
      'ThreadNetworkDiagnostics-neighborTable': '[]'
    })
    const labels = (input: api.EnrichedThing[]) =>
      provider
        .buildGraph(input, BRIDGE)
        .nodes.map((n) => n.label)
        .sort()
    expect(labels([otbr1, other])).toEqual(labels([other, otbr1]))
  })
})

describe('extended address helpers', () => {
  it('keeps full precision for integer addresses in tables', () => {
    const [entry] = parseTable('[{"extAddress":13706561541729176713,"rloc16":1}]')
    expect(normalizeExtAddress(entry.extAddress)).toBe('BE377D1A0ACC4C89')
  })

  it('converts 16 digit decimal addresses in tables from decimal', () => {
    const [entry] = parseTable('[{"extAddress":1234567890123456,"rloc16":1}]')
    expect(normalizeExtAddress(entry.extAddress)).toBe('000462D53C8ABAC0')
  })

  it('treats zero as no address', () => {
    expect(normalizeExtAddress(0)).toBeNull()
    expect(normalizeExtAddress('0000000000000000')).toBeNull()
  })

  it('reads the Thread interface hardware address', () => {
    expect(threadInterfaceExtAddress(threadInterfaces('9a7356fdec978bee'))).toBe('9A7356FDEC978BEE')
  })
})
