<!-- Adapted from https://github.com/1615450788/vue-cron - license: MIT -->

<template>
  <f7-popup class="cron-select" :opened="opened" close-on-escape @popup:closed="onClose">
    <f7-page class="cron-select-content">
      <f7-navbar :title="'Cron: ' + cron" :subtitle="translation">
        <f7-nav-right>
          <f7-link class="popup-close" @click="onChange"> Done </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar tabbar position="top">
        <f7-link class="padding-left padding-right" tab-link="#seconds" tab-link-active> Seconds </f7-link>
        <f7-link class="padding-left padding-right" tab-link="#minutes"> Minutes </f7-link>
        <f7-link class="padding-left padding-right" tab-link="#hours"> Hours </f7-link>
        <f7-link class="padding-left padding-right" tab-link="#days"> Days </f7-link>
        <f7-link class="padding-left padding-right" tab-link="#month"> Month </f7-link>
        <f7-link class="padding-left padding-right" tab-link="#year"> Year </f7-link>
      </f7-toolbar>
      <f7-tabs type="border-card">
        <f7-tab id="seconds" tab-active>
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ Labels.Seconds.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <f7-list-item
                radio
                :checked="second.cronEvery === CronEvery.Every ? true : null"
                @change="second.cronEvery = CronEvery.Every">
                {{ Labels.Seconds.every }}
              </f7-list-item>
              <f7-list-item
                radio
                :checked="second.cronEvery === CronEvery.Increment ? true : null"
                @change="second.cronEvery = CronEvery.Increment">
                {{ Labels.Seconds.interval[0] }}
                <f7-stepper small v-model:value="second.increment.increment" :min="1" :max="CRON_LIMITS.second.incrementMax" />
                {{ Labels.Seconds.interval[1] || '' }}
                <f7-stepper small v-model:value="second.increment.start" :min="CRON_LIMITS.second.min" :max="CRON_LIMITS.second.max" />
                {{ Labels.Seconds.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificSecond"
                :title="Labels.Seconds.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="second.cronEvery === CronEvery.Specific ? true : null"
                @click="second.cronEvery = CronEvery.Specific">
                <select multiple v-model="second.specific">
                  <option v-for="val in 60" :key="val" :value="val - 1">
                    {{ val - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item
                radio
                :checked="second.cronEvery === CronEvery.Range ? true : null"
                @change="second.cronEvery = CronEvery.Range">
                {{ Labels.Seconds.cycle[0] }}
                <f7-stepper small v-model:value="second.range.start" :min="CRON_LIMITS.second.min" :max="CRON_LIMITS.second.max" />
                {{ Labels.Seconds.cycle[1] || '' }}
                <f7-stepper small v-model:value="second.range.end" :min="CRON_LIMITS.second.min" :max="CRON_LIMITS.second.max" />
                {{ Labels.Seconds.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab id="minutes">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ Labels.Minutes.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <f7-list-item
                radio
                :checked="minute.cronEvery === CronEvery.Every ? true : null"
                @change="minute.cronEvery = CronEvery.Every">
                {{ Labels.Minutes.every }}
              </f7-list-item>
              <f7-list-item
                radio
                :checked="minute.cronEvery === CronEvery.Increment ? true : null"
                @change="minute.cronEvery = CronEvery.Increment">
                {{ Labels.Minutes.interval[0] }}
                <f7-stepper small v-model:value="minute.increment.increment" :min="1" :max="CRON_LIMITS.minute.incrementMax" />
                {{ Labels.Minutes.interval[1] || '' }}
                <f7-stepper small v-model:value="minute.increment.start" :min="CRON_LIMITS.minute.min" :max="CRON_LIMITS.minute.max" />
                {{ Labels.Minutes.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificMinute"
                :title="Labels.Minutes.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="minute.cronEvery === CronEvery.Specific ? true : null"
                @click="minute.cronEvery = CronEvery.Specific">
                <select multiple v-model="minute.specific">
                  <option v-for="val in 60" :key="val" :value="val - 1">
                    {{ val - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item
                radio
                :checked="minute.cronEvery === CronEvery.Range ? true : null"
                @change="minute.cronEvery = CronEvery.Range">
                {{ Labels.Minutes.cycle[0] }}
                <f7-stepper small v-model:value="minute.range.start" :min="CRON_LIMITS.minute.min" :max="CRON_LIMITS.minute.max" />
                {{ Labels.Minutes.cycle[1] || '' }}
                <f7-stepper small v-model:value="minute.range.end" :min="CRON_LIMITS.minute.min" :max="CRON_LIMITS.minute.max" />
                {{ Labels.Minutes.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab id="hours">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ Labels.Hours.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="hour.cronEvery === CronEvery.Every ? true : null" @change="hour.cronEvery = CronEvery.Every">
                {{ Labels.Hours.every }}
              </f7-list-item>
              <f7-list-item
                radio
                :checked="hour.cronEvery === CronEvery.Increment ? true : null"
                @change="hour.cronEvery = CronEvery.Increment">
                {{ Labels.Hours.interval[0] }}
                <f7-stepper small v-model:value="hour.increment.increment" :min="1" :max="CRON_LIMITS.hour.incrementMax" />
                {{ Labels.Hours.interval[1] || '' }}
                <f7-stepper small v-model:value="hour.increment.start" :min="CRON_LIMITS.hour.min" :max="CRON_LIMITS.hour.max" />
                {{ Labels.Hours.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificHour"
                :title="Labels.Hours.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="hour.cronEvery === CronEvery.Specific ? true : null"
                @click="hour.cronEvery = CronEvery.Specific">
                <select multiple v-model="hour.specific">
                  <option v-for="val in 24" :key="val" :value="val - 1">
                    {{ val - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="hour.cronEvery === CronEvery.Range ? true : null" @change="hour.cronEvery = CronEvery.Range">
                {{ Labels.Hours.cycle[0] }}
                <f7-stepper small v-model:value="hour.range.start" :min="CRON_LIMITS.hour.min" :max="CRON_LIMITS.hour.max" />
                {{ Labels.Hours.cycle[1] || '' }}
                <f7-stepper small v-model:value="hour.range.end" :min="CRON_LIMITS.hour.min" :max="CRON_LIMITS.hour.max" />
                {{ Labels.Hours.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab id="days">
          <template #label>
            <span>
              <i class="el-icon-date" />
              {{ Labels.Day.name }}
            </span>
          </template>
          <f7-block>
            <f7-list>
              <!-- Every day -->
              <f7-list-item radio :checked="day.cronEvery === CronEvery.Every ? true : null" @change="day.cronEvery = CronEvery.Every">
                {{ Labels.Day.every }}
              </f7-list-item>
              <!-- Every 1 day(s) starting on Sunday -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.IntervalWeek ? true : null"
                @change="day.cronEvery = CronEvery.IntervalWeek">
                {{ Labels.Day.intervalWeek[0] }}
                <f7-stepper
                  small
                  v-model:value="week.increment.increment"
                  :min="CRON_LIMITS.week.incrementMin"
                  :max="CRON_LIMITS.week.incrementMax" />
                {{ Labels.Day.intervalWeek[1] || '' }}
                <select size="small" v-model="week.increment.start" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="Labels.Week[val - 1]" :value="WEEKDAY_TOKENS[val - 1]" />
                </select>
                <!-- <f7-stepper small :value="week.incrementStart" @stepper:change="(v) => week.incrementStart = v" :min="0" :max="23"></f7-stepper> -->
                {{ Labels.Day.intervalWeek[2] || '' }}
              </f7-list-item>
              <!-- Every 1 day(s) starting on the 1 of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.IntervalDay ? true : null"
                @change="day.cronEvery = CronEvery.IntervalDay">
                {{ Labels.Day.intervalDay[0] }}
                <f7-stepper
                  small
                  v-model:value="day.increment.increment"
                  :min="CRON_LIMITS.dayOfMonth.min"
                  :max="CRON_LIMITS.dayOfMonth.incrementMax" />
                {{ Labels.Day.intervalDay[1] || '' }}
                <f7-stepper small v-model:value="day.increment.start" :min="CRON_LIMITS.dayOfMonth.min" :max="CRON_LIMITS.dayOfMonth.max" />
                {{ Labels.Day.intervalDay[2] || '' }}
              </f7-list-item>
              <!-- Specific day of week -->
              <f7-list-item
                radio
                ref="specificDayOfWeek"
                :title="Labels.Day.specificWeek"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="day.cronEvery === CronEvery.Specific ? true : null"
                @click="day.cronEvery = CronEvery.Specific">
                <select multiple v-model="week.specific">
                  <option v-for="val in 7" :key="val" :value="WEEKDAY_TOKENS[val - 1]">
                    {{ Labels.Week[val - 1] }}
                  </option>
                </select>
              </f7-list-item>
              <!-- Specific day of the month -->
              <f7-list-item
                radio
                ref="specificDayOfMonth"
                :title="Labels.Day.specificDay"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="day.cronEvery === CronEvery.SpecificDayOfMonth ? true : null"
                @click="day.cronEvery = CronEvery.SpecificDayOfMonth">
                <select multiple v-model="day.specific">
                  <option v-for="val in 31" :key="val" :value="val">
                    {{ val }}
                  </option>
                </select>
              </f7-list-item>
              <!-- On the last day of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.LastDayOfMonth ? true : null"
                @change="day.cronEvery = CronEvery.LastDayOfMonth">
                {{ Labels.Day.lastDay }}
              </f7-list-item>
              <!-- On the last weekday of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.LastWeekdayOfMonth ? true : null"
                @change="day.cronEvery = CronEvery.LastWeekdayOfMonth">
                {{ Labels.Day.lastWeekday }}
              </f7-list-item>
              <!-- On the last 'Specific Day' of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.LastSpecificDayOfMonth ? true : null"
                @change="day.cronEvery = CronEvery.LastSpecificDayOfMonth">
                {{ Labels.Day.lastWeek[0] }}
                <select size="small" v-model="day.cronLastSpecificDomDay" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="Labels.Week[val - 1]" :value="WEEKDAY_TOKENS[val - 1]" />
                </select>
                {{ Labels.Day.lastWeek[1] || '' }}
              </f7-list-item>
              <!-- 1 day(s) before the end of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.DaysBeforeEndOfMonth ? true : null"
                @change="day.cronEvery = CronEvery.DaysBeforeEndOfMonth">
                <f7-stepper
                  small
                  v-model:value="day.cronDaysBeforeEomMinus"
                  :min="CRON_LIMITS.dayOfMonth.min"
                  :max="CRON_LIMITS.dayOfMonth.max" />
                {{ Labels.Day.beforeEndMonth[0] }}
              </f7-list-item>
              <!-- Nearest weekday (Monday to Friday) to the 1 of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.NearestWeekdayOfMonth ? true : null"
                @change="day.cronEvery = CronEvery.NearestWeekdayOfMonth">
                {{ Labels.Day.nearestWeekday[0] }}
                <f7-stepper
                  small
                  v-model:value="day.cronDaysNearestWeekday"
                  :min="CRON_LIMITS.dayOfMonth.min"
                  :max="CRON_LIMITS.dayOfMonth.max" />
                {{ Labels.Day.nearestWeekday[1] }}
              </f7-list-item>
              <!-- On the 1 Sunday of the month -->
              <f7-list-item
                radio
                :checked="day.cronEvery === CronEvery.SomeWeekdayOfMonth ? true : null"
                @change="day.cronEvery = CronEvery.SomeWeekdayOfMonth">
                {{ Labels.Day.someWeekday[0] }}
                <f7-stepper small v-model:value="week.cronNthDayNth" :min="CRON_LIMITS.week.nthMin" :max="CRON_LIMITS.week.nthMax" />
                <select size="small" v-model="week.cronNthDayDay" style="max-width: 150px">
                  <option v-for="val in 7" :key="val" :label="Labels.Week[val - 1]" :value="WEEKDAY_TOKENS[val - 1]" />
                </select>
                {{ Labels.Day.someWeekday[1] }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab id="month">
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="month.cronEvery === CronEvery.Every ? true : null" @change="month.cronEvery = CronEvery.Every">
                {{ Labels.Month.every }}
              </f7-list-item>
              <f7-list-item
                radio
                :checked="month.cronEvery === CronEvery.Increment ? true : null"
                @change="month.cronEvery = CronEvery.Increment">
                {{ Labels.Month.interval[0] }}
                <f7-stepper small v-model:value="month.increment.increment" :min="1" :max="CRON_LIMITS.month.incrementMax" />
                {{ Labels.Month.interval[1] || '' }}
                <f7-stepper small v-model:value="month.increment.start" :min="CRON_LIMITS.month.min" :max="CRON_LIMITS.month.max" />
                {{ Labels.Month.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificMonth"
                :title="Labels.Month.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="month.cronEvery === CronEvery.Specific ? true : null"
                @click="month.cronEvery = CronEvery.Specific">
                <select multiple v-model="month.specific">
                  <option v-for="val in 12" :key="val" :value="val">
                    {{ val }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="month.cronEvery === CronEvery.Range ? true : null" @change="month.cronEvery = CronEvery.Range">
                {{ Labels.Month.cycle[0] }}
                <f7-stepper small v-model:value="month.range.start" :min="CRON_LIMITS.month.min" :max="CRON_LIMITS.month.max" />
                {{ Labels.Month.cycle[1] || '' }}
                <f7-stepper small v-model:value="month.range.end" :min="CRON_LIMITS.month.min" :max="CRON_LIMITS.month.max" />
                {{ Labels.Month.cycle[2] || '' }}
              </f7-list-item>
            </f7-list>
          </f7-block>
        </f7-tab>
        <f7-tab id="year">
          <f7-block>
            <f7-list>
              <f7-list-item radio :checked="year.cronEvery === CronEvery.Every ? true : null" @change="year.cronEvery = CronEvery.Every">
                {{ Labels.Year.every }}
              </f7-list-item>
              <f7-list-item
                radio
                :checked="year.cronEvery === CronEvery.Increment ? true : null"
                @change="year.cronEvery = CronEvery.Increment">
                {{ Labels.Year.interval[0] }}
                <f7-stepper
                  small
                  v-model:value="year.increment.increment"
                  :min="CRON_LIMITS.year.incrementMin"
                  :max="CRON_LIMITS.year.incrementMax" />
                {{ Labels.Year.interval[1] || '' }}
                <f7-stepper
                  small
                  v-model:value="year.increment.start"
                  :min="year.currentYear"
                  :max="year.currentYear + CRON_LIMITS.year.maxOffset" />
                {{ Labels.Year.interval[2] || '' }}
              </f7-list-item>
              <f7-list-item
                radio
                ref="specificYear"
                :title="Labels.Year.specific"
                smart-select
                no-chevron
                :smart-select-params="smartSelectParams"
                :checked="year.cronEvery === CronEvery.Specific ? true : null"
                @click="year.cronEvery = CronEvery.Specific">
                <select multiple v-model="year.specific">
                  <option v-for="val in 100" :key="val" :value="val + year.currentYear - 1">
                    {{ val + year.currentYear - 1 }}
                  </option>
                </select>
              </f7-list-item>
              <f7-list-item radio :checked="year.cronEvery === CronEvery.Range ? true : null" @change="year.cronEvery = CronEvery.Range">
                {{ Labels.Year.cycle[0] }}
                <f7-stepper
                  small
                  v-model:value="year.range.start"
                  :min="year.currentYear"
                  :max="year.currentYear + CRON_LIMITS.year.maxOffset" />
                {{ Labels.Year.cycle[1] || '' }}
                <f7-stepper
                  small
                  v-model:value="year.range.end"
                  :min="year.currentYear"
                  :max="year.currentYear + CRON_LIMITS.year.maxOffset" />
                {{ Labels.Year.cycle[2] || '' }}
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

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { f7 } from 'framework7-vue'
import Labels from '@/assets/i18n/cron/en'
import { toString } from 'cronstrue'
import {
  CRON_LIMITS,
  WEEKDAY_TOKENS,
  expandWeekdaySegment,
  normalizeSpecificNumericList,
  normalizeWeekdayToken,
  parseAndClamp
} from './cronexpression-editor.utils'
import type { WeekdayToken } from './cronexpression-editor.utils'

enum CronEvery {
  Every = 1,
  Increment,
  Specific,
  Range,
  IntervalWeek,
  IntervalDay,
  SpecificDayOfMonth,
  LastDayOfMonth,
  LastWeekdayOfMonth,
  LastSpecificDayOfMonth,
  DaysBeforeEndOfMonth,
  NearestWeekdayOfMonth,
  SomeWeekdayOfMonth
}

interface CronDataBase {
  cronEvery: CronEvery
  increment: { start: number; increment: number }
  range: { start: number; end: number }
  specific: (number | string)[]
}

interface CronDataYear extends CronDataBase {
  currentYear: number
}

interface CronDataDay extends CronDataBase {
  cronLastSpecificDomDay?: WeekdayToken
  cronDaysBeforeEomMinus?: number
  cronDaysNearestWeekday?: number
  cronNthDayDay?: WeekdayToken
  cronNthDayNth?: number
}

interface CronDataWeek {
  increment: { start: WeekdayToken; increment: number }
  specific: WeekdayToken[]
  cronNthDayDay?: WeekdayToken
  cronNthDayNth?: number
}

// props & emits
const opened = defineModel<boolean>('opened', { default: false })
const value = defineModel<string>({ type: String })
const emits = defineEmits<{
  (e: 'cronEditorClosed'): void
}>()

const date = new Date()
const currentMonth = date.getMonth() + 1
const currentYear = date.getFullYear()

// reactive state
const second = ref<CronDataBase>({
  cronEvery: CronEvery.Specific,
  increment: { start: 0, increment: 5 },
  range: { start: 1, end: 1 },
  specific: [0]
})

const minute = ref<CronDataBase>({
  cronEvery: CronEvery.Specific,
  increment: { start: 0, increment: 5 },
  range: { start: 1, end: 1 },
  specific: [0]
})

const hour = ref<CronDataBase>({
  cronEvery: CronEvery.Specific,
  increment: { start: 0, increment: 5 },
  range: { start: 1, end: 1 },
  specific: [8]
})

const day = ref<CronDataDay>({
  cronEvery: CronEvery.Every,
  increment: { start: 1, increment: 1 },
  range: { start: 1, end: 1 },
  specific: [],
  cronLastSpecificDomDay: 'SUN',
  cronDaysBeforeEomMinus: 1,
  cronDaysNearestWeekday: 1
})

const week = ref<CronDataWeek>({
  increment: { start: 'SUN', increment: 1 },
  specific: [],
  cronNthDayDay: 'SUN',
  cronNthDayNth: 1
})

const month = ref<CronDataBase>({
  cronEvery: CronEvery.Every,
  increment: { start: currentMonth, increment: 2 },
  range: { start: currentMonth, end: currentMonth },
  specific: []
})

const year = ref<CronDataYear>({
  cronEvery: CronEvery.Every,
  increment: { start: currentYear, increment: 1 },
  range: { start: currentYear, end: currentYear },
  specific: [],
  currentYear: currentYear
})

// Watchers
watch(
  () => value.value,
  (newVal) => {
    restore(newVal || '')
  },
  { immediate: true }
)

// Computed
const smartSelectParams = computed(() => ({ openIn: 'popover', view: f7.view.main }))
const cron = computed(() => {
  return `${secondsText.value || '*'} ${minutesText.value || '*'} ${hoursText.value || '*'} ${daysText.value || '?'} ${monthsText.value || '*'} ${weeksText.value || '?'} ${yearsText.value.length ? ' ' : ''}${yearsText.value || ''}`
})
const secondsText = computed(() => {
  return formatBaseCronField(second.value)
})
const minutesText = computed(() => {
  return formatBaseCronField(minute.value)
})
const hoursText = computed(() => {
  return formatBaseCronField(hour.value)
})
const daysText = computed(() => {
  switch (day.value.cronEvery) {
    case CronEvery.Every:
      return '*'
    case CronEvery.IntervalWeek:
    case CronEvery.Specific:
    case CronEvery.SomeWeekdayOfMonth:
    case CronEvery.LastSpecificDayOfMonth:
      return '?'
    case CronEvery.IntervalDay:
      return day.value.increment.start + '/' + day.value.increment.increment
    case CronEvery.SpecificDayOfMonth:
      return day.value.specific.join(',')
    case CronEvery.LastDayOfMonth:
      return 'L'
    case CronEvery.LastWeekdayOfMonth:
      return 'LW'
    case CronEvery.DaysBeforeEndOfMonth:
      return 'L-' + day.value.cronDaysBeforeEomMinus
    case CronEvery.NearestWeekdayOfMonth:
      return day.value.cronDaysNearestWeekday + 'W'
    default:
      return ''
  }
})
const weeksText = computed(() => {
  switch (day.value.cronEvery) {
    case CronEvery.Every:
    case CronEvery.IntervalDay:
    case CronEvery.SpecificDayOfMonth:
    case CronEvery.LastDayOfMonth:
    case CronEvery.LastWeekdayOfMonth:
    case CronEvery.DaysBeforeEndOfMonth:
    case CronEvery.NearestWeekdayOfMonth:
      return '?'
    case CronEvery.IntervalWeek:
      return week.value.increment.start + '/' + week.value.increment.increment
    case CronEvery.Specific:
      return week.value.specific.join(',')
    case CronEvery.LastSpecificDayOfMonth:
      return (day.value.cronLastSpecificDomDay || 'SUN') + 'L'
    case CronEvery.SomeWeekdayOfMonth:
      return (week.value.cronNthDayDay || 'SUN') + '#' + week.value.cronNthDayNth
    default:
      return ''
  }
})
const monthsText = computed(() => {
  return formatBaseCronField(month.value)
})
const yearsText = computed(() => {
  return formatBaseCronField(year.value)
})

const translation = computed(() => {
  try {
    return toString(cron.value, {
      use24HourTimeFormat: true,
      dayOfWeekStartIndexZero: false
    })
  } catch {
    return 'Invalid cron expression'
  }
})

// Events
function onChange() {
  value.value = cron.value
}

function onClose() {
  opened.value = false
  emits('cronEditorClosed')
}

// Methods
function formatBaseCronField(field: CronDataBase, emptyForEvery = false) {
  switch (field.cronEvery) {
    case CronEvery.Every:
      return emptyForEvery ? '' : '*'
    case CronEvery.Increment:
      return field.increment.start + '/' + field.increment.increment
    case CronEvery.Specific:
      return field.specific.join(',')
    case CronEvery.Range:
      return field.range.start + '-' + field.range.end
    default:
      return ''
  }
}

function restore(val: string) {
  if (!val) return
  const cronExpr = val.trim().split(/\s+/)

  second.value.cronEvery = CronEvery.Every
  minute.value.cronEvery = CronEvery.Every
  hour.value.cronEvery = CronEvery.Every
  day.value.cronEvery = CronEvery.Every
  month.value.cronEvery = CronEvery.Every
  year.value.cronEvery = CronEvery.Every

  if (cronExpr.length !== 6 && cronExpr.length !== 7) {
    resetDayAndWeekSubstate()
    return
  }

  cronExpr.forEach((expr, ndx) => {
    switch (ndx) {
      case 0:
        second.value = restoreBase(second.value, expr, CRON_LIMITS.second.min, CRON_LIMITS.second.max, CRON_LIMITS.second.incrementMax)
        break
      case 1:
        minute.value = restoreBase(minute.value, expr, CRON_LIMITS.minute.min, CRON_LIMITS.minute.max, CRON_LIMITS.minute.incrementMax)
        break
      case 2:
        hour.value = restoreBase(hour.value, expr, CRON_LIMITS.hour.min, CRON_LIMITS.hour.max, CRON_LIMITS.hour.incrementMax)
        break
      case 4:
        month.value = restoreBase(month.value, expr, CRON_LIMITS.month.min, CRON_LIMITS.month.max, CRON_LIMITS.month.incrementMax)
        break
      case 6:
        year.value = restoreBase(
          year.value,
          expr,
          currentYear,
          currentYear + CRON_LIMITS.year.maxOffset,
          CRON_LIMITS.year.incrementMax
        ) as CronDataYear
        break
    }
  })
  restoreDayAndWeek(cronExpr[3] || '', cronExpr[5] || '')
}

function restoreBase(val: CronDataBase, expr: string, fieldMin: number, fieldMax: number, incrementMax: number) {
  if (expr === '*') {
    val.cronEvery = CronEvery.Every
  } else if (expr.includes('/')) {
    val.cronEvery = CronEvery.Increment
    const [start, step] = expr.split('/')
    val.increment.start = parseAndClamp(start || String(fieldMin), fieldMin, fieldMin, fieldMax)
    val.increment.increment = parseAndClamp(step || '1', 1, 1, incrementMax)
  } else if (expr.includes('-')) {
    val.cronEvery = CronEvery.Range
    const [start, end] = expr.split('-')
    val.range.start = parseAndClamp(start || String(fieldMin), fieldMin, fieldMin, fieldMax)
    val.range.end = parseAndClamp(end || String(fieldMin), fieldMin, fieldMin, fieldMax)
  } else {
    val.cronEvery = CronEvery.Specific
    const specificValues = normalizeSpecificNumericList(expr, fieldMin, fieldMax)
    val.specific = specificValues.length ? specificValues : [fieldMin]
  }
  return val
}

function resetDayAndWeekSubstate() {
  day.value.increment.start = 1
  day.value.increment.increment = 1
  day.value.specific = []
  day.value.cronLastSpecificDomDay = 'SUN'
  day.value.cronDaysBeforeEomMinus = 1
  day.value.cronDaysNearestWeekday = 1

  week.value.increment.start = 'SUN'
  week.value.increment.increment = 1
  week.value.specific = []
  week.value.cronNthDayDay = 'SUN'
  week.value.cronNthDayNth = 1
}

function restoreDayAndWeek(dayExpr: string, weekExpr: string) {
  resetDayAndWeekSubstate()

  // Standard cron for day-of-month/day-of-week when the other field carries the schedule.
  if ((dayExpr === '*' || dayExpr === '?') && (weekExpr === '*' || weekExpr === '?')) {
    day.value.cronEvery = CronEvery.Every
    return
  }

  if (weekExpr.includes('/')) {
    day.value.cronEvery = CronEvery.IntervalWeek
    const [start, step] = weekExpr.split('/')
    week.value.increment.start = normalizeWeekdayToken(start || 'SUN')
    week.value.increment.increment = parseAndClamp(
      step || String(CRON_LIMITS.week.incrementMin),
      CRON_LIMITS.week.incrementMin,
      CRON_LIMITS.week.incrementMin,
      CRON_LIMITS.week.incrementMax
    )
  } else if (dayExpr.includes('/')) {
    day.value.cronEvery = CronEvery.IntervalDay
    const [start, step] = dayExpr.split('/')
    day.value.increment.start = parseAndClamp(
      start || String(CRON_LIMITS.dayOfMonth.min),
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.max
    )
    day.value.increment.increment = parseAndClamp(
      step || String(CRON_LIMITS.dayOfMonth.min),
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.incrementMax
    )
  } else if (dayExpr === 'L') {
    day.value.cronEvery = CronEvery.LastDayOfMonth
  } else if (dayExpr === 'LW') {
    day.value.cronEvery = CronEvery.LastWeekdayOfMonth
  } else if (weekExpr.endsWith('L')) {
    day.value.cronEvery = CronEvery.LastSpecificDayOfMonth
    day.value.cronLastSpecificDomDay = normalizeWeekdayToken(weekExpr.slice(0, -1) || 'SUN')
  } else if (dayExpr.startsWith('L-')) {
    day.value.cronEvery = CronEvery.DaysBeforeEndOfMonth
    day.value.cronDaysBeforeEomMinus = parseAndClamp(
      dayExpr.slice(2) || String(CRON_LIMITS.dayOfMonth.min),
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.max
    )
  } else if (dayExpr.endsWith('W')) {
    day.value.cronEvery = CronEvery.NearestWeekdayOfMonth
    day.value.cronDaysNearestWeekday = parseAndClamp(
      dayExpr.slice(0, -1) || String(CRON_LIMITS.dayOfMonth.min),
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.min,
      CRON_LIMITS.dayOfMonth.max
    )
  } else if (weekExpr.includes('#')) {
    day.value.cronEvery = CronEvery.SomeWeekdayOfMonth
    const [dayOfWeek, nth] = weekExpr.split('#')
    week.value.cronNthDayDay = normalizeWeekdayToken(dayOfWeek || 'SUN')
    week.value.cronNthDayNth = parseAndClamp(
      nth || String(CRON_LIMITS.week.nthMin),
      CRON_LIMITS.week.nthMin,
      CRON_LIMITS.week.nthMin,
      CRON_LIMITS.week.nthMax
    )
  } else if (weekExpr?.length && weekExpr !== '?') {
    day.value.cronEvery = CronEvery.Specific
    const specificWeekdays = weekExpr.split(',').reduce<WeekdayToken[]>((acc, segment) => {
      acc.push(...expandWeekdaySegment(segment))
      return acc
    }, [])
    week.value.specific = specificWeekdays.length ? specificWeekdays : (['SUN'] as WeekdayToken[])
  } else {
    day.value.cronEvery = CronEvery.SpecificDayOfMonth
    day.value.specific = normalizeSpecificNumericList(dayExpr, CRON_LIMITS.dayOfMonth.min, CRON_LIMITS.dayOfMonth.max)
  }
}
</script>
