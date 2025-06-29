export function parseUnit (item) {
  let unit =
    item.transformedState?.split(' ')[1] ??
    item.state?.split(' ')[1] ??
    item.stateDescription?.pattern?.split(' ')[1]
  if (unit) unit = unit.replace(/^%%/, '%')

  return unit || ''
}

export function getYAxis (item, coordSettings) {
  let unit = parseUnit(item)
  let unitAxis = coordSettings.valueAxesOptions.findIndex((a) => a.unit === unit)
  if (unitAxis >= 0) {
    return unitAxis
  } else {
    coordSettings.valueAxesOptions.push({ name: unit, unit, split: 'line' })
    return coordSettings.valueAxesOptions.length - 1
  }
}

export function renderVisualMap (visualMap) {
  return [
    {
      component: 'oh-chart-visualmap',
      config: {
        show: true,
        orient: 'horizontal',
        calculable: true,
        bottom: 0,
        left: 'center',
        presetPalette: visualMap.palette,
        type: visualMap.type,
        ...(visualMap.min && visualMap.min !== '') && { min: parseFloat(visualMap.min) },
        ...(visualMap.max && visualMap.max !== '') && { max: parseFloat(visualMap.max) }
      }
    }
  ]
}

export function renderValueAxis (a) {
  return {
    component: 'oh-value-axis',
    config: {
      gridIndex: 0,
      name: a.name || a.unit,
      ...(a.min && a.min !== '') && { min: parseFloat(a.min) },
      ...(a.max && a.max !== '') && { max: parseFloat(a.max) },
      scale: a.scale,
      ...(a.split === 'none' || a.split === 'area' || a.split === 'area+minor') && { splitLine: { show: false } },
      ...(a.split === 'line+minor' || a.split === 'area+minor' || a.split === 'all') && { minorTick: { show: true }, minorSplitLine: { show: true } },
      ...(a.split === 'area' || a.split === 'line+area' || a.split === 'area+minor' || a.split === 'all') && { splitArea: { show: true } }
    }
  }
}
