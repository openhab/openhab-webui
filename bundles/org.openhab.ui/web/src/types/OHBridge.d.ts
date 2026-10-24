// Set by the openHAB iOS and Android apps. See src/js/host-bridge.
interface OHBridgePort {
  postMessage(json: string): void
  onmessage: ((event: { data: string }) => void) | null
  readonly info: import('@/js/host-bridge/protocol').HostInfo
}

interface Window {
  OHBridge?: OHBridgePort
}
