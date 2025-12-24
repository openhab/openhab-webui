import { client } from '@/api/client.gen'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from '@/js/openhab/auth'

class ApiError extends Error {
  public response: Response

  constructor (message : string, response: Response) {
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
  if (response.status >= 500 && response.status <= 599) {
    throw new ApiError('Server error',  response)
  } else if (response.status === 400) {
    throw new ApiError('Bad request',  response)
  } else if (response.status === 404) {
    throw new ApiError('Not Found',  response)
  } else if (response.status >= 400) {
    throw new ApiError('Client error',  response)
  }

  return response
})