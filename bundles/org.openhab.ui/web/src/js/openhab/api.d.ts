declare namespace _default {
  export function get(uri: any, data?: any): Promise<any>
  export function getPlain(
    uri: any,
    data: any,
    contentType: any,
    responseType: any,
    headers: any
  ): Promise<any>
  export function post(uri: any, data: any, dataType: any): Promise<any>
  export function postPlain(
    uri: any,
    data: any,
    dataType: any,
    contentType: any,
    headers: any
  ): Promise<any>
  export function put(uri: any, data: any): Promise<any>
  export function putPlain(uri: any, data: any, dataType: any, contentType: any): Promise<any>
  export function head(uri: any): Promise<any>
  function _delete(uri: any, data: any): Promise<any>
  export { _delete as delete }
}
export default _default
