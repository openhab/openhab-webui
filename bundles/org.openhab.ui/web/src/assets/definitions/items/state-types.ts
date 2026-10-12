import type { ItemType } from '@/assets/item-types.ts'

/**
 * See {@link https://www.openhab.org/javadoc/latest/org/openhab/core/types/state org.openhab.core.types.State}
 */
export enum StateType {
  DateTime = 'DateTime',
  Decimal = 'Decimal',
  HSB = 'HSB',
  OnOff = 'OnOff',
  OpenClosed = 'OpenClosed',
  Percent = 'Percent',
  PlayPause = 'PlayPause',
  Point = 'Point',
  Quantity = 'Quantity',
  Raw = 'Raw',
  RewindFastforward = 'RewindFastforward',
  StringList = 'StringList',
  String = 'String',
  UnDef = 'UnDef',
  UpDown = 'UpDown'
}

const STATE_TYPES_SET = new Set<string>(Object.values(StateType))

export function isStateType(value: string | undefined): value is StateType {
  return typeof value === 'string' && STATE_TYPES_SET.has(value)
}

const ITEM_TYPE_TO_STATE_TYPE: Record<ItemType, StateType> = {
  Call: StateType.StringList,
  Color: StateType.HSB,
  Contact: StateType.OpenClosed,
  DateTime: StateType.DateTime,
  Dimmer: StateType.Percent,
  Group: StateType.UnDef,
  Image: StateType.Raw,
  Location: StateType.Point,
  Number: StateType.Decimal,
  Player: StateType.PlayPause,
  Rollershutter: StateType.Percent,
  String: StateType.String,
  Switch: StateType.OnOff
}

/**
 * Maps an openHAB Item type (e.g. Contact, Dimmer, Number:Temperature) to the corresponding state type.
 *
 * @param {string} itemType the Item type
 * @returns {string} the state type
 */
export function stateTypeForItemType(itemType: ItemType): StateType {
  return ITEM_TYPE_TO_STATE_TYPE[itemType]
}
