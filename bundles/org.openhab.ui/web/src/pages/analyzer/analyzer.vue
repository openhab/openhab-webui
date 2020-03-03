<template>
  <f7-popup tablet-fullscreen close-on-escape @popup:opened="() => showChart = true">
    <f7-page class="analyzer-content">
      <f7-navbar :title="titleDisplayText" back-link="Back">
        <!-- <f7-nav-right>
          <f7-link popup-close>Close</f7-link>
        </f7-nav-right> -->
      </f7-navbar>
      <chart v-if="showChart" :items="$f7route.query.items.split(',')" :startTime="new Date()" :endTime="new Date() - 1"></chart>
    </f7-page>
  </f7-popup>
</template>

<script>
export default {
  components: {
    'chart': () => import('../../components/charts/chart.vue')
  },
  data () {
    return {
      showChart: false,
      items: this.$f7route.query.items.split(',')
    }
  },
  methods: {
    initChart () {
      this.showChart = true
    }
  },
  computed: {
    titleDisplayText () {
      if (!this.items || !this.items.length) return 'Analyze'
      if (this.items.length === 1) return this.items[0]
      return this.items[0] + ' + ' + (this.items.length - 1)
    },
    itemPickerDisplayText () {
      return this.items.length + ' item(s)'
    }
  }
}
</script>
