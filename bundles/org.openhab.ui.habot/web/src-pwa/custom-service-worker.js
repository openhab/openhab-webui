/*
 * This file (which will be your service worker)
 * is picked up by the build system if BOTH conditions are met:
 *  - You are building for production
 *  - quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

'use strict'

workbox.core.setCacheNameDetails({prefix: "habot"});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

/* eslint-env browser, serviceworker */

// Determines whether a client is currently focused
// Source: https://web-push-book.gauntface.com/chapter-05/04-common-notification-patterns/
// Modified to check whether the url contains /chat.
function isClientFocused () {
  return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
    let clientIsFocused = false

    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i]
      if (windowClient.focused && windowClient.url.indexOf('/chat') > 0) {
        clientIsFocused = true
        break
      }
    }

    return clientIsFocused
  })
}

self.addEventListener('push', function (event) {
  let notificationTitle = 'HABot'
  let notificationOptions = {
    body: 'Notification from HABot',
    icon: 'statics/icons/icon-192x192.png',
    badge: 'statics/icons/badge-72x72.png',
    tag: 'habot-notification'
  }

  if (event.data) {
    const payload = event.data.json()
    if (payload.title) notificationTitle = payload.title
    Object.assign(notificationOptions, payload)
  }

  event.waitUntil(
    isClientFocused().then(function (focused) {
      // add the message to the chat list of clients to handle
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        // post messages to all matching clients in case they're on the "Chat with HABot" page - the message would simply be
        // added to the current chat

        let payload = JSON.stringify({
          title: notificationTitle,
          body: notificationOptions.body,
          data: notificationOptions.data,
          actions: notificationOptions.actions
        })

        for (let client of clientList) {
          client.postMessage(payload)
        }

        if (!focused) {
          // display the notification, but only if the client isn't focused and on the chat page (see isClientFocused)
          return self.registration.showNotification(notificationTitle, notificationOptions)
        }
      })
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      let payload = JSON.stringify({
        title: event.notification.title,
        body: event.notification.body,
        data: event.notification.data,
        actions: event.notification.actions,
        timestamp: event.notification.timestamp
      })
      let url = '/habot/notification#' + btoa(encodeURIComponent(payload))
      if (clientList.length > 0) {
        for (let client of clientList) {
          client.navigate(url)
        }
        return clientList[0].focus()
      }

      return self.clients.openWindow(url)
    })
  )
})

// don't do anything for now if the notification is dismissed
// self.addEventListener('notificationclose', function (event) {
// })
