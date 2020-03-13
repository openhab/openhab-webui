export default {
  methods: {
    getRefreshToken () {
      return localStorage.getItem('openhab.ui:refreshToken') || null
    },
    authorize () {
      window.location = '/auth' +
        '?response_type=code' +
        '&client_id=' + encodeURIComponent(window.location.origin) +
        '&redirect_uri=' + encodeURIComponent(window.location.origin) +
        '&scope=admin'
    },
    tryExchangeAuthorizationCode () {
      return new Promise((resolve, reject) => {
        const queryParams = this.$f7.utils.parseUrlQuery(window.location.href)
        if (queryParams.code) {
          if (window.history) {
            window.history.replaceState(null, window.title, window.location.href.replace('?code=' + queryParams.code, ''))
          }
          this.$f7.views.main.router.navigate('/', { animate: false, clearPreviousHistory: true })

          const payload = this.$f7.utils.serializeObject({
            'grant_type': 'authorization_code',
            'client_id': window.location.origin,
            'redirect_uri': window.location.origin,
            'code': queryParams.code
          })
          this.$oh.api.postPlain('/rest/auth/token?useCookie=true', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
            const resp = JSON.parse(data)
            localStorage.setItem('openhab.ui:refreshToken', resp.refresh_token)
            this.$oh.setAccessToken(resp.access_token)
            this.$f7.data.user = resp.user
            resolve(resp.user)
          }).catch((err) => {
            console.log(err)
            reject(err)
          })
        } else {
          reject()
        }
      })
    },
    refreshAccessToken () {
      return new Promise((resolve, reject) => {
        const refreshToken = this.getRefreshToken()
        const payload = this.$f7.utils.serializeObject({
          'grant_type': 'refresh_token',
          'client_id': window.location.origin,
          'redirect_uri': window.location.origin,
          'refresh_token': refreshToken
        })
        this.$oh.api.postPlain('/rest/auth/token', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
          const resp = JSON.parse(data)
          this.$oh.setAccessToken(resp.access_token)
          this.$f7.data.user = resp.user
          resolve(resp.user)
        }).catch((err) => {
          console.log(err)
          reject(err)
        })
      })
    },
    cleanSession () {
      return new Promise((resolve, reject) => {
        const refreshToken = this.getRefreshToken()
        const payload = this.$f7.utils.serializeObject({
          'refresh_token': refreshToken
        })
        this.$oh.api.postPlain('/rest/auth/logout', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
          localStorage.removeItem('openhab.ui:refreshToken')
          this.$oh.setAccessToken(null)
          this.$f7.data.user = null
          resolve()
        }).catch((err) => {
          console.log(err)
          reject(err)
        })
      })
    }
  }
}
