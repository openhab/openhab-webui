import * as dayjs from 'dayjs'

export default {
  neededItems (component) {
    if (!component || !component.config || !component.config.item) return []
    return [component.config.item]
  },
  get (component, points) {
    const itemPoints = points.find(p => p.name === component.config.item).data
    const groups = itemPoints.reduce((acc, p) => {
      let day = dayjs(p.time).startOf('day')
      if (acc.length && acc[acc.length - 1][0].isSame(day)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([day, [p.state]])
      }
      return acc
    }, [])

    console.debug(groups)

    const data = groups.map((arr, idx, days) => {
      const aggregationFunction = component.config.aggregationFunction || 'average'
      let aggregate
      switch (aggregationFunction) {
        case 'sum':
          aggregate = arr[1].reduce((sum, state) => sum + parseFloat(state), 0)
          break
        case 'min':
          aggregate = arr[1].reduce((min, state) => parseFloat(state) < min ? parseFloat(state) : min, +Infinity)
          break
        case 'max':
          aggregate = arr[1].reduce((max, state) => parseFloat(state) > max ? parseFloat(state) : max, -Infinity)
          break
        case 'first':
          aggregate = arr[1][0]
          break
        case 'last':
          aggregate = arr[1][arr[1].length - 1]
          break
        case 'diff_first':
          aggregate = idx < 1 ? NaN : arr[1][0] - days[idx - 1][1][0]
          break
        case 'diff_last':
          aggregate = idx < 1 ? NaN : arr[1][arr[1].length - 1] - days[idx - 1][1][days[idx - 1][1].length - 1]
          break
        case 'average':
          aggregate = arr[1].reduce((sum, state) => sum + parseFloat(state), 0) / arr[1].length
          break
        default:
          aggregate = arr[1][0]
          break
      }
      return [arr[0].toDate(), aggregate]
    })

    let series = Object.assign({}, component.config)
    if (!series.type) series.type = 'heatmap'
    series.coordinateSystem = 'calendar'

    series.data = data

    // other things
    return series
  }
}
