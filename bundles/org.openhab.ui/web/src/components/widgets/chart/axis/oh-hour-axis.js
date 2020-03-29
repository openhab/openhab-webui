export default {
  get (component, startTime, endTime, chart, reverse) {
    const config = component.config || {}
    let axis = Object.assign({}, config)
    axis.type = 'category'
    axis.data = []
    for (let i = 0; i < 60; i++) {
      axis.data.push(i)
    }
    if (reverse) axis.data.reverse()

    return axis
  }
}
