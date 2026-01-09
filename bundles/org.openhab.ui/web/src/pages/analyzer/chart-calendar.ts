import { renderVisualMap } from './analyzer-helpers.ts'

import { SeriesType, type CoordSettings, type CoordSystem, type SeriesOptions, type VisualMap, type CoordSettingsBase } from './types'
import type { Item, Page } from '@/types/openhab'
import { AggregationFunction, ChartType, OhChartPage, Orient, OhChartVisualmap, OhCalendarSeries, OhChartTooltip, OhCalendarAxis, OhChartLegend } from '@/types/components/widgets/index.gen.ts'

export interface CalendarCoordSettings extends CoordSettingsBase {
  orientation: Orient
  visualMap: VisualMap
  auxColumn: string
}

export interface CalendarSeriesOptions extends SeriesOptions {
  aggregation: AggregationFunction
}

const calendarCoordSystem : CoordSystem = {
  initCoordSystem (coordSettings? : Partial<CalendarCoordSettings>) : CalendarCoordSettings {
    const typeOptions : ChartType[] = [ChartType.month, ChartType.year]
    return {
      typeOptions,
      chartType: (coordSettings && coordSettings.chartType && typeOptions.includes(coordSettings.chartType)) ? coordSettings.chartType : ChartType.month,
      orientation: (coordSettings && coordSettings.orientation) ? coordSettings.orientation : Orient.horizontal,
      auxColumn: 'aggregation',
      visualMap: {
        palette: OhChartVisualmap.PresetPalette.yellowred,
        min: null,
        max: null,
        type: OhChartVisualmap.Type.continuous
      }
    }
  },
  initAxes (coordSettings) {
    // calendar chart has no axes
  },
  initSeries (item : Item, coordSettings : CoordSettings, seriesOptions : Partial<CalendarSeriesOptions>) : CalendarSeriesOptions {
    const options : CalendarSeriesOptions = {
      name: item.label || item.name,
      type: SeriesType.none,
      typeOptions: [],
      aggregation: AggregationFunction.average
    }

    if ((item.type.startsWith('Number') || item.type === 'Dimmer' ||
      item.groupType?.startsWith('Number') || item.groupType === 'Dimmer')) {
      options.type = SeriesType.heatmap
      options.typeOptions = [SeriesType.heatmap]
    }

    return options
  },
  getChartPage (coordSettings : CoordSettings, allSeriesOptions : Record<string, SeriesOptions>, items: Item[]) : Page {
    const calendarCoordSettings = coordSettings as CalendarCoordSettings

    let page : Page = {
      component: 'oh-chart-page',
      config: {
        chartType: coordSettings.chartType
      } satisfies OhChartPage.Config
    }

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

    page.slots.legend = [
      {
        component: 'oh-chart-legend',
        config: {
          top: '20',
          left: '15',
          type: 'scroll',
          data: items.reduce<Array<{ name: string }>>((legendItems, item) => {
            const seriesOptions = allSeriesOptions[item.name] as CalendarSeriesOptions
            if (seriesOptions.type !== SeriesType.state) {
              legendItems.push({ name: seriesOptions.name })
            }
            return legendItems
          }, [])
        } satisfies OhChartLegend.Config & Record<string, unknown>
      }
    ]

    return page
  }
}

export default calendarCoordSystem
