<template>
  <q-modal-layout>
    <q-toolbar slot="header">
      <q-btn
        flat
        round
        dense
        v-close-overlay
        icon="arrow_back"
      />
      <q-toolbar-title>
        <q-select class="q-toolbar-button-flat"
                  inverted color="secondary"
                  :value="items"
                  @input="val => { items = val }"
                  :display-value="titleDisplayText"
                  :options="itemChoices"
                  multiple filter />
      </q-toolbar-title>
      <q-btn flat icon="build" @click="showToolbar = !showToolbar"></q-btn>
    </q-toolbar>

    <q-toolbar v-if="showToolbar" slot="header">
      <q-datetime
        class="q-toolbar-button-flat"
        inverted color="secondary"
        :type="chartType === 'calendar' ? 'date' : 'datetime'"
        :value="startTime"
        :first-day-of-week="1"
        format24h
        :format="'DD MMM YY'"
        :max="today"
        @change="val => { startTime = val }"
      />
      -
      <q-datetime
        class="q-toolbar-button-flat"
        inverted color="secondary"
        :type="chartType === 'calendar' ? 'date' : 'datetime'"
        :value="endTime"
        :first-day-of-week="1"
        format24h
        :format="'DD MMM YY'"
        :max="today"
        @change="val => { endTime = val }"
      />

      <q-toolbar-title />

      <q-btn round flat icon="event" @click="resetChartPeriodDialog()" />

      <q-btn round flat icon="more_vert">
        <q-popover anchor="bottom right" self="top right">
          <q-list link class="no-border">
            <q-list-header>Chart type</q-list-header>
            <q-item tag="label" v-close-overlay>
              <q-item-side>
                <q-radio v-model="chartType" val="line" color="secondary"></q-radio>
              </q-item-side>
              <q-item-main label="Line chart" />
            </q-item>

            <q-item tag="label" v-close-overlay>
              <q-item-side>
                <q-radio v-model="chartType" val="calendar" color="secondary"></q-radio>
              </q-item-side>
              <q-item-main label="Calendar" />
            </q-item>
            <!-- <q-item tag="label" v-close-overlay>
              <q-item-side>
                <q-radio v-model="chartType" val="punchline" color="secondary"></q-radio>
              </q-item-side>
              <q-item-main label="Week Punchline" />
            </q-item> -->
            <q-item-separator />
            <q-item tag="label" v-if="chartType === 'calendar'">
              <q-item-main label="Vertical orientation" />
              <q-item-side right>
                <q-toggle color="secondary" v-model="chartOptions.calendar.vertical" />
              </q-item-side>
            </q-item>
            <q-item tag="label" v-if="chartType === 'calendar'">
              <q-item-main label="Show range slider" />
              <q-item-side right>
                <q-toggle color="secondary" v-model="chartOptions.calendar.showVisualMap" />
              </q-item-side>
            </q-item>
            <q-item tag="label" v-close-overlay v-if="chartType === 'calendar'" @click.native="calendarColorPaletteConfig()">
              <q-item-main label="Color palette..." />
            </q-item>
            <q-item tag="label" v-close-overlay v-if="chartType === 'line'" @click.native="lineMarkerConfig()">
              <q-item-main label="Marker options..." />
            </q-item>

          </q-list>
        </q-popover>
      </q-btn>
    </q-toolbar>

    <!-- <q-toolbar slot="footer">
      <q-toolbar-title>
        Tools
      </q-toolbar-title>
    </q-toolbar> -->

    <div class="fit q-pa-md">
      <chart ref="chart" v-if="showChart && items && items.length" class="fit-chart" :items="items" :type="chartType" :options="chartOptions" :start-time="startTime" :end-time="endTime"/>
    </div>
  </q-modal-layout>
</template>

<style lang="stylus" scoped>
.fit-chart
  width 100%
  height 100%
.q-toolbar-button-flat
  box-shadow none
  background none !important
</style>

<script>
import { date, extend } from 'quasar'
const { subtractFromDate } = date
const today = new Date()

