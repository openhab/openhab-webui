import ComponentId from '../../component-id'

export default {
  get (component, startTime, endTime, chart, chartWidget, orient) {
    let calendar = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    calendar.range = [startTime.toDate(), endTime.subtract(1, 'day').toDate()]
    if (orient) calendar.orient = orient
    calendar.dayLabel = {
      firstDay: 1,
      margin: 5
    }
    calendar.monthName = {
      margin: 5
    }

    if (!calendar.top) calendar.top = 100
    if (!calendar.bottom) calendar.bottom = 50
    if (!calendar.left) calendar.left = 60
    if (!calendar.right) calendar.right = 50

    if (document && document.documentElement.classList.contains('theme-dark')) {
      if (!calendar.itemStyle) calendar.itemStyle = {}
      if (!calendar.itemStyle.color) calendar.itemStyle.color = '#333'
      if (!calendar.itemStyle.borderColor) calendar.itemStyle.borderColor = '#555'
      if (!calendar.itemStyle) calendar.itemStyle = {}
      if (!calendar.dayLabel) calendar.dayLabel = {}
      if (!calendar.dayLabel.color) calendar.dayLabel.color = '#aaa'
      if (!calendar.monthLabel) calendar.monthLabel = {}
      if (!calendar.monthLabel.color) calendar.monthLabel.color = '#aaa'
      if (!calendar.splitLine) calendar.splitLine = {}
      if (!calendar.splitLine.lineStyle) calendar.splitLine.lineStyle = {}
      if (!calendar.splitLine.lineStyle.color) calendar.splitLine.lineStyle.color = '#aaa'
    }

    return calendar
  }
}
