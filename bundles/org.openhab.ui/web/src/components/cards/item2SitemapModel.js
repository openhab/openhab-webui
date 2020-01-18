export default function (item) {
  let model = {}
  let state = item.transformedState || item.state // do a sprintf if necessary
  model.label = `${item.label || item.name} [${state}]`
  model.item = item.name
  if (item.category) model.icon = item.category
  model.type = 'Text'
  if (!item.readonly) {
    if (item.type === 'Switch') model.type = 'Switch'
    if (item.type === 'Dimmer') model.type = 'Slider'
    if (item.type === 'Rollershutter') model.type = 'Rollershutter'
    if (item.metadata && item.metadata.semantics) {
      if (item.metadata.semantics.value === 'Point_Setpoint') model.type = 'Setpoint'
      if (item.metadata.semantics.value === 'Point_Measurement') model.type = 'Text'
    }
  }

  return model
}
