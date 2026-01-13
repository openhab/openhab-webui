import { request } from 'framework7'
import { client } from '@/api/client.gen'

import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from './auth'

class ApiError extends Error {
  constructor(message, response) {
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
    throw new ApiError('Server error', response)
  } else if (response.status === 400) {
    throw new ApiError('Bad request', response)
  } else if (response.status === 404) {
    throw new ApiError('Not Found', response)
  }
  return response
})

// Wrapper to convert Framework7 promises to standard promises

async function wrapPromise(f7promise) {
  return new Promise((resolve, reject) => {
    f7promise.then((data) => resolve(data.data)).catch((err) => reject(err.message || err.status))
  })
}

request.setup({
  xhrFields: { withCredentials: true },
  beforeSend(xhr) {
    if (getAccessToken() && xhr.requestParameters.method !== 'HEAD') {
      if (getTokenInCustomHeader()) {
        xhr.setRequestHeader('X-OPENHAB-TOKEN', getAccessToken())
      } else {
        xhr.setRequestHeader('Authorization', 'Bearer ' + getAccessToken())
      }
    }
    if (getBasicCredentials()) {
      const creds = getBasicCredentials()
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(creds.id + ':' + creds.password))
    }
  }
})

export default {
  async request(parameters) {
    return request(parameters)
  },
  async get(uri, data) {
    return wrapPromise(request.json(uri, data))
  },
  async getPlain(uri, data, contentType, responseType, headers) {
    return wrapPromise(
      request({
        method: 'GET',
        url: uri,
        data,
        processData: false,
        contentType: contentType || 'text/plain',
        xhrFields: typeof responseType !== 'undefined' ? { responseType } : null,
        headers
      })
    )
  },
  async post(uri, data, dataType) {
    return wrapPromise(request.postJSON(uri, data, dataType))
  },
  async postPlain(uri, data, dataType, contentType, headers) {
    return wrapPromise(
      request({
        method: 'POST',
        url: uri,
        data,
        processData: false,
        contentType: contentType || 'text/plain',
        dataType: dataType || 'application/json',
        headers
      })
    )
  },
  async put(uri, data) {
    return wrapPromise(
      request({
        method: 'PUT',
        url: uri,
        data: JSON.stringify(data),
        processData: false,
        // dataType: 'json',
        contentType: 'application/json'
      })
    )
  },
  async putPlain(uri, data, dataType, contentType) {
    return wrapPromise(
      request({
        method: 'PUT',
        url: uri,
        data,
        processData: false,
        // dataType: 'json',
        contentType: contentType || 'text/plain',
        dataType: dataType || 'application/json'
      })
    )
  },
  async head(uri) {
    return wrapPromise(
      request({
        method: 'HEAD',
        url: uri
      })
    )
  },
  async delete(uri, data) {
    return wrapPromise(
      request({
        method: 'DELETE',
        url: uri,
        processData: false,
        // dataType: 'json',
        contentType: 'application/json'
      })
    )
  }
}
