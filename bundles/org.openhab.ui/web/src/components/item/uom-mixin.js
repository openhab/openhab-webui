export default {
  data () {
    return {
      dimensions: []
    }
  },
  created () {
    this.$oh.api.get('/rest/systeminfo/uom').then((data) => {
      data.uomInfo.dimensions.forEach((d) => {
        this.dimensions.push({
          name: d.dimension,
          label: d.dimension + ' (' + d.systemUnit + ')',
          systemUnit: d.systemUnit
        })
      })
    })
  }
}
