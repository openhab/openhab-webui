import { renderVisualMap } from './analyzer-helpers'

import { SeriesType, type ChartPage, type CoordSettings, type CoordSystem, type CoordUIParams, type SeriesOptions, type VisualMap, type CoordSettingsBase } from './types'
import type { Item } from '@/types/openhab'
import { AggregationFunction, ChartType, OhChartPage, Orient, OhChartVisualmap, OhCalendarSeries, OhChartTooltip, OhCalendarAxis } from '@/types/components'

export interface CalendarCoordSettings extends CoordSettingsBase {
  orientation: Orient
  dimensions: number
  visualMap: VisualMap
}

export interface CalendarSeriesOptions extends SeriesOptions {
  aggregation: AggregationFunction
}

const calendarCoordSystem : CoordSystem = {
  initCoordSystem (coordSettings? : Partial<CalendarCoordSettings>) : CalendarCoordSettings {
    const uiParams : CoordUIParams = {
      showRotation: true,
      isAggregate: true,
      typeOptions: [ChartType.month, ChartType.year]
    }
    return {
      uiParams,
      chartType: (coordSettings && coordSettings.chartType && uiParams.typeOptions.includes(coordSettings.chartType)) ? coordSettings.chartType : ChartType.month,
      dimensions: 2,
      orientation: (coordSettings && coordSettings.orientation) ? coordSettings.orientation : Orient.horizontal,
      visualMap: {
        palette: OhChartVisualmap.PresetPalette.yellowred,
        min: null,
        max: null,
        type: OhChartVisualmap.Type.continuous
      }
    }
  },
  initAxes (coordSettings) {
  },
  initSeries (item : Item, coordSettings : CoordSettings, seriesOptions : Partial<CalendarSeriesOptions>) : CalendarSeriesOptions {
    const calCoordSettings = coordSettings as CalendarCoordSettings

    const options : CalendarSeriesOptions = {
      name: item.label || item.name,
      type: SeriesType.heatmap,
      uiParams: {
        typeOptions: [SeriesType.heatmap]
      },
      aggregation: AggregationFunction.average
    }

    if (!(item.type.startsWith('Number') || item.type === 'Dimmer' ||
      item.groupType?.startsWith('Number') || item.groupType === 'Dimmer')) {
    } else {
      options.type = SeriesType.heatmap
      options.uiParams.typeOptions = [SeriesType.heatmap]
      options.uiParams.showAggregationOptions = true
    }

    return options
  },
  getChartPage (coordSettings : CoordSettings, allSeriesOptions : Record<string, SeriesOptions>, items: Item[]) : ChartPage {
    const calendarCoordSettings = coordSettings as CalendarCoordSettings

    let page : ChartPage = {} as ChartPage

    page.component = 'oh-chart-page'
    page.config = {
      chartType: coordSettings.chartType
    } satisfies OhChartPage.Config
    page.slots = {
      xAxis: [],
      yAxis: [],
      series: [],
      grid: [],
      tooltip: [],
      legend: [],
      visualMap: []
    }

    const calendar = {
      component: 'oh-calendar-axis',
      config: {
        orient: calendarCoordSettings.orientation
      } satisfies OhCalendarAxis.Config
    }

    page.slots.calendar = [calendar]

    page.slots.series = items.map((item : Item) => {
      const seriesOptions = allSeriesOptions[item.name] as CalendarSeriesOptions
      return {
        component: 'oh-calendar-series',
        config: {
          name: item.label || item.name,
          item: item.name,
          calendarIndex: 0,
          type: OhCalendarSeries.Type.heatmap,
          aggregationFunction: seriesOptions.aggregation
        } satisfies OhCalendarSeries.Config
      }
    })

    page.slots.visualMap = renderVisualMap(calendarCoordSettings.visualMap)

    page.slots.tooltip = [
      {
        component: 'oh-chart-tooltip',
        config: {
          confine: true
          // smartFormatter: true
        } satisfies OhChartTooltip.Config
      }
    ]

    return page
  }
}

export default calendarCoordSystem