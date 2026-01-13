import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

export const useThemeStore = defineStore('theme', () => {
  // State
  const ohVariables = ref(new Map<string, string>())

  // Actions
  function buildCache() {
    ohVariables.value.clear()

    const documentStyle = getComputedStyle(document.documentElement)

    const dummyColorElement = document.createElement('div')
    document.body.appendChild(dummyColorElement)

    for (let i = 0; i < documentStyle.length; i++) {
      const varName = documentStyle[i]
      if (varName.startsWith('--oh')) {
        let varValue = documentStyle.getPropertyValue(varName).trim()
        if (varValue.startsWith('oklch')) {
          dummyColorElement.style.setProperty('color', varValue)
          varValue = getComputedStyle(dummyColorElement).color
          varValue = oklchToHex(varValue)
        }
        ohVariables.value.set(varName, varValue)
      }
    }

    document.body.removeChild(dummyColorElement)
  }

  // Getters
  function getVar(varName: string): string | undefined {
    return ohVariables.value.get(varName)
  }

  function getVarRGB(varName: string): string | undefined {
    const varValue = getVar(varName);
    if (varValue) {
      // Extract the RGB values from the hex color code
      const r = parseInt(varValue.slice(1, 3), 16);
      const g = parseInt(varValue.slice(3, 5), 16);
      const b = parseInt(varValue.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    }
    return undefined;
  }

  const renderLogo = computed(() => {
    let logoUrl = getVar('--oh-logo');
    const darkMode = useUIOptionsStore().getDarkMode();
    const ohLogoDark = '/images/openhab-logo-white.svg';
    const ohLogoLight = '/images/openhab-logo.svg';
    // Inline style for the branding string - prevent any user defined CSS from interfering
    const inlineStyle = "text-align: center;" + // allow custom theme to override alignment
      "width: 196px !important;" +
      "height: auto !important;" +
      "margin: 0 !important;" +
      "font-size: small;" +
      "color: var(--oh-theme-color) !important;" +
      "display: block !important;" +
      "visibility: visible !important;" +
      "opacity: 1 !important;" +
      "content-visibility: visible !important;" +
      "line-height: .8 !important;";
    let ohBrandingString = '';

    if (!logoUrl) {
      if (darkMode === 'dark') {
        logoUrl = ohLogoDark;
      } else {
        logoUrl = ohLogoLight;
      }
    } else {
      ohBrandingString = `<p class="openhab-branding-string" style="${inlineStyle}">powered by openHAB</p>`;
    }

    return `<img src="${logoUrl}" />` + ohBrandingString;
  })

  /**
   * Convert OKLCH string to Hex
   * @param {string} oklchString - OKLCH color string (e.g., "oklch(70% 0.15 30)" or "oklch(0.7 0.15 30deg)")
   * @returns {string} Hex color string (e.g., "#ff5733")
   */
  function oklchToHex(oklchString: string) {
    // Parse OKLCH string
    const namedRegex = /oklch\((?<l>\d+(?:\.\d+)?)\s+(?<c>\d+(?:\.\d+)?)\s+(?<h>none|\d+(?:\.\d+)?)(?:\s+\/\s+(?<a>\d+(?:\.\d+)?))?\)/;

    const matchResult = oklchString.match(namedRegex)
    if (!matchResult) {
      console.warn(`Invalid OKLCH color string: ${oklchString}`);
      return '#000000'; // Return black for invalid input
    }

    let { l, c, h, t } = matchResult.groups;

    l = parseFloat(l);
    c = parseFloat(c);
    h = h === 'none' ? 0 : parseFloat(h);
    t = t ? parseFloat(t) : 1.0;

    // Convert percentage lightness to 0-1 range
    if (oklchString.includes('%')) {
      l = l / 100;
    }

    // Convert percentage lightness to 0-1 range
    if (oklchString.includes('%')) {
      l = l / 100;
    }

    // Convert OKLCH to OKLAB
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // Convert OKLAB to linear LMS
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    // Convert linear LMS to linear RGB
    let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let b_rgb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    // Convert linear RGB to sRGB
    r = linearToSrgb(r);
    g = linearToSrgb(g);
    b_rgb = linearToSrgb(b_rgb);

    // Clamp and convert to 8-bit
    r = Math.max(0, Math.min(255, Math.round(r * 255)));
    g = Math.max(0, Math.min(255, Math.round(g * 255)));
    b_rgb = Math.max(0, Math.min(255, Math.round(b_rgb * 255)));

    // Convert to hex
    return '#' + [r, g, b_rgb].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function linearToSrgb(val) {
    // Clamp to valid range first
    val = Math.max(0, Math.min(1, val));

    if (val <= 0.0031308) {
      return 12.92 * val;
    }
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  }

  return {
    ohVariables,
    getVar,
    getVarRGB,
    buildCache,
    renderLogo
  }
})
