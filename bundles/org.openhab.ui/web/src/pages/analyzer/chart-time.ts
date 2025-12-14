import { getYAxis, renderValueAxis, toPrimitiveMarkers } from './analyzer-helpers.ts'

import { Marker, SeriesType, type CoordSystem, type CoordSettings, type SeriesOptions, type ValueAxisOptions, type CoordSettingsBase } from './types.js'
import type { Item, Page } from '@/types/openhab'
import { OhCategoryAxis, OhChartPage, OhValueAxis, ChartType, Period, OhStateSeries, OhTimeSeries, OhChartTooltip, OhChartLegend } from '@/types/components/widgets'

export interface TimeCoordSettings extends CoordSettingsBase {
    valueAxesOptions: Array<ValueAxisOptions>
    categoryAxisValues: Array<string>
    period: Period
}

export interface TimeSeriesOptions extends SeriesOptions {
    valueAxisIndex: number
    marker?: Marker
    yValue?: number
    showAxesOptions?: boolean
}

const GRID_CONFIG = {
  /** Pixels per category item in grid */
  CATEGORY_HEIGHT_PER_ITEM_PERCENT: 20,
  /** Maximum percentage of chart height for categories */
  MAX_CATEGORY_GRID_PERCENT: 50,
  /** Default bottom margin when no categories */
  DEFAULT_BOTTOM_MARGIN_PIX: 60,
  /** Padding between value and category grids */
  GRID_PADDING_PERCENT: 10
} as const

