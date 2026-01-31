<!-- Adapted from https://github.com/1615450788/vue-cron - license: MIT -->

<template>
  <f7-popup class="cron-select" close-on-escape @popup:opened="open" @popup:closed="close">
    <f7-page class="cron-select-content">
      <f7-navbar :title="'Cron: ' + cron" :subtitle="translation">
        <f7-nav-right>
          <f7-link class="popup-close" @click="change"> Done </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar tabbar position="top">
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'seconds'" @click="currentTab = 'seconds'">
          Seconds
        </f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'minutes'" @click="currentTab = 'minutes'">
          Minutes
        </f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'hours'" @click="currentTab = 'hours'">
          Hours
        </f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'days'" @click="currentTab = 'days'"> Days </f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'month'" @click="currentTab = 'month'">
          Month
        </f7-link>
        <f7-link class="padding-left padding-right" :tab-link-active="currentTab === 'year'" @click="currentTab = 'year'"> Year </f7-link>
      </f7-toolbar>
      <f7-tabs type="border-card">
        <f7-tab :tab-active="currentTab === 'seconds'">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ text.Seconds.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="second.cronEvery === 1 ? true : null" @change="second.cronEvery = 1">
                {{ text.Seconds.every }}
              </f7-list-item>
              <f7-list-item radio :checked="second.cronEvery === 2 ? true : null" @change="second.cronEvery = 2">
                {{ text.Seconds.interval[0] }}
                <f7-stepper
                  small
                  :value="second.incrementIncrement"
                  @stepper:change="(v) => second.incrementIncrement = v"
                  :min="1"
                  :max="60" />
                {{ text.Seconds.interval[1] || '' }}
                <f7-stepper small :value="second.incrementStart" @stepper:change="(v) => (second.incrementStart = v)" :min="0" :max="59" />
                {{ text.Seconds.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificSecond"
                :title="text.Seconds.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="second.cronEvery === 3 ? true : null"
                @click="second.cronEvery = 3">
                <select multiple @change="second.specificSpecific = getSmartSelectValue('specificSecond').map((v) => parseInt(v))">
                  <option
                    v-for="val in 60"
                    :key="val"
                    :value="val - 1"
                    :selected="second.specificSpecific.indexOf(val - 1) >= 0 ? true : null">
                    {{ val - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="second.cronEvery === 4 ? true : null" @change="second.cronEvery = 4">
                {{ text.Seconds.cycle[0] }}
                <f7-stepper small :value="second.rangeStart" @stepper:change="v => (second.rangeStart = v)" :min="0" :max="59" />
                {{ text.Seconds.cycle[1] || '' }}
                <f7-stepper small :value="second.rangeEnd" @stepper:change="(v) => second.rangeEnd = v" :min="0" :max="59" />
                {{ text.Seconds.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'minutes'">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ text.Minutes.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="minute.cronEvery === 1 ? true : null" @change="minute.cronEvery = 1">
                {{ text.Minutes.every }}
              </f7-list-item>
              <f7-list-item radio :checked="minute.cronEvery === 2 ? true : null" @change="minute.cronEvery = 2">
                {{ text.Minutes.interval[0] }}
                <f7-stepper
                  small
                  :value="minute.incrementIncrement"
                  @stepper:change="v => (minute.incrementIncrement = v)"
                  :min="1"
                  :max="60" />
                {{ text.Minutes.interval[1] || '' }}
                <f7-stepper small :value="minute.incrementStart" @stepper:change="(v) => minute.incrementStart = v" :min="0" :max="59" />
                {{ text.Minutes.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificMinute"
                :title="text.Minutes.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="minute.cronEvery === 3 ? true : null"
                @click="minute.cronEvery = 3">
                <select multiple @change="minute.specificSpecific = getSmartSelectValue('specificMinute').map((v) => parseInt(v))">
                  <option
                    v-for="val in 60"
                    :key="val"
                    :value="val - 1"
                    :selected="minute.specificSpecific.indexOf(val - 1) >= 0 ? true : null">
                    {{ val - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="minute.cronEvery === 4 ? true : null" @change="minute.cronEvery = 4">
                {{ text.Minutes.cycle[0] }}
                <f7-stepper small :value="minute.rangeStart" @stepper:change="v => (minute.rangeStart = v)" :min="0" :max="60" />
                {{ text.Minutes.cycle[1] || '' }}
                <f7-stepper small :value="minute.rangeEnd" @stepper:change="v => (minute.rangeEnd = v)" :min="0" :max="59" />
                {{ text.Minutes.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'hours'">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ text.Hours.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="hour.cronEvery === 1 ? true : null" @change="hour.cronEvery = 1">
                {{ text.Hours.every }}
              </f7-list-item>
              <f7-list-item radio :checked="hour.cronEvery === 2 ? true : null" @change="hour.cronEvery = 2">
                {{ text.Hours.interval[0] }}
                <f7-stepper
                  small
                  :value="hour.incrementIncrement"
                  @stepper:change="v => (hour.incrementIncrement = v)"
                  :min="1"
                  :max="23" />
                {{ text.Hours.interval[1] || '' }}
                <f7-stepper small :value="hour.incrementStart" @stepper:change="v => (hour.incrementStart = v)" :min="0" :max="23" />
                {{ text.Hours.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificHour"
                :title="text.Hours.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="hour.cronEvery === 3 ? true : null"
                @click="hour.cronEvery = 3">
                <select multiple @change="hour.specificSpecific = getSmartSelectValue('specificHour').map((v) => parseInt(v))">
                  <option
                    v-for="val in 24"
                    :key="val"
                    :value="val - 1"
                    :selected="hour.specificSpecific.indexOf(val - 1) >= 0 ? true : null">
                    {{ val - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="hour.cronEvery === 4 ? true : null" @change="hour.cronEvery = 4">
                {{ text.Hours.cycle[0] }}
                <f7-stepper small :value="hour.rangeStart" @stepper:change="v => (hour.rangeStart = v)" :min="0" :max="23" />
                {{ text.Hours.cycle[1] || '' }}
                <f7-stepper small :value="hour.rangeEnd" @stepper:change="v => (hour.rangeEnd = v)" :min="0" :max="23" />
                {{ text.Hours.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'days'">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ text.Day.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <!-- Every day -->
              <f7-list-item radio :checked="day.cronEvery === 1 ? true : null" @change="day.cronEvery = 1">
                {{ text.Day.every }}
              </f7-list-item>
              <!-- Every 1 day(s) starting on Sunday -->
              <f7-list-item radio :checked="day.cronEvery === 2 ? true : null" @change="day.cronEvery = 2">
                {{ text.Day.intervalWeek[0] }}
                <f7-stepper small :value="week.incrementIncrement" @stepper:change="v => (week.incrementIncrement = v)" :min="1" :max="7" />
                {{ text.Day.intervalWeek[1] || '' }}
                <select size="small" v-model="week.incrementStart" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="text.Week[val-1]" :value="val" />
                </select>
                <!-- <f7-stepper small :value="week.incrementStart" @stepper:change="(v) => week.incrementStart = v" :min="0" :max="23"></f7-stepper> -->
                {{ text.Day.intervalWeek[2] || '' }}
              </f7-list-item>
              <!-- Every 1 day(s) starting on the 1 of the month -->
              <f7-list-item radio :checked="day.cronEvery === 3 ? true : null" @change="day.cronEvery = 3">
                {{ text.Day.intervalDay[0] }}
                <f7-stepper small :value="day.incrementIncrement" @stepper:change="v => (day.incrementIncrement = v)" :min="1" :max="31" />
                {{ text.Day.intervalDay[1] || '' }}
                <f7-stepper small :value="day.incrementStart" @stepper:change="v => (day.incrementStart = v)" :min="1" :max="31" />
                {{ text.Day.intervalDay[2] || '' }}
              </f7-list-item>
              <!-- Specific day of week -->
              <f7-list-item
                radio
                ref="specificDayOfWeek"
                :title="text.Day.specificWeek"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="day.cronEvery === 4 ? true : null"
                @click="day.cronEvery = 4">
                <select multiple @change="week.specificSpecific = getSmartSelectValue('specificDayOfWeek').map((v) => v)">
                  <option
                    v-for="val in 7"
                    :key="val"
                    :value="['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][val - 1]"
                    :selected="week.specificSpecific.indexOf( ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][val - 1]) >= 0 ? true : null">
                    {{ text.Week[val - 1] }}
                  </option>
                </select>
              </f7-list-item>
              <!-- Specific day of the month -->
              <f7-list-item
                radio
                ref="specificDayOfMonth"
                :title="text.Day.specificDay"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="day.cronEvery === 5 ? true : null"
                @click="day.cronEvery = 5">
                <select multiple @change="day.specificSpecific = getSmartSelectValue('specificDayOfMonth').map((v) => parseInt(v))">
                  <option v-for="val in 31" :key="val" :value="val" :selected="day.specificSpecific.indexOf(val) >= 0 ? true : null">
                    {{ val }}
                  </option>
                </select>
              </f7-list-item>
              <!-- On the last day of the month -->
              <f7-list-item radio :checked="day.cronEvery === 6 ? true : null" @change="day.cronEvery = 6">
                {{ text.Day.lastDay }}
              </f7-list-item>
              <!-- On the last weekday of the month -->
              <f7-list-item radio :checked="day.cronEvery === 7 ? true : null" @change="day.cronEvery = 7">
                {{ text.Day.lastWeekday }}
              </f7-list-item>
              <!-- On the last Sunday of the month -->
              <f7-list-item radio :checked="day.cronEvery === 8 ? true : null" @change="day.cronEvery = 8">
                {{ text.Day.lastWeek[0] }}
                <select size="small" v-model="day.cronLastSpecificDomDay" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="text.Week[val - 1]" :value="val" />
                </select>
                {{ text.Day.lastWeek[1] || '' }}
              </f7-list-item>
              <!-- 1 day(s) before the end of the month -->
              <f7-list-item radio :checked="day.cronEvery === 9 ? true : null" @change="day.cronEvery = 9">
                <f7-stepper
                  small
                  :value="day.cronDaysBeforeEomMinus"
                  @stepper:change="v => (day.cronDaysBeforeEomMinus = v)"
                  :min="1"
                  :max="31" />
                {{ text.Day.beforeEndMonth[0] }}
              </f7-list-item>
              <!-- Nearest weekday (Monday to Friday) to the 1 of the month -->
              <f7-list-item radio :checked="day.cronEvery === 10 ? true : null" @change="day.cronEvery = 10">
                {{ text.Day.nearestWeekday[0] }}
                <f7-stepper
                  small
                  :value="day.cronDaysNearestWeekday"
                  @stepper:change="(v) => day.cronDaysNearestWeekday = v"
                  :min="1"
                  :max="31" />
                {{ text.Day.nearestWeekday[1] }}
              </f7-list-item>
              <!-- On the 1 Sunday of the month -->
              <f7-list-item radio :checked="day.cronEvery === 11 ? true : null" @change="day.cronEvery = 11">
                {{ text.Day.someWeekday[0] }}
                <f7-stepper small :value="week.cronNthDayNth" @stepper:change="(v) => week.cronNthDayNth = v" :min="1" :max="5" />
                <select size="small" v-model="week.cronNthDayDay" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="text.Week[val - 1]" :value="val" />
                </select>
                {{ text.Day.someWeekday[1] }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'month'">
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="month.cronEvery === 1 ? true : null" @change="month.cronEvery = 1">
                {{ text.Month.every }}
              </f7-list-item>
              <f7-list-item radio :checked="month.cronEvery === 2 ? true : null" @change="month.cronEvery = 2">
                {{ text.Month.interval[0] }}
                <f7-stepper
                  small
                  :value="month.incrementIncrement"
                  @stepper:change="(v) => month.incrementIncrement = v"
                  :min="1"
                  :max="12" />
                {{ text.Month.interval[1] || '' }}
                <f7-stepper small :value="month.incrementStart" @stepper:change="(v) => month.incrementStart = v" :min="1" :max="12" />
                {{ text.Month.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificMonth"
                :title="text.Month.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="month.cronEvery === 3 ? true : null"
                @click="month.cronEvery = 3">
                <select multiple @change="month.specificSpecific = getSmartSelectValue('specificMonth').map((v) => parseInt(v))">
                  <option v-for="val in 12" :key="val" :value="val" :selected="month.specificSpecific.indexOf(val) >= 0 ? true : null">
                    {{ val }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="month.cronEvery === 4 ? true : null" @change="month.cronEvery = 4">
                {{ text.Month.cycle[0] }}
                <f7-stepper small :value="month.rangeStart" @stepper:change="(v) => month.rangeStart = v" :min="1" :max="12" />
                {{ text.Month.cycle[1] || '' }}
                <f7-stepper small :value="month.rangeEnd" @stepper:change="(v) => month.rangeEnd = v" :min="1" :max="12" />
                {{ text.Month.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab :tab-active="currentTab === 'year'">
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="year.cronEvery === 1 ? true : null" @change="year.cronEvery = 1">
                {{ text.Year.every }}
              </f7-list-item>
              <f7-list-item radio :checked="year.cronEvery === 2 ? true : null" @change="year.cronEvery = 2">
                {{ text.Year.interval[0] }}
                <f7-stepper
                  small
                  :value="year.incrementIncrement"
                  @stepper:change="(v) => year.incrementIncrement = v"
                  :min="1"
                  :max="99" />
                {{ text.Year.interval[1] || '' }}
                <f7-stepper
                  small
                  :value="year.incrementStart"
                  @stepper:change="(v) => year.incrementStart = v"
                  :min="year.currentYear"
                  :max="year.currentYear + 100" />
                {{ text.Year.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificYear"
                :title="text.Year.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="year.cronEvery === 3 ? true : null"
                @click="year.cronEvery = 3">
                <select multiple @change="year.specificSpecific = getSmartSelectValue('specificYear').map((v) => parseInt(v))">
                  <option
                    v-for="val in 100"
                    :key="val"
                    :value="val + year.currentYear - 1"
                    :selected="year.specificSpecific.indexOf(val + year.currentYear - 1) >= 0 ? true : null">
                    {{ val + year.currentYear - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="year.cronEvery === 4 ? true : null" @change="year.cronEvery = 4">
                {{ text.Year.cycle[0] }}
                <f7-stepper
                  small
                  :value="year.rangeStart"
                  @stepper:change="v => (year.rangeStart = v)"
                  :min="year.currentYear"
                  :max="year.currentYear + 100" />
                {{ text.Year.cycle[1] || '' }}
                <f7-stepper
                  small
                  :value="year.rangeEnd"
                  @stepper:change="v => (year.rangeEnd = v)"
                  :min="year.currentYear"
                  :max="year.currentYear + 100" />
                {{ text.Year.cycle[2] || '' }}
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
import Labels from '@/assets/i18n/cron/en.js'
import { toString } from 'cronstrue'
import { f7 } from 'framework7-vue'

export default {
  name: 'vueCron',
  props: {
    value: String
  },
  setup () {
    return [
      f7
    ]
  },
  data () {
    const date = new Date()
    const currentMonth = date.getMonth() + 1
    const currentYear = date.getFullYear()
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
        incrementStart: 1,
        incrementIncrement: 1,
        specificSpecific: [],
        cronNthDayDay: 1,
        cronNthDayNth: 1
      },
      month: {
        cronEvery: 1,
        incrementStart: currentMonth,
        incrementIncrement: 2,
        rangeStart: currentMonth,
        rangeEnd: currentMonth,
        specificSpecific: []
      },
      year: {
        cronEvery: 1,
        incrementStart: currentYear,
        incrementIncrement: 1,
        rangeStart: currentYear,
        rangeEnd: currentYear,
        specificSpecific: [],
        currentYear: currentYear
      }
    }
  },
  computed: {
    smartSelectParams () {
      return { openIn: 'popover', view: f7.view.main }
    },
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
          this.second.specificSpecific.forEach((val) => {
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
          this.minute.specificSpecific.forEach((val) => {
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
          this.hour.specificSpecific.forEach((val) => {
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
        case '2':
        case '4':
        case '11':
          days = '?'
          break
        case '3':
          days = this.day.incrementStart + '/' + this.day.incrementIncrement
          break
        case '5':
          this.day.specificSpecific.forEach((val) => {
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
          weeks = '*'
          break
        case '3':
        case '5':
          weeks = '?'
          break
        case '2':
          weeks = this.week.incrementStart + '/' + this.week.incrementIncrement
          break
        case '4':
          this.week.specificSpecific.forEach((val) => {
            weeks += val + ','
          })
          weeks = weeks.slice(0, -1)
          break
        case '6':
        case '7':
        case '9':
        case '10':
          weeks = '?'
          break
        case '8':
          weeks = this.day.cronLastSpecificDomDay + 'L'
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
          this.month.specificSpecific.forEach((val) => {
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
          years = ''
          break
        case '2':
          years = this.year.incrementStart + '/' + this.year.incrementIncrement
          break
        case '3':
          this.year.specificSpecific.forEach((val) => {
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
        .hoursText || '*'} ${this.daysText || '?'} ${this.monthsText ||
        '*'} ${this.weeksText || '?'} ${this.yearsText.length ? ' ' : ''}${this.yearsText || ''}`
    },
    translation () {
      return toString(this.cron, {
        use24HourTimeFormat: true,
        dayOfWeekStartIndexZero: false
      })
    }
  },
  methods: {
    change () {
      f7.emit('cronEditorUpdate', this.cron)
    },
    open () {
      this.restore(this.value)
      this.$nextTick(() => {
        // Manually update select elements to reflect restored data
        this.updateSmartSelectOptions('specificSecond', this.second.specificSpecific)
        this.updateSmartSelectOptions('specificMinute', this.minute.specificSpecific)
        this.updateSmartSelectOptions('specificHour', this.hour.specificSpecific)
        this.updateSmartSelectOptions('specificDayOfWeek', this.week.specificSpecific)
        this.updateSmartSelectOptions('specificDayOfMonth', this.day.specificSpecific)
        this.updateSmartSelectOptions('specificMonth', this.month.specificSpecific)
        this.updateSmartSelectOptions('specificYear', this.year.specificSpecific)
      })
    },
    close () {
      f7.emit('cronEditorClosed')
    },
    updateSmartSelectOptions (refName, selectedValues) {
      const selectEl = this.$refs[refName]?.$el?.querySelector('select')
      if (!selectEl) return

      Array.from(selectEl.options).forEach(option => {
        option.selected = selectedValues.includes(option.value) || selectedValues.includes(parseInt(option.value))
      })

      // Trigger change to update smart-select UI
      selectEl.dispatchEvent(new Event('change', { bubbles: true }))
    },
    restore (val) {
      if (!val) return
      const cronExpr = val.trim().split(' ')
      this.second.cronEvery = 1
      this.minute.cronEvery = 1
      this.hour.cronEvery = 1
      this.day.cronEvery = 1
      this.month.cronEvery = 1
      this.year.cronEvery = 1
      cronExpr.forEach((expr, ndx) => {
        switch (ndx) {
          case 0:
            this.second = this.restoreBase(this.second, expr)
            break
          case 1:
            this.minute = this.restoreBase(this.minute, expr)
            break
          case 2:
            this.hour = this.restoreBase(this.hour, expr)
            break
          case 4:
            this.month = this.restoreBase(this.month, expr)
            break
          case 6:
            this.year = this.restoreBase(this.year, expr)
            break
        }
      })
      this.restoreDayAndWeek(cronExpr[3] || '', cronExpr[5] || '')
    },
    restoreBase (val, expr) {
      const newVal = val
      if (expr === '*') {
        newVal.cronEvery = 1
      } else if (expr.includes('/')) {
        newVal.cronEvery = 2
        const increment = expr.split('/')
        newVal.incrementStart = parseInt(increment[0])
        newVal.incrementIncrement = parseInt(increment[1])
      } else if (expr.includes('-')) {
        this.second.cronEvery = 4
        const range = expr.split('-')
        newVal.rangeStart = parseInt(range[0])
        newVal.rangeEnd = parseInt(range[1])
      } else {
        newVal.cronEvery = 3
        newVal.specificSpecific = expr.split(',').map((v) => parseInt(v))
      }
      return newVal
    },
    restoreDayAndWeek (dayExpr, weekExpr) {
      if (weekExpr.includes('/')) {
        this.day.cronEvery = 2
        const weekIncrement = weekExpr.split('/')
        this.week.incrementStart = weekIncrement[0]
        this.week.incrementEnd = weekIncrement[1]
      } else if (dayExpr.includes('/')) {
        this.day.cronEvery = 3
        const dayIncrement = dayExpr.split('/')
        this.day.incrementStart = dayIncrement[0]
        this.day.incrementEnd = dayIncrement[1]
      } else if (dayExpr === 'L') {
        this.day.cronEvery = 6
      } else if (dayExpr === 'LW') {
        this.day.cronEvery = 7
      } else if (weekExpr.endsWith('L')) {
        this.day.cronEvery = 8
        this.day.cronLastSpecificDomDay = weekExpr.slice(0, -1)
      } else if (dayExpr.startsWith('L-')) {
        this.day.cronEvery = 9
        this.day.cronDaysBeforeEomMinus = dayExpr.slice(2)
      } else if (dayExpr.endsWith('W')) {
        this.day.cronEvery = 10
        this.day.cronDaysNearestWeekday = dayExpr.slice(0, -1)
      } else if (weekExpr.includes('#')) {
        this.day.cronEvery = 11
        const weekNthDay = weekExpr.split('#')
        this.week.cronNthDayDay = weekNthDay[0]
        this.week.cronNthDayNth = weekNthDay[1]
      } else if (weekExpr?.length) {
        this.day.cronEvery = 4
        this.week.specificSpecific = weekExpr.split(',')
      } else {
        this.day.cronEvery = 5
        this.day.specificSpecific = dayExpr.split(',')
      }
    },
    getSmartSelectValue (refName) {
      const ref = this.$refs[refName]
      return ref?.$el?.children[0]?.f7SmartSelect?.getValue() || []
    }
  }
}
</script>
