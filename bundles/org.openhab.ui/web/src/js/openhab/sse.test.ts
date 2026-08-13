import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import sse from './sse'

vi.mock('event-source-polyfill', () => {
  class MockEventSource {
    url: string
    options: any
    readyState: number = 0 // CONNECTING
    listeners: Record<string, ((...args: any[]) => void)[]> = {}
    onmessage: ((ev: MessageEvent) => void) | null = null
    onopen: ((ev: Event) => void) | null = null
    onerror: ((ev: Event) => void) | null = null

    constructor(url: string, options?: any) {
      this.url = url
      this.options = options
      if (!(global as any).mockEventSourceInstances) {
        ;(global as any).mockEventSourceInstances = []
      }
      ;(global as any).mockEventSourceInstances.push(this)
    }

    addEventListener(type: string, listener: any) {
      if (!this.listeners[type]) this.listeners[type] = []
      this.listeners[type].push(listener)
    }

    removeEventListener(type: string, listener: any) {
      if (!this.listeners[type]) return
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener)
    }

    close() {
      this.readyState = 2 // CLOSED
    }
  }

  return {
    EventSourcePolyfill: MockEventSource,
    NativeEventSource: MockEventSource
  }
})

vi.mock('./auth', () => ({
  getAccessToken: () => 'mock-token',
  getTokenInCustomHeader: () => false,
  getBasicCredentials: () => null
}))

describe('SSE Connection and Reconnect', () => {
  beforeEach(() => {
    ;(global as any).mockEventSourceInstances = []
    vi.useFakeTimers()
    global.fetch = vi.fn().mockResolvedValue({ status: 200 })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  function getInstances(): any[] {
    return (global as any).mockEventSourceInstances || []
  }

  it('should track logical connection separately and close all underlying connections', async () => {
    // 1. Establish SSE connection
    const conn = sse.connect(
      '/rest/events',
      [],
      () => {},
      () => {}
    )
    const instances = getInstances()
    expect(instances.length).toBe(1)
    const es1 = instances[0]
    expect(conn.currentEventSource).toBe(es1)

    // Simulate connection failure (readyState = 2, triggers onerror)
    es1.readyState = 2
    if (es1.onerror) {
      es1.onerror({} as Event)
    }

    // Wait for the fetch and verify reconnect schedules a timeout
    await Promise.resolve() // let fetch promise resolve
    expect(global.fetch).toHaveBeenCalledWith('/rest/events', expect.any(Object))

    // 2. Reconnection timer should be set for 1 second
    // Advance timers by 1 second to trigger the reconnect
    await vi.advanceTimersByTimeAsync(1000)

    // A new EventSource should have been instantiated on reconnect
    expect(instances.length).toBe(2)
    const es2 = instances[1]
    expect(conn.currentEventSource).toBe(es2)

    // 3. Call close on the logical handle
    sse.close(conn)

    // Both underlying EventSources should end up closed (readyState === 2)
    expect(es1.readyState).toBe(2)
    expect(es2.readyState).toBe(2)
    expect(conn.closed).toBe(true)
    expect(conn.currentEventSource).toBeNull()
  })

  it('should cancel pending reconnect and not spawn new connection if closed', async () => {
    // 1. Establish SSE connection
    const conn = sse.connect(
      '/rest/events',
      [],
      () => {},
      () => {}
    )
    const instances = getInstances()
    expect(instances.length).toBe(1)
    const es1 = instances[0]

    // Simulate connection failure
    es1.readyState = 2
    if (es1.onerror) {
      es1.onerror({} as Event)
    }

    await Promise.resolve()

    // 2. Close the logical connection before the reconnect timer fires
    sse.close(conn)
    expect(conn.closed).toBe(true)

    // 3. Advance timers past the 1 second reconnect delay
    await vi.advanceTimersByTimeAsync(1000)

    // No new event source should be instantiated
    expect(instances.length).toBe(1)
  })
})
