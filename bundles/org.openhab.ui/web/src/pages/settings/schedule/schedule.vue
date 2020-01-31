<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Schedule" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link>
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-schedule"
          :init="initSearchbar"
          search-container=".timeline"
          search-item=".timeline-item-inner"
          search-in=".timeline-item-title"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">Remove {{selectedItems.length}}</f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false"></f7-link>
      <div class="title" v-if="$theme.md">
        {{selectedItems.length}} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected"></f7-link>
        <f7-link icon-md="material:more_vert" icon-color="white" @click="removeSelected"></f7-link>
      </div>
    </f7-toolbar>

    <empty-state-placeholder v-if="noRuleEngine" icon="exclamationmark_triangle" title="rules.missingengine.title" text="rules.missingengine.text" />
    <empty-state-placeholder v-else-if="ready && !rules.length" icon="calendar" title="schedule.title" text="schedule.text" />
    <div v-else class="timeline timeline-horizontal col-33 tablet-15">
      <div class="timeline-year" v-for="(yearObj, year) in calendar" :key="year">
        <div class="timeline-year-title"><span>{{year}}</span></div>
        <div class="timeline-month" v-for="(monthObj, month) in yearObj" :key="month">
          <div class="timeline-month-title"><span>{{month}}</span></div>
          <div class="timeline-item" v-for="(dayObj, day) in monthObj" :key="day">
            <div class="timeline-item-date"><span>{{day}}</span></div>
            <div class="timeline-item-content">
              <div class="timeline-item-inner" v-for="(occurrence, $idx) in calendar[year][month][day]" :key="$idx">
                <div class="timeline-item-time">{{occurrence[0].substring(11, 16)}}</div>
                <div class="timeline-item-title">{{occurrence[1].name}}</div>
                <!-- <div class="timeline-item-text">{{occurrence[1].description}}</div> -->
                <f7-link :href="'/settings/rules/' + occurrence[1].uid" small text="edit"></f7-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <f7-fab v-if="ready" position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close"></f7-icon>
    </f7-fab>
  </f7-page>
</template>

<style lang="stylus">
.timeline-item-content
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */
.timeline-item-content::-webkit-scrollbar /* WebKit */
  width 0
  height 0

</style>

<script>
import later from 'later-again'

export default {
  data () {
    return {
      ready: false,
      loading: false,
      rules: [],
      noRuleEngine: false,
      calendar: {},
      initSearchbar: false,
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  created () {

  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      if (this.loading) return
      this.loading = true
      let occurrences = []
      this.$oh.api.get('/rest/rules?tags=Schedule').then(data => {
        this.rules = data.sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
        this.initSearchbar = true
        this.loading = false

        // compute occurrences for rules
        this.rules.forEach((rule) => {
          rule.triggers.forEach((t) => {
            if (t.type === 'timer.GenericCronTrigger') {
              if (t.configuration && t.configuration.cronExpression) {
                try {
                  const laterSchedule = later.cron(t.configuration.cronExpression, true)
                  const triggerNextOccurrences = later.schedule(laterSchedule).next(100)
                  occurrences.push(...triggerNextOccurrences.map((o) => {
                    return [o.toISOString(), rule]
                  }))
                } catch (err) {
                  throw err
                }
              }
            } else if (t.type === 'timer.TimeOfDayTrigger') {
              if (t.configuration && t.configuration.time && t.configuration.time.match(/^\d\d:\d\d/)) {
                for (let i = 0, d = new Date(); i < 31; i++) {
                  d.setUTCHours(t.configuration.time.split(':')[0], t.configuration.time.split(':')[1])
                  occurrences.push([d.toISOString().replace(), rule])
                  d.setDate(d.getDate() + 1)
                }
              }
            }
          })
        })

        occurrences = occurrences.sort((o1, o2) => o1[0].localeCompare(o2[0]))
        this.$set(this, 'calendar', {})

        let start = new Date(), limit = new Date()
        limit.setDate(start.getDate() + 31)
        let day = start
        // eslint-disable-next-line no-unmodified-loop-condition
        while (day < limit) {
          const year = day.getFullYear()
          const month = day.toLocaleString('default', { month: 'long' })
          const dayofmonth = day.toLocaleString('default', { weekday: 'short' }) + ' ' + day.getDate()
          const cal = this.calendar
          if (!cal[year]) cal[year] = {}
          if (!cal[year][month]) cal[year][month] = {}
          if (!cal[year][month][dayofmonth]) cal[year][month][dayofmonth] = []

          const dayISODate = day.toISOString().split('T')[0]
          const dayOccurrences = occurrences.filter((o) => {
            const occurrenceISODate = o[0].split('T')[0]
            const rule = o[1]

            // filter out the occurrences not satisfying common rule conditions modules
            if (rule.conditions.some((c) => c.type === 'timer.DayOfWeekCondition' &&
                c.configuration && Array.isArray(c.configuration.days) &&
                c.configuration.days.indexOf(['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day.getDay()]) < 0)) {
              return false
            }

            return occurrenceISODate === dayISODate
          })
          cal[year][month][dayofmonth] = dayOccurrences
          day.setDate(day.getDate() + 1)
        }

        this.ready = true
        if (!this.eventSource) this.startEventSource()
      }).catch((err, status) => {
        if (err === 'Not Found' || status === 404) {
          this.noRuleEngine = true
        }
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/rules/*/*', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'added':
          case 'removed':
          case 'updated':
            this.load()
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    toggleItemCheck (event, item) {
      console.log('toggle check')
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected rules?`,
        'Remove Rules',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = this.$f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Rules removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    }
  }
}
</script>