const timeCoordSystem : CoordSystem = {
  initCoordSystem (coordSettings? : Partial<TimeCoordSettings>) : TimeCoordSettings {
    const typeOptions : ChartType[] = [ChartType.day, ChartType.isoWeek, ChartType.week, ChartType.month, ChartType.year]
    return {
      period: coordSettings?.period || Period.D,
      categoryAxisValues: [],
      valueAxesOptions: [],
      typeOptions,
      chartType: (coordSettings && coordSettings.chartType && typeOptions.includes(coordSettings.chartType)) ? coordSettings.chartType : ChartType.dynamic
    }
  },
  initAxes (coordSettings : Partial<TimeCoordSettings>) : void {
    coordSettings.categoryAxisValues = []
    coordSettings.valueAxesOptions = []
  },
  initSeries (item : Item, coordSettings : CoordSettings, seriesOptions: Partial<TimeSeriesOptions>) : SeriesOptions {
    const timeCoordSettings = coordSettings as unknown as TimeCoordSettings

    const options : TimeSeriesOptions = {
      name: item.label || item.name,
      typeOptions: [SeriesType.line, SeriesType.area, SeriesType.state],
      type: SeriesType.line,
      valueAxisIndex: 0
    }

    if (item.type.startsWith('Number') || item.groupType?.startsWith('Number')) {
      options.marker = Marker.none
      options.showAxesOptions = true
      options.type = (seriesOptions?.type && options.typeOptions.includes(seriesOptions.type)) ? seriesOptions.type : SeriesType.line
    } else if (item.type === 'Dimmer' || item.groupType === 'Dimmer' || item.type === 'Rollershutter' || item.groupType === 'Rollershutter') {
      options.showAxesOptions = false
      options.marker = Marker.none
      options.type = (seriesOptions?.type && options.typeOptions.includes(seriesOptions.type)) ? seriesOptions.type : SeriesType.line
    } else {
      options.typeOptions = [SeriesType.state]
      options.showAxesOptions = false
      options.type = SeriesType.state
    }

    // determine the Y axis for the item
    if (options.type === SeriesType.state) {
      timeCoordSettings.categoryAxisValues.unshift(item.name)
      options.yValue = timeCoordSettings.categoryAxisValues.length - 1
    } else if (options.type === SeriesType.line || options.type === SeriesType.area || options.type === SeriesType.bar) {
      options.valueAxisIndex = getYAxis(item, timeCoordSettings)
    }

    return options
  },
  getChartPage (coordSettings : CoordSettings, allSeriesOptions : Record<string, SeriesOptions>, items: Item[]) : Page {
    const timeCoordSettings = coordSettings as unknown as TimeCoordSettings

    let page : Page = {
      component: 'oh-chart-page',
      config: {
        chartType: coordSettings.chartType,
        period: timeCoordSettings.period
      } satisfies OhChartPage.Config
    }

    page.slots = {
      xAxis: [],
      yAxis: [],
      series: [],
      grid: [],
      tooltip: [],
      legend: [],
      dataZoom: []
    }

    let valueGrid = (timeCoordSettings.valueAxesOptions.length > 0)
    let categoryGrid = (timeCoordSettings.categoryAxisValues.length > 0)

    let categoryGridSize = timeCoordSettings.categoryAxisValues.length * GRID_CONFIG.CATEGORY_HEIGHT_PER_ITEM_PERCENT
    categoryGridSize = Math.min(categoryGridSize, GRID_CONFIG.MAX_CATEGORY_GRID_PERCENT)

    if (valueGrid) {
      page.slots.grid.push({ component: 'oh-chart-grid', config: { includeLabels: true, bottom: (categoryGrid) ? `${categoryGridSize + GRID_CONFIG.GRID_PADDING_PERCENT}%` : GRID_CONFIG.DEFAULT_BOTTOM_MARGIN_PIX } })
      page.slots.xAxis.push({ component: 'oh-time-axis', config: { gridIndex: 0 } })
      page.slots.yAxis = timeCoordSettings.valueAxesOptions.map((a) => {
        return renderValueAxis(a)
      })
    }

    let categoryGridIndex = (valueGrid) ? 1 : 0
    if (categoryGrid) {
      page.slots.grid.push({ component: 'oh-chart-grid', config: { includeLabels: true, top: (valueGrid) ? `${100 - categoryGridSize}%` : GRID_CONFIG.DEFAULT_BOTTOM_MARGIN_PIX } })
      page.slots.xAxis.push({ component: 'oh-time-axis', config: { gridIndex: categoryGridIndex } })
      page.slots.yAxis.push({
        component: 'oh-category-axis',
        config: {
          data: timeCoordSettings.categoryAxisValues.map((item) => { return allSeriesOptions[item].name }),
          gridIndex: categoryGridIndex,
          categoryType: OhCategoryAxis.CategoryType.values,
          monthFormat: OhCategoryAxis.MonthFormat.short,
          weekdayFormat: OhCategoryAxis.WeekdayFormat.short
        } satisfies OhCategoryAxis.Config
      })
    }

    if (page.slots.yAxis.length === 0) {
      // add a default axis if none was found (for instance, only discrete values)
      page.slots.yAxis.push({
        component: 'oh-value-axis',
        config: {
          gridIndex: 0
        } satisfies OhValueAxis.Config
      })
    }

    page.slots.series = items.map((item : Item) => {
      const seriesOptions = allSeriesOptions[item.name] as TimeSeriesOptions

      if (seriesOptions.type === 'state') {
        return {
          component: 'oh-state-series',
          config: {
            item: item.name,
            name: seriesOptions.name,
            xAxisIndex: categoryGridIndex,
            yAxisIndex: page.slots!.yAxis.length - 1,
            yValue: seriesOptions.yValue
          } satisfies OhStateSeries.Config
        }
      }

      return {
        component: 'oh-time-series',
        config: {
          name: seriesOptions.name,
          xAxisIndex: 0,
          yAxisIndex: seriesOptions.valueAxisIndex,
          type: OhTimeSeries.Type.line,
          item: item.name,
          areaStyle: seriesOptions.type === SeriesType.area ? { opacity: 0.2 } : undefined,
          markers: toPrimitiveMarkers(seriesOptions.marker)
        } satisfies OhTimeSeries.Config & Record<string, unknown>
      }
    })

    page.slots.tooltip = [{
      component: 'oh-chart-tooltip',
      config: {
        confine: true,
        smartFormatter: true
      } satisfies OhChartTooltip.Config & Record<string, unknown>
    }]

    page.slots.legend = [{
      component: 'oh-chart-legend',
      config: {
        bottom: '3',
        type: 'scroll',
        data: items.reduce<Array<{ name: string }>>((legendItems, item) => {
          const seriesOptions = allSeriesOptions[item.name] as TimeSeriesOptions
          if (seriesOptions.type !== SeriesType.state) {
            legendItems.push({ name: seriesOptions.name })
          }
          return legendItems
        }, [])
      } satisfies OhChartLegend.Config & Record<string, unknown>
    }]

    page.slots.dataZoom = [{
      component: 'oh-chart-datazoom',
      config: {
        type: 'inside',
        xAxisIndex: (valueGrid && categoryGrid) ? [0, 1] : [0]
      }
    }]

    return page
  }
}

export default timeCoordSystem
