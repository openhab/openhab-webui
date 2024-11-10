import Framework7 from 'framework7'
import diacritic from 'diacritic'

export default {
  normalizeLabel: (label) => {
    return diacritic.clean(label.normalize('NFKD')).replace(/\s+/g, '_').replace(/[^0-9a-z_]/gi, '')
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
