export default {
  get (component, startTime, endTime, chart, orient) {
    let calendar = Object.assign({}, component.config)
    calendar.range = [startTime.toDate(), endTime.subtract(1, 'day').toDate()]
    if (orient) calendar.orient = orient
    calendar.dayLabel = {
      firstDay: 1,
      margin: 5
    }
    calendar.monthName = {
      margin: 5
    }

    if (!calendar.top) calendar.top = 80
    if (!calendar.bottom) calendar.bottom = 50
    if (!calendar.left) calendar.left = 50
    if (!calendar.right) calendar.right = 50

    return calendar
  }
}
