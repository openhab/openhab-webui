import * as dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

export default {
  get (component, startTime, endTime, chart) {
    let axis = Object.assign({}, component.config)
    axis.type = 'category'
    dayjs.extend(LocalizedFormat)
    let weekday = dayjs().startOf('week')
    const dayFormat = component.config.dayFormat || 'short'
    axis.data = []
    for (let i = 0; i < 7; i++) {
      axis.data.push(weekday.format(dayFormat === 'min' ? 'dd' : dayFormat === 'long' ? 'dddd' : 'ddd'))
      weekday = weekday.add(1, 'day')
    }

    return axis
  }
}
