<template>
  <div class="layout-padding" style="max-width: 600px;">
    <br />
    <q-list link>
      <q-list-header>Speech recognition API</q-list-header>
      <q-item tag="label">
        <q-item-side>
          <q-radio v-model="speechApi" val="google"></q-radio>
        </q-item-side>
        <q-item-main>
          <q-item-tile label>Google Cloud Speech</q-item-tile>
          <q-item-tile sublabel>Uses Google Cloud Platform, API key required.</q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-btn @click="setGoogleApiKey()" color="primary" flat>Setup</q-btn>
        </q-item-side>
      </q-item>
      <q-item tag="label">
        <q-item-side>
          <q-radio v-model="speechApi" val="bing"></q-radio>
        </q-item-side>
        <q-item-main>
          <q-item-tile label>Bing Speech</q-item-tile>
          <q-item-tile sublabel>Uses Microsoft Cognitive Services, API key required.</q-item-tile>
        </q-item-main>
        <q-item-side right>
          <q-btn @click="setBingApiKey()" color="primary" flat>Setup</q-btn>
        </q-item-side>
      </q-item>
      <q-item tag="label" v-if="browserSpeechRecognitionAvailable">
        <q-item-side>
          <q-radio v-model="speechApi" val="webkitSpeechRecognition"></q-radio>
        </q-item-side>
        <q-item-main>
          <q-item-tile label>Browser built-in recognition</q-item-tile>
          <q-item-tile sublabel>Uses the browser functionality if supported (Chrome only).</q-item-tile>
        </q-item-main>
      </q-item>
      <q-item tag="label" disabled>
        <q-item-side>
          <q-radio v-model="speechApi" val="openhab" disable></q-radio>
        </q-item-side>
        <q-item-main>
          <q-item-tile label>Send to openHAB speech-to-text</q-item-tile>
          <q-item-tile sublabel>Sends the audio to openHAB for local processing (not implemented).</q-item-tile>
        </q-item-main>
      </q-item>

      <q-list-header>Information used for item matching</q-list-header>
      <q-item @click.native="showItemTagger = true">
        <q-item-main>
          <q-item-tile label>View item attributes</q-item-tile>
          <q-item-tile sublabel>Review the named attributes attached to items, used to identify them in conversations.</q-item-tile>
        </q-item-main>
      </q-item>
      <q-modal v-model="showItemTagger" :content-css="{minWidth: '80vw', minHeight: '80vh'}" @show="$refs.itemtable.processItems()">
        <item-table ref="itemtable"></item-table>
      </q-modal>

      <q-list-header>Notifications</q-list-header>
      <q-item @click.native="enableNotifications()">
        <q-item-main>
          <q-item-tile label>Enable/test push notifications</q-item-tile>
          <q-item-tile sublabel>Subscribe to push notifications on this device, and check whether notifications are received.</q-item-tile>
        </q-item-main>
      </q-item>

      <q-list-header v-if="$q.platform.is.chrome">Credential management</q-list-header>
      <q-item v-if="$q.platform.is.chrome" @click.native="showCredentialsDialog = true">
        <q-item-main>
          <q-item-tile label>Store openHAB Cloud credentials</q-item-tile>
          <q-item-tile sublabel>Save your remote credentials securely in your Chrome browser to log in automatically in the future.</q-item-tile>
        </q-item-main>
      </q-item>

      <q-dialog
        v-model="showCredentialsDialog"
        prevent-close
        :ok="true"
        :cancel="true"
        @ok="storeCredentials"
        @cancel="() => {}"
      >
        <!-- This or use "title" prop on <q-dialog> -->
        <span slot="title">Store credentials</span>

        <!-- This or use "message" prop on <q-dialog> -->
        <span slot="message">Please enter your username and password for myopenhab.org below, click OK, then confirm when your browser offers to save the credentials.</span>

        <div slot="body">
          <q-field
            icon="account_circle"
            label="User ID (your email)"
            required
          >
            <q-input v-model="creds.username" />
          </q-field>
        </div>
        <div slot="body">
          <q-field
            label="Password"
            icon="vpn_key"
            required
          >
            <q-input type="password" v-model="creds.password" />
          </q-field>
        </div>

        <!-- <template slot="buttons" slot-scope="props">
          <q-btn color="primary" label="Set" @click="this(props.ok, 'Superman')" />
          <q-btn flat label="No thanks" @click="props.cancel" />
        </template> -->
      </q-dialog>

      <q-list-header>About</q-list-header>
      <q-item disabled>
        <q-item-main>
          <q-item-tile label>About HABot</q-item-tile>
          <q-item-tile sublabel>Build date: {{buildTimestamp}}</q-item-tile>
        </q-item-main>
      </q-item>
      <q-item @click.native="refreshApp()">
        <q-item-main>
          <q-item-tile label>Refresh the application</q-item-tile>
          <q-item-tile sublabel>Empty and refresh the application cache to upgrade the app.</q-item-tile>
        </q-item-main>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import ItemTable from 'layouts/itemtable/ItemTable.vue'

