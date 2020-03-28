export default {
  get (component, startTime, endTime, chart, orient) {
    let calendar = Object.assign({}, component.config)
    calendar.range = [startTime.toDate(), endTime.toDate()]
    if (orient) calendar.orient = orient
    calendar.dayLabel = {
      firstDay: 1,
      margin: 5
    }
    calendar.monthName = {
      margin: 5
    }

    return calendar
  }
}
