import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

/**
 * The current access token
 */
let accessToken = null

/**
 * The access token should be passed in the X-OPENHAB-TOKEN header instead of Authorization: Bearer
 */
let tokenInCustomHeader = false

/**
 * The PasswordCredential to authenticate to a reverse proxy service like openHAB Cloud
 */
let basicCredentials = null

/**
 * The token is required for all requests, including SSE
 */
let requireToken

export function getAccessToken () { return accessToken }
export function getTokenInCustomHeader () { return tokenInCustomHeader }
export function getBasicCredentials () { return basicCredentials }
export function getRequireToken () { return requireToken }

if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) tokenInCustomHeader = true

export function authorize (setup) {
  import('pkce-challenge').then((PkceChallenge) => {
    const pkceChallenge = PkceChallenge.default()
    const authState = (setup ? 'setup-' : '') + Framework7.utils.id()

    sessionStorage.setItem('openhab.ui:codeVerifier', pkceChallenge.code_verifier)
    sessionStorage.setItem('openhab.ui:authState', authState)

    window.location = '/auth' +
      '?response_type=code' +
      '&client_id=' + encodeURIComponent(window.location.origin) +
      '&redirect_uri=' + encodeURIComponent(window.location.origin) +
      '&scope=admin' +
      '&code_challenge_method=S256' +
      '&code_challenge=' + encodeURIComponent(pkceChallenge.code_challenge) +
      '&state=' + authState
  })
}

export function setBasicCredentials (username, password) {
  if (username && password) {
    console.log('Using passed credentials')
    basicCredentials = { id: username, password: password }
    tokenInCustomHeader = true
    return Promise.resolve()
  } else if (window.OHApp && window.OHApp.getBasicCredentialsUsername) {
    const usernameFromApp = window.OHApp.getBasicCredentialsUsername()
    const passwordFromApp = window.OHApp.getBasicCredentialsPassword()
    basicCredentials = { id: usernameFromApp, password: passwordFromApp }
    tokenInCustomHeader = true
    return Promise.resolve()
  } else if (navigator.credentials && navigator.credentials.preventSilentAccess && window.PasswordCredential) {
    return navigator.credentials.get({ password: true }).then((creds) => {
      if (creds) {
        console.log('Using stored Basic credentials to sign in to a reverse proxy service')
        basicCredentials = { id: creds.id, password: creds.password }
        tokenInCustomHeader = true
      }
      return Promise.resolve()
    })
  } else {
    return Promise.resolve()
  }
}

export function clearBasicCredentials () {
  basicCredentials = null
  tokenInCustomHeader = document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0
}

export function storeBasicCredentials () {
  if (basicCredentials && navigator.credentials && navigator.credentials.preventSilentAccess && window.PasswordCredential) {
    navigator.credentials.store(new window.PasswordCredential(basicCredentials))
  }
}

export function setAccessToken (token, api) {
  accessToken = token
  if (!token || !api || requireToken !== undefined) return

  // determine whether the token is required for user operations
  return api.head('/rest/sitemaps').then((resp) => {
    requireToken = false
    return Promise.resolve()
  }).catch((err) => {
    if (err === 'Unauthorized') requireToken = true
    return Promise.resolve()
  })
}

export function clearAccessToken () {
  accessToken = null
}

export default {
  setAccessToken,
  clearAccessToken,
  setBasicCredentials
}
