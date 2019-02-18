<template>
  <div style="width: 100%; padding-bottom: 50%" :class="{'highlight-and-fade': this.model.highlight}">
    <img :src="imageUrl" style="position: absolute; top: 0; width: 100%">
    <q-inner-loading :visible="working" color="primary"></q-inner-loading>
  </div>
</template>

<script>
export default {
  component: 'HbChartImage',
  props: ['model'],
  data () {
    return {
      working: false
    }
  },
  asyncComputed: {
    imageUrl: {
      get () {
        this.working = true
        let items = this.model.config.items || []
        let period = this.model.config.period || 'D'
        return new Promise((resolve, reject) => {
          let request = this.$http.get('/chart?items=' + items.join(',') + '&period=' + period, { responseType: 'blob' })
          request.then((resp) => {
            let reader = new FileReader()
            reader.readAsDataURL(resp.data)
            reader.onload = () => {
              this.working = false
              return resolve(reader.result)
            }
          })
        })
      }
    }
  }
}
</script>
