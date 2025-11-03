<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="rules-list">
    <f7-navbar>
      <oh-nav-content :title="type"
                      back-link="Settings"
                      back-link-url="/settings/"
                      :f7router>
        <template #right>
          <f7-link icon-md="material:done_all"
                   @click="toggleCheck()"
                   :text="(!theme.md) ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <!-- Only render searchbar, if page is ready. Otherwise searchbar is broken after changes to the rules list. -->
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-rules"
          custom-search
          @searchbar:search="search"
          @searchbar:clear="clearSearch"
          @searchbar:disable="clearSearch"
          :placeholder="searchPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar v-if="showCheckboxes"
                class="contextual-toolbar"
                :class="{ navbar: theme.md, 'tabbar-labels': $f7dim.width < 480 }"
                bottom-ios
                bottom-aurora>
      <f7-link v-if="!theme.md"
               color="red"
               v-show="selectedDeletableItems.length"
               class="delete"
               icon-ios="f7:trash"
               icon-aurora="f7:trash"
               @click="deleteSelected">
        &nbsp;{{ $t('dialogs.delete') }}&nbsp;{{ selectedDeletableItems.length }}
      </f7-link>
      <f7-link v-if="!theme.md && !showScenes"
               color="orange"
               v-show="selectedItems.length && canDisable"
               class="disable"
               @click="doDisableEnableSelected(false)"
               icon-ios="f7:pause_circle"
               icon-aurora="f7:pause_circle">
        &nbsp;{{ $t('dialogs.disable') }}&nbsp;{{ disablableItems }}
      </f7-link>
      <f7-link v-if="!theme.md && !showScenes"
               color="green"
               v-show="selectedItems.length && canEnable"
               class="enable"
               @click="doDisableEnableSelected(true)"
               icon-ios="f7:play_circle"
               icon-aurora="f7:play_circle">
        &nbsp;{{ $t('dialogs.enable') }}&nbsp;{{ enablableItems }}
      </f7-link>
      <f7-link v-if="!theme.md && !showScenes"
               :color="uiOptionsStore.getDarkMode() === 'dark' ? 'purple' : 'deeppurple'"
               v-show="selectedItems.length && canRegenerate"
               class="enable"
               @click="regenerateSelected()"
               icon-ios="f7:arrow_2_circlepath"
               icon-aurora="f7:arrow_2_circlepath">
        &nbsp;{{ $t('dialogs.regenerate') }}&nbsp;{{ regeneratableItemsCount }}
      </f7-link>
      <f7-link v-if="theme.md"
               icon-md="material:close"
               icon-color="white"
               @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">
        {{ selectedItems.length }} selected
      </div>
      <div v-if="theme.md" class="right">
        <f7-link v-if="!showScenes"
                 v-show="selectedItems.length && canRegenerate"
                 tooltip="Regenerate selected from template"
                 icon-md="material:autorenew"
                 icon-color="white"
                 @click="regenerateSelected()" />
        <f7-link v-if="!showScenes"
                 v-show="selectedItems.length && canDisable"
                 tooltip="Disable selected"
                 icon-md="material:pause_circle_outline"
                 icon-color="white"
                 @click="doDisableEnableSelected(false)" />
        <f7-link v-if="!showScenes"
                 v-show="selectedItems.length && canEnable"
                 tooltip="Enable selected"
                 icon-md="material:play_circle_outline"
                 icon-color="white"
                 @click="doDisableEnableSelected(true)" />
        <f7-link v-show="selectedDeletableItems.length"
                 tooltip="Delete selected"
                 icon-md="material:delete"
                 icon-color="white"
                 @click="deleteSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      v-if="$refs.rulesList"
      v-show="!$device.desktop"
      :listEl="$refs.rulesList ? $$($refs.rulesList.$el) : undefined"
      :scroll-list="true"
      :label="true" />

    <!-- no rule engine available -->
    <empty-state-placeholder v-if="noRuleEngine"
                             icon="exclamationmark_triangle"
                             title="rules.missingengine.title"
                             text="rules.missingengine.text" />
    <!-- rule engine available but not yet ready -->
    <f7-block v-else-if="!noRuleEngine && !ready" class="block-narrow">
      <f7-col v-show="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col rules-list">
          <f7-list-group>
            <f7-list-item v-for="n in 20"
                          media-item
                          :key="n"
                          :class="`skeleton-text skeleton-effect-blink`"
                          title="Title of the rule"
                          subtitle="Tags, Schedule, Scene..."
                          after="status badge"
                          footer="Description of the rule" />
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>
    <!-- rule engine available and ready, but no rules -->
    <f7-block v-else-if="ready && !rules.length" class="block-narrow">
      <empty-state-placeholder v-if="showScripts"
                               icon="doc_plaintext"
                               title="scripts.title"
                               text="scripts.text" />
      <empty-state-placeholder v-else-if="showScenes"
                               icon="film"
                               title="scenes.title"
                               text="scenes.text" />
      <empty-state-placeholder v-else
                               icon="wand_stars"
                               title="rules.title"
                               text="rules.text" />
      <f7-row v-if="$f7dim.width < 1280" class="display-flex justify-content-center">
        <f7-button large
                   fill
                   color="blue"
                   external
                   :href="`${runtimeStore.websiteUrl}/link/${type.toLowerCase()}`"
                   target="_blank"
                   :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <!-- rule engine available and ready and has rules -->
    <f7-block class="block-narrow" v-show="!noRuleEngine && ready && rules.length > 0">
      <f7-col>
        <f7-block-title class="no-margin-top">
          <span>{{ listTitle }}</span>
          <template v-if="showCheckboxes && listedItems.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <list-filter v-if="ready"
                     ref="filters"
                     :filters="filters"
                     @toggled="updateFilteredItems"
                     @reset="updateFilteredItems" />
        <f7-list v-if="!listedItems.length">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list
          v-show="listedItems.length > 0"
          class="searchbar-found col rules-list"
          ref="rulesList"
          media-list
          contacts-list>
          <f7-list-group v-for="(rulesWithInitial, initial) in indexedRules" :key="initial">
            <f7-list-item v-if="rulesWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="rule in rulesWithInitial"
              :key="rule.uid"
              media-item
              class="rulelist-item"
              :checkbox="showCheckboxes ? true : null"
              :checked="isChecked(rule.uid) ? true : null"
              @click.ctrl="(e) => ctrlClick(e, rule)"
              @click.meta="(e) => ctrlClick(e, rule)"
              @click.exact="(e) => click(e, rule)"
              link=""
              :title="rule.name"
              :text="rule.uid"
              :footer="rule.description"
              :badge="showScenes ? '' : ruleStatusBadgeText(ruleStatuses[rule.uid])"
              :badge-color="ruleStatusBadgeColor(ruleStatuses[rule.uid])">
              <template #footer>
                <div class="footer-inner">
                  <f7-chip v-if="rule.templateUID"
                           :text="templateName(rule)"
                           @click.ctrl="(e) => templateClick(e, true, rule)"
                           @click.meta="(e) => templateClick(e, true, rule)"
                           @click.exact="(e) => templateClick(e, false, rule)"
                           media-bg-color="orange"
                           style="margin-right: 2px">
                    <template #media>
                      <f7-icon ios="f7:doc_on_doc_fill"
                               md="material:file_copy"
                               aurora="f7:doc_on_doc_fill" />
                    </template>
                  </f7-chip>
                  <f7-chip v-for="tag in displayedTags(rule)"
                           :key="tag"
                           :text="tag"
                           media-bg-color="blue"
                           style="margin-right: 6px">
                    <template #media>
                      <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                    </template>
                  </f7-chip>
                </div>
              </template>
              <!-- <span slot="media" class="item-initial">{{initial}}</span> -->
              <template v-if="rule.editable === false" #after-title>
                <f7-icon f7="lock_fill" size="1rem" color="gray" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes"
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
.rules-list
  .item-footer
    margin-block-start 4px
    margin-block-end 2px
    .footer-inner
      margin-block-start 2px
  .tabbar-labels
    .toolbar-inner
      a
        color var(--f7-toolbar-link-color, var(--f7-bars-link-color, var(--f7-theme-color)))
        font-size var(--f7-tabbar-label-font-size)
