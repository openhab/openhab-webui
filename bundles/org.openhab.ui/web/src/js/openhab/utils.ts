import { f7 } from 'framework7-vue'
import { clean as cleanDiacritics } from 'diacritic'

export function normalizeLabel(label: string) {
  return cleanDiacritics(label.normalize('NFKD'))
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^0-9a-z_]/gi, '')
    .replace(/^([0-9])/, '_$1')
}
export function normalizeLabelForThingId(label: string) {
  return cleanDiacritics(label.normalize('NFKD'))
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^0-9a-z_-]/gi, '')
    .replace(/^-+/, '')
}
export function normalizeInput(id: any) {
  const inputElement: HTMLInputElement = document.querySelector(id) as unknown as HTMLInputElement
  inputElement.value = normalizeLabel(inputElement.value.trim())
  inputElement.dispatchEvent(new Event('input'))
}
export function normalizeInputForThingId(id: any) {
  const inputElement: HTMLInputElement = document.querySelector(id) as unknown as HTMLInputElement
  inputElement.value = normalizeLabelForThingId(inputElement.value.trim())
  inputElement.dispatchEvent(new Event('input'))
}
/**
 * Convert a color from HSB to RGB.
 *
 * @param h hue value (0-360)
 * @param s saturation value (0-1)
 * @param b brightness value (0-1)
 * @returns `[r, g, b]` array
 */
export function hsbToRgb(h: number, s: number, b: number) {
  const hsl = f7.utils.colorHsbToHsl(h, s, b)
  return f7.utils.colorHslToRgb(hsl[0], hsl[1], hsl[2])
}
/**
 * A simple hash function based on Java's `String::hashCode()` algorithm.
 *
 * Please note:
 * - This is not a cryptographically secure hash function.
 * - This is sensitive to the order of keys in an object.
 *
 * @param obj
 * @returns a 32-bit hash of the object
 */
export function simpleHash(obj: object | string): string {
  const str = JSON.stringify(obj)
  let hash = 0
  if (str.length === 0) return hash.toString()
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return (hash >>> 0).toString(36)
}

export default {
  normalizeLabel,
  normalizeLabelForThingId,
  normalizeInput,
  normalizeInputForThingId,
  hsbToRgb,
  simpleHash
}
