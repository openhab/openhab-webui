import { Utils } from 'framework7'

import { authorize, setBasicCredentials, clearBasicCredentials, storeBasicCredentials } from '@/js/openhab/auth'

export default {
  data () {
    return {
      currentTokenExpireTime: null
    }
  },
  methods: {
    authorize,
    getRefreshToken () {
      return localStorage.getItem('openhab.ui:refreshToken') || null
    },
    tryExchangeAuthorizationCode () {
      return new Promise((resolve, reject) => {
        const queryParams = Utils.parseUrlQuery(window.location.href)
        if (queryParams.code && queryParams.state) {
          const authState = sessionStorage.getItem('openhab.ui:authState')
          sessionStorage.removeItem('openhab.ui:authState')
          if (authState !== queryParams.state) {
            reject('Invalid state')
          }
          if (window.history) {
            window.history.replaceState(null, window.title, window.location.href.replace('?code=' + queryParams.code, '').replace('&state=' + authState, ''))
          }

          const codeVerifier = sessionStorage.getItem('openhab.ui:codeVerifier')
          sessionStorage.removeItem('openhab.ui:codeVerifier')

          const payload = Utils.serializeObject({
            'grant_type': 'authorization_code',
            'client_id': window.location.origin,
            'redirect_uri': window.location.origin,
            'code': queryParams.code,
            'code_verifier': codeVerifier
          })

          this.$oh.auth.clearAccessToken()
          this.$oh.api.postPlain('/rest/auth/token?useCookie=true', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
            const resp = JSON.parse(data)
            localStorage.setItem('openhab.ui:refreshToken', resp.refresh_token)
            return this.$oh.auth.setAccessToken(resp.access_token, this.$oh.api).then(() => {
              // schedule the next token refresh when 95% of this token's lifetime has elapsed, i.e. 3 minutes before a 1-hour token is due to expire
              setTimeout(this.refreshAccessToken, resp.expires_in * 950)
              this.$store.commit('setUser', { user: resp.user })

              const nextRoute = authState.indexOf('setup') === 0 ? '/setup-wizard/' : '/'
              this.$f7.views.main.router.navigate(nextRoute, { animate: false, clearPreviousHistory: true })

              resolve(resp.user)
            })
          }).catch((err) => {
            console.log('Exchanging authorization code failed', err)
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

        this.$oh.auth.clearAccessToken()
        this.$oh.api.postPlain('/rest/auth/token', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
          const resp = JSON.parse(data)
          return this.$oh.auth.setAccessToken(resp.access_token, this.$oh.api).then(() => {
            // schedule the next token refresh when 95% of this token's lifetime has elapsed, i.e. 3 minutes before a 1-hour token is due to expire
            setTimeout(this.refreshAccessToken, resp.expires_in * 950)
            // also make sure to check the token and renew it when the app becomes visible again
            this.currentTokenExpireTime = new Date().getTime() + resp.expires_in * 950
            document.addEventListener('visibilitychange', this.checkTokenAfterVisibilityChange)
            this.$store.commit('setUser', { user: resp.user })
            resolve(resp)
          })
        }).catch((err) => {
          console.log('Refreshing access token failed', err)
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
          this.$oh.auth.clearAccessToken()
          this.$store.commit('setUser', { user: null })
          resolve()
        }).catch((err) => {
          console.log('Failed to log out', err)
          this.$oh.auth.clearAccessToken()
          this.$store.commit('setUser', { user: null })
          reject(err)
        })
      })
    },
    setBasicCredentials,
    clearBasicCredentials,
    storeBasicCredentials
  }
}
