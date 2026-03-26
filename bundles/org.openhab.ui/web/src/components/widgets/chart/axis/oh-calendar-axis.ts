import ComponentId from '../../component-id'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import type { AxisComponent, OhCalendarAxisOption } from '../types'
import type { CalendarOption } from 'echarts/types/dist/shared'

const calendarAxis: AxisComponent = {
  get(context, component, startTime, endTime) {
    const calendar = context.evaluateExpression<OhCalendarAxisOption>(ComponentId.get(component)!, component.config)
    calendar.range = [startTime.toDate(), endTime.subtract(1, 'day').toDate()]
    if (!calendar.dayLabel) calendar.dayLabel = {}
    if (calendar.dayLabel.firstDay === undefined) calendar.dayLabel.firstDay = 1
    if (calendar.dayLabel.margin === undefined) calendar.dayLabel.margin = 5
    if (!calendar.monthLabel) calendar.monthLabel = {}
    if (calendar.monthLabel.margin === undefined) calendar.monthLabel.margin = 5

    if (!calendar.top) calendar.top = 100
    if (!calendar.bottom) calendar.bottom = 50
    if (!calendar.left) calendar.left = 60
    if (!calendar.right) calendar.right = 50

    if (useUIOptionsStore().darkMode === 'dark') {
      if (!calendar.itemStyle) calendar.itemStyle = {}
      if (!calendar.itemStyle.color) calendar.itemStyle.color = '#333'
      if (!calendar.itemStyle.borderColor) calendar.itemStyle.borderColor = '#555'
      if (!calendar.dayLabel) calendar.dayLabel = {}
      if (!calendar.dayLabel.color) calendar.dayLabel.color = '#aaa'
      if (!calendar.monthLabel) calendar.monthLabel = {}
      if (!calendar.monthLabel.color) calendar.monthLabel.color = '#aaa'
      if (!calendar.splitLine) calendar.splitLine = {}
      if (!calendar.splitLine.lineStyle) calendar.splitLine.lineStyle = ({} as { color: string })!
      if (!calendar.splitLine.lineStyle.color) calendar.splitLine.lineStyle.color = '#aaa'
    }

    return calendar
  }
}

export default calendarAxis
