import * as dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import LocaleData from 'dayjs/plugin/localeData'
import ComponentId from '../../component-id'
dayjs.extend(LocalizedFormat)
dayjs.extend(LocaleData)

const months = {
  'short': [...dayjs.localeData().monthsShort()],
  'default': [...dayjs.localeData().months()]
}

const weekdays = {
  'min': [...dayjs.localeData().weekdaysMin()],
  'short': [...dayjs.localeData().weekdaysShort()],
  'default': [...dayjs.localeData().weekdays()]
}

export default {
  get (component, startTime, endTime, chart, chartWidget, inverse) {
    const config = component.config || {}
    let axis = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    axis.type = 'category'

    axis.data = axis.data || []
    switch (config.categoryType) {
      case 'hour':
        axis.name = 'min'
        for (let i = 0; i < 60; i++) {
          axis.data.push(i)
        }
        break
      case 'day':
        axis.name = 'h'
        for (let i = 0; i < 24; i++) {
          axis.data.push(i)
        }
        break
      case 'week':
        const axisWeekdays = weekdays[config.weekdayFormat] || weekdays.default
        axis.data = [...axisWeekdays]
        if (!config.startOnSunday) {
          axis.data.push(axis.data.shift())
        }
        break
      case 'month':
        axis.name = 'day'
        for (let i = 1; i <= 31; i++) {
          axis.data.push(i)
        }
        break
      case 'year':
        const axisMonths = months[config.monthFormat] || months.default
        axis.data = [...axisMonths]
        break
    }

    // axis.inverse = inverse
    if (inverse) axis.data = axis.data.reverse()

    return axis
  }
}
