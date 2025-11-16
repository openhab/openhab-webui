import { getYAxis, renderVisualMap, renderValueAxis, toPrimitiveMarkers } from './analyzer-helpers.js'

import { OhAggregateSeries, OhCategoryAxis, OhChartPage, OhValueAxis, ChartType, Orient, OhChartTooltip, OhChartLegend, OhChartVisualmap } from '@/types/components'

import { Marker, type CoordSystem, type SeriesOptions, type CoordSettings, type CoordUIParams, SeriesType, type ValueAxisOptions, type ChartPage, type VisualMap, type CoordSettingsBase } from './types.js'
import type { PageSlotComponent, Item  } from '@/types/openhab'


const DIMENSION_MAP : Partial<Record<ChartType, [OhAggregateSeries.Dimension, OhCategoryAxis.CategoryType, OhAggregateSeries.Dimension] >> = { // dimension1, category2, dimension2
  [ChartType.day]: [OhAggregateSeries.Dimension.hour, OhCategoryAxis.CategoryType.hour, OhAggregateSeries.Dimension.minute],
  [ChartType.week]: [OhAggregateSeries.Dimension.weekday, OhCategoryAxis.CategoryType.day, OhAggregateSeries.Dimension.hour],
  [ChartType.isoWeek]: [OhAggregateSeries.Dimension.isoWeekday, OhCategoryAxis.CategoryType.day, OhAggregateSeries.Dimension.hour],
  [ChartType.month]: [OhAggregateSeries.Dimension.date, OhCategoryAxis.CategoryType.day, OhAggregateSeries.Dimension.hour],
  [ChartType.year]: [OhAggregateSeries.Dimension.month, OhCategoryAxis.CategoryType.month, OhAggregateSeries.Dimension.date]
}

export interface AggregateCoordSettings extends CoordSettingsBase {
  orientation: Orient
  dimensions: number
  valueAxesOptions: Array<ValueAxisOptions>
  visualMap: VisualMap
}

export interface AggregateSeriesOptions extends SeriesOptions {
  valueAxisIndex: number
  aggregation: OhAggregateSeries.AggregationFunction
  marker: Marker
}

