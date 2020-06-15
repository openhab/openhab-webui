export default {
  getIcon: (icon, format, state) => {
    if (!format) format = 'svg'
    let url = `/icon/${icon}?format=${format}`
    if (state) url += `&state=${state}`

    // TODO handle basic auth with blobs and data URIs if necessary
    // return new Promise((resolve, reject) => {
    //   Framework7.request.promise({ url, xhrFields: { responseType: 'blob' } }).then((resp) => {
    //     let reader = new FileReader()
    //     reader.readAsDataURL(resp.data)
    //     reader.onload = () => {
    //       return resolve(reader.result)
    //     }
    //   })
    // })
    return Promise.resolve(url)
  }
}
