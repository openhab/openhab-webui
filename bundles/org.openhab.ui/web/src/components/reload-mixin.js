import { loadLocaleMessages } from '@/js/i18n'

export default {
  data () {
    return {
      showCachePurgeOption: false
    }
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/about'))
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
      this.$f7.dialog.confirm(
        this.$t('about.reload.confirmPurge'),
        () => {
          navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
              registration.unregister().then(function () {
                return self.clients.matchAll()
              }).then(function (clients) {
                clients.forEach(client => {
                  if (client.url && 'navigate' in client) {
                    setTimeout(() => { client.navigate(client.url.split('#')[0]) }, 1000)
                  }
                })
              })
            }
          })
          window.caches.keys().then(function (cachesNames) {
            console.log('Deleting caches')
            return Promise.all(cachesNames.map(function (cacheName) {
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
      document.location.reload()
    }
  }
}