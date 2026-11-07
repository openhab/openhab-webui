import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  scheduleTokenRefresh,
  cancelTokenRefresh,
  TOKEN_CHECK_INTERVAL_MS,
  TOKEN_REFRESH_MAX_RETRY_DELAY_MS,
  TOKEN_REFRESH_TIMEOUT_MS
} from './token-refresh'

const EXPIRES_IN = 3600
const REFRESH_DUE_MS = EXPIRES_IN * 950

/** Simulates a suspended or hibernated device: the wall clock advances, but timers do not. */
function suspend(ms: number) {
  vi.setSystemTime(Date.now() + ms)
}

function setVisibility(hidden: boolean) {
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(hidden)
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('token-refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cancelTokenRefresh()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('refreshes the token after 95% of its lifetime', async () => {
    const refresh = vi.fn<() => Promise<void>>().mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    await vi.advanceTimersByTimeAsync(REFRESH_DUE_MS - TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('refreshes the token promptly after resuming from suspend', async () => {
    const refresh = vi.fn<() => Promise<void>>().mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    await vi.advanceTimersByTimeAsync(60_000)
    suspend(4 * 3600 * 1000)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('refreshes the token when the page becomes visible and the refresh is due', () => {
    const refresh = vi.fn<() => Promise<void>>().mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    setVisibility(false)
    expect(refresh).not.toHaveBeenCalled()

    suspend(REFRESH_DUE_MS)
    setVisibility(false)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('does not refresh the token when the page becomes hidden', () => {
    const refresh = vi.fn<() => Promise<void>>().mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    setVisibility(true)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('schedules the next refresh based on the new token', async () => {
    const refresh = vi.fn<() => Promise<void>>().mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    await vi.advanceTimersByTimeAsync(REFRESH_DUE_MS)
    expect(refresh).toHaveBeenCalledTimes(1)
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    await vi.advanceTimersByTimeAsync(REFRESH_DUE_MS - TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('does not start another refresh while one is in progress', async () => {
    const pending = Promise.withResolvers<void>()
    const refresh = vi.fn<() => Promise<void>>().mockReturnValue(pending.promise)
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS * 2)
    setVisibility(false)
    expect(refresh).toHaveBeenCalledTimes(1)

    pending.resolve()
  })

  it('retries a refresh that does not complete in time', async () => {
    const pending = Promise.withResolvers<void>()
    const refresh = vi.fn<() => Promise<void>>().mockReturnValueOnce(pending.promise).mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)

    // timed out, retried after the initial retry delay
    await vi.advanceTimersByTimeAsync(TOKEN_REFRESH_TIMEOUT_MS + TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(2)
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    // a late failure of the abandoned attempt must not trigger another retry
    pending.reject(new Error('connection reset'))
    await vi.advanceTimersByTimeAsync(TOKEN_REFRESH_TIMEOUT_MS * 2)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('ignores the failure of a refresh superseded by a new token', async () => {
    const pending = Promise.withResolvers<void>()
    const refresh = vi.fn<() => Promise<void>>().mockReturnValue(pending.promise)
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)

    scheduleTokenRefresh(EXPIRES_IN, refresh)
    pending.reject(new Error('network error'))
    await vi.advanceTimersByTimeAsync(REFRESH_DUE_MS - TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('retries a failed refresh with an increasing, bounded delay', async () => {
    const refresh = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('network error'))
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)

    // first retry after 10 s, second one 20 s later
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(3)

    // the delay is capped
    await vi.advanceTimersByTimeAsync(3600 * 1000)
    refresh.mockClear()
    await vi.advanceTimersByTimeAsync(TOKEN_REFRESH_MAX_RETRY_DELAY_MS + TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('recovers once a retried refresh succeeds', async () => {
    const refresh = vi.fn<() => Promise<void>>().mockRejectedValueOnce(new Error('network error')).mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(2)
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    await vi.advanceTimersByTimeAsync(REFRESH_DUE_MS - TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(2)
  })

  it('does not resume refreshing when a pending refresh fails after cancellation', async () => {
    const pending = Promise.withResolvers<void>()
    const refresh = vi.fn<() => Promise<void>>().mockReturnValue(pending.promise)
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    expect(refresh).toHaveBeenCalledTimes(1)

    cancelTokenRefresh()
    pending.reject(new Error('network error'))
    await vi.advanceTimersByTimeAsync(TOKEN_REFRESH_MAX_RETRY_DELAY_MS * 2)
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('stops refreshing when cancelled', async () => {
    const refresh = vi.fn<() => Promise<void>>().mockResolvedValue()
    scheduleTokenRefresh(EXPIRES_IN, refresh)

    cancelTokenRefresh()
    suspend(REFRESH_DUE_MS)
    await vi.advanceTimersByTimeAsync(TOKEN_CHECK_INTERVAL_MS)
    setVisibility(false)

    expect(refresh).not.toHaveBeenCalled()
  })
})
