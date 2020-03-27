export default {
  get (component, points) {
    const data = points.data.map((p) => {
      return [new Date(p.time), p.state]
    })

    let series = Object.assign({}, component.config)
    series.data = data

    // other things
    return series
  }
}
