export default {
  get (component, startTime, endTime) {
    let axis = Object.assign({}, component.config)
    axis.type = 'time'
    return axis
  }
}
