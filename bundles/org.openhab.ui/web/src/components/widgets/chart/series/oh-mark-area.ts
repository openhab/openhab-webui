import ComponentId from '../../component-id'
import type { ChartContext } from '../types.ts'
import * as api from '@/api'
import type { Dayjs } from 'dayjs'
import type { MarkAreaComponentOption } from 'echarts'

export interface Config {
  states?: string[]
  item: string
}

type Entry = { name?: string; xAxis: Date; value?: string }

export default {
  get(context: ChartContext, component: api.UiComponent, points: api.ItemHistory[], _startTime: Dayjs, endTime: Dayjs) {
    const markArea = context.evaluateExpression<Config & MarkAreaComponentOption>(
      ComponentId.get(component)!,
      component.config as unknown as Config & MarkAreaComponentOption
    )

    const states = (markArea.states && !Array.isArray(markArea.states) ? [markArea.states] : (markArea.states as string[])) || [
      'ON',
      'OPEN'
    ]
    const itemPoints = points.find((p) => p.name === markArea.item)?.data ?? []

    markArea.data = []
    let rollingState: string | null = null
    let currentArea: Entry[] | null = null

    itemPoints.forEach((p) => {
      const isInState = states.includes(p.state)
      const wasInState = rollingState !== null && states.includes(rollingState)

      if (isInState && !wasInState) {
        currentArea = [
          {
            name: (markArea.name as string) || markArea.item,
            xAxis: new Date(p.time)
          }
        ]
      } else if (!isInState && wasInState && currentArea) {
        // End of area
        currentArea.push({ xAxis: new Date(p.time) })
        if (rollingState) currentArea[0]!.value = rollingState
        // @ts-expect-error currentArea's type isn't type-compatible, but it still works
        markArea.data!.push(currentArea)
        currentArea = null
      }
      rollingState = p.state
    })

    if (Array.isArray(currentArea)) {
      ;(currentArea as unknown[]).push({ xAxis: endTime.toDate() })
      markArea.data.push(currentArea)
    }

    if (!markArea.label) markArea.label = { show: false }

    return markArea as MarkAreaComponentOption
  }
}
