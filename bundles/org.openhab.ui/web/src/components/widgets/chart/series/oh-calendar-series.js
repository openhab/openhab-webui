import * as dayjs from 'dayjs'

export default {
  get (component, points) {
    const data = points.data.reduce((acc, p) => {
      let day = dayjs(p.time).startOf('day')
      if (acc.length && acc[acc.length - 1][0].isSame(day)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([day, [p.state]])
      }
      return acc
    }, []).map((arr) => {
      const aggregationFunction = component.config.aggregationFunction || 'average'
      let aggregate
      switch (aggregationFunction) {
        default:
          // average
          aggregate = arr[1].reduce((sum, state) => sum + parseFloat(state), 0) / arr[1].length
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
