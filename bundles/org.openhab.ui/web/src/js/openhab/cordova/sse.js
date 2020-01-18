/* eslint-disable no-undef */
export default {
  /* This is a buggy and probably unreliable SSE client implementation
     using native sockets, to cope with CORS and iOS's WKWebView.
  */
  connect (path, topics, callback, errorCallback) {
    let clientSockets = []
    let buffer = ''

    const serverUrl = localStorage.getItem('openhab.ui:serverUrl')
    // const username = localStorage.getItem('openhab.ui:username')
    // const password = localStorage.getItem('openhab.ui:password')

    const server = new URL(serverUrl)
    const hostname = server.hostname
    const tls = server.protocol === 'https:'
    const port = parseInt(server.port) || (tls ? 443 : 80)

    const requestString = `GET ${path} HTTP/1.1\r\nHost: ${hostname}\r\n\r\n`
    const request = new ArrayBuffer(requestString.length)
    const reqView = new Uint8Array(request)
    for (var i = 0, strLen = requestString.length; i < strLen; i++) {
      reqView[i] = requestString.charCodeAt(i)
    }

    const decoder = new TextDecoder('utf-8')

    const recvListener = (info) => {
      let decoded = decoder.decode(info.data)
      if (decoded.substring(0, 4) === 'HTTP') {
        return // ignore headers
      }

      if (buffer.length) {
        console.info('Buffer present, prepending!')
        console.info('BUFFER: ' + buffer)
        console.info('DECODED: ' + decoded)
      }
      let original = buffer + decoded

      decoded = original
      buffer = ''
      let final = ''
      let chunkSizes = []
      let chunks = []
      let payload = {}

      decoded = decoded.trimLeft()

      while (decoded.trim().length) {
        let chunk
        while (decoded.length && (decoded[0] === '\r' || decoded[0] === '\n')) {
          decoded = decoded.substring(1)
        }
        let chunkSizeHexa = decoded.substring(0, decoded.indexOf('\r\n'))
        let chunkSize = parseInt('0x' + chunkSizeHexa)
        chunkSizes.push(chunkSize)
        console.trace('chunk size: ' + chunkSize + ' (0x' + chunkSizeHexa + ')')
        if (chunkSize > 0) {
          decoded = decoded.substring(decoded.indexOf('\r\n') + 2)
          chunk = decoded.substring(0, chunkSize)
          chunks.push(chunk)
          final += chunk
          decoded = decoded.substring(chunkSize)
          while (decoded.length && (decoded[0] === '\r' || decoded[0] === '\n')) {
            decoded = decoded.substring(1)
          }
        } else {
          console.error('Error while decoding chunk (size=' + chunkSize + ')')
          console.trace('ORIGINAL: ' + original)
          console.trace('CHUNKED: ' + decoded)
          // debugger
          console.log('dismissing data')
          return
        }
      }
      // console.log('FINAL: ' + final)
      if (final[final.length - 1] !== '\n') {
        console.trace('data not ending w/ newline, continuing the buffering: ' + final)
        buffer = original
        return
      }
      for (let sseLine of final.split('\n')) {
        if (sseLine.trim().length === 0) payload = {}
        if (sseLine.trim().indexOf('event') === 0) {
          payload.event = sseLine.substring(6)
        }
        if (sseLine.trim().indexOf('data') === 0) {
          try {
            payload.data = JSON.parse(sseLine.substring(5).replace('\r', '').trim())
          } catch (e) {
            console.warn(e)
            console.warn(original)
            // buffer = original;
            break
          }

          console.log(payload.data)
          callback(payload.data)
          payload = {}
        }
      }
    }
    chrome.sockets.tcp.onReceive.addListener(recvListener)

    const errorListener = (info) => {
      console.log('SSE error')
      console.log(info)
      if (errorCallback) {
        errorCallback(info)
      }
    }
    chrome.sockets.tcp.onReceiveError.addListener(errorListener)

    let clientInfo = {
      socketId: null,
      path: path,
      topics: topics
    }
    chrome.sockets.tcp.create({}, function (clientCreateInfo) {
      clientSockets.push(clientCreateInfo)
      console.log('socket created')
      clientInfo.socketId = clientSockets[0].socketId
      chrome.sockets.tcp.setPaused(clientSockets[0].socketId, true, function () {
        chrome.sockets.tcp.connect(clientSockets[0].socketId, hostname, port, function (connectResult) {
          console.log('connected')

          if (tls) {
            // expect(connectResult).toEqual(0);
            chrome.sockets.tcp.secure(clientSockets[0].socketId, { tlsVersion: { min: 'tls1.2', max: 'tls1.3' } }, function (secureResult) {
              console.log('TLS established')
              // expect(secureResult).toEqual(0);
              chrome.sockets.tcp.send(clientSockets[0].socketId, request, function (sendResult) {
                console.log('request sent')
                // expect(sendResult.resultCode).toEqual(0);
                // expect(sendResult.bytesSent).toEqual(requestString.length);
                chrome.sockets.tcp.setPaused(clientSockets[0].socketId, false)
              })
            })
          } else {
            chrome.sockets.tcp.send(clientSockets[0].socketId, request, function (sendResult) {
              console.log('request sent')
              // expect(sendResult.resultCode).toEqual(0);
              // expect(sendResult.bytesSent).toEqual(requestString.length);
              chrome.sockets.tcp.setPaused(clientSockets[0].socketId, false)
            })
          }
        })
      })
      return clientSockets[0]
    })

    return clientInfo
  },
  close (clientInfo, callback) {
    if (clientInfo && clientInfo.socketId) {
      chrome.sockets.tcp.close(clientInfo.socketId, callback)
    }
  }
}
