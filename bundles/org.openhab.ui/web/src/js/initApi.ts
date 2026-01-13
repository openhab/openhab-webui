import { client } from '@/api/client.gen'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from '@/js/openhab/auth'

class ApiError extends Error {
  public response: Response

  constructor(message: string, response: Response) {
    super(message + ` (status: ${response?.status}, url: ${response?.url})`)

    this.name = 'ApiError'
    this.response = response
  }
}

client.interceptors.request.use((request, options) => {
  if (getAccessToken()) {
    if (getTokenInCustomHeader()) {
      request.headers.set('X-OPENHAB-TOKEN', getAccessToken())
    } else {
      request.headers.set('Authorization', 'Bearer ' + getAccessToken())
    }
  }
  if (getBasicCredentials()) {
    const creds = getBasicCredentials()
    request.headers.set('Authorization', 'Basic ' + btoa(creds.id + ':' + creds.password))
  }
  return request
})

client.interceptors.response.use((response) => {
  if (response.status >= 400) {
    const message =
      response.status >= 500
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
