import { f7 } from 'framework7-vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n.js'

export default {
  data () {
    return {
      showCachePurgeOption: false
    }
  },
  setup () {
    const { t, setLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('about', setLocaleMessage)
    return {
      t
    }
  },
  methods: {
    checkPurgeServiceWorkerAndCachesAvailable () {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          if (registrations.length > 0) {
            this.showCachePurgeOption = true
          }
        })
      }
      if (window.caches) {
        window.caches.keys().then((cachesNames) => {
          if (cachesNames.length > 0) {
            this.showCachePurgeOption = true
          }
        })
      }
    },
    purgeServiceWorkerAndCaches () {
      f7.dialog.confirm(
        this.t('about.reload.confirmPurge'),
        () => {
          navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
              registration.unregister().then(function () {
                return self.clients.matchAll()
              }).then(function (clients) {
                clients.forEach((client) => {
                  if (client.url && 'navigate' in client) {
                    setTimeout(() => { client.navigate(client.url.split('#')[0]) }, 1000)
                  }
                })
              })
            }
          })
          window.caches.keys().then(function (cachesNames) {
            console.log('Deleting caches')
            return Promise.all(cachesNames.map(async function (cacheName) {
              return caches.delete(cacheName).then(function () {
                console.log('Cache with name ' + cacheName + ' is deleted')
              })
            }))
          }).then(function () {
            console.log('Caches deleted')
            setTimeout(() => { location.reload(true) }, 1000)
          })
        }
      )
    },
    reload () {
      window.location.reload()
    }
  }
}
