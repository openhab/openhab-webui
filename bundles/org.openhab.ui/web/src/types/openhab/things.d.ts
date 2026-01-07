// type definitions for DTOs returned from /rest/things endpoints

export interface Firmware {
  /**
   * The Thing Type UID this firmware is associated with.
   */
  thingTypeUID: string
  /**
   * The vendor of the firmware.
   */
  vendor?: string
  /**
   * The model of the firmware.
   */
  model?: string
  /**
   * Whether this firmware is restricted to things with the above model.
   */
  modelRestricted: boolean
  /**
   * The description of the firmware.
   */
  description?: string
  /**
   * The version of the firmware.
   */
  version: string
  /**
   * The prerequisite version of the firmware.
   */
  prerequisiteVersion?: string
  /**
   * The changelog of the firmware.
   */
  changelog?: string
}

export type ThingStatus =
  | 'UNINITIALIZED'
  | 'INITIALIZING'
  | 'UNKNOWN'
  | 'ONLINE'
  | 'OFFLINE'
  | 'REMOVING'
  | 'REMOVED'

export type ThingStatusDetail =
  | 'NONE'
  | 'NOT_YET_READY'
  | 'HANDLER_MISSING_ERROR'
  | 'HANDLER_REGISTERING_ERROR'
  | 'HANDLER_INITIALIZING_ERROR'
  | 'HANDLER_CONFIGURATION_PENDING'
  | 'CONFIGURATION_PENDING'
  | 'COMMUNICATION_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'BRIDGE_OFFLINE'
  | 'FIRMWARE_UPDATING'
  | 'DUTY_CYCLE'
  | 'BRIDGE_UNINITIALIZED'
  | 'GONE'
  | 'DISABLED'

/**
 * Based on org.openhab.core.thing.ThingStatusInfo.
 */
export interface ThingStatusInfo {
  status: ThingStatus
  statusDetail: ThingStatusDetail
  description?: string
}

export type ChannelKind = 'STATE' | 'TRIGGER'

export type AutoUpdatePolicy = 'VETO' | 'DEFAULT' | 'RECOMMENDED'

/**
 * Data transfer object for a Thing Channel.
 * Based on org.openhab.core.io.rest.core.thing.EnrichedChannelDTO.
 */
export interface Channel {
  /**
   * The unique id of the channel, uniquely identifying the channel across all things (not null and not empty).
   */
  uid: string
  /**
   * The id of the channel, uniquely identifying the channel on its thing (not null, not empty).
   */
  id: string
  /**
   * The channel type UID (if a channel type is specified).
   */
  channelTypeUID?: string

  /**
   * The accepted item type of the channel (if specified).
   */
  itemType?: string
  /**
   * The channel kind.
   */
  kind: ChannelKind
  /**
   * The human-readable label of the channel (if set).
   */
  label?: string
  /**
   * The human-readable description of the channel (if set).
   */
  description?: string
  /**
   * The configuration of the channel.
   */
  configuration: Record<string, any>
  /**
   * The properties of the channel.
   */
  properties: Record<string, string>
  /**
   * The default tags of the channel.
   */
  defaultTags: string[]
  autoupdatePolicy?: AutoUpdatePolicy

  /**
   * The items linked to the channel.
   */
  linkedItems?: string[]
}

/**
 * Data transfer object for a Thing.
 * Based on org.openhab.core.io.rest.core.thing.EnrichedThingDTO.
 */
export interface Thing {
  /**
   * The Thing Type UID of the thing (not null and not empty).
   */
  thingTypeUID: string
  /**
   * The UID of the thing (not null and not empty).
   */
  UID: string
  /**
   * The human-readable label of the thing.
   */
  label?: string
  /**
   * The bridge UID (if any bridge) of the thing.
   */
  bridgeUID?: string
  /**
   * The configuration of the thing.
   */
  configuration: Record<string, any>
  /**
   * The properties of the thing.
   */
  properties: Record<string, any>
  /**
   * The phsyical location of the thing.
   */
  location?: string
  /**
   * The semantic (equipment) tag of the thing.
   */
  semanticEquipmentTag?: string

  /**
   * The channels of the thing.
   */
  channels: Channel[]
  /**
   * The status information of the thing.
   */
  statusInfo: ThingStatusInfo
  /**
   * The firmware status of the thing (if any).
   */
  firmwareStatus?: Firmware
  /**
   * Whether the thing is editable.
   */
  editable: boolean
}

/**
 * Response object from the GET `/rest/things/{thingUID}/firmware` endpoint.
 */
export type FirmwareResponse = Firmware[]

/**
 * Response object from the GET `/rest/things/{thingUID}` endpoint.
 */
export type ThingResponse = Thing
