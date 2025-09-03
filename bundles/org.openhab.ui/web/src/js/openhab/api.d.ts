declare namespace _default {
  export async function get(uri: any, data?: any): Promise<any>
  export async function getPlain(
    uri: any,
    data: any,
    contentType: any,
    responseType: any,
    headers: any
  ): Promise<any>
  export async function post(uri: any, data: any, dataType: any): Promise<any>
  export async function postPlain(
    uri: any,
    data: any,
    dataType: any,
    contentType: any,
    headers: any
  ): Promise<any>
  export async function put(uri: any, data: any): Promise<any>
  export async function putPlain(uri: any, data: any, dataType: any, contentType: any): Promise<any>
  export async function head(uri: any): Promise<any>
  export async function _delete(uri: any, data: any): Promise<any>
  export { _delete as delete }
}
export default _default
