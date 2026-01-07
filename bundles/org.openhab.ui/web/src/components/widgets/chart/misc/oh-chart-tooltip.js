import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import ComponentId from '../../component-id'

dayjs.extend(LocalizedFormat)

export default {
  get(component, startTime, endTime, chart, device, numberFormatter) {
    let options = chart.evaluateExpression(ComponentId.get(component), component.config)
    if (options.confine === undefined) options.confine = true

    if (!options.valueFormatter) {
      options.valueFormatter = value => numberFormatter.format(value)
    }

    if (options.smartFormatter) {
      options.formatter = (params, ticket, callback) => {
        let tooltip = ''
        // special tooltip for mark area:
        // - header: time range (start time to end time) in 'dd DD.MM.YYYY HH:mm:ss'
        // - content: marker colour, series name and value (if available)
        if (params.componentType === 'markArea') {
          tooltip += `<div>${dayjs(params.data.coord[0][0]).format('llll')}<br />${dayjs(params.data.coord[1][0]).format('llll')}</div>`
          tooltip += params.marker
          tooltip += params.name
          if (params.value) tooltip += ': ' + params.value
          return tooltip
        }
        if (!params[0] || !params[0].axisType) return
        // header: x-axis time in 'dd DD.MM.YYYY HH:mm:ss'
        if (params[0].axisType === 'xAxis.time') {
          tooltip += `<div>${dayjs(params[0].axisValue).format('llll')}</div>`
        }
        // content: for each oh-time-series marker colour, series name and formatted value
        params.forEach(s => {
          if (s.seriesId) {
            const [seriesType, itemName] = s.seriesId.split('#')
            if (seriesType === 'oh-time-series') {
              let item = chart._items[itemName]
              let state = numberFormatter.format(s.data[1])
              if (item) {
                const stateDescription = item.stateDescription || {}
                if (stateDescription.format) {
                }
              }

              tooltip += s.marker + ' ' + s.seriesName + ': ' + state + '<br />'
            }
          }
        })

        return tooltip
      }
    }

    return options
  }
}
