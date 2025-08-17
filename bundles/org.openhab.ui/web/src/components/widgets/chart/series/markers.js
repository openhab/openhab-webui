import dayjs from 'dayjs'

export default (series) => {
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
    if (series.markers.includes('avg')) {
      series.markLine.data.push({
        type: 'average'
      })
    }
    if (series.markers.includes('time')) {
      series.markLine.data.push({
        label: {
          show: false
        },
        lineStyle: {
          color: '#e64a19',
          type: 'solid',
          width: 1
        },
        symbol: 'none',
        xAxis: dayjs().format()
      })
    }
    if (series.markers.includes('min')) {
      series.markPoint.data.push({ type: 'min', name: 'min' })
    }
    if (series.markers.includes('max')) {
      series.markPoint.data.push({ type: 'max', name: 'max' })
    }
  }
}
