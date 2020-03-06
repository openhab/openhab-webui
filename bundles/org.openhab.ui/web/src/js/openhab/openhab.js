import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

let openSSEClients = []

function wrapPromise (f7promise) {
  return new Promise((resolve, reject) => {
    f7promise
      .then((data) => resolve(data.data, data.status, data.xhr))
      .catch((err) => reject(err.message, err.status, err.xhr))
  })
}

function newSSEConnection (path, readyCallback, messageCallback, errorCallback) {
  let eventSource
  // TODO handle basic auth with polyfill if necessary
  eventSource = new EventSource(path)

  eventSource.addEventListener('ready', (e) => {
    readyCallback(e.data)
  })

  eventSource.onmessage = (event) => {
    let evt = JSON.parse(event.data)
    messageCallback(evt)
  }

  eventSource.onopen = (event) => {
  }

  eventSource.onerror = () => {
    console.log('SSE error')
    console.log(eventSource)
    if (errorCallback) {
      errorCallback()
    }
    if (eventSource.readyState === 2) {
      console.log('%c=!= Event source connection broken...', 'background-color: red; color: white')
    }
  }

  openSSEClients.push(eventSource)
  console.log(`new SSE connection: ${eventSource.url}, ${openSSEClients.length} open`)
  console.debug(openSSEClients)
  return eventSource
}

export default {
  api: {
    get (uri, data) {
      return wrapPromise(Framework7.request.promise.json(uri, data))
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
  },
  sse: {
    connect (path, topics, messageCallback, errorCallback) {
      return newSSEConnection(path, null, messageCallback, errorCallback)
    },
    connectStateTracker (path, readyCallback, updateCallback, errorCallback) {
      return newSSEConnection(path, readyCallback, updateCallback, errorCallback)
    },
    close (client, callback) {
      if (!client) return
      if (openSSEClients.indexOf(client) >= 0) {
        openSSEClients.splice(openSSEClients.indexOf(client), 1)
      }
      console.log(`SSE connection closed: ${client.url}, ${openSSEClients.length} open`)
      console.debug(openSSEClients)

      client.close()
    }
  },
  media: {
    getIcon: (icon, format, state) => {
      if (!format) format = 'svg'
      let url = `/icon/${icon}?format=${format}`
      if (state) url += `&state=${state}`

      // TODO handle basic auth with blobs and data URIs if necessary
      // return new Promise((resolve, reject) => {
      //   Framework7.request.promise({ url, xhrFields: { responseType: 'blob' } }).then((resp) => {
      //     let reader = new FileReader()
      //     reader.readAsDataURL(resp.data)
      //     reader.onload = () => {
      //       return resolve(reader.result)
      //     }
      //   })
      // })
      return Promise.resolve(url)
    }
  }
}
