/**
 * Keeps the access token fresh.
 *
 * The time a refresh is due is tracked against the wall clock and checked periodically, instead of scheduling a single
 * `setTimeout` for the token lifetime: browser timers run on a monotonic clock that does not advance while the device
 * is suspended or hibernated, so such a timer fires long after the token has expired after a resume. Until then, the UI
 * keeps sending the expired token and e.g. WebSocket connections are rejected.
 */

/** Interval for checking whether a refresh is due, also the initial delay for retrying a failed refresh. */
export const TOKEN_CHECK_INTERVAL_MS = 10_000
/** Upper bound for the retry delay, so a revoked session does not flood the server with refresh requests. */
export const TOKEN_REFRESH_MAX_RETRY_DELAY_MS = 300_000
/** Time after which a pending refresh is considered failed, e.g. if its connection did not survive a suspend. */
export const TOKEN_REFRESH_TIMEOUT_MS = 30_000

/** Share of the token lifetime after which it is refreshed, i.e. 3 minutes before a 1-hour token expires. */
const REFRESH_AT_LIFETIME_SHARE = 0.95

let refreshDueTime: number | null = null
let retryDelay = TOKEN_CHECK_INTERVAL_MS
let refreshFn: (() => Promise<unknown>) | null = null
/** Identifies the current refresh attempt, so outcomes of abandoned or superseded attempts are ignored. */
let attempt = 0
let attemptStartTime: number | null = null
let checkTimer: ReturnType<typeof setInterval> | null = null

function refreshFailed(): void {
  attempt++
  attemptStartTime = null
  refreshDueTime = Date.now() + retryDelay
  retryDelay = Math.min(retryDelay * 2, TOKEN_REFRESH_MAX_RETRY_DELAY_MS)
}

function checkTokenRefresh(): void {
  if (refreshFn === null || refreshDueTime === null) return
  if (attemptStartTime !== null) {
    if (Date.now() - attemptStartTime < TOKEN_REFRESH_TIMEOUT_MS) return
    refreshFailed()
  }
  if (Date.now() < refreshDueTime) return

  const currentAttempt = ++attempt
  attemptStartTime = Date.now()
  refreshFn().then(
    () => {
      if (currentAttempt === attempt) attemptStartTime = null
    },
    () => {
      if (currentAttempt === attempt) refreshFailed()
    }
  )
}

function onVisibilityChange(): void {
  if (!document.hidden) checkTokenRefresh()
}

/**
 * Schedules the refresh of a newly obtained access token.
 *
 * @param expiresIn lifetime of the access token in seconds
 * @param refresh function refreshing the access token; it has to call this function again on success, and reject on failure
 */
export function scheduleTokenRefresh(expiresIn: number, refresh: () => Promise<unknown>): void {
  attempt++
  attemptStartTime = null
  refreshDueTime = Date.now() + expiresIn * 1000 * REFRESH_AT_LIFETIME_SHARE
  retryDelay = TOKEN_CHECK_INTERVAL_MS
  refreshFn = refresh
  if (checkTimer === null) {
    checkTimer = setInterval(checkTokenRefresh, TOKEN_CHECK_INTERVAL_MS)
    // refresh right away when the app becomes visible again, as timers of hidden pages may be throttled
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
}

/**
 * Stops refreshing the access token, e.g. when the session is closed.
 */
export function cancelTokenRefresh(): void {
  if (checkTimer !== null) {
    clearInterval(checkTimer)
    checkTimer = null
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
  attempt++
  attemptStartTime = null
  refreshDueTime = null
  retryDelay = TOKEN_CHECK_INTERVAL_MS
  refreshFn = null
}
