import ComponentId from '../../component-id'

const presetFeatures = {
  saveAsImage: { title: 'Save as Image' },
  restore: { title: 'Restore' },
  dataView: { title: 'Data Table', lang: ['Data Table', 'Close', 'Refresh'] },
  dataZoom: { title: { zoom: 'Area Zooming', back: 'Restore Area Zoom' } },
  magicType: { title: { line: 'Line', bar: 'Bar', stack: 'Stack', tiled: 'Tiled' }, type: ['line', 'bar', 'stack', 'tiled'] }
}

export default {
  get (component, startTime, endTime, chart, device) {
    const options = chart.evaluateExpression(ComponentId.get(component), component.config)

    if (options.presetFeatures && !options.feature) {
      options.feature = Object.assign({}, presetFeatures)
      for (const featureName in options.feature) {
        options.feature[featureName].show = (options.presetFeatures.indexOf(featureName) >= 0)
      }
    }

    if (!options.left) options.left = 'center'

    return options
  }
}
