import openhabApi from '@/js/openhab/api'

const Semantics = {
  Equipments: [],
  Locations: [],
  Points: [],
  Properties: [],
  Labels: {},
  whenLoaded: openhabApi.get('/rest/tags').then(tags => {
    Semantics.Locations = tags.Locations.map(tag => tag.name)
    Semantics.Equipments = tags.Equipments.map(tag => tag.name)
    Semantics.Points = tags.Points.map(tag => tag.name)
    Semantics.Properties = tags.Properties.map(tag => tag.name)

    let labels = {}
    Object.values(tags).forEach(tags => tags.forEach(tag => {
      if (tag.label) {
        labels[tag.name] = tag.label
      }
    }))
    const locale = process.env.VUE_APP_I18N_LOCALE || 'en'
    Semantics.Labels = { [locale]: labels }
    return Semantics
  })
}

export default Semantics
