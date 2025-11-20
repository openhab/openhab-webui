export enum VisibleTo {
  role_administrator = 'role:administrator',
  role_user = 'role:user'
}

export interface Config {
  layerName?: string
  preload?: boolean
  visible?: string
  visibleTo?: VisibleTo
}
