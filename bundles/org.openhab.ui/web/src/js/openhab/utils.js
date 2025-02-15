import Framework7 from 'framework7'
import diacritic from 'diacritic'

export default {
  normalizeLabel: (label) => {
    return diacritic.clean(label.normalize('NFKD')).trim().replace(/\s+/g, '_').replace(/[^0-9a-z_]/gi, '').replace(/^([0-9])/, '_$1')
  },
  normalizeLabelForThingId: (label) => {
    return diacritic.clean(label.normalize('NFKD')).trim().replace(/\s+/g, '-').replace(/[^0-9a-z_-]/gi, '').replace(/^-+/, '')
  },
  normalizeInput (id) {
    const inputElement = document.querySelector(id)
    inputElement.value = this.normalizeLabel(inputElement.value.trim())
    inputElement.dispatchEvent(new Event('input'))
  },
  normalizeInputForThingId (id) {
    const inputElement = document.querySelector(id)
    inputElement.value = this.normalizeLabelForThingId(inputElement.value.trim())
    inputElement.dispatchEvent(new Event('input'))
  },
  /**
   * Convert a color from HSB to RGB.
   *
   * @param h hue value (0-360)
   * @param s saturation value (0-1)
   * @param b brightness value (0-1)
   * @returns {number[]} [r, g, b] array
   */
  hsbToRgb (h, s, b) {
    const hsl = Framework7.utils.colorHsbToHsl(h, s, b)
    return Framework7.utils.colorHslToRgb(hsl[0], hsl[1], hsl[2])
  }
}
