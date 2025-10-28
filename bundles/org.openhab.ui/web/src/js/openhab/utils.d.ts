declare namespace _default {
    function normalizeLabel(label: any): any;
    function normalizeLabelForThingId(label: any): any;
    function normalizeInput(id: any): void;
    function normalizeInputForThingId(id: any): void;
    /**
     * Convert a color from HSB to RGB.
     *
     * @param h hue value (0-360)
     * @param s saturation value (0-1)
     * @param b brightness value (0-1)
     * @returns {number[]} [r, g, b] array
     */
    function hsbToRgb(h: any, s: any, b: any): number[];
}
export default _default
