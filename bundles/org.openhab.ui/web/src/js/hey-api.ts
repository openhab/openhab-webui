import { client } from '@/api/client.gen'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from '@/js/openhab/auth'

client.setConfig({
  parseAs: 'json',
  throwOnError: true
})

export class ApiError extends Error {
  public response: Response

  constructor(message: string, response: Response) {
    super(message)
    this.name = 'ApiError'
    this.response = response
  }

  /**
   * Creates a "debug string" by appending the status code and the URL to the error message.
   *
   * @returns {string} the debug string.
   */
  toDebugString(): string {
    return `${this.message} (status: ${this.response?.status}, url: ${this.response?.url})`
  }
}

/**
 * Returns the error message from an error object.
 *
 * @param err the error object.
 * @param debug whether to return the debug string if available.
 * @returns {string} the error message.
 */
export function getErrorMessage(err: any, debug: boolean = false): string {
  return debug && err.toDebugString ? err.toDebugString() : err.toString()
}

client.interceptors.request.use((request, options) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    if (getTokenInCustomHeader()) {
      request.headers.set('X-OPENHAB-TOKEN', accessToken)
    } else {
      request.headers.set('Authorization', 'Bearer ' + accessToken)
    }
  }
  const basicCredentials = getBasicCredentials()
  if (basicCredentials) {
    request.headers.set('Authorization', 'Basic ' + btoa(basicCredentials.id + ':' + basicCredentials.password))
  }
  return request
})

client.interceptors.response.use((response) => {
  if (response.status >= 400) {
    const message = response.statusText
      ? response.statusText
      : response.status >= 500
        ? 'Server error'
        : response.status === 404
          ? 'Not Found'
          : response.status === 400
            ? 'Bad request'
            : 'Client error'
    throw new ApiError(message, response)
  }
  return response
})
