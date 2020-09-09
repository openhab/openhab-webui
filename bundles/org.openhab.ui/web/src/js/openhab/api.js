import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

let accessToken = null

function wrapPromise (f7promise) {
  return new Promise((resolve, reject) => {
    f7promise
      .then((data) => resolve(data.data, data.status, data.xhr))
      .catch((err) => reject(err.message, err.status, err.xhr))
  })
}

Framework7.request.setup({
  xhrFields: { withCredentials: true },
  beforeSend (xhr) {
    if (accessToken) {
      if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) {
        xhr.setRequestHeader('X-OPENHAB-TOKEN', accessToken)
      } else {
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
      }
    }
  }
})

export default {
  setAccessToken (token) {
    accessToken = token
  },
  get (uri, data) {
    return wrapPromise(Framework7.request.promise.json(uri, data))
  },
  getPlain (uri, data, contentType) {
    return wrapPromise(Framework7.request.promise({
      method: 'GET',
      url: uri,
      data,
      processData: false,
      contentType: contentType || 'text/plain'
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