export default {
  components: {
    'chart': () => import('components/charts/Chart.vue')
  },
  props: ['model'],
  data () {
    return {
      showToolbar: false,
      showChart: false,
      items: this.model.config.items,
      period: this.model.config.period,
      startTime: null,
      endTime: null,
      today: today,
      chartType: 'line',
      itemChoices: this.$store.state.items.items.map((item) => {
        return {
          value: item.name,
          label: item.name,
          sublabel: item.label,
          stamp: item.type
        }
      }),
      chartOptions: {
        calendar: {
          vertical: true,
          showVisualMap: true
        },
        line: {
          markers: {}
        }
      }
    }
  },
  methods: {
    initChart () {
      this.showChart = true
    },
    resetChartPeriodDialog () {
      let options = (this.chartType === 'line')
        ? ['h', '4h', '8h', '12h', 'D', '2D', '3D', 'W', '2W', 'M', '2M', '4M', 'Y']
        : ['M', '2M', '4M', 'Y']

      this.$q.actionSheet({
        title: 'Reset to predefined period',
        grid: true,
        actions: options.map(o => {
          return {
            label: o,
            icon: (o.indexOf('h') >= 0) ? 'mdi-clock-outline'
              : (o.indexOf('W') >= 0) ? 'mdi-calendar-week'
                : (o.indexOf('D') > 0) ? 'mdi-calendar-range'
                  : (o.indexOf('D') === 0) ? 'mdi-calendar-today'
                    : (o.indexOf('M') === 0) ? 'mdi-calendar'
                      : 'mdi-calendar-multiple'
          }
        })
      }).then((val) => {
        this.resetChartPeriod(val.label)
      })
    },
    resetChartPeriod (period) {
      this.endTime = new Date()
      this.startTime = new Date()
      switch (period) {
        case 'h':
          this.startTime = subtractFromDate(this.startTime, { hours: 1 })
          break
        case '4h':
          this.startTime = subtractFromDate(this.startTime, { hours: 4 })
          break
        case '8h':
          this.startTime = subtractFromDate(this.startTime, { hours: 8 })
          break
        case '12h':
          this.startTime = subtractFromDate(this.startTime, { hours: 12 })
          break
        case 'D':
          this.startTime = subtractFromDate(this.startTime, { days: 1 })
          break
        case '2D':
          this.startTime = subtractFromDate(this.startTime, { days: 2 })
          break
        case '3D':
          this.startTime = subtractFromDate(this.startTime, { days: 3 })
          break
        case 'W':
          this.startTime = subtractFromDate(this.startTime, { days: 7 })
          break
        case '2W':
          this.startTime = subtractFromDate(this.startTime, { days: 14 })
          break
        case 'M':
          this.startTime = subtractFromDate(this.startTime, { month: 1 })
          break
        case '2M':
          this.startTime = subtractFromDate(this.startTime, { month: 2 })
          break
        case '4M':
          this.startTime = subtractFromDate(this.startTime, { month: 4 })
          break
        case 'Y':
          this.startTime = subtractFromDate(this.startTime, { month: 12 })
          break
        default:
          this.startTime = subtractFromDate(this.startTime, { days: 1 })
          break
      }
    },
    lineMarkerConfig () {
      let model = []
      if (this.chartOptions.line.markers.averageLine) model.push('averageLine')
      if (this.chartOptions.line.markers.minMaxLines) model.push('minMaxLines')
      if (this.chartOptions.line.markers.minMaxPoints) model.push('minMaxPoints')
      this.$q.dialog({
        title: 'Markers',
        message: 'Choose markers to display',
        color: 'secondary',
        ok: true,
        cancel: true,
        options: {
          type: 'toggle',
          model: model,
          items: [
            { label: 'Show average line', value: 'averageLine' },
            { label: 'Show min/max lines', value: 'minMaxLines' },
            { label: 'Show min/max points', value: 'minMaxPoints' }
          ]
        }
      }).then((val) => {
        this.chartOptions.line.markers = extend({}, {
          averageLine: (val.indexOf('averageLine') >= 0),
          minMaxLines: (val.indexOf('minMaxLines') >= 0),
          minMaxPoints: (val.indexOf('minMaxPoints') >= 0)
        })
      })
    },
    calendarColorPaletteConfig () {
      this.$q.dialog({
        title: 'Color palette',
        message: 'Color range of colors',
        color: 'secondary',
        ok: true,
        cancel: true,
        options: {
          type: 'radio',
          model: this.chartOptions.calendar.colorPalette,
          items: [
            { label: 'yellow/red (default)', value: null },
            { label: 'green/yellow/red', value: 'greenred' },
            { label: 'blue/yellow/red', value: 'bluered' },
            { label: 'white/blue', value: 'whiteblue' }
          ]
        }
      }).then((val) => {
        this.chartOptions.calendar = extend({}, this.chartOptions.calendar, {
          colorPalette: val
        })
      })
    }
  },
  created () {
    this.resetChartPeriod(this.model.config.period)
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
