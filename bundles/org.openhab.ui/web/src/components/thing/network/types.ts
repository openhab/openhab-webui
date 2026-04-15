/**
 * Unified Network Graph Types
 *
 * These types define a protocol-agnostic schema for network visualization.
 * Providers (Thread, Z-Wave, Zigbee, etc.) transform protocol specific data
 * into this unified format, which is then rendered by a generic viewer.
 */

import * as api from '@/api'

export interface NetworkLegendRole {
  id: string
  label: string
  color: string
  size: number
}

export interface NetworkLegendQuality {
  value: number
  label: string
  color: string
  width: number
}

export interface NetworkLegendLinkType {
  id: string
  label: string
  symbol: 'none' | 'arrow' | 'double_arrow'
  lineStyle?: 'solid' | 'dashed'
}

export interface NetworkLegend {
  nodeRoles: NetworkLegendRole[]
  linkQualities: NetworkLegendQuality[]
  linkTypes: NetworkLegendLinkType[]
}

export interface NetworkNode {
  id: string
  label: string
  role: string
  secondaryRole?: string
  status: 'online' | 'offline' | 'unknown'
  statusColor?: string
  properties?: Record<string, string | number | boolean>
}

export interface NetworkLink {
  source: string
  target: string
  type: 'peer' | 'hierarchical' | 'asymmetric'
  quality?: number
  lineStyle?: 'solid' | 'dashed'
  properties?: Record<string, string | number | boolean>
}

/**
 * Display options for graph rendering
 */
export interface NetworkDisplayOptions {
  /** Force layout gravity (0-1, higher = nodes pulled to center) */
  gravity?: number
  /** Force layout repulsion (higher = nodes push apart more) */
  repulsion?: number
  /** Preferred edge length in pixels */
  edgeLength?: number
  /** Whether to animate layout changes */
  layoutAnimation?: boolean
  /** Default node symbol size */
  symbolSize?: number
  /** Label font size */
  fontSize?: number
  /** Label position: 'inside' places the label inside the node, 'bottom' places it below (text is chosen via labelContent) */
  labelPosition?: 'inside' | 'bottom'
  /** What to display as the node label: 'id' or 'label' */
  labelContent?: 'id' | 'label'
  /** Line width for links */
  lineWidth?: number
  /** Line curveness (0 = straight, higher = more curved) */
  lineCurveness?: number
  /** Line opacity (0-1) */
  lineOpacity?: number
}

export interface NetworkGraph {
  networkType: string
  networkId: string
  title: string
  legend: NetworkLegend
  nodes: NetworkNode[]
  links: NetworkLink[]
  /** Optional display/layout preferences */
  displayOptions?: NetworkDisplayOptions
}

/**
 * Provider interface - each network type implements this
 */
export interface NetworkGraphProvider {
  /**
   * Display title for this network type
   */
  readonly title: string

  /**
   * Build a NetworkGraph from raw thing data
   */
  buildGraph(things: api.EnrichedThing[], bridgeUID: string): NetworkGraph
}

/**
 * Registry of all available network providers
 */
export type NetworkProviderRegistry = Record<string, NetworkGraphProvider>
