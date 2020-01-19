function prepareRequest (uri) {
  // prepend uri with base if applicable (Cordova)
  const serverUrl = localStorage.getItem('openhab.ui:serverUrl')
  const username = localStorage.getItem('openhab.ui:username')
  const password = localStorage.getItem('openhab.ui:password')

  if (!serverUrl) {
    return null
  }

  uri = serverUrl + uri
  if (cordova && cordova.plugin.http) {
    cordova.plugin.http.setDataSerializer('json')
    if (username && password) {
      cordova.plugin.http.useBasicAuth(username, password)
    }
  }
  return uri
}

export default {
  get (uri, data) {
    const fullUri = prepareRequest(uri)
    if (fullUri) {
      return new Promise((resolve, reject) => {
        cordova.plugin.http.get(fullUri, null, {},
          function (response) {
            resolve(JSON.parse(response.data))
          }, function (response) {
            reject(response.error)
          })
      })
    }
  },
  post (uri, data) {
    const fullUri = prepareRequest(uri)
    if (fullUri) {
      return new Promise((resolve, reject) => {
        cordova.plugin.http.post(fullUri, data, {},
          function (response) {
            resolve(JSON.parse(response.data))
          }, function (response) {
            reject(response.error)
          })
      })
    }
  },
  postPlain (uri, data, dataType, contentType) {
    const fullUri = prepareRequest(uri)
    const headers = { 'Content-Type': contentType || 'text/plain' }
    if (fullUri) {
      cordova.plugin.http.setDataSerializer('utf8')
      return new Promise((resolve, reject) => {
        cordova.plugin.http.setDataSerializer('json')
        cordova.plugin.http.post(fullUri, data, headers,
          function (response) {
            resolve(JSON.parse(response.data))
          }, function (response) {
            reject(response.error)
          })
      })
    }
  },
  put (uri, data) {
    const fullUri = prepareRequest(uri)
    if (fullUri) {
      return new Promise((resolve, reject) => {
        cordova.plugin.http.put(fullUri, data, {},
          function (response) {
            resolve(JSON.parse(response.data))
          }, function (response) {
            reject(response.error)
          })
      })
    }
  },
  putPlain (uri, data, dataType, contentType) {
    const fullUri = prepareRequest(uri)
    const headers = { 'Content-Type': contentType || 'text/plain' }
    if (fullUri) {
      cordova.plugin.http.setDataSerializer('utf8')
      return new Promise((resolve, reject) => {
        cordova.plugin.http.setDataSerializer('json')
        cordova.plugin.http.put(fullUri, data, headers,
          function (response) {
            resolve(JSON.parse(response.data))
          }, function (response) {
            reject(response.error)
          })
      })
    }
  },
  delete (uri, data) {
    const fullUri = prepareRequest(uri)
    if (fullUri) {
      return new Promise((resolve, reject) => {
        cordova.plugin.http.delete(fullUri, null, {},
          function (response) {
            resolve(JSON.parse(response.data))
          }, function (response) {
            reject(response.error)
          })
      })
    }
  }
}
