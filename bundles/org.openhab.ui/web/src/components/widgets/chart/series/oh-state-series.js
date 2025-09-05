import { utils } from 'framework7'
import ComponentId from '../../component-id'
import { graphic } from 'echarts/core'

function renderState (params, api) {
  const yValue = api.value(0)
  const start = api.coord([api.value(1), yValue])
  const duration = api.value(2)
  const end = api.coord([api.value(1) + duration, yValue])
  const state = api.value(3)
  const yHeight = api.value(4)

  if (state === 'UNDEF' || state === 'NULL') return
  const height = api.size([0, 1])[1] * yHeight
  const rectShape = graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    }
  )
  return (
    rectShape && {
      type: 'rect',
      shape: rectShape,
      style: api.style({})
    }
  )
}

export default {
  neededItems (component, chart) {
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)
    return [
      series.item
    ]
  },
  get (component, points, startTime, endTime, chart) {
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)
    series.type = 'custom'
    series.renderItem = renderState
    series.encode = {
      x: -1, // don't filter by x value when zooming
      y: 0,
      tooltip: [3],
      itemName: 3
    }
    series.colorBy = 'data'
    series.label = series.label || { }
    if (series.label.show === undefined) series.label.show = true
    series.label.position = series.label.position || 'insideLeft'
    series.label.formatter = series.label.formatter || '{@[3]}'
    series.labelLayout = series.labelLayout || { hideOverlap: true }
    series.tooltip = series.tooltip || { }
    if (series.tooltip.formatter === undefined) {
      series.tooltip.formatter = (params) => {
        let durationSec = params.value[2] / 1000
        let hours = Math.floor(durationSec / 3600).toString().padStart(2, '0')
        let minutes = Math.floor((durationSec - (hours * 3600)) / 60).toString().padStart(2, '0')
        return params.seriesName + '<br />' + params.marker + params.name + '&#9;(' + hours + ':' + minutes + ')'
      }
    }

    series.data = []

    if (series.item) {
      let itemPoints = points.find((p) => p.name === series.item).data

      if (series.mapState) {
        for (let i = 0; i < itemPoints.length; i++) {
          itemPoints[i].state = series.mapState(itemPoints[i].state)
        }
      }

      let data = []
      let itemStartTime = null
      // fill data array - combine state updates where state does not change
      for (let i = 0; i < itemPoints.length; i++) {
        if (itemPoints[i + 1] && itemPoints[i].state === itemPoints[i + 1].state) {
          itemStartTime = itemStartTime || new Date(itemPoints[i].time)
          continue
        }

        itemStartTime = itemStartTime || new Date(itemPoints[i].time)
        let itemEndTime = new Date(itemPoints[i + 1] ? itemPoints[i + 1].time : endTime)
        let itemDuration = itemEndTime - itemStartTime

        let stateColor = (series.stateColor) ? series.stateColor[itemPoints[i].state] : null
        data.push({
          value: [series.yValue || 0, itemStartTime, itemDuration, itemPoints[i].state, series.yHeight || 0.6],
          itemStyle: {
            color: stateColor
          }
        })
        itemStartTime = null
      }

      series.data = data

      series.id = `oh-state-series#${series.item}#${utils.id()}`
    }

    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}
