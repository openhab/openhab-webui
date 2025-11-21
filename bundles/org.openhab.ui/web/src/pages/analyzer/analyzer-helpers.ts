import type { Item, UIComponent } from '@/types/openhab'
import { Marker, type VisualMap } from './types'
import type { AggregateCoordSettings } from './chart-aggregate'
import type { TimeCoordSettings } from './chart-time'
import { OhChartVisualmap, Orient, OhTimeSeries, OhAggregateSeries } from '@/types/components/widgets'

function parseUnit (item: Item) : string {
  let unit =
    item.transformedState?.split(' ')[1] ??
    item.state?.split(' ')[1] ??
    item.stateDescription?.pattern?.split(' ')[1]
  if (unit) unit = unit.replace(/^%%/, '%')

  return unit || ''
}

export function getYAxis (item : Item, coordSettings : TimeCoordSettings | AggregateCoordSettings) : number {
  let unit = parseUnit(item)
  let unitAxis = coordSettings.valueAxesOptions.findIndex((a) => a.unit === unit)
  if (unitAxis >= 0) {
    return unitAxis
  } else {
    coordSettings.valueAxesOptions.push({ name: unit, unit, split: 'line' })
    return coordSettings.valueAxesOptions.length - 1
  }
}

export function renderVisualMap (visualMap: VisualMap) : UIComponent[] {
  const min = Number(visualMap.min)
  const max = Number(visualMap.max)
  return [
    {
      component: 'oh-chart-visualmap',
      config: {
        show: true,
        orient: Orient.horizontal,
        calculable: true,
        bottom: '0',
        left: 'center',
        presetPalette: visualMap.palette,
        type: visualMap.type,
        // ...(visualMap.max && visualMap.max !== '') && { max: parseFloat(visualMap.max) }
        ...(min) && { min: min.toString() },
        ...(max) && { max: max.toString() }
      } satisfies OhChartVisualmap.Config & Record<string, unknown>
    }
  ]
}

export function renderValueAxis (a : any) : UIComponent {
  return {
    component: 'oh-value-axis',
    config: {
      gridIndex: 0,
      name: a.name || a.unit,
      ...(a.min && a.min !== '') && { min: parseFloat(a.min) },
      ...(a.max && a.max !== '') && { max: parseFloat(a.max) },
      scale: a.scale,
      ...(a.split === 'none' || a.split === 'area' || a.split === 'area+minor') && { splitLine: { show: false } },
      ...(a.split === 'line+minor' || a.split === 'area+minor' || a.split === 'all') && { minorTick: { show: true }, minorSplitLine: { show: true } },
      ...(a.split === 'area' || a.split === 'line+area' || a.split === 'area+minor' || a.split === 'all') && { splitArea: { show: true } }
    }
  }
}

export function toPrimitiveMarkers (marker: Marker): Array<OhTimeSeries.Markers | OhAggregateSeries.Markers> {
  const markers : Array<OhTimeSeries.Markers>= []

  if (marker === Marker.all) markers.push(OhTimeSeries.Markers.min, OhTimeSeries.Markers.max, OhTimeSeries.Markers.avg)
  if (marker === Marker.min_max) markers.push(OhTimeSeries.Markers.min, OhTimeSeries.Markers.max)
  if (marker === Marker.avg) markers.push(OhTimeSeries.Markers.avg)
  if (marker === Marker.min) markers.push(OhTimeSeries.Markers.min)
  if (marker === Marker.max) markers.push(OhTimeSeries.Markers.max)
  return markers
}