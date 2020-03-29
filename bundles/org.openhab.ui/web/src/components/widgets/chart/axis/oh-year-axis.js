import * as dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import LocaleData from 'dayjs/plugin/localeData'

export default {
  get (component, startTime, endTime, chart, reverse) {
    const config = component.config || {}
    let axis = Object.assign({}, config)
    axis.type = 'category'
    dayjs.extend(LocalizedFormat)
    dayjs.extend(LocaleData)
    switch (config.dayFormat) {
      case 'short':
        axis.data = dayjs.localeData().monthsShort()
        break
      default:
        axis.data = dayjs.localeData().months()
        break
    }
    if (reverse) axis.data.reverse()

    return axis
  }
}
