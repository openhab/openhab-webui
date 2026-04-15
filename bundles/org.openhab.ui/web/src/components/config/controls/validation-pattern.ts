const hex2 = `[0-9A-Fa-f]{2}`
const hex4 = `[0-9A-Fa-f]{4}`
const hex12 = `[0-9A-Fa-f]{12}`
/**
 * MAC address handler.
 * Supports:
 * - `AA:BB:CC:DD:EE:FF`
 * - `AA-BB-CC-DD-EE-FF`
 * - `AABB.CCDD.EEFF`
 * - `AABBCCDDEEFF`
 */
export const MacAddress: string = `(?:(?:${hex2}[:\\-]){5}${hex2}|(?:${hex4}\\.){2}${hex4}|${hex12})`
export const MacAddressCompiled: RegExp = new RegExp(`^${MacAddress}$`)

// const ipv4Addr = `(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])`
const ipv6Addr = `(?:(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|:(?::[A-Fa-f0-9]{1,4}){1,7}|(?:[A-Fa-f0-9]{1,4}:){1,6}:[A-Fa-f0-9]{1,4}|::)`
const hostLabel = `[A-Za-z0-9](?:[A-Za-z0-9\\-]{0,61}[A-Za-z0-9])?`
const hostIpv4 = `(?:${hostLabel}(?:\\.${hostLabel})*)`
const host = `(?:${hostIpv4}|\\[${ipv6Addr}\\])`
const http = `[Hh][Tt][Tt][Pp][Ss]?:\\/\\/`
const port = `(?::(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d{2}|6[0-4]\\d{3}|[1-5]\\d{4}|\\d{1,4}))?`
const rest = `(?:\\/[^\\s]*)?`
const fullUrl = `${http}${host}${port}${rest}`
const hostWithPort = `${host}${port}`

/**
 * Network address and URL handler.
 * - With scheme: full URL allowed
 * - Without scheme: host + optional port only (NO path)
 */
export const NetworkAddress: string = `(?:${fullUrl}|${hostWithPort})`
export const NetworkAddressCompiled: RegExp = new RegExp(`^${NetworkAddress}$`)

/**
 * Full URL only — requires scheme, host, optional port, optional path
 */
export const FullUrl: string = fullUrl
export const FullUrlCompiled: RegExp = new RegExp(`^${FullUrl}$`)
