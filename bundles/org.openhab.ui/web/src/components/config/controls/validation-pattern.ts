const hex2 = `[0-9A-Fa-f]{2}`;
const hex4 = `[0-9A-Fa-f]{4}`;
/**
 * MAC address handler.
 * Supports:
 * - `AA:BB:CC:DD:EE:FF`
 * - `AA-BB-CC-DD-EE-FF`
 * - `AABB.CCDD.EEFF`
 */
export const MacAddress: string = `(?:(?:${hex2}[:\\-]){5}${hex2}|(?:${hex4}\\.){2}${hex4})`
export const MacAddressCompiled: RegExp = new RegExp(`^${MacAddress}$`)

const ipv4Addr = `(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])`
const ipv6Addr = `(?:(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|:(?::[A-Fa-f0-9]{1,4}){1,7}|(?:[A-Fa-f0-9]{1,4}:){1,6}:[A-Fa-f0-9]{1,4}|::)`
/**
 * "Pure" IP address handler.
 * Supports IPv4 and IPv6 addresses without port suffix.
 */
export const IpAddress: string = `(?:${ipv4Addr}|${ipv6Addr})`
export const IpAddressCompiled: RegExp = new RegExp(`^${IpAddress}$`)

// hostIpv4 matches both a.b.c.d and 1.2.3.4 so covers ipv4 address pattern as well
const hostIpv4 = `(?:[A-Za-z0-9](?:[A-Za-z0-9\\-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9\\-]{0,61}[A-Za-z0-9])?)*)`
const http = `(?:[Hh][Tt][Tt][Pp][Ss]?:\\/\\/)?`
const host = `(?:${hostIpv4}|(?:\\[${ipv6Addr}\\]))`
const port = `(?::(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d{2}|6[0-4]\\d{3}|[1-5]\\d{4}|\\d{1,4}))?`
const rest = `(?:\\/[^\\s]*?)?`
/**
 * Network address and URL handler (these are synonyms).
 */
export const NetworkAddress: string = `${http}${host}${port}${rest}`
export const NetworkAddressCompiled: RegExp = new RegExp(`^${NetworkAddress}$`)
