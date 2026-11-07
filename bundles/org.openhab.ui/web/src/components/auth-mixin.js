import { utils } from 'framework7'
import { f7 } from 'framework7-vue'

import { authorize, getAccessToken, setBasicCredentials, clearBasicCredentials, storeBasicCredentials } from '@/js/openhab/auth'
import { scheduleTokenRefresh, cancelTokenRefresh } from '@/js/openhab/token-refresh'

import { useUserStore } from '@/js/stores/useUserStore'

/** Expiry of the current access token, used to keep it after a failed refresh as long as it is valid. */
let accessTokenExpireTime = 0

export default {
  methods: {
    authorize,
    getRefreshToken() {
      return localStorage.getItem('openhab.ui:refreshToken') || null
    },
    tryExchangeAuthorizationCode() {
      return new Promise((resolve, reject) => {
        const queryParams = utils.parseUrlQuery(window.location.href)
        if (queryParams.code && queryParams.state) {
          const authState = sessionStorage.getItem('openhab.ui:authState')
          sessionStorage.removeItem('openhab.ui:authState')
          if (window.history) {
            window.history.replaceState(
              null,
              window.title,
              window.location.href.replace('?code=' + queryParams.code, '').replace('&state=' + queryParams.state, '')
            )
          }
          if (authState !== queryParams.state) {
            reject('Invalid state')
            return
          }

          const codeVerifier = sessionStorage.getItem('openhab.ui:codeVerifier')
          sessionStorage.removeItem('openhab.ui:codeVerifier')

          const payload = utils.serializeObject({
            grant_type: 'authorization_code',
            client_id: window.location.origin,
            redirect_uri: window.location.origin,
            code: queryParams.code,
            code_verifier: codeVerifier
          })

          this.$oh.auth.clearAccessToken()
          this.$oh.api
            .postPlain('/rest/auth/token?useCookie=true', payload, 'application/json', 'application/x-www-form-urlencoded')
            .then((data) => {
              const resp = JSON.parse(data)
              localStorage.setItem('openhab.ui:refreshToken', resp.refresh_token)
              this.$oh.auth.setAccessToken(resp.access_token)
              accessTokenExpireTime = Date.now() + resp.expires_in * 1000
              scheduleTokenRefresh(resp.expires_in, this.refreshAccessToken)
              useUserStore().setUser(resp.user)

              const nextRoute = authState.indexOf('setup') === 0 ? '/setup-wizard/' : '/'
              f7.views.main.router.navigate(nextRoute, { animate: false, clearPreviousHistory: true })

              resolve(resp.user)
            })
            .catch((err) => {
              console.log('Exchanging authorization code failed', err)
              reject(err)
            })
        } else {
          reject()
        }
      })
    },
    refreshAccessToken() {
      return new Promise((resolve, reject) => {
        const refreshToken = this.getRefreshToken()
        const payload = utils.serializeObject({
          grant_type: 'refresh_token',
          client_id: window.location.origin,
          redirect_uri: window.location.origin,
          refresh_token: refreshToken
        })

        // the token request must not carry an expired access token, as it would be rejected
        const previousAccessToken = getAccessToken()
        const previousAccessTokenExpireTime = accessTokenExpireTime
        this.$oh.auth.clearAccessToken()
        this.$oh.api
          .postPlain('/rest/auth/token', payload, 'application/json', 'application/x-www-form-urlencoded')
          .then((data) => {
            if (this.getRefreshToken() !== refreshToken) {
              reject('Session has been closed during token refresh')
              return
            }
            const resp = JSON.parse(data)
            this.$oh.auth.setAccessToken(resp.access_token)
            accessTokenExpireTime = Date.now() + resp.expires_in * 1000
            scheduleTokenRefresh(resp.expires_in, this.refreshAccessToken)
            useUserStore().setUser(resp.user)

            resolve(resp)
          })
          .catch((err) => {
            console.log('Refreshing access token failed', err)
            // keep using the previous access token while it is valid, e.g. if the network is temporarily unavailable
            if (
              previousAccessToken &&
              !getAccessToken() &&
              this.getRefreshToken() === refreshToken &&
              Date.now() < previousAccessTokenExpireTime
            ) {
              this.$oh.auth.setAccessToken(previousAccessToken)
            }
            reject(err)
          })
      })
    },
    cleanSession() {
      return new Promise((resolve, reject) => {
        const refreshToken = this.getRefreshToken()
        const payload = utils.serializeObject({
          refresh_token: refreshToken
        })
        cancelTokenRefresh()
        localStorage.removeItem('openhab.ui:refreshToken')
        this.$oh.api
          .postPlain('/rest/auth/logout', payload, 'application/json', 'application/x-www-form-urlencoded')
          .then((data) => {
            console.log('Logged out')
            this.$oh.auth.clearAccessToken()
            useUserStore().setUser(null)
            resolve()
          })
          .catch((err) => {
            console.log('Failed to log out', err)
            this.$oh.auth.clearAccessToken()
            useUserStore().setUser(null)
            reject(err)
          })
      })
    },
    setBasicCredentials,
    clearBasicCredentials,
    storeBasicCredentials
  }
}
