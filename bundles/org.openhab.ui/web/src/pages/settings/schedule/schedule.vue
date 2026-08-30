<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Schedule" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-schedules"
          :persist-search-string-key="'schedules-search-string'"
          :haystack-fields="haystackFields"
          :filters-definitions="filtersDefinitions"
          @update:tokenized-search="onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <f7-link
        v-if="!theme.md"
        v-show="selectedItems.length"
        class="delete"
        icon-ios="f7:trash"
        icon-aurora="f7:trash"
        @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">{{ selectedItems.length }} selected</div>
      <div v-if="theme.md" class="right">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link icon-md="material:more_vert" icon-color="white" @click="removeSelected" />
      </div>
    </f7-toolbar>

    <empty-state-placeholder
      v-if="noRuleEngine"
      icon="exclamationmark_triangle"
      title="rules.missingengine.title"
      text="rules.missingengine.text" />
    <empty-state-placeholder v-else-if="ready && !rules.length" icon="calendar" title="schedule.title" text="schedule.text" />
    <div v-else class="timeline timeline-horizontal col-33 tablet-15">
      <div v-for="(yearObj, year) in calendar" class="timeline-year" :key="year">
        <div class="timeline-year-title">
          <span>{{ year }}</span>
        </div>
        <div v-for="(monthObj, month) in yearObj" class="timeline-month" :key="month">
          <div class="timeline-month-title">
            <span>{{ month }}</span>
          </div>
          <div v-for="(dayObj, day) in monthObj" class="timeline-item" :key="day">
            <div class="timeline-item-date">
              <span>{{ day }}</span>
            </div>
            <div class="timeline-item-content">
              <template v-for="(occurrence, idx) in calendar[year][month][day]">
                <template v-if="filteredList.indexOf(occurrence.index) >= 0">
                  <div class="timeline-item-inner" :key="idx">
                    <div class="timeline-item-time">
                      {{ occurrence.date.toTimeString().substring(0, 5) }}
                    </div>
                    <div class="timeline-item-title">
                      {{ occurrence.rule.name }}
                    </div>
                    <!-- <div class="timeline-item-text">{{occurrence[1].description}}</div> -->
                    <f7-link :href="'/settings/rules/' + occurrence.rule.uid" small text="edit" />
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #fixed>
      <f7-fab v-if="ready" position="right-bottom" color="theme-alt" href="add">
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
import { nextTick, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

import { showToast } from '@/js/dialog-promises'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import { useSearch } from '@/components/useSearch'

export default {
  components: {
    'empty-state-placeholder': EmptyStatePlaceholder,
    OhSearchbar
  },
  props: {
    f7router: Object
  },
  setup() {
    const rules = shallowRef([])
    const haystackFields = ['uid', 'name', 'description', 'tag'] // TODO: ruleStatusBadgeText
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    function displayedTags(rule) {
      return rule.tags.filter((t) => t !== 'Script' && t !== 'Scene')
    }

    const filtersDefinitions = {
      name: {
        label: 'Name',
        path: 'rule.name'
      },
      uid: {
        label: 'UID',
        path: 'rule.uid'
      },
      description: {
        label: 'Description',
        path: 'rule.description'
      },
      tag: {
        label: 'Tag',
        getFn: (rule) => displayedTags(rule.rule)
      },
      status: {
        label: 'Status',
        options: {
          uninitialized: 'Uninitialized',
          initializing: 'Initializing',
          idle: 'Idle',
          running: 'Running',
          disabled: 'Disabled'
        },
        getFn: (rule) => [rule.rule.status?.status, rule.rule.status?.statusDetail]
      }
    }

    const { filteredList, isFiltered, onUpdateTokenizedSearch, getFuseValuesForField } = useSearch(rules, {
      filtersDefinitions,
      haystackFields,
      returnType: 'indices'
    })

    filtersDefinitions.tag.options = () => getFuseValuesForField('tag')

    return {
      theme,
      rules,
      ohSearchbarRef,
      filtersDefinitions,
      filteredList,
      isFiltered,
      onUpdateTokenizedSearch,
      haystackFields
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      noRuleEngine: false,
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null,
      start: new Date()
    }
  },
  computed: {
    calendar() {
      const limit = new Date()
      limit.setDate(this.start.getDate() + 31)
      const cal = {}

      const occurrences = []
      this.rules.forEach((rule, idx) => {
        occurrences.push({ date: new Date(rule.date), rule: rule.rule, index: idx })
      })

      let day = new Date(this.start)
      while (day < limit) {
        const year = day.getFullYear()
        const month = day.toLocaleString('default', { month: 'long' })
        const dayofmonth = day.toLocaleString('default', { weekday: 'short' }) + ' ' + day.getDate()
        const monthIndex = day.getMonth()
        const dayIndex = day.getDate()
        if (!cal[year]) cal[year] = {}
        if (!cal[year][month]) cal[year][month] = {}
        cal[year][month][dayofmonth] = occurrences.filter((o) => {
          return o.date.getFullYear() === year && o.date.getMonth() === monthIndex && o.date.getDate() === dayIndex
        })
        day.setDate(day.getDate() + 1)
      }

      return cal
    }
  },
  methods: {
    async onPageAfterIn() {
      await this.load()
    },
    onPageBeforeOut() {
      this.stopEventSource()
      this.ohSearchbarRef?.persistSearchbarQuery()
    },
    async load() {
      if (this.loading) return
      this.loading = true

      this.initSearchbar = false

      const limit = new Date()
      limit.setDate(this.start.getDate() + 31)
      await this.$oh.api
        .get('/rest/rules/schedule/simulations?from=' + this.start.toISOString() + '&until=' + limit.toISOString())
        .then((data) => {
          this.rules = data
          this.loading = false
          this.initSearchbar = true

          this.ready = true
          if (!this.eventSource) this.startEventSource()

          nextTick(() => {
            if (this.$device.desktop) {
              this.ohSearchbarRef?.focus()
            }
          })
        })
        .catch((err, status) => {
          if (err === 'Not Found' || status === 404) {
            this.noRuleEngine = true
          }
        })
    },
    startEventSource() {
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
    stopEventSource() {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked(item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    toggleItemCheck(event, item) {
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected() {
      const vm = this

      f7.dialog.confirm(`Remove ${this.selectedItems.length} selected rules?`, 'Remove Rules', () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      let dialog = f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises)
        .then((data) => {
          showToast('Rules removed')
          this.selectedItems = []
          dialog.close()
          this.load()
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          f7.dialog.alert('An error occurred while deleting: ' + err)
        })
    }
  }
}
</script>
