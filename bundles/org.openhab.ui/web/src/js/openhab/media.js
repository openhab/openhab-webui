import { getBasicCredentials } from '@/js/openhab/auth'
import Framework7 from 'framework7/framework7-lite.esm.bundle.js'

export default {
  getIcon: (icon, format, state, iconSet) => {
    if (!format) format = 'svg'
    let url = `/icon/${icon}?format=${format}&anyFormat=true`
    if (state) url += `&state=${encodeURIComponent(state)}`
    if (iconSet) url += `&iconset=${iconSet}`

    if (getBasicCredentials()) {
      return new Promise((resolve, reject) => {
        Framework7.request.promise({ url, xhrFields: { responseType: 'blob' } }).then((resp) => {
          let reader = new FileReader()
          reader.readAsDataURL(resp.data)
          reader.onload = () => {
            return resolve(reader.result)
          }
        })
      })
    } else {
      return Promise.resolve(url)
    }
  },
  getImage: (url) => {
    if (getBasicCredentials()) {
      return new Promise((resolve, reject) => {
        Framework7.request.promise({ url, xhrFields: { responseType: 'blob' } }).then((resp) => {
          let reader = new FileReader()
          reader.readAsDataURL(resp.data)
          reader.onload = () => {
            return resolve(reader.result)
          }
        })
      })
    } else {
      return Promise.resolve(url)
    }
  }
}
