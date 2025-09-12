<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <f7-nav-left>
        <f7-link icon-f7="chevron_left" href="/settings/">
          Settings
        </f7-link>
      </f7-nav-left>
      <f7-nav-title>
        Schedule
      </f7-nav-title>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link icon-md="material:done_all"
                 @click="toggleCheck()"
                 :text="(!theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-schedule"
          search-container=".timeline"
          search-item=".timeline-item-inner"
          search-in=".timeline-item-title"
          :placeholder="searchPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar v-if="showCheckboxes"
                class="contextual-toolbar"
                :class="{ navbar: theme.md }"
                bottom-ios
                bottom-aurora>
      <f7-link v-if="!theme.md"
               v-show="selectedItems.length"
               class="delete"
               icon-ios="f7:trash"
               icon-aurora="f7:trash"
               @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="theme.md"
               icon-md="material:close"
               icon-color="white"
               @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">
        {{ selectedItems.length }} selected
      </div>
      <div v-if="theme.md" class="right">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link icon-md="material:more_vert" icon-color="white" @click="removeSelected" />
      </div>
    </f7-toolbar>

    <empty-state-placeholder v-if="noRuleEngine"
                             icon="exclamationmark_triangle"
                             title="rules.missingengine.title"
                             text="rules.missingengine.text" />
    <empty-state-placeholder v-else-if="ready && !rules.length"
                             icon="calendar"
                             title="schedule.title"
                             text="schedule.text" />
    <div v-else class="timeline timeline-horizontal col-33 tablet-15">
      <div class="timeline-year" v-for="(yearObj, year) in calendar" :key="year">
        <div class="timeline-year-title">
          <span>{{ year }}</span>
        </div>
        <div class="timeline-month" v-for="(monthObj, month) in yearObj" :key="month">
          <div class="timeline-month-title">
            <span>{{ month }}</span>
          </div>
          <div class="timeline-item" v-for="(dayObj, day) in monthObj" :key="day">
            <div class="timeline-item-date">
              <span>{{ day }}</span>
            </div>
            <div class="timeline-item-content">
              <div v-for="(occurrence, $idx) in calendar[year][month][day]" class="timeline-item-inner" :key="$idx">
                <div class="timeline-item-time">
                  {{ occurrence[0].toTimeString().substring(0, 5) }}
                </div>
                <div class="timeline-item-title">
                  {{ occurrence[1].name }}
                </div>
                <!-- <div class="timeline-item-text">{{occurrence[1].description}}</div> -->
                <f7-link :href="'/settings/rules/' + occurrence[1].uid" small text="edit" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #fixed>
      <f7-fab v-if="ready"
              position="right-bottom"
              color="blue"
              href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      </f7-fab>
    </template>
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
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'
import { use } from 'marked'

export default {
  components: {
    'empty-state-placeholder': EmptyStatePlaceholder
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      rules: [],
      noRuleEngine: false,
      calendar: {},
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageBeforeOut () {
      this.stopEventSource()
      useLastSearchQueryStore().lastScheduleSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar) useLastSearchQueryStore().lastScheduleSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      let occurrences = []

      let start = new Date(), limit = new Date()
      limit.setDate(start.getDate() + 31)

      this.$oh.api.get('/rest/rules/schedule/simulations?from=' + start.toISOString() + '&until=' + limit.toISOString()).then((data) => {
        this.rules = data
        this.loading = false
        this.initSearchbar = true

        // map RulesExecutions per time
        this.rules.forEach((rule) => {
          occurrences.push([new Date(rule.date), rule.rule])
        })

        this.calendar = {}

        let day = start
        while (day < limit) {
          const year = day.getFullYear()
          const month = day.toLocaleString('default', { month: 'long' })
          const dayofmonth = day.toLocaleString('default', { weekday: 'short' }) + ' ' + day.getDate()
          const monthIndex = day.getMonth()
          const dayIndex = day.getDate()
          const cal = this.calendar
          if (!cal[year]) cal[year] = {}
          if (!cal[year][month]) cal[year][month] = {}
          cal[year][month][dayofmonth] = occurrences.filter((o) => {
            return o[0].getFullYear() === year && o[0].getMonth() === monthIndex && o[0].getDate() === dayIndex
          })
          day.setDate(day.getDate() + 1)
        }

        this.ready = true
        if (!this.eventSource) this.startEventSource()

        nextTick(() => {
          if (this.$device.desktop && this.$refs.searchbar) {
            this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
          }
          this.$refs.searchbar?.$el.f7Searchbar.search(useLastSearchQueryStore().lastScheduleSearchQuery || '')
        })
      }).catch((err, status) => {
        if (err === 'Not Found' || status === 404) {
          this.noRuleEngine = true
        }
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/rules/*/*', null, (event) => {
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
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected () {
      const vm = this

      f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected rules?`,
        'Remove Rules',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      let dialog = f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises).then((data) => {
        f7.toast.create({
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
        f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    }
  },
  computed: {
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    }
  }
}
</script>
