import { Utils } from 'framework7'

export default {
  data () {
    return {
      currentTokenExpireTime: null
    }
  },
  methods: {
    getRefreshToken () {
      return localStorage.getItem('openhab.ui:refreshToken') || null
    },
    authorize () {
      import('pkce-challenge').then((PkceChallenge) => {
        const pkceChallenge = PkceChallenge.default()
        sessionStorage.setItem('openhab.ui:codeVerifier', pkceChallenge.code_verifier)

        window.location = '/auth' +
          '?response_type=code' +
          '&client_id=' + encodeURIComponent(window.location.origin) +
          '&redirect_uri=' + encodeURIComponent(window.location.origin) +
          '&scope=admin' +
          '&code_challenge_method=S256' +
          '&code_challenge=' + encodeURIComponent(pkceChallenge.code_challenge)
      })
    },
    tryExchangeAuthorizationCode () {
      return new Promise((resolve, reject) => {
        const queryParams = Utils.parseUrlQuery(window.location.href)
        if (queryParams.code) {
          if (window.history) {
            window.history.replaceState(null, window.title, window.location.href.replace('?code=' + queryParams.code, ''))
          }
          this.$f7.views.main.router.navigate('/', { animate: false, clearPreviousHistory: true })

          const codeVerifier = sessionStorage.getItem('openhab.ui:codeVerifier')
          sessionStorage.removeItem('openhab.ui:codeVerifier')

          const payload = Utils.serializeObject({
            'grant_type': 'authorization_code',
            'client_id': window.location.origin,
            'redirect_uri': window.location.origin,
            'code': queryParams.code,
            'code_verifier': codeVerifier
          })

          this.$oh.api.setAccessToken(null)
          this.$oh.api.postPlain('/rest/auth/token?useCookie=true', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
            const resp = JSON.parse(data)
            localStorage.setItem('openhab.ui:refreshToken', resp.refresh_token)
            this.$oh.api.setAccessToken(resp.access_token)
            // schedule the next token refresh when 95% of this token's lifetime has elapsed, i.e. 3 minutes before a 1-hour token is due to expire
            setTimeout(this.refreshAccessToken, resp.expires_in * 950)
            this.$store.commit('setUser', { user: resp.user })
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
        const payload = Utils.serializeObject({
          'grant_type': 'refresh_token',
          'client_id': window.location.origin,
          'redirect_uri': window.location.origin,
          'refresh_token': refreshToken
        })

        this.$oh.api.setAccessToken(null)
        this.$oh.api.postPlain('/rest/auth/token', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
          const resp = JSON.parse(data)
          this.$oh.api.setAccessToken(resp.access_token)
          // schedule the next token refresh when 95% of this token's lifetime has elapsed, i.e. 3 minutes before a 1-hour token is due to expire
          setTimeout(this.refreshAccessToken, resp.expires_in * 950)
          // also make sure to check the token and renew it when the app becomes visible again
          this.currentTokenExpireTime = new Date().getTime() + resp.expires_in * 950
          document.addEventListener('visibilitychange', this.checkTokenAfterVisibilityChange)
          this.$store.commit('setUser', { user: resp.user })
          resolve(resp)
        }).catch((err) => {
          console.log(err)
          reject(err)
        })
      })
    },
    checkTokenAfterVisibilityChange (evt) {
      if (!document.hidden && this.currentTokenExpireTime && this.currentTokenExpireTime < new Date().getTime()) {
        console.log('Refreshing expired token')
        this.refreshAccessToken()
      }
    },
    cleanSession () {
      return new Promise((resolve, reject) => {
        const refreshToken = this.getRefreshToken()
        const payload = Utils.serializeObject({
          'refresh_token': refreshToken
        })
        localStorage.removeItem('openhab.ui:refreshToken')
        this.$oh.api.postPlain('/rest/auth/logout', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
          console.log('Logged out')
          this.$oh.api.setAccessToken(null)
          this.$store.commit('setUser', { user: null })
          resolve()
        }).catch((err) => {
          console.log(err)
          this.$oh.api.setAccessToken(null)
          this.$store.commit('setUser', { user: null })
          reject(err)
        })
      })
    }
  }
}
