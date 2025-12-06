// type definitions for DTOs returned from /rest/actions endpoints

import type { ConfigDescriptionParameter } from '@/types/openhab/config-descriptions'

/**
 * Data transfer object for a Thing Actions.
 * Based on org.openhab.core.automation.rest.internal.ThingActionsResource.ThingActionDTO.
 */
export interface ThingAction {
  actionUid: string;
  label: string;
  description?: string;
  visibility?: 'VISIBLE' | 'HIDDEN' | 'EXPERT';
  inputs: any[];
  inputConfigDescriptions?: ConfigDescriptionParameter[];
  outputs?: any[];
}

/**
 * Response object from the `/rest/actions/{thingUID}` endpoint.
 */
export type ThingActionsResponse = ThingAction[]
