// type definitions for DTOs returned from /rest/things endpoints

export interface Firmware {
  /**
   * The Thing Type UID this firmware is associated with.
   */
  thingTypeUID: string;
  /**
   * The vendor of the firmware.
   */
  vendor?: string;
  /**
   * The model of the firmware.
   */
  model?: string;
  /**
   * Whether this firmware is restricted to things with the above model.
   */
  modelRestricted: boolean
  /**
   * The description of the firmware.
   */
  description?: string;
  /**
   * The version of the firmware.
   */
  version: string;
  /**
   * The prerequisite version of the firmware.
   */
  prerequisiteVersion?: string;
  /**
   * The changelog of the firmware.
   */
  changelog?: string;
}

/**
 * Response object from the `/rest/things/{thingUID}/firmware` endpoint.
 */
export type FirmwareResponse = Firmware[]
