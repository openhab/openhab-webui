declare namespace _default {
  function connect(
    path: string,
    topics: null,
    messageCallback: (evt: MessageEvent) => void,
    errorCallback: () => void,
    heartbeatCallback: (tbd: boolean) => void
  ): any
  function connectStateTracker(
    path: string,
    readyCallback: (data: any) => void,
    updateCallback: (data: any) => void,
    errorCallback: () => void,
    heartbeatCallback: (healthy: boolean) => void
  ): any
  function close(
    client: EventSource & { clearKeepalive?: () => void },
    callback?: (() => void) | null
  ): void
}
export default _default
