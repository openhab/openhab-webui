import Framework7 from 'framework7/framework7-lite.esm.bundle.js'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from './auth'

function wrapPromise (f7promise) {
  return new Promise((resolve, reject) => {
    f7promise
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.message || err.status))
  })
}

Framework7.request.setup({
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
  get (uri, data) {
    return wrapPromise(Framework7.request.promise.json(uri, data))
  },
  getPlain (uri, data, contentType, responseType) {
    return wrapPromise(Framework7.request.promise({
      method: 'GET',
      url: uri,
      data,
      processData: false,
      contentType: contentType || 'text/plain',
      xhrFields: typeof responseType !== 'undefined' ? { responseType: responseType } : null
    }))
  },
  post (uri, data, dataType) {
    return wrapPromise(Framework7.request.promise.postJSON(uri, data, dataType))
  },
  postPlain (uri, data, dataType, contentType) {
    return wrapPromise(Framework7.request.promise({
      method: 'POST',
      url: uri,
      data,
      processData: false,
      contentType: contentType || 'text/plain',
      dataType: dataType || 'application/json'
    }))
  },
  put (uri, data) {
    return wrapPromise(Framework7.request.promise({
      method: 'PUT',
      url: uri,
      data: JSON.stringify(data),
      processData: false,
      // dataType: 'json',
      contentType: 'application/json'
    }))
  },
  putPlain (uri, data, dataType, contentType) {
    return wrapPromise(Framework7.request.promise({
      method: 'PUT',
      url: uri,
      data,
      processData: false,
      // dataType: 'json',
      contentType: contentType || 'text/plain',
      dataType: dataType || 'application/json'
    }))
  },
  head (uri) {
    return wrapPromise(Framework7.request.promise({
      method: 'HEAD',
      url: uri
    }))
  },
  delete (uri, data) {
    return wrapPromise(Framework7.request.promise({
      method: 'DELETE',
      url: uri,
      processData: false,
      // dataType: 'json',
      contentType: 'application/json'
    }))
  }
}
