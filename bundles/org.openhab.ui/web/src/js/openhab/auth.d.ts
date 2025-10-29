export function getAccessToken(): any
export function getTokenInCustomHeader(): boolean
export function getBasicCredentials(): any
export function getRequireToken(): any
export function authorize(setup?: any): Promise<void>
export function setBasicCredentials(username: any, password: any): Promise<void>
export function clearBasicCredentials(): void
export function storeBasicCredentials(): void
export function setAccessToken(token: any, api: any): any
export function clearAccessToken(): void
export function isLoggedIn(): boolean
export function isAdmin(): boolean
export function enforceAdminForRoute(context: any): void
declare namespace _default {
  export { setAccessToken }
  export { clearAccessToken }
  export { setBasicCredentials }
}
export default _default
