<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="rules-list">
    <f7-navbar :title="type">
      <f7-nav-left>
        <f7-link icon-f7="chevron_left" href="/settings/">
          Settings
        </f7-link>
      </f7-nav-left>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link icon-md="material:done_all"
                 @click="toggleCheck()"
                 :text="(!theme.md) ? (showCheckboxes ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
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
                :class="{ navbar: theme.md, 'tabbar-labels': f7.width < 480 }"
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

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

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
      <f7-row v-if="f7.width < 1280" class="display-flex justify-content-center">
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
          <template v-if="selectedTags.length > 0">
            -
            <f7-link @click="selectedTags = []" text="Reset filters" />
          </template>
          <template v-if="showCheckboxes && filteredRules.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>

        <f7-list v-if="uniqueTags.length > 0">
          <f7-list-item accordion-item title="Filter by tags">
            <f7-accordion-content>
              <div class="block block-strong-ios block-outline-ios padding-bottom" ref="filterTags">
                <f7-chip v-for="tag in uniqueTags"
                         :key="tag"
                         :text="tag"
                         media-bg-color="blue"
                         :color="isTagSelected(tag) ? 'blue' : ''"
                         style="margin-right: 6px; cursor: pointer;"
                         @click="(e) => toggleSearchTag(e, tag)">
                  <template #media>
                    <f7-icon v-if="isTagSelected(tag)"
                             ios="f7:checkmark_circle_fill"
                             md="material:check_circle"
                             aurora="f7:checkmark_circle_fill" />
                  </template>
                </f7-chip>
              </div>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>
        <f7-list
          v-show="rules.length > 0"
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
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import debounce from 'debounce'
import RuleStatus from '@/components/rule/rule-status-mixin'

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'

export default {
  mixins: [RuleStatus],
  props: {
    showScripts: Boolean,
    showScenes: Boolean,
    f7router: Object
  },
  components: {
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
      uniqueTags: [],
      selectedTags: [],
      selectedItems: [],
      selectedDeletableItems: [],
      searchQuery: null,
      showCheckboxes: false,
      eventSource: null,
      templates: null
    }
  },
  computed: {
    type () {
      return this.showScripts ? 'Scripts' : (this.showScenes ? 'Scenes' : 'Rules')
    },
    filteredByTags () {
      if (this.selectedTags.length === 0) return this.rules

      return this.rules.filter((r) => {
        for (const t of this.selectedTags) {
          if (r.tags.includes(t)) return true
        }
        return false
      })
    },
    filteredRules () {
      if (!this.searchQuery) return this.filteredByTags

      return this.filteredByTags.filter((rule) => {
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
    filteredUids () {
      return new Set(this.filteredRules.map((rule) => rule.uid))
    },
    indexedRules () {
      return this.filteredRules.reduce((prev, rule, i, rules) => {
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
      return this.selectedItems.length === this.filteredRules.length
    },
    listTitle () {
      let title = this.filteredRules.length
      if (this.searchQuery) {
        title += ` of ${this.filteredByTags.length} ${this.type} found`
      } else {
        title += ' ' + this.type
      }
      if (this.selectedItems.length > 0) {
        title += `, ${this.selectedItems.length} selected`
      }
      return title
    },
    enablableItems () {
      if (!this.selectedItems || !this.selectedItems.length) return 0
      return this.selectedItems.filter((i) => this.isRuleStatusDisabled(this.ruleStatuses[i])).length
    },
    disablableItems () {
      if (!this.selectedItems || !this.selectedItems.length) return 0
      return this.selectedItems.filter((i) => this.ruleStatuses[i] && !this.isRuleStatusDisabled(this.ruleStatuses[i])).length
    },
    regeneratableItemsCount () {
      return this.regeneratableItems.length
    },
    regeneratableItems () {
      if (!this.selectedItems || !this.selectedItems.length || !this.rules || !this.templates) return []
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
      this.selectedDeletableItems = []
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
          let rules = ruleData.value.sort((a, b) => {
            return a.name.localeCompare(b.name)
          })

          if (!this.showScripts) {
            rules = rules.filter((r) => !r.tags || r.tags.indexOf('Script') < 0)
          }

          if (!this.showScenes) {
            rules = rules.filter((r) => !r.tags || r.tags.indexOf('Scene') < 0)
          }
          this.rules = rules

          rules.forEach((rule) => {
            this.ruleStatuses[rule.uid] = rule.status

            rule.tags.forEach((t) => {
              if (t === 'Scene' || t === 'Script') return
              if (t.startsWith('marketplace:')) t = 'Marketplace'
              if (!this.uniqueTags.includes(t)) this.uniqueTags.push(t)
            })
          })

          this.uniqueTags.sort()
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
      this.filterSelectedItems()
    }, 200),
    filterSelectedItems () {
      this.selectedItems = this.selectedItems.filter((uid) => this.filteredUids.has(uid))
    },
    clearSearch () {
      this.searchQuery = null
    },
    selectDeselectAll () {
      if (this.allSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = Array.from(this.filteredUids)
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
          const rule = this.rules.find((r) => r.uid === item)
          if (rule?.editable) {
            this.selectedDeletableItems.push(item)
          }
        }
      } else {
        if (this.isChecked(item)) {
          this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
          const idx = this.selectedDeletableItems.indexOf(item)
          if (idx >= 0) {
            this.selectedDeletableItems.splice(idx, 1)
          }
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
        this.selectedDeletableItems = []
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
      if (!this.selectedItems) return
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
      if (!this.selectedItems) return
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
    toggleSearchTag (e, item) {
      const idx = this.selectedTags.indexOf(item)
      if (idx !== -1) {
        this.selectedTags.splice(idx, 1)
      } else {
        this.selectedTags.push(item)
      }
      // update rules list
      this.$refs.listIndex.update()
      this.filterSelectedItems()
    },
    displayedTags (rule) {
      return rule.tags.filter((t) => t !== 'Script' && t !== 'Scene')
    },
    isTagSelected (tag) {
      return this.selectedTags.includes(tag)
    },
    templateName (rule) {
      let template = this.templates ? this.templates.find((t) => t.uid === rule.templateUID) : undefined
      return template ? template.label : rule.templateUID
    }
  }
}
</script>
