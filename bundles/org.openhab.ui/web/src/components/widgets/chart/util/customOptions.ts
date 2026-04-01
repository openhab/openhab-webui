import dayjs from 'dayjs'
import { type OhAxisOption, type OhSeriesOption, type OhTimeSeriesOption } from '@/components/widgets/chart/types.ts'
import { Style } from '@/types/components/widgets'
import { Markers } from '@/types/components/widgets/chart/oh-time-series.gen.ts'

function applyMarkers(series: OhSeriesOption) {
  if ('markers' in series && Array.isArray(series.markers) && series.markers.length > 0) {
    const markers = (series.markers as OhTimeSeriesOption['markers'])!
    if (!series.markLine) {
      series.markLine = {
        data: [],
        tooltip: {
          // @ts-expect-error ECharts provides no type def for MarkLineOption::formatter
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          formatter: (params: unknown) => dayjs(params.data.xAxis as string).format('llll')
        }
      }
    }
    if (!series.markPoint) {
      series.markPoint = {
        label: {
          backgroundColor: 'auto'
        },
        data: []
      }
    }
    if (markers.includes(Markers.avg)) {
      series.markLine.data!.push({ type: 'average', name: 'avg' })
    }
    if (markers.includes(Markers.time)) {
      series.markLine.data!.push({
        label: {
          show: false
        },
        lineStyle: {
          color: '#e64a19',
          type: 'solid',
          width: 1
        },
        name: 'now',
        symbol: 'none',
        xAxis: dayjs().format()
      })
    }
    if (markers.includes(Markers.min)) {
      series.markPoint.data!.push({ type: 'min', name: 'min' })
    }
    if (markers.includes(Markers.max)) {
      series.markPoint.data!.push({ type: 'max', name: 'max' })
    }

    delete series.markers
  }
}

function applyLabelPosition(series: OhSeriesOption) {
  if ('labelPosition' in series && series.labelPosition) {
    if (!series.label) series.label = {}
    series.label.show = true
    series.label.position = series.labelPosition

    delete series.labelPosition
  }
}

function applyBarBorderRadius(series: OhSeriesOption) {
  if ('barBorderRadius' in series && series.barBorderRadius !== undefined) {
    if (!series.itemStyle) series.itemStyle = {}
    series.itemStyle.borderRadius = [series.barBorderRadius, series.barBorderRadius, series.barBorderRadius, series.barBorderRadius]

    delete series.barBorderRadius
  }
}

/**
 * Transforms custom options for series into ECharts options.
 * @param series
 */
export function transformCustomSeriesOptions(series: OhSeriesOption) {
  applyMarkers(series)
  applyLabelPosition(series)
  applyBarBorderRadius(series)
  return series
}

function applyAxisStyle(axis: OhAxisOption) {
  if ('style' in axis && axis.style) {
    switch (axis.style) {
      case Style.label:
        // remove line
        if (!axis.axisLine) axis.axisLine = {}
        axis.axisLine.show = false
      // eslint-disable-next-line no-fallthrough
      case Style.label_line:
        // remove tick
        if (!axis.axisTick) axis.axisTick = {}
        axis.axisTick.show = false
        break
      case Style.label_line_tick:
        break
    }

    delete axis.style
  }
}

/**
 * Transform custom options for axis into ECharts options.
 * @param axis
 */
export function transformCustomAxisOptions(axis: OhAxisOption) {
  applyAxisStyle(axis)
  return axis
}
