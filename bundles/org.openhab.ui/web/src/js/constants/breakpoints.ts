/**
 * Application Responsive Breakpoints (in pixels)
 */
export const BREAKPOINTS = {
  /** Narrow mobile / small phones (480px) */
  XS: 480,
  /** Mobile wide / small tablets (600px) */
  SM: 600,
  /** Tablet / F7 Master-Detail & Left Panel (960px) */
  MD: 960,
  /** Desktop / Multi-column lists & Right Panel (1280px) */
  LG: 1280,
  /** Wide desktop / Multi-column settings menu (1450px) */
  XL: 1450
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS
