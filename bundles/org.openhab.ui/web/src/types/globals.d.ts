import type { Device } from 'framework7'
import type { Composer } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $device: Device
    $t: Composer['t']
    $fullscreen: typeof import('vue-fullscreen').api
  }
}
declare namespace Intl {
  function supportedValuesOf(key: 'timeZone'): string[]
}