</style>

<script>
import { nextTick, toRaw } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import debounce from 'debounce'
import RuleStatus from '@/components/rule/rule-status-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import ListFilter from '@/components/util/list-filter.vue'

const ITEM_KINDS = {
  editable: 'Editable',
  readonly: 'Non-editable',
  marketplace: 'Marketplace',
  template: 'Template Based'
}

export default {
  mixins: [RuleStatus],
  props: {
    showScripts: Boolean,
    showScenes: Boolean,
    f7router: Object
  },
  components: {
    ListFilter,
    EmptyStatePlaceholder
  },
  setup () {
    return { f7, theme }
  },
  data () {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      noRuleEngine: false,
      rules: [],
      ruleStatuses: {},
      filters: {
        kinds: {
          label: 'Kind',
          options: { ...ITEM_KINDS }
        },
        tags: {
          label: 'Tag',
          options: {}
        }
      },
      filteredItems: [],
      selectedItems: [],
      searchQuery: null,
      showCheckboxes: false,
      eventSource: null,
      templates: []
    }
  },
  mounted () {
    if (this.showScene || this.showScripts) {
      delete this.filters.kinds.options.marketplace
      delete this.filters.kinds.options.template
    }
  },
  watch: {
    listedUids () {
      this.selectedItems = this.selectedItems.filter((i) => this.listedUids.has(i))
    }
  },
  computed: {
    type () {
      return this.showScripts ? 'Scripts' : (this.showScenes ? 'Scenes' : 'Rules')
    },
    listedItems () {
      if (!this.searchQuery) return this.filteredItems

      return this.filteredItems.filter((rule) => {
        const hayStack = [
          rule.name,
          rule.uid,
          rule.description,
          this.ruleStatusBadgeText(this.ruleStatuses[rule.uid]),
          ...this.displayedTags(rule)
        ].join(' ').toLowerCase()
        return hayStack.includes(this.searchQuery)
      })
    },
    listedUids () {
      return new Set(this.listedItems.map((rule) => rule.uid))
    },
    indexedRules () {
      return this.listedItems.reduce((prev, rule, i, rules) => {
        const initial = rule.name.substring(0, 1).toUpperCase()
        if (!prev[initial]) {
          prev[initial] = []
        }
        prev[initial].push(rule)

        return prev
      }, {})
    },
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    },
    allSelected () {
      return this.selectedItems.length >= this.listedItems.length && this.listedItems.length > 0
    },
    listTitle () {
      let title = this.listedItems.length
      if (this.searchQuery || this.$refs.filters?.filtered) {
        title += ` of ${this.rules.length} ${this.type} found`
      } else {
        title += ' ' + this.type
      }
      if (this.selectedItems.length > 0) {
        title += `, ${this.selectedItems.length} selected`
      }
      return title
    },
    selectedDeletableItems () {
      if (!this.selectedItems.length) return []
      const selectedUids = new Set(this.selectedItems)
      return this.rules.filter((r) => selectedUids.has(r.uid) && r.editable).map((r) => r.uid)
    },
    enablableItems () {
      if (!this.selectedItems.length) return 0
      return this.selectedItems.filter((i) => this.isRuleStatusDisabled(this.ruleStatuses[i])).length
    },
    disablableItems () {
      if (!this.selectedItems.length) return 0
      return this.selectedItems.filter((i) => this.ruleStatuses[i] && !this.isRuleStatusDisabled(this.ruleStatuses[i])).length
    },
    regeneratableItemsCount () {
      return this.regeneratableItems.length
    },
    regeneratableItems () {
      if (!this.selectedItems.length) return []
      return this.selectedItems.filter((i) => {
        const rule = this.rules.find((r) => r.uid === i)
        return rule && rule.templateUID && rule.templateState && rule.templateState !== 'no-template' && rule.templateState !== 'template-missing' && this.templates.some((t) => t.uid === rule.templateUID)
      })
    },
    canEnable () {
      return this.enablableItems > 0
    },
    canDisable () {
      return this.disablableItems > 0
    },
    canRegenerate () {
      return this.regeneratableItemsCount > 0
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore)
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    onPageBeforeOut () {
      this.stopEventSource()
      useLastSearchQueryStore().lastRulesSearchQuery[this.type] = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar)
        useLastSearchQueryStore().lastRulesSearchQuery[this.type] = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.selectedItems = []
      this.showCheckboxes = false
      let filter = ''
      if (this.showScripts) {
        filter = '&tags=Script'
      }
      if (this.showScenes) {
        filter = '&tags=Scene'
      }

      const promises = [this.$oh.api.get('/rest/templates'), this.$oh.api.get('/rest/rules?summary=true' + filter)]
      Promise.allSettled(promises).then((results) => {
        const templateData = results[0]
        const ruleData = results[1]
        if (templateData.status === 'fulfilled') {
          this.templates = templateData.value
        } else {
          console.warn('Failed to retrieve rule templates. Status: "' + templateData.status + '", Reason: "' + templateData.reason + '"')
        }
        if (ruleData.status === 'fulfilled') {
          this.rules = ruleData.value
            .filter((r) => {
              if (!this.showScripts && r.tags?.includes('Script')) return false
              if (!this.showScenes && r.tags?.includes('Scene')) return false
              return true
            })
            .sort((a, b) => a.name.localeCompare(b.name))

          const uniqueTags = new Set()
          this.rules.forEach((rule) => {
            this.ruleStatuses[rule.uid] = rule.status

            rule.tags.forEach((t) => {
              if (t === 'Scene' || t === 'Script') return
              if (t.startsWith('marketplace:')) return
              uniqueTags.add(t)
            })
          })

          const sortedTags = Array.from(uniqueTags).sort((a, b) => a.localeCompare(b))
          this.filters.tags.options = Object.fromEntries(sortedTags.map((tag) => [tag, tag]))
          this.updateFilteredItems()

          this.initSearchbar = true

          this.loading = false
          this.ready = true
          this.noRuleEngine = false

          nextTick(() => {
            if (this.$refs.listIndex) this.$refs.listIndex.$el.f7ListIndex.update()
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
            }
            this.$refs.searchbar?.$el.f7Searchbar.search(
              useLastSearchQueryStore().lastRulesSearchQuery[this.type] || ''
            )
          })

          if (!this.eventSource) this.startEventSource()
        } else {
          console.warn('Failed to retrieve rule templates. Status: "' + ruleData.status + '", Reason: "' + ruleData.reason + '"')
          if (ruleData.reason === 'Not Found') {
            this.noRuleEngine = true
          }
          this.loading = false
          let self = this
          setTimeout(() => {
            self.load()
          }, 2000)
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
          case 'state':
            const uid = topicParts[2]
            const newStatus = JSON.parse(event.payload)
            // skip status updates for RUNNING for performance reasons (can be easily skipped as it was never really shown due to the short execution time of rules)
            if (newStatus.status === 'RUNNING') return

            if (!this.ruleStatuses[uid]) this.ruleStatuses[uid] = {}
            this.ruleStatuses[uid].status = newStatus.status
            this.ruleStatuses[uid].statusDetail = newStatus.statusDetail
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
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.uid, item)
      } else {
        this.f7router.navigate(item.uid)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    templateClick (event, ctrl, rule) {
      if (!rule || !rule.templateUID) return
      if (ctrl || this.showCheckboxes) {
        event.stopPropagation()
        if (!this.showCheckboxes) this.showCheckboxes = true
        const rules = this.rules.filter((r) => r.templateUID === rule.templateUID)
        let unchecked = 0, checked = 0
        rules.forEach((r) => {
          if (this.isChecked(r.uid)) {
            checked++
          } else {
            unchecked++
          }
        })
        const doCheck = checked < unchecked
        rules.forEach((r) => {
          this.setItemChecked(r.uid, doCheck)
        })
        if (ctrl && !this.selectedItems.length) this.showCheckboxes = false
      }
    },
    search: debounce(function (searchbar, query, previousQuery) { // don't use arrow function here, otherwise `this` is not the Vue instance
      this.searchQuery = query.trim().toLowerCase()
    }, 200),
    clearSearch () {
      this.searchQuery = null
    },
    selectDeselectAll () {
      if (this.allSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = Array.from(this.listedUids)
      }
    },
    toggleItemCheck (event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.setItemChecked(item, false)
      } else {
        this.setItemChecked(item, true)
      }
    },
    setItemChecked (item, checked) {
      if (checked) {
        if (!this.isChecked(item)) {
          this.selectedItems.push(item)
        }
      } else {
        if (this.isChecked(item)) {
          this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
        }
      }
    },
    deleteSelected () {
      const vm = this

      f7.dialog.confirm(
        `Delete ${this.selectedDeletableItems.length} rule${this.selectedDeletableItems.length === 1 ? '' : 's'}?`,
        'Delete Rules',
        () => {
          vm.doDeleteSelected()
        }
      )
    },
    doDeleteSelected () {
      let dialog = f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedDeletableItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises).then((data) => {
        f7.toast.create({
          text: (promises.length === 1 ? 'Rule' : 'Rules') + ' deleted',
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
    },
    doDisableEnableSelected (enable) {
      if (!this.selectedItems.length) return
      let dialog = f7.dialog.progress('Please Wait...')

      const items = this.selectedItems.filter((i) => Boolean(this.isRuleStatusDisabled(this.ruleStatuses[i])) === Boolean(enable))
      const promises = items.map((i) => this.$oh.api.postPlain('/rest/rules/' + i + '/enable', enable.toString()))
      Promise.all(promises).then((data) => {
        f7.toast.create({
          text: (promises.length === 1 ? 'Rule ' : 'Rules ') + (enable ? 'enabled' : 'disabled'),
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
        f7.dialog.alert('An error occurred while enabling/disabling: ' + err)
      })
    },
    regenerateSelected () {
      if (!this.selectedItems.length) return
      const rules = this.regeneratableItems.map((i) => this.rules.find((r) => r.uid === i))
      if (rules.length === 0) return
      if (rules.length === 1 && rules[0].editable) {
        this.$oh.api.get('/rest/rules/' + rules[0].uid).then((rule) => {
          this.f7router.navigate({
            url: '/settings/rules/stub'
          }, {
            reloadCurrent: false,
            props: {
              ruleCopy: rule
            }
          })
        }).catch((err) => {
          f7.dialog.alert('An error occurred when retrieving rule "' + rules[0].uid + '": ' + err)
        })
      } else {
        const promises = rules.map((r) => this.$oh.api.postPlain('/rest/rules/' + r.uid + '/regenerate'))
        Promise.all(promises).then(() => {
          f7.toast.create({
            text: (rules.length === 1 ? 'Rule' : 'Rules') + ' regenerated from template',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }).catch((err) => {
          f7.dialog.alert('An error occurred when trying to regenerate rule(s) from template: ' + err)
        })
      }
    },
    displayedTags (rule) {
      return rule.tags.filter((t) => t !== 'Script' && t !== 'Scene')
    },
    updateFilteredItems () {
      const filters = this.$refs.filters
      if (filters === undefined || !filters.filtered) {
        this.filteredItems = this.rules
        return
      }

      const selected = filters.selected
      const ruleKinds = new Set()

      this.filteredItems = this.rules.filter((rule) => {
        const tagsMatch = !selected.tags.size || rule.tags.some((t) => selected.tags.has(t))

        ruleKinds.clear()
        ruleKinds.add(rule.editable ? 'editable' : 'readonly')
        if (rule.tags.some((t) => t.startsWith('marketplace:'))) ruleKinds.add('marketplace')
        if (rule.templateUID) ruleKinds.add('template')
        const kindsMatch = !selected.kinds.size || toRaw(selected.kinds).intersection(ruleKinds).size > 0

        return tagsMatch && kindsMatch
      })

      // update rules list
      this.$refs.listIndex.update()
    },
    templateName (rule) {
      let template = this.templates ? this.templates.find((t) => t.uid === rule.templateUID) : undefined
      return template ? template.label : rule.templateUID
    }
  }
}
</script>
