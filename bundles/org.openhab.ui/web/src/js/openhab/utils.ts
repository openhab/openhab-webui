import { f7 } from 'framework7-vue'

import { clean as cleanDiacritics } from 'diacritic'

export default {
  normalizeLabel: (label: string) => {
    return cleanDiacritics(label.normalize('NFKD'))
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^0-9a-z_]/gi, '')
      .replace(/^([0-9])/, '_$1')
  },
  normalizeLabelForThingId: (label: string) => {
    return cleanDiacritics(label.normalize('NFKD'))
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^0-9a-z_-]/gi, '')
      .replace(/^-+/, '')
  },
  normalizeInput(id: any) {
    const inputElement: HTMLInputElement = document.querySelector(id) as unknown as HTMLInputElement
    inputElement.value = this.normalizeLabel(inputElement.value.trim())
    inputElement.dispatchEvent(new Event('input'))
  },
  normalizeInputForThingId(id: any) {
    const inputElement: HTMLInputElement = document.querySelector(id) as unknown as HTMLInputElement
    inputElement.value = this.normalizeLabelForThingId(inputElement.value.trim())
    inputElement.dispatchEvent(new Event('input'))
  },
  /**
   * Convert a color from HSB to RGB.
   *
   * @param h hue value (0-360)
   * @param s saturation value (0-1)
   * @param b brightness value (0-1)
   * @returns `[r, g, b]` array
   */
  hsbToRgb(h: number, s: number, b: number) {
    const hsl = f7.utils.colorHsbToHsl(h, s, b)
    return f7.utils.colorHslToRgb(hsl[0], hsl[1], hsl[2])
  }
}
