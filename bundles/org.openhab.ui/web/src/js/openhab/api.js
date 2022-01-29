import Framework7 from 'framework7/framework7-lite.esm.bundle.js'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from './auth'

function wrapPromise (f7promise) {
  return new Promise((resolve, reject) => {
    f7promise
      .then((data) => resolve(data.data))
      .catch((err) => reject(err.message || err.status))
  })
}

function basedURI (uri) {
  if (uri.charAt(0) === '/') {
    if (window.document.baseURI.slice(-1) === '/') {
      return window.document.baseURI.slice(0, -1) + uri
    } else return window.document.baseURI + uri
  } else return uri
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
  getPlain (uri, data, contentType) {
    return wrapPromise(Framework7.request.promise({
      method: 'GET',
      url: basedURI(uri),
      data,
      processData: false,
      contentType: contentType || 'text/plain'
    }))
  },
  post (uri, data, dataType) {
    return wrapPromise(Framework7.request.promise.postJSON(basedURI(uri), data, dataType))
  },
  postPlain (uri, data, dataType, contentType) {
    return wrapPromise(Framework7.request.promise({
      method: 'POST',
      url: basedURI(uri),
      data,
      processData: false,
      contentType: contentType || 'text/plain',
      dataType: dataType || 'application/json'
    }))
  },
  put (uri, data) {
    return wrapPromise(Framework7.request.promise({
      method: 'PUT',
      url: basedURI(uri),
      data: JSON.stringify(data),
      processData: false,
      // dataType: 'json',
      contentType: 'application/json'
    }))
  },
  putPlain (uri, data, dataType, contentType) {
    return wrapPromise(Framework7.request.promise({
      method: 'PUT',
      url: basedURI(uri),
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
      url: basedURI(uri)
    }))
  },
  delete (uri, data) {
    return wrapPromise(Framework7.request.promise({
      method: 'DELETE',
      url: basedURI(uri),
      processData: false,
      // dataType: 'json',
      contentType: 'application/json'
    }))
  }
}
