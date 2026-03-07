import dayjs from 'dayjs'
import { Marker, type SeriesOption } from '@/components/widgets/chart/types.ts'

export default (series: SeriesOption) => {
  if (Array.isArray(series.markers)) {
    if (!series.markLine) {
      series.markLine = {
        data: []
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
    if (series.markers.includes(Marker.avg)) {
      series.markLine.data!.push({ type: 'average', name: 'avg' })
    }
    if (series.markers.includes(Marker.time)) {
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
    if (series.markers.includes(Marker.min)) {
      series.markPoint.data!.push({ type: 'min', name: 'min' })
    }
    if (series.markers.includes(Marker.max)) {
      series.markPoint.data!.push({ type: 'max', name: 'max' })
    }
  }
}
