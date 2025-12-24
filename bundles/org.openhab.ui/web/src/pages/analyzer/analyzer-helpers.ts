import { Marker, type VisualMap, type ValueAxisOptions, ValueAxisSplitOptions } from './types'
import type { AggregateCoordSettings } from './chart-aggregate'
import type { TimeCoordSettings } from './chart-time'
import { OhChartVisualmap, Orient, OhTimeSeries, OhAggregateSeries, OhValueAxis } from '@/types/components/widgets'

import * as api from '@/api'

function parseUnit (item: api.EnrichedItem | api.GroupItem) : string {
  let unit = ('transformedState' in item && item.transformedState) ? item.transformedState.split(' ')[1] :
    ('state' in item) ? (typeof item.state === 'string' ? item.state.split(' ')[1] : undefined) :
      ('stateDescription' in item) ? (item as any).stateDescription.pattern?.split(' ')[1] : null
  if (unit) unit = unit.replace(/^%%/, '%')

  return unit || ''
}

export function getYAxis (item : api.EnrichedItem | api.GroupItem, coordSettings : TimeCoordSettings | AggregateCoordSettings) : number {
  let unit = parseUnit(item)
  let unitAxis = coordSettings.valueAxesOptions.findIndex((a) => a.unit === unit)
  if (unitAxis >= 0) {
    return unitAxis
  } else {
    coordSettings.valueAxesOptions.push({ name: unit, unit, split: ValueAxisSplitOptions.line })
    return coordSettings.valueAxesOptions.length - 1
  }
}

export function renderVisualMap (visualMap: VisualMap) : api.UiComponent[] {
  const config: OhChartVisualmap.Config = {
    show: true,
    orient: Orient.horizontal,
    calculable: true,
    bottom: '0',
    left: 'center',
    presetPalette: visualMap.palette,
    type: visualMap.type
  }

  if (visualMap.min !== null && visualMap.min !== undefined && visualMap.min !== '') {
    const minValue = typeof visualMap.min === 'string' ? parseFloat(visualMap.min) : visualMap.min
    if (!isNaN(minValue) && isFinite(minValue)) {
      config.min = minValue.toString()
    }
  }

  if (visualMap.max !== null && visualMap.max !== undefined && visualMap.max !== '') {
    const maxValue = typeof visualMap.max === 'string' ? parseFloat(visualMap.max) : visualMap.max
    if (!isNaN(maxValue) && isFinite(maxValue)) {
      config.max = maxValue.toString()
    }
  }

  return [{
    component: 'oh-chart-visualmap',
    config: config as Record<string, unknown>
  }]
}

function getSplitLineConfig (split: ValueAxisSplitOptions | undefined): Record<string, any> {
  const config: Record<string, any> = {}

  const noSplitLine = [ValueAxisSplitOptions.none, ValueAxisSplitOptions.area, ValueAxisSplitOptions.area_minor]
  if (split && noSplitLine.includes(split)) {
    config.splitLine = { show: false }
  }

  const showMinorTicks = [ValueAxisSplitOptions.line_minor, ValueAxisSplitOptions.area_minor, ValueAxisSplitOptions.all]
  if (split && showMinorTicks.includes(split)) {
    config.minorTick = { show: true }
    config.minorSplitLine = { show: true }
  }

  const showSplitArea = [ValueAxisSplitOptions.area, ValueAxisSplitOptions.line_area, ValueAxisSplitOptions.area_minor, ValueAxisSplitOptions.all]
  if (split && showSplitArea.includes(split)) {
    config.splitArea = { show: true }
  }

  return config
}

export function renderValueAxis (options : ValueAxisOptions) : api.UiComponent {
  const config : OhValueAxis.Config = {
    gridIndex: 0,
    name: options.name || options.unit,
    scale: options.scale
  }

  if (options.min !== undefined && options.min !== '') {
    const minValue = typeof options.min === 'string' ? parseFloat(options.min) : options.min
    if (!isNaN(minValue) && isFinite(minValue)) {
      config.min = minValue.toString()
    }
  }

  if (options.max !== undefined && options.max !== '') {
    const maxValue = typeof options.max === 'string' ? parseFloat(options.max) : options.max
    if (!isNaN(maxValue) && isFinite(maxValue)) {
      config.max = maxValue.toString()
    }
  }

  return {
    component: 'oh-value-axis',
    config: {
      ...getSplitLineConfig(options.split),
      ...config
    }
  }
}

export function toPrimitiveMarkers (marker: Marker | undefined): Array<OhTimeSeries.Markers | OhAggregateSeries.Markers> {
  const markers : Array<OhTimeSeries.Markers | OhAggregateSeries.Markers> = []

  if (!marker || marker === Marker.none) return markers

  switch(marker) {
    case Marker.all:
      markers.push(OhTimeSeries.Markers.min, OhTimeSeries.Markers.max, OhTimeSeries.Markers.avg)
      break
    case Marker.min_max:
      markers.push(OhTimeSeries.Markers.min, OhTimeSeries.Markers.max)
      break
    case Marker.avg:
      markers.push(OhTimeSeries.Markers.avg)
      break
    case Marker.min:
      markers.push(OhTimeSeries.Markers.min)
      break
    case Marker.max:
      markers.push(OhTimeSeries.Markers.max)
      break
  }

  return markers
}
