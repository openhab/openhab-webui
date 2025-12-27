/**
 * Network Graph Components and Providers
 *
 * This module provides a unified network visualization system that supports
 * multiple protocols (Thread, Z-Wave, Zigbee, etc.) through a provider pattern.
 *
 * Usage:
 *   import { networkProviders, NetworkGraph } from '@/components/thing/network'
 *
 *   // Get a provider by key:
 *   const provider = networkProviders['thread']
 *   const graph = provider.buildGraph(things, bridgeUID)
 *
 *   // Then render with: <network-graph :graph="graph" />
 */

import type { NetworkProviderRegistry } from './types'

export * from './types'

import { threadNetworkProvider, ThreadNetworkProvider } from './providers/thread-provider'
import { zwaveNetworkProvider, ZWaveNetworkProvider } from './providers/zwave-provider'

export { threadNetworkProvider, ThreadNetworkProvider }
export { zwaveNetworkProvider, ZWaveNetworkProvider }

/**
 * Registry of all available network providers, keyed by network type.
 * Use this to look up providers dynamically by key.
 */
export const networkProviders: NetworkProviderRegistry = {
  thread: threadNetworkProvider,
  zwave: zwaveNetworkProvider
}

// Vue Component exports
import NetworkGraphComponent from './network-graph.vue'
export { NetworkGraphComponent }
export default NetworkGraphComponent
