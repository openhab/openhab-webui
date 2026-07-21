import type { Device } from 'framework7'
import type { Composer } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $device: Device
    $t: Composer['t']
    $fullscreen: typeof import('vue-fullscreen').api
    $f7dim: {
      width: number
      height: number
    }
  }
}

declare global {
  namespace Intl {
    function supportedValuesOf(key: 'timeZone'): string[]
  }
}
