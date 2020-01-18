<!-- Adapted from https://github.com/1615450788/vue-cron - license: MIT -->

<template>
  <f7-popup :id="popupId" class="cron-select" close-on-escape @popup:closed="$emit('closed')" :opened="opened">
    <f7-page class="cron-select-content">
      <f7-navbar :title="'Cron: ' + cron" :subtitle="translation">
        <f7-nav-right>
          <f7-link :popup-close="(popupId) ? '#' + popupId : '.cron-select'" @click.native="$emit('input', cron)">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar tabbar position="top">
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'seconds'" @click="currentTab = 'seconds'">Seconds</f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'minutes'" @click="currentTab = 'minutes'">Minutes</f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'hours'" @click="currentTab = 'hours'">Hours</f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'days'" @click="currentTab = 'days'">Days</f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'month'" @click="currentTab = 'month'">Month</f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'year'" @click="currentTab = 'year'">Year</f7-link>
      </f7-toolbar>
      <!-- <f7-toolbar bottom>
        <div>
          <h4 class="value">
            <small>At 12:00 AM, on the weekday nearest day 20 of the month, only in October, only in 2019</small>
          </h4>
        </div>
      </f7-toolbar> -->
      <f7-tabs type="border-card" v-if="opened">
        <f7-tab :tab-active="currentTab === 'seconds'">
          <span slot="label">
            <i class="el-icon-date"></i>
            {{text.Seconds.name}}
          </span>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="second.cronEvery === 1" @change="second.cronEvery = 1">{{text.Seconds.every}}</f7-list-item>
              <f7-list-item radio :checked="second.cronEvery === 2" @change="second.cronEvery = 2">
                {{text.Seconds.interval[0]}}
                <f7-stepper small :value="second.incrementIncrement" @stepper:change="(v) => second.incrementIncrement = v" :min="1" :max="60"></f7-stepper>
                {{text.Seconds.interval[1]||''}}
                <f7-stepper small :value="second.incrementStart" @stepper:change="(v) => second.incrementStart = v" :min="0" :max="59"></f7-stepper>
                {{text.Seconds.interval[2]||''}}
              </f7-list-item>
              <f7-list-item radio ref="specificSecond" :title="text.Seconds.specific" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="second.cronEvery === 3" @click="second.cronEvery = 3">
                <select multiple @change="second.specificSpecific = $refs.specificSecond.f7SmartSelect.getValue()">
                  <option v-for="val in 60" :key="val" :value="val-1" :selected="second.specificSpecific.indexOf(val-1) >= 0">{{val-1}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="second.cronEvery === 4" @change="second.cronEvery = 4">
                {{text.Seconds.cycle[0]}}
                <f7-stepper small :value="second.rangeStart" @stepper:change="(v) => second.rangeStart = v" :min="0" :max="59"></f7-stepper>
                {{text.Seconds.cycle[1]||''}}
                <f7-stepper small :value="second.rangeEnd" @stepper:change="(v) => second.rangeEnd = v" :min="0" :max="59"></f7-stepper>
                {{text.Seconds.cycle[2]||''}}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'minutes'">
          <span slot="label">
            <i class="el-icon-date"></i>
            {{text.Minutes.name}}
          </span>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="minute.cronEvery === 1" @change="minute.cronEvery = 1">
                {{text.Minutes.every}}
              </f7-list-item>
              <f7-list-item radio :checked="minute.cronEvery === 2" @change="minute.cronEvery = 2">
                {{text.Minutes.interval[0]}}
                <f7-stepper small :value="minute.incrementIncrement" @stepper:change="(v) => minute.incrementIncrement = v" :min="1" :max="60"></f7-stepper>
                {{text.Minutes.interval[1]||''}}
                <f7-stepper small :value="minute.incrementStart" @stepper:change="(v) => minute.incrementStart = v" :min="0" :max="59"></f7-stepper>
                {{text.Minutes.interval[2]||''}}
              </f7-list-item>
              <f7-list-item radio ref="specificMinute" :title="text.Minutes.specific" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="minute.cronEvery === 3" @click="minute.cronEvery = 3">
                <select multiple @change="minute.specificSpecific = $refs.specificMinute.f7SmartSelect.getValue()">
                  <option v-for="val in 60" :key="val" :value="val-1" :selected="minute.specificSpecific.indexOf(val-1) >= 0">{{val-1}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="minute.cronEvery === 4" @change="minute.cronEvery = 4">
                {{text.Minutes.cycle[0]}}
                <f7-stepper small :value="minute.rangeStart" @stepper:change="(v) => minute.rangeStart = v" :min="0" :max="60"></f7-stepper>
                {{text.Minutes.cycle[1]||''}}
                <f7-stepper small :value="minute.rangeEnd" @stepper:change="(v) => minute.rangeEnd = v" :min="0" :max="59"></f7-stepper>
                {{text.Minutes.cycle[2]||''}}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'hours'">
          <span slot="label">
            <i class="el-icon-date"></i>
            {{text.Hours.name}}
          </span>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="hour.cronEvery === 1" @change="hour.cronEvery = 1">
                {{text.Hours.every}}
              </f7-list-item>
              <f7-list-item radio :checked="hour.cronEvery === 2" @change="hour.cronEvery = 2">
                {{text.Hours.interval[0]}}
                <f7-stepper small :value="hour.incrementIncrement" @stepper:change="(v) => hour.incrementIncrement = v" :min="1" :max="23"></f7-stepper>
                {{text.Hours.interval[1]||''}}
                <f7-stepper small :value="hour.incrementStart" @stepper:change="(v) => hour.incrementStart = v" :min="0" :max="23"></f7-stepper>
                {{text.Hours.interval[2]||''}}
              </f7-list-item>
              <f7-list-item radio ref="specificHour" :title="text.Hours.specific" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="hour.cronEvery === 3" @click="hour.cronEvery = 3">
                <select multiple @change="hour.specificSpecific = $refs.specificHour.f7SmartSelect.getValue()">
                  <option v-for="val in 24" :key="val" :value="val-1" :selected="hour.specificSpecific.indexOf(val-1) >= 0">{{val-1}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="hour.cronEvery === 4" @change="hour.cronEvery = 4">
                {{text.Hours.cycle[0]}}
                <f7-stepper small :value="hour.rangeStart" @stepper:change="(v) => hour.rangeStart = v" :min="0" :max="23"></f7-stepper>
                {{text.Hours.cycle[1]||''}}
                <f7-stepper small :value="hour.rangeEnd" @stepper:change="(v) => hour.rangeEnd = v" :min="0" :max="23"></f7-stepper>
                {{text.Hours.cycle[2]||''}}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'days'">
          <span slot="label">
            <i class="el-icon-date"></i>
            {{text.Day.name}}
          </span>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="day.cronEvery === 1" @change="day.cronEvery = 1">
                {{text.Day.every}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 2" @change="day.cronEvery = 2">
                {{text.Day.intervalWeek[0]}}
                <f7-stepper small :value="week.incrementIncrement" @stepper:change="(v) => week.incrementIncrement = v" :min="1" :max="7"></f7-stepper>
                {{text.Day.intervalWeek[1]||''}}
                <select size="small" v-model="week.incrementStart" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="text.Week[val-1]" :value="val"></option>
                </select>
                <!-- <f7-stepper small :value="week.incrementStart" @stepper:change="(v) => week.incrementStart = v" :min="0" :max="23"></f7-stepper> -->
                {{text.Day.intervalWeek[2]||''}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 3" @change="day.cronEvery = 3">
                {{text.Day.intervalDay[0]}}
                <f7-stepper small :value="day.incrementIncrement" @stepper:change="(v) => day.incrementIncrement = v" :min="1" :max="31"></f7-stepper>
                {{text.Day.intervalDay[1]||''}}
                <f7-stepper small :value="day.incrementStart" @stepper:change="(v) => day.incrementStart = v" :min="1" :max="31"></f7-stepper>
                {{text.Day.intervalDay[2]||''}}
              </f7-list-item>
              <f7-list-item radio ref="specificDayOfWeek" :title="text.Day.specificWeek" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="day.cronEvery === 4" @click="day.cronEvery = 4">
                <select multiple @change="week.specificSpecific = $refs.specificDayOfWeek.f7SmartSelect.getValue()">
                  <option v-for="val in 7" :key="val" :value="['SUN','MON','TUE','WED','THU','FRI','SAT'][val-1]" :selected="week.specificSpecific.indexOf(['SUN','MON','TUE','WED','THU','FRI','SAT'][val-1]) >= 0">{{text.Week[val-1]}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio ref="specificDayOfMonth" :title="text.Day.specificDay" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="day.cronEvery === 5" @click="day.cronEvery = 5">
                <select multiple @change="day.specificSpecific = $refs.specificDayOfMonth.f7SmartSelect.getValue()">
                  <option v-for="val in 31" :key="val" :value="val" :selected="day.specificSpecific.indexOf(val) >= 0">{{val}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 6" @change="day.cronEvery = 6">
                {{text.Day.lastDay}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 7" @change="day.cronEvery = 7">
                {{text.Day.lastWeekday}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 8" @change="day.cronEvery = 8">
                {{text.Day.lastWeek[0]}}
                <select size="small" v-model="day.cronLastSpecificDomDay" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="text.Week[val-1]" :value="val-1"></option>
                </select>
                {{text.Day.lastWeek[1]||''}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 9" @change="day.cronEvery = 9">
                <f7-stepper small :value="day.cronDaysBeforeEomMinus" @stepper:change="(v) => day.cronDaysBeforeEomMinus = v" :min="1" :max="31"></f7-stepper>
                {{text.Day.beforeEndMonth[0]}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 10" @change="day.cronEvery = 10">
                {{text.Day.nearestWeekday[0]}}
                <f7-stepper small :value="day.cronDaysNearestWeekday" @stepper:change="(v) => day.cronDaysNearestWeekday = v" :min="1" :max="31"></f7-stepper>
                {{text.Day.nearestWeekday[1]}}
              </f7-list-item>
              <f7-list-item radio :checked="day.cronEvery === 11" @change="day.cronEvery = 11">
                {{text.Day.someWeekday[0]}}
                <f7-stepper small :value="week.cronNthDayNth" @stepper:change="(v) => week.cronNthDayNth = v" :min="1" :max="5"></f7-stepper>
                <select size="small" v-model="week.cronNthDayDay" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="text.Week[val-1]" :value="val-1"></option>
                </select>
                {{text.Day.someWeekday[1]}}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'month'">
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="month.cronEvery === 1" @change="month.cronEvery = 1">
                {{text.Month.every}}
              </f7-list-item>
              <f7-list-item radio :checked="month.cronEvery === 2" @change="month.cronEvery = 2">
                {{text.Month.interval[0]}}
                <f7-stepper small :value="month.incrementIncrement" @stepper:change="(v) => month.incrementIncrement = v" :min="1" :max="12"></f7-stepper>
                {{text.Month.interval[1]||''}}
                <f7-stepper small :value="month.incrementStart" @stepper:change="(v) => month.incrementStart = v" :min="1" :max="12"></f7-stepper>
                {{text.Month.interval[2]||''}}
              </f7-list-item>
              <f7-list-item radio ref="specificMonth" :title="text.Month.specific" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="month.cronEvery === 3" @click="month.cronEvery = 3">
                <select multiple @change="month.specificSpecific = $refs.specificMonth.f7SmartSelect.getValue()">
                  <option v-for="val in 12" :key="val" :value="val" :selected="month.specificSpecific.indexOf(val) >= 0">{{val}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="month.cronEvery === 4" @change="month.cronEvery = 4">
                {{text.Month.cycle[0]}}
                <f7-stepper small :value="month.rangeStart" @stepper:change="(v) => month.rangeStart = v" :min="1" :max="12"></f7-stepper>
                {{text.Month.cycle[1]||''}}
                <f7-stepper small :value="month.rangeEnd" @stepper:change="(v) => month.rangeEnd = v" :min="1" :max="12"></f7-stepper>
                {{text.Month.cycle[2]||''}}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'year'">
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="year.cronEvery === 1" @change="year.cronEvery = 1">
                {{text.Year.every}}
              </f7-list-item>
              <f7-list-item radio :checked="year.cronEvery === 2" @change="year.cronEvery = 2">
                {{text.Year.interval[0]}}
                <f7-stepper small :value="year.incrementIncrement" @stepper:change="(v) => year.incrementIncrement = v" :min="1" :max="99"></f7-stepper>
                {{text.Year.interval[1]||''}}
                <f7-stepper small :value="year.incrementStart" @stepper:change="(v) => year.incrementStart = v" :min="2019" :max="2119"></f7-stepper>
                {{text.Year.interval[2]||''}}
              </f7-list-item>
              <f7-list-item radio ref="specificYear" :title="text.Year.specific" smart-select no-chevron :smart-select-params="{ openIn: 'popover', view: $f7.views.main }" :checked="year.cronEvery === 3" @click="year.cronEvery = 3">
                <select multiple @change="year.specificSpecific = $refs.specificYear.f7SmartSelect.getValue()">
                  <option v-for="val in 100" :key="val" :value="val+2018" :selected="year.specificSpecific.indexOf(val+2018) >= 0">{{val+2018}}</option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="year.cronEvery === 4" @change="year.cronEvery = 4">
                {{text.Year.cycle[0]}}
                <f7-stepper small :value="year.rangeStart" @stepper:change="(v) => year.rangeStart = v" :min="2019" :max="2119"></f7-stepper>
                {{text.Year.cycle[1]||''}}
                <f7-stepper small :value="year.rangeEnd" @stepper:change="(v) => year.rangeEnd = v" :min="2019" :max="2119"></f7-stepper>
                {{text.Year.cycle[2]||''}}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
      </f7-tabs>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
// .cron-select-content .page-content
//   --f7-page-navbar-offset 0px
@media (max-width: 640px)
  .cron-select-content
    .item-content
      .item-inner
        display block
        .stepper-small
          transform translate(0, 8px)
</style>

<script>
import Labels from '@/assets/i18n/en/cron.js'
import cronstrue from 'cronstrue'

export default {
  name: 'vueCron',
  props: ['value', 'opened', 'popupId', 'i18n'],
  data () {
    return {
      currentTab: 'seconds',
      second: {
        cronEvery: 3,
        incrementStart: 0,
        incrementIncrement: 5,
        rangeStart: 1,
        rangeEnd: 1,
        specificSpecific: [0]
      },
      minute: {
        cronEvery: 3,
        incrementStart: 0,
        incrementIncrement: 5,
        rangeStart: 1,
        rangeEnd: 1,
        specificSpecific: [0]
      },
      hour: {
        cronEvery: 3,
        incrementStart: 0,
        incrementIncrement: 5,
        rangeStart: 1,
        rangeEnd: 1,
        specificSpecific: [8]
      },
      day: {
        cronEvery: 1,
        incrementStart: 1,
        incrementIncrement: 1,
        rangeStart: 1,
        rangeEnd: 1,
        specificSpecific: [],
        cronLastSpecificDomDay: 1,
        cronDaysBeforeEomMinus: 1,
        cronDaysNearestWeekday: 1
      },
      week: {
        cronEvery: 1,
        incrementStart: 1,
        incrementIncrement: 1,
        specificSpecific: [],
        cronNthDayDay: 1,
        cronNthDayNth: 1
      },
      month: {
        cronEvery: 1,
        incrementStart: 3,
        incrementIncrement: 5,
        rangeStart: 1,
        rangeEnd: 1,
        specificSpecific: []
      },
      year: {
        cronEvery: 1,
        incrementStart: 2019,
        incrementIncrement: 1,
        rangeStart: 2019,
        rangeEnd: 2019,
        specificSpecific: []
      },
      output: {
        second: 1,
        minute: 1,
        hour: 1,
        day: 1,
        month: 1,
        Week: 1,
        year: 1
      }
    }
  },
  watch: {
    value () {
      this.rest(this.$data)
    }
  },
  computed: {
    text () {
      return Labels
    },
    secondsText () {
      let seconds = ''
      let cronEvery = this.second.cronEvery
      switch (cronEvery.toString()) {
        case '1':
          seconds = '*'
          break
        case '2':
          seconds =
            this.second.incrementStart + '/' + this.second.incrementIncrement
          break
        case '3':
          this.second.specificSpecific.map(val => {
            seconds += val + ','
          })
          seconds = seconds.slice(0, -1)
          break
        case '4':
          seconds = this.second.rangeStart + '-' + this.second.rangeEnd
          break
      }
      return seconds
    },
    minutesText () {
      let minutes = ''
      let cronEvery = this.minute.cronEvery
      switch (cronEvery.toString()) {
        case '1':
          minutes = '*'
          break
        case '2':
          minutes =
            this.minute.incrementStart + '/' + this.minute.incrementIncrement
          break
        case '3':
          this.minute.specificSpecific.map(val => {
            minutes += val + ','
          })
          minutes = minutes.slice(0, -1)
          break
        case '4':
          minutes = this.minute.rangeStart + '-' + this.minute.rangeEnd
          break
      }
      return minutes
    },
    hoursText () {
      let hours = ''
      let cronEvery = this.hour.cronEvery
      switch (cronEvery.toString()) {
        case '1':
          hours = '*'
          break
        case '2':
          hours = this.hour.incrementStart + '/' + this.hour.incrementIncrement
          break
        case '3':
          this.hour.specificSpecific.map(val => {
            hours += val + ','
          })
          hours = hours.slice(0, -1)
          break
        case '4':
          hours = this.hour.rangeStart + '-' + this.hour.rangeEnd
          break
      }
      return hours
    },
    daysText () {
      let days = ''
      let cronEvery = this.day.cronEvery
      switch (cronEvery.toString()) {
        case '1':
          break
        case '2':
        case '4':
        case '11':
          days = '?'
          break
        case '3':
          days = this.day.incrementStart + '/' + this.day.incrementIncrement
          break
        case '5':
          this.day.specificSpecific.map(val => {
            days += val + ','
          })
          days = days.slice(0, -1)
          break
        case '6':
          days = 'L'
          break
        case '7':
          days = 'LW'
          break
        case '8':
          days = this.day.cronLastSpecificDomDay + 'L'
          break
        case '9':
          days = 'L-' + this.day.cronDaysBeforeEomMinus
          break
        case '10':
          days = this.day.cronDaysNearestWeekday + 'W'
          break
      }
      return days
    },
    weeksText () {
      let weeks = ''
      let cronEvery = this.day.cronEvery
      switch (cronEvery.toString()) {
        case '1':
        case '3':
        case '5':
          weeks = '?'
          break
        case '2':
          weeks = this.week.incrementStart + '/' + this.week.incrementIncrement
          break
        case '4':
          this.week.specificSpecific.map(val => {
            weeks += val + ','
          })
          weeks = weeks.slice(0, -1)
          break
        case '6':
        case '7':
        case '8':
        case '9':
        case '10':
          weeks = '?'
          break
        case '11':
          weeks = this.week.cronNthDayDay + '#' + this.week.cronNthDayNth
          break
      }
      return weeks
    },
    monthsText () {
      let months = ''
      let cronEvery = this.month.cronEvery
      switch (cronEvery.toString()) {
        case '1':
          months = '*'
          break
        case '2':
          months =
            this.month.incrementStart + '/' + this.month.incrementIncrement
          break
        case '3':
          this.month.specificSpecific.map(val => {
            months += val + ','
          })
          months = months.slice(0, -1)
          break
        case '4':
          months = this.month.rangeStart + '-' + this.month.rangeEnd
          break
      }
      return months
    },
    yearsText () {
      let years = ''
      let cronEvery = this.year.cronEvery
      switch (cronEvery.toString()) {
        case '1':
          years = '*'
          break
        case '2':
          years = this.year.incrementStart + '/' + this.year.incrementIncrement
          break
        case '3':
          this.year.specificSpecific.map(val => {
            years += val + ','
          })
          years = years.slice(0, -1)
          break
        case '4':
          years = this.year.rangeStart + '-' + this.year.rangeEnd
          break
      }
      return years
    },
    cron () {
      return `${this.secondsText || '*'} ${this.minutesText || '*'} ${this
        .hoursText || '*'} ${this.daysText || '*'} ${this.monthsText ||
        '*'} ${this.weeksText || '?'} ${this.yearsText || '*'}`
    },
    translation () {
      return cronstrue.toString(this.cron, {
        use24HourTimeFormat: true
      })
    }
  },
  methods: {
    getValue () {
      return this.cron
    },
    change () {
      this.$emit('change', this.cron)
      this.close()
    },
    close () {
      this.$emit('close')
    },
    rest (data) {
      for (let i in data) {
        if (i === 'currentTab') continue
        if (data[i] instanceof Object) {
          this.rest(data[i])
        } else {
          switch (typeof data[i]) {
            case 'object':
              data[i] = []
              break
            case 'string':
              data[i] = ''
              break
          }
        }
      }
    }
  },
  mounted () {}
}
</script>
