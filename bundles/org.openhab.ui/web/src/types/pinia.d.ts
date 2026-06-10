import 'pinia'

declare module 'pinia' {
  export interface DefineSetupStoreOptions<Id extends string, S, G, A> {
    persistTo?: 'local' | 'server'
  }

  export interface DefineStoreOptionsInPlugin<Id extends string, S, G, A> {
    persistTo?: 'local' | 'server'
  }

  export interface PiniaCustomProperties {
    isReady?: Promise<void>
  }
}
