export interface RuntimeInfo {
  version: string
  buildString?: string
}

export interface Link {
  type: string
  url: string
}

export interface RootResponse {
  version: string
  locale: string
  measurementSystem: 'SI' | 'US'
  timezone: string
  runtimeInfo: RuntimeInfo
  links: Link[]
}