const aggregateCoordSystem : CoordSystem = {
  initCoordSystem (coordSettings? : Partial<AggregateCoordSettings>) : AggregateCoordSettings {
    const uiParams : CoordUIParams= {
      typeOptions: [ChartType.day, ChartType.isoWeek, ChartType.month, ChartType.year],
      showRotation: true,
      showMultiDimension: true,
      isAggregate: true
    }
    return {
      dimensions: (coordSettings && coordSettings.dimensions) ? coordSettings.dimensions : 1,
      valueAxesOptions: [],
      uiParams,
      chartType: (coordSettings && coordSettings.chartType && uiParams.typeOptions.includes(coordSettings.chartType)) ? coordSettings.chartType : ChartType.day,
      orientation: (coordSettings && coordSettings.orientation) ? coordSettings.orientation : Orient.horizontal,
      visualMap: {
        palette: OhChartVisualmap.PresetPalette.yellowred,
        min: null,
        max: null,
        type: OhChartVisualmap.Type.continuous
      }
    }
  },
  initAxes (coordSettings : Partial<AggregateCoordSettings>) : void {
    coordSettings.valueAxesOptions = []
  },
  initSeries (item : Item, coordSettings : CoordSettings, seriesOptions : Partial<AggregateSeriesOptions>) : AggregateSeriesOptions {
    const aggregateCoordSettings = coordSettings as AggregateCoordSettings

    const options : AggregateSeriesOptions = {
      name: item.label || item.name,
      type: SeriesType.none,
      uiParams: {
        typeOptions: [],
        showAggregationOptions: false
      },
      aggregation: seriesOptions.aggregation || OhAggregateSeries.AggregationFunction.average,
      valueAxisIndex: 0,
      marker: Marker.none
    }

    if ((item.type.startsWith('Number') || item.type === 'Dimmer' ||
        item.groupType?.startsWith('Number') || item.groupType === 'Dimmer')) {
      options.uiParams.showAggregationOptions = true

      if (aggregateCoordSettings.dimensions === 2) {
        options.uiParams.typeOptions = [SeriesType.heatmap]
        options.type = SeriesType.heatmap
      } else {
        options.uiParams.typeOptions = [SeriesType.bar, SeriesType.line, SeriesType.area]
        options.type = (seriesOptions.type && options.uiParams.typeOptions.includes(seriesOptions.type)) ? seriesOptions.type : SeriesType.bar
        options.uiParams.showAxesOptions = true
        options.uiParams.showMarkerOptions = true
        options.valueAxisIndex = getYAxis(item, aggregateCoordSettings)
      }
    }

    return options
  },
  getChartPage (coordSettings : CoordSettings, allSeriesOptions : Record<string, SeriesOptions>, items: Item[]) : ChartPage {
    const aggregateCoordSettings = coordSettings as AggregateCoordSettings

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

    page.slots.grid = [{ component: 'oh-chart-grid', config: {} }]

    const categoryType = (aggregateCoordSettings.chartType === ChartType.isoWeek || aggregateCoordSettings.chartType === ChartType.dynamic) ? OhCategoryAxis.CategoryType.week : (aggregateCoordSettings.chartType as unknown as OhCategoryAxis.CategoryType)

    const axis1 = [{
      component: 'oh-category-axis',
      config: {
        gridIndex: 0,
        categoryType: categoryType,
        startonSunday: (aggregateCoordSettings.chartType === ChartType.week) ? true : undefined,
        monthFormat: OhCategoryAxis.MonthFormat.short,
        weekdayFormat: OhCategoryAxis.WeekdayFormat.short
      } satisfies OhCategoryAxis.Config
    }]

    const dims = DIMENSION_MAP[aggregateCoordSettings.chartType] ?? [OhAggregateSeries.Dimension.hour, OhCategoryAxis.CategoryType.hour, OhAggregateSeries.Dimension.minute]
    const dimension1 = dims[0]

    let axis2 : PageSlotComponent[]
    let dimension2 : OhAggregateSeries.Dimension | undefined
    if (aggregateCoordSettings.dimensions === 2) {
      const category2 = dims[1]
      dimension2 = dims[2]
      axis2 = [{
        component: 'oh-category-axis',
        config: {
          gridIndex: 0,
          categoryType: category2,
          monthFormat: OhCategoryAxis.MonthFormat.short,
          weekdayFormat: OhCategoryAxis.WeekdayFormat.short
        } satisfies OhCategoryAxis.Config
      }]
    } else {
      if (aggregateCoordSettings.valueAxesOptions.length === 0) {
        axis2 = [{
          component: 'oh-value-axis',
          config: {
            gridIndex: 0
          } satisfies OhValueAxis.Config
        }]
      } else {
        axis2 = aggregateCoordSettings.valueAxesOptions.map((a) => renderValueAxis(a))
      }
    }

    if (aggregateCoordSettings.orientation === Orient.vertical) {
      page.slots.xAxis = axis2
      page.slots.yAxis = axis1
    } else {
      page.slots.xAxis = axis1
      page.slots.yAxis = axis2
    }

    page.slots.series = items.filter((item) => (item.type.startsWith('Number') || item.type === 'Dimmer')).map((item : Item) => {
      const seriesOptions = allSeriesOptions[item.name] as AggregateSeriesOptions

      return {
        component: 'oh-aggregate-series',
        config: {
          name: seriesOptions.name,
          item: item.name,
          xAxisIndex: (aggregateCoordSettings.orientation === Orient.vertical && !dimension2) ? seriesOptions.valueAxisIndex : 0,
          yAxisIndex: (aggregateCoordSettings.orientation !== Orient.vertical && !dimension2) ? seriesOptions.valueAxisIndex : 0,
          type: dimension2 ? OhAggregateSeries.Type.heatmap : (seriesOptions.type === SeriesType.bar) ? OhAggregateSeries.Type.bar : OhAggregateSeries.Type.line,
          dimension1,
          dimension2,
          markers: toPrimitiveMarkers(seriesOptions.marker) as OhAggregateSeries.Markers[],
          transpose: aggregateCoordSettings.orientation === Orient.vertical ? true : undefined,
          areaStyle: seriesOptions.type === SeriesType.area ? { opacity: 0.2 } : undefined,
          aggregationFunction: seriesOptions.aggregation
        } satisfies OhAggregateSeries.Config & Record<string, unknown>
      }
    })

    if (dimension2) {
      page.slots.visualMap = renderVisualMap(aggregateCoordSettings.visualMap)
    }

    page.slots.tooltip = [
      {
        component: 'oh-chart-tooltip',
        config: {
          confine: true
          // smartFormatter: true
        } satisfies OhChartTooltip.Config
      }
    ]

    if (!dimension2) {
      page.slots.legend = [
        {
          component: 'oh-chart-legend',
          config: {
            bottom: '3',
            type: 'scroll'
          } as OhChartLegend.Config
        }
      ]
    }

    console.log(page)
    return page
  }
}

export default aggregateCoordSystem