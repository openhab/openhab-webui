export default {
  get (component, startTime, endTime, chart) {
    let axis = Object.assign({}, component.config)
    axis.type = 'value'
    return axis
  }
}
