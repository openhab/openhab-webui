import { pt } from '../helpers'

export default [
  pt('modules', 'Modules', 'Modules to display').o([
    { value: 'wheel', label: 'Color wheel' },
    { value: 'sb-spectrum', label: 'Saturation/brightness spectrum' },
    { value: 'hue-slider', label: 'Hue slider' },
    { value: 'hs-spectrum', label: 'Hue/saturation spectrum' },
    { value: 'brightness-slider', label: 'Brightness spectrum' },
    { value: 'rgb-sliders', label: 'RGB sliders' },
    { value: 'hsb-sliders', label: 'HSB sliders' },
    { value: 'rgb-bars', label: 'RGB bars' },
    { value: 'palette', label: 'Palette' },
    { value: 'current-color', label: 'Current color' },
    { value: 'initial-current-colors', label: 'Initial current colors' }
  ], true, true)
]