/* This function is used to convert the server's public VAPID key for push notifications
   Source: https://github.com/GoogleChromeLabs/web-push-codelab/blob/master/app/scripts/main.js */
function urlB64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default {
  components: {
    ItemTable
  },
  data () {
    return {
      browserSpeechRecognitionAvailable: false,
      speechApi: this.$q.localStorage.get.item('habot.speechApi') || 'google',
      buildTimestamp: new Date(process.env.BUILD_TIMESTAMP).toString(),
      creds: {
        username: null,
        password: null
      },
      showCredentialsDialog: false,
      showItemTagger: false
    }
  },
  methods: {
    storeCredentials () {
      if (navigator.credentials && navigator.credentials.preventSilentAccess) {
        navigator.credentials.store(new PasswordCredential({id: this.creds.username, password: this.creds.password})).then((result) => {
          this.$q.notify({ type: 'positive', message: 'The credentials were saved successfully!' })
        }).catch((err) => {
          this.$q.notify('Error while saving credentials: ' + err)
        })
      }
    },
    setGoogleApiKey () {
      var vm = this
      vm.$q.dialog({
        title: 'Set the Google Cloud API key',
        message:
            'You need to subscribe to the Google Cloud Platform to use this feature.' +
            '60 min/month free after the trial period. See help for details. ' +
            'Paste the API key below:',
        // '<ul>' +
        // '<li>Go to <a target="_blank" href="https://console.cloud.google.com">console.cloud.google.com</a> and sign up or login</li>' +
        // '<li>Create a project and set up a payment method for billing</li>' +
        // '<li>Go to API &amp; Services</li>' +
        // '<li>Enable the Cloud Speech API from the Library page</li>' +
        // '<li>Go to the Credentials page and create an API key</li>' +
        // '<li>Paste the API key below</li>' +
        // '</ul>',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true
      }).then((data) => {
        vm.$q.localStorage.set('habot.googleApiKey', data)
        vm.$q.notify({ type: 'info', message: 'Google Cloud API Key set for this device' })
      }).catch(() => {

      })
    },
    setBingApiKey () {
      var vm = this
      vm.$q.dialog({
        title: 'Set the Bing Speech API key',
        message:
            'Trial keys expire after 30 days, sign up to Azure to get non-expiring keys. ' +
            '5000 transactions free per month, 20 per minute allowed. See help for details. ' +
            'Paste one of the two API keys below:',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true
      }).then((data) => {
        vm.$q.localStorage.set('habot.bingApiKey', data)
        vm.$q.notify({ type: 'info', message: 'Bing Speech API Key set for this device' })
      }).catch(() => {

      })
    },

    enableNotifications () {
      var vm = this
      const isLocalhost = Boolean(window.location.hostname === 'localhost' ||
          // [::1] is the IPv6 localhost address.
          window.location.hostname === '[::1]' ||
          // 127.0.0.1/8 is considered localhost for IPv4.
          window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
      )
      if (!('serviceWorker' in navigator)) {
        vm.$q.notify('Sorry, notifications are not supported on this browser')
        return
      }
      if (!(window.location.protocol === 'https:' || isLocalhost)) {
        vm.$q.notify('Sorry, HTTPS is required for the notifications to work')
        return
      }

      // Basic service worker checks passed
      navigator.serviceWorker.getRegistration()
      // navigator.serviceWorker.register('sw-webpush.js')
        .then((registration) => {
          // Check if desktop notifications are supported
          if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            vm.$q.notify('Notifications aren\'t supported.')
            vm.$q.loading.hide()
            return
          }

          if (Notification.permission === 'denied') {
            vm.$q.notify('Notifications are blocked - please check the browser\'s site settings')
            vm.$q.loading.hide()
            return
          }

          if (!('PushManager' in window)) {
            vm.$q.notify('Push messaging isn\'t supported.')
            vm.$q.loading.hide()
            return
          }

          // Get the notification subscription object
          registration.pushManager.getSubscription().then((subscription) => {
            var sendSubscriptionToServer = (subscription) => {
              // send the subscription to the server for storage
              // can't use JSON (see server code and https://github.com/openhab/openhab-cloud/issues/31)
              // so stringify and send as plain text and the server will deserialize it
              vm.$q.loading.show({ message: 'Subscribing to notifications...' })
              vm.$http.post('/rest/habot/notifications/subscribe', JSON.stringify(subscription), {
                headers: {
                  'Content-Type': 'text/plain'
                }
              }).then((response) => {
                vm.$q.notify({ type: 'positive', message: 'Success! You should receive a test notification!' })
                vm.$q.loading.hide()
              }).catch((e) => {
                vm.$q.notify('Error while sending the subscription to the openHAB server: ' + e)
                vm.$q.loading.hide()
              })
            }

            vm.$q.loading.show({ message: 'Initializing, please wait...' })

            // No subscription yet, create one
            if (!subscription) {
              // Get the VAPID key from the server first
              vm.$http.get('/rest/habot/notifications/vapid').then((response) => {
                // we got the key, first convert it to a byte array
                const applicationServerKey = urlB64ToUint8Array(response.data)

                vm.$q.loading.show({ message: 'Preparing the subscription... Please allow the notifications if prompted!', delay: 1000 })
                // then perform the subscription
                registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: applicationServerKey
                }).then((subscription) => {
                  sendSubscriptionToServer(subscription)
                }).catch((e) => {
                  if (Notification.permission === 'denied') {
                    vm.$q.notify('Notifications are blocked - please check the browser\'s site settings')
                  } else {
                    vm.$q.notify('Error while subscribing to push notifications: ' + e)
                  }
                  vm.$q.loading.hide()
                })
              }).catch((e) => {
                vm.$q.notify('Error while getting the public VAPID key from the server: ' + e)
                vm.$q.loading.hide()
              })
            } else {
              sendSubscriptionToServer(subscription)
            }
          })
        })
        .catch((e) => {
          vm.$q.notify('Error while registering the service worker: ' + e)
        })
    },

    refreshApp () {
      this.$q.dialog({
        title: 'Refresh app',
        message: 'This will empty the cache and reload the newest version of the app from the server. ' +
                 'You will need to enable push notifications again. Continue?',
        cancel: true
      }).then((data) => {
        this.$q.loading.show({ delay: 0, message: 'Refreshing the app...' })
        setTimeout(() => {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
              registration.unregister()
            }
            location.reload()
          })
        }, 1000)
      })
    }

  },
  watch: {
    speechApi () {
      console.log('Setting speechApi to ' + this.speechApi)
      this.$q.localStorage.set('habot.speechApi', this.speechApi)
    }
  },
  created () {
    this.browserSpeechRecognitionAvailable = this.$q.platform.is.chrome &&
      'webkitSpeechRecognition' in window &&
      (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
  }
}
</script>
