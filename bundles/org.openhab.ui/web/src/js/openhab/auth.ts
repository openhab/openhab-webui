import { f7 } from 'framework7-vue'

import { useUserStore } from '@/js/stores/useUserStore'
import { ApiError } from '../hey-api'
export interface BasicCredentials {
  id: string
  password: string
}

/**
 * The current access token
 */
let accessToken: string | null = null

/**
 * The access token should be passed in the `X-OPENHAB-TOKEN` header instead of `Authorization: Bearer ...`
 */
let tokenInCustomHeader: boolean = false

/**
 * The PasswordCredential to authenticate to a reverse proxy service like openHAB Cloud
 */
let basicCredentials: BasicCredentials | null = null

export function getAccessToken() {
  return accessToken
}
export function getTokenInCustomHeader() {
  return tokenInCustomHeader
}
export function getBasicCredentials() {
  return basicCredentials
}

if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) tokenInCustomHeader = true

export async function authorize(setup: boolean = false): Promise<void> {
  return import('pkce-challenge').then((PkceChallenge) => {
    const pkceChallenge = PkceChallenge.default()
    const authState = (setup ? 'setup-' : '') + f7.utils.id()

    sessionStorage.setItem('openhab.ui:codeVerifier', pkceChallenge.code_verifier)
    sessionStorage.setItem('openhab.ui:authState', authState)

    window.location.href =
      '/auth' +
      '?response_type=code' +
      '&client_id=' +
      encodeURIComponent(window.location.origin) +
      '&redirect_uri=' +
      encodeURIComponent(window.location.origin) +
      '&scope=admin' +
      '&code_challenge_method=S256' +
      '&code_challenge=' +
      encodeURIComponent(pkceChallenge.code_challenge) +
      '&state=' +
      authState
  })
}

export async function setBasicCredentials(username: string, password: string): Promise<void> {
  if (username && password) {
    console.log('Using passed credentials')
    basicCredentials = { id: username, password }
    tokenInCustomHeader = true
    return
  } else if (
    typeof window.OHApp?.getBasicCredentialsUsername === 'function' &&
    typeof window.OHApp?.getBasicCredentialsPassword === 'function'
  ) {
    const usernameFromApp = window.OHApp.getBasicCredentialsUsername()
    const passwordFromApp = window.OHApp.getBasicCredentialsPassword()
    basicCredentials = { id: usernameFromApp, password: passwordFromApp }
    tokenInCustomHeader = true
    return
  } else if ('credentials' in navigator && 'preventSilentAccess' in navigator.credentials && 'PasswordCredential' in window) {
    // @ts-expect-error PasswordCredential not included in type defs, see https://github.com/microsoft/TypeScript/issues/34550
    return navigator.credentials.get({ password: true }).then((credentials) => {
      if (credentials) {
        console.log('Using stored Basic credentials to sign in to a reverse proxy service')
        // @ts-expect-error PasswordCredential not included in type defs, see https://github.com/microsoft/TypeScript/issues/34550
        basicCredentials = { id: credentials.id, password: credentials.password as string }
        tokenInCustomHeader = true
      }
      return
    })
  } else {
    return
  }
}

export function clearBasicCredentials(): void {
  basicCredentials = null
  tokenInCustomHeader = document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0
}

export function storeBasicCredentials(): void {
  if (basicCredentials && 'credentials' in navigator && 'preventSilentAccess' in navigator.credentials && 'PasswordCredential' in window) {
    // @ts-expect-error PasswordCredential not included in type defs, see https://github.com/microsoft/TypeScript/issues/34550
    void navigator.credentials.store(new window.PasswordCredential(basicCredentials) as Credential)
  }
}

export function setAccessToken(token: string): void {
  if (!token) return
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

export function isLoggedIn() {
  return useUserStore().user !== null
}

export function isAdmin(): boolean {
  const user = useUserStore().user
  if (!user || !user.roles) return false
  return user.roles.indexOf('administrator') >= 0
}

// As Framework7 RouteCallbackCtx uses Function type:
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function enforceAdminForRoute({ resolve, reject }: { resolve: Function; reject: Function }): void {
  if (!isAdmin()) {
    reject()
    void authorize()
  } else {
    resolve()
  }
}

export default {
  setAccessToken,
  clearAccessToken,
  setBasicCredentials
}
