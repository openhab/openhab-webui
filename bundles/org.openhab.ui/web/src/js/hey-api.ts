import { client } from '@/api/client.gen'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from '@/js/openhab/auth'

client.setConfig({
  parseAs: 'json'
})

class ApiError extends Error {
  public response: Response

  constructor(message: string, response: Response) {
    super(message + ` (status: ${response?.status}, url: ${response?.url})`)

    this.name = 'ApiError'
    this.response = response
  }
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
