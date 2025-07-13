import { request } from 'framework7'

import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from './auth'

async function wrapPromise (f7promise) {
  return new Promise((resolve, reject) => {
    f7promise
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.message || err.status))
  })
}

request.setup({
  xhrFields: { withCredentials: true },
  beforeSend (xhr) {
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
  async get (uri, data) {
    return wrapPromise(request.json(uri, data))
  },
  getPlain (uri, data, contentType, responseType, headers) {
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
  post (uri, data, dataType) {
    return wrapPromise(request.postJSON(uri, data, dataType))
  },
  postPlain (uri, data, dataType, contentType, headers) {
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
  put (uri, data) {
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
  putPlain (uri, data, dataType, contentType) {
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
  head (uri) {
    return wrapPromise(
      request({
        method: 'HEAD',
        url: uri
      })
    )
  },
  delete (uri, data) {
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
