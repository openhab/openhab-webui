<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="rules-list">
    <f7-navbar>
      <oh-nav-content :title="showType + 's'" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-rules"
          :persist-search-string-key="`${showType}-search-string`"
          :haystack-fields="haystackFields"
          :filters-definitions="filtersDefinitions"
          @update:tokenized-search="onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar
      v-if="showCheckboxes"
      class="contextual-toolbar"
      :class="{ navbar: theme.md, 'tabbar-labels': $f7dim.width < 480 }"
      bottom-ios
      bottom-aurora>
      <f7-link
        v-if="!theme.md"
        v-show="selectedDeletableItems.length"
        color="red"
        class="delete"
        icon-ios="f7:trash"
        icon-aurora="f7:trash"
        @click="deleteSelected">
        &nbsp;{{ $t('dialogs.delete') }}&nbsp;{{ selectedDeletableItems.length }}
      </f7-link>
      <f7-link
        v-if="!theme.md && showType !== 'Scene'"
        v-show="selected.length && canDisable"
        color="orange"
        class="disable"
        @click="doDisableEnableSelected(false)"
        icon-ios="f7:pause_circle"
        icon-aurora="f7:pause_circle">
        &nbsp;{{ $t('dialogs.disable') }}&nbsp;{{ disablableItems }}
      </f7-link>
      <f7-link
        v-if="!theme.md && showType !== 'Scene'"
        v-show="selected.length && canEnable"
        color="green"
        class="enable"
        @click="doDisableEnableSelected(true)"
        icon-ios="f7:play_circle"
        icon-aurora="f7:play_circle">
        &nbsp;{{ $t('dialogs.enable') }}&nbsp;{{ enablableItems }}
      </f7-link>
      <f7-link
        v-if="!theme.md && showType !== 'Scene'"
        v-show="selected.length"
        color="blue"
        class="copy"
        @click="initRuleDefinitionsPopup()"
        icon-ios="f7:square_on_square"
        icon-aurora="f7:square_on_square">
        &nbsp;{{ $t('dialogs.copy') }}&nbsp;{{ selected.length }}
      </f7-link>
      <f7-link
        v-if="!theme.md && showType !== 'Scene'"
        v-show="selected.length && canRegenerate"
        :color="uiOptionsStore.darkMode === 'dark' ? 'purple' : 'deeppurple'"
        class="enable"
        @click="regenerateSelected()"
        icon-ios="f7:arrow_2_circlepath"
        icon-aurora="f7:arrow_2_circlepath">
        &nbsp;{{ $t('dialogs.regenerate') }}&nbsp;{{ regeneratableItemsCount }}
      </f7-link>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">{{ selected.length }} selected</div>
      <div v-if="theme.md" class="right">
        <f7-link
          v-if="showType !== 'Scene'"
          v-show="selected.length && canRegenerate"
          tooltip="Regenerate selected from template"
          icon-md="material:autorenew"
          icon-color="white"
          @click="regenerateSelected()" />
        <f7-link
          v-if="showType !== 'Scene'"
          v-show="selected.length && canDisable"
          tooltip="Disable selected"
          icon-md="material:pause_circle_outline"
          icon-color="white"
          @click="doDisableEnableSelected(false)" />
        <f7-link
          v-if="showType !== 'Scene'"
          v-show="selected.length && canEnable"
          tooltip="Enable selected"
          icon-md="material:play_circle_outline"
          icon-color="white"
          @click="doDisableEnableSelected(true)" />
        <f7-link
          v-if="showType !== 'Scene'"
          v-show="selected.length"
          tooltip="Copy selected"
          icon-md="material:content_copy"
          icon-color="white"
          @click="initRuleDefinitionsPopup()" />
        <f7-link
          v-show="selectedDeletableItems.length"
          tooltip="Delete selected"
          icon-md="material:delete"
          icon-color="white"
          @click="deleteSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="$refs.rulesList"
      v-show="!$device.desktop"
      ref="listIndex"
      :listEl="$refs.rulesList ? $$($refs.rulesList.$el) : undefined"
      :scroll-list="true"
      :label="true" />

    <!-- no rule engine available -->
    <empty-state-placeholder
      v-if="noRuleEngine"
      icon="exclamationmark_triangle"
      title="rules.missingengine.title"
      text="rules.missingengine.text" />
    <!-- rule engine available but not yet ready -->
    <f7-block v-else-if="!noRuleEngine && !ready" class="block-narrow">
      <f7-col v-show="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col rules-list">
          <f7-list-group>
            <f7-list-item
              v-for="n in 20"
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
      <empty-state-placeholder v-if="showType == 'Script'" icon="doc_plaintext" title="scripts.title" text="scripts.text" />
      <empty-state-placeholder v-else-if="showType == 'Scene'" icon="film" title="scenes.title" text="scenes.text" />
      <empty-state-placeholder v-else icon="wand_stars" title="rules.title" text="rules.text" />
      <f7-row v-if="$f7dim.width < 1280" class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="blue"
          external
          :href="`${runtimeStore.websiteUrl}/link/${showType.toLowerCase()}`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <!-- rule engine available and ready and has rules -->
    <f7-block v-show="!noRuleEngine && ready && rules.length > 0" class="block-narrow">
      <f7-col>
        <f7-block-title class="no-margin-top">
          <span>{{ getListTitle(isFiltered, filteredList.length, rules.length, 'Rule', selected.length) }}</span>
          <template v-if="showCheckboxes && filteredList.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <f7-list v-if="!filteredList.length">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list v-show="filteredList.length > 0" class="searchbar-found col rules-list" ref="rulesList" media-list contacts-list>
          <f7-list-group v-for="(rulesWithInitial, initial) in indexedRules" :key="initial">
            <f7-list-item v-if="rulesWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="rule in rulesWithInitial"
              :key="rule.uid"
              media-item
              class="rulelist-item"
              :checkbox="showCheckboxes ? true : null"
              :checked="isChecked(rule.uid) ? true : null"
              prevent-router
              @click.ctrl="ctrlClick($event, rule)"
              @click.meta="ctrlClick($event, rule)"
              @click.exact="click($event, rule)"
              :link="`${encodeURIComponent(rule.uid)}`"
              :title="rule.name"
              :text="rule.uid"
              :footer="rule.description"
              :badge="showType == 'Scene' ? '' : ruleStatusBadgeText(ruleStatuses[rule.uid])"
              :badge-color="ruleStatusBadgeColor(ruleStatuses[rule.uid])">
              <template #footer>
                <div class="footer-inner">
                  <f7-chip
                    v-if="rule.templateUID"
                    :text="templateName(rule)"
                    @click.ctrl="(e) => templateClick(e, true, rule)"
                    @click.meta="(e) => templateClick(e, true, rule)"
                    @click.exact="(e) => templateClick(e, false, rule)"
                    media-bg-color="orange"
                    style="margin-right: 2px">
                    <template #media>
                      <f7-icon ios="f7:doc_on_doc_fill" md="material:file_copy" aurora="f7:doc_on_doc_fill" />
                    </template>
                  </f7-chip>
                  <f7-chip v-for="tag in displayedTags(rule)" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
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
      <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" color="blue" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      </f7-fab>
    </template>

    <f7-popup v-model:opened="copyPopupOpened" class="copy-definition-popup" backdrop closeOnEscape>
      <div class="popup-content-wrapper page-content">
        <f7-block-title>Copy Rule File Definition</f7-block-title>
        <f7-block>
          <p>Select the format to copy to clipboard</p>
          <div class="button-stack">
            <f7-button
              fill
              large
              :color="canCopyToDSL ? 'teal' : 'red'"
              :tooltip="canCopyToDSL ? 'Copy DSL to clipboard' : showDslErrors ? 'Hide DSL errors' : 'Show DSL errors'"
              @click="exportDslClicked">
              DSL{{ canCopyToDSL ? '' : showDslErrors ? ' ▲' : ' ▼' }}
            </f7-button>
            <f7-block v-if="!canCopyToDSL && showDslErrors" inset class="dsl-errors">
              <f7-block-title small>DSL problems:</f7-block-title>
              <f7-list>
                <f7-list-item v-for="(line, idx) in dslCopyErrors" :key="idx">
                  {{ line }}
                </f7-list-item>
              </f7-list>
              <f7-button
                v-if="dslCopyOk?.length"
                fill
                tooltip="Exclude rules that cannot be expressed using DSL"
                @click="deselectIncompatibleDsl">
                Deselect Incompatible
              </f7-button>
            </f7-block>
            <f7-button
              fill
              large
              :color="canCopyToYAML ? 'blue' : 'red'"
              :tooltip="
                canCopyToYAML
                  ? showYamlExportOptions
                    ? 'Hide YAML options'
                    : 'Show YAML options'
                  : showYamlErrors
                    ? 'Hide YAML errors'
                    : 'Show YAML errors'
              "
              @click="exportYamlClicked">
              YAML{{ (canCopyToYAML && showYamlExportOptions) || (!canCopyToYAML && showYamlErrors) ? ' ▲' : ' ▼' }}
            </f7-button>
            <div v-if="canCopyToYAML && showYamlExportOptions" class="yaml-sub-menu">
              <f7-button
                fill
                color="blue"
                tooltip="Copy YAML, where empty collections and normally irrelevant elements are omitted, to clipboard"
                @click="copyRuleDefinitionsToClipboard('YAML', serializationOptions.NORMAL)">
                Normal
              </f7-button>
              <f7-button
                fill
                color="blue"
                tooltip="Copy YAML, where empty collections and normally irrelevant elements are included, to clipboard"
                @click="copyRuleDefinitionsToClipboard('YAML', serializationOptions.ALL)">
                With All Details
              </f7-button>
              <f7-button
                v-if="yamlCopyCanStub"
                fill
                color="blue"
                tooltip="Copy YAML, where only templates and configured template parameters are included, to clipboard"
                @click="copyRuleDefinitionsToClipboard('YAML', serializationOptions.STUB)">
                Rule Stub Only
              </f7-button>
              <f7-button
                v-if="yamlCopyCanStrip"
                fill
                color="blue"
                tooltip="Copy YAML, where templates and configured parameters are removed, resulting in identical but fully independent rules, to clipboard"
                @click="copyRuleDefinitionsToClipboard('YAML', serializationOptions.STRIPPED)">
                Stripped Of Template
              </f7-button>
            </div>
            <f7-block v-if="!canCopyToYAML && showYamlErrors" inset class="yaml-errors">
              <f7-block-title small>YAML problems:</f7-block-title>
              <f7-list>
                <f7-list-item v-for="(line, idx) in yamlCopyErrors" :key="idx">
                  {{ line }}
                </f7-list-item>
              </f7-list>
              <f7-button
                v-if="yamlCopyOk?.length"
                fill
                tooltip="Exclude rules that cannot be expressed using YAML"
                @click="deselectIncompatibleYaml">
                Deselect Incompatible
              </f7-button>
            </f7-block>
            <f7-button fill large @click="copyPopupOpened = false" color="gray">Cancel</f7-button>
          </div>
        </f7-block>
      </div>
    </f7-popup>
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

.dark
  .popup
    &.copy-definition-popup
      .yaml-sub-menu
        background #fff3

.popup
  &.copy-definition-popup

    @media (min-width: 630px) and (min-height: 630px)
      width 90%
      max-width 450px
      height auto
      max-height 80vh
      top 50%
      left 50%
      overflow-y auto
      margin 0
      transition-property transform, margin-left, top
      .block-title
        font-size calc(var(--f7-block-title-font-size) + 3px)
      &.modal-in
        transform translate3d(-50%, -50%, 0)

    .button-stack
      display flex
      flex-direction column
      gap 10px

    .yaml-sub-menu
      display flex
      flex-direction column
      gap 8px
      padding 10px
      background #0001
      .block-title
        font-size var(--f7-block-title-font-size)

    .yaml-errors, .dsl-errors
      padding-block-start calc(var(--f7-block-padding-vertical) / 2)
      background var(--f7-page-bg-color)
      margin-top 0
      margin-bottom 0

      .block-title
        font-size var(--f7-block-title-font-size)
</style>

<script>
import { nextTick, reactive, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import { ruleStatusBadgeColor, ruleStatusBadgeText, isRuleStatusDisabled, getRuleLanguage, ruleType } from '@/components/rule/rule-helpers'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast } from '@/js/dialog-promises'
import { canSerializeRules, createFileFormatForRules } from '@/api'
import { useSearch } from '@/components/useSearch'
import { getListTitle } from '@/pages/list-helpers'
import copyToClipboard from '@/js/clipboard'

import OhSearchbar from '@/pages/oh-searchbar.vue'

export default {
  props: {
    showType: {
      type: String,
      default: 'Rule'
    },
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    OhSearchbar
  },
  setup(props) {
    const rules = shallowRef([])
    const ruleStatuses = reactive({})
    const haystackFields = ['uid', 'name', 'description', 'tag'] // TODO: ruleStatusBadgeText
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    function displayedTags(rule) {
      return rule.tags.filter((t) => t !== 'Script' && t !== 'Scene')
    }

    const serializationOptions = Object.freeze({
      NORMAL: 'Normal',
      ALL: 'Include all',
      STUB: 'Stub only',
      STRIPPED: 'Strip template'
    })

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        options: ['Editable', 'Readonly', 'Marketplace', 'Template'],
        getFn: (rule) => {
          if (rule.editable === true) return 'editable'
          if (rule.tags?.includes('marketplace')) return 'marketplace'
          if (rule.templateUID) return 'template'
          return 'readonly'
        }
      },
      name: {
        label: 'Name',
        path: 'name'
      },
      uid: {
        label: 'UID',
        path: 'uid'
      },
      description: {
        label: 'Description',
        path: 'description'
      },
      tag: {
        label: 'Tag',
        getFn: (rule) => displayedTags(rule)
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
        getFn: (rule) => [rule.status?.status, rule.status?.statusDetail, ruleStatusBadgeText(ruleStatuses[rule.uid])]
      },
      language: {
        label: 'Language',
        getFn: (rule) => getRuleLanguage(rule)?.shortName
      },
      trigger: {
        label: 'Trigger',
        getFn: (rule) => rule.triggers?.map((t) => t.type).filter(Boolean)
      }
    }

    const { filteredList, isFiltered, onUpdateTokenizedSearch, getFuseValuesForField } = useSearch(rules, {
      filtersDefinitions,
      haystackFields
    })

    filtersDefinitions.tag.options = () => getFuseValuesForField('tag')
    filtersDefinitions.language.options = () => getFuseValuesForField('language')
    filtersDefinitions.trigger.options = () => getFuseValuesForField('trigger')

    return {
      f7,
      theme,
      rules,
      ruleStatuses,
      ruleStatusBadgeText,
      ruleStatusBadgeColor,
      isRuleStatusDisabled,
      displayedTags,
      ohSearchbarRef,
      serializationOptions,
      filtersDefinitions,
      filteredList,
      isFiltered,
      onUpdateTokenizedSearch,
      getListTitle
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      noRuleEngine: false,
      selected: [],
      showCheckboxes: false,
      eventSource: null,
      templates: [],

      copyPopupOpened: false,
      showYamlExportOptions: false,
      yamlCopyCanStub: false,
      yamlCopyCanStrip: false,
      showYamlErrors: false,
      showDslErrors: false,
      yamlCopyOk: [],
      dslCopyOk: [],
      yamlCopyErrors: [],
      dslCopyErrors: []
    }
  },
  watch: {
    listedUids() {
      this.selected = this.selected.filter((i) => this.listedUids.has(i))
    }
  },
  computed: {
    listedUids() {
      return new Set(this.filteredList.map((rule) => rule.uid))
    },
    indexedRules() {
      return this.filteredList.reduce((prev, rule, i, rules) => {
        const initial = rule.name.substring(0, 1).toUpperCase()
        if (!prev[initial]) {
          prev[initial] = []
        }
        prev[initial].push(rule)

        return prev
      }, {})
    },
    allSelected() {
      return this.selected.length >= this.filteredList.length && this.filteredList.length > 0
    },
    selectedDeletableItems() {
      if (!this.selected.length) return []
      const selectedUids = new Set(this.selected)
      return this.rules.filter((r) => selectedUids.has(r.uid) && r.editable).map((r) => r.uid)
    },
    enablableItems() {
      if (!this.selected.length) return 0
      return this.selected.filter((i) => isRuleStatusDisabled(this.ruleStatuses[i])).length
    },
    disablableItems() {
      if (!this.selected.length) return 0
      return this.selected.filter((i) => this.ruleStatuses[i] && !isRuleStatusDisabled(this.ruleStatuses[i])).length
    },
    regeneratableItemsCount() {
      return this.regeneratableItems.length
    },
    regeneratableItems() {
      if (!this.selected.length) return []
      return this.selected.filter((i) => {
        const rule = this.rules.find((r) => r.uid === i)
        return (
          rule &&
          rule.templateUID &&
          rule.templateState &&
          rule.templateState !== 'no-template' &&
          rule.templateState !== 'template-missing' &&
          this.templates.some((t) => t.uid === rule.templateUID)
        )
      })
    },
    canEnable() {
      return this.enablableItems > 0
    },
    canDisable() {
      return this.disablableItems > 0
    },
    canRegenerate() {
      return this.regeneratableItemsCount > 0
    },
    canCopyToYAML() {
      return this.yamlCopyOk?.length && !this.yamlCopyErrors?.length
    },
    canCopyToDSL() {
      return this.dslCopyOk?.length && !this.dslCopyErrors?.length
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore)
  },
  methods: {
    async onPageAfterIn() {
      await this.load()
    },
    onPageBeforeOut() {
      this.stopEventSource()
      this.ohSearchbarRef.value?.persistSearchQuery()
    },
    async load() {
      if (this.loading) return
      this.loading = true

      this.initSearchbar = false

      this.selected = []
      this.showCheckboxes = false
      let filter = this.showType != 'Rule' ? '&tags=' + this.showType : ''

      const promises = [this.$oh.api.get('/rest/templates'), this.$oh.api.get('/rest/rules?summary=false' + filter)]
      await Promise.allSettled(promises).then(([templateData, ruleData]) => {
        if (templateData.status === 'fulfilled') {
          this.templates = templateData.value
        } else {
          console.warn('Failed to retrieve rule templates. Status: "' + templateData.status + '", Reason: "' + templateData.reason + '"')
        }
        if (ruleData.status === 'fulfilled') {
          this.rules = ruleData.value.filter((r) => ruleType(r) === this.showType).sort((a, b) => a.name.localeCompare(b.name))

          this.initSearchbar = true

          this.loading = false
          this.ready = true
          this.noRuleEngine = false

          nextTick(() => {
            if (this.$refs.listIndex) this.$refs.listIndex.$el.f7ListIndex.update()
            const searchbar = this.$refs.searchbar?.$el.f7Searchbar
            if (this.$device.desktop && searchbar) {
              searchbar.$inputEl[0].focus()
            }
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
    startEventSource() {
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

            if (!this.ruleStatuses[uid]) this.ruleStatuses[uid] = {}
            this.ruleStatuses[uid].status = newStatus.status
            this.ruleStatuses[uid].statusDetail = newStatus.statusDetail
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
      return this.selected.indexOf(item) >= 0
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.uid, item)
      } else {
        this.f7router.navigate(item.uid)
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selected.length) this.showCheckboxes = false
    },
    templateClick(event, ctrl, rule) {
      if (!rule || !rule.templateUID) return
      if (ctrl || this.showCheckboxes) {
        event.stopPropagation()
        if (!this.showCheckboxes) this.showCheckboxes = true
        const rules = this.rules.filter((r) => r.templateUID === rule.templateUID)
        let unchecked = 0,
          checked = 0
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
        if (ctrl && !this.selected.length) this.showCheckboxes = false
      }
    },
    selectDeselectAll() {
      if (this.allSelected) {
        this.selected = []
      } else {
        this.selected = Array.from(this.listedUids)
      }
    },
    toggleItemCheck(event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.setItemChecked(item, false)
      } else {
        this.setItemChecked(item, true)
      }
    },
    setItemChecked(item, checked) {
      if (checked) {
        if (!this.isChecked(item)) {
          this.selected.push(item)
        }
      } else {
        if (this.isChecked(item)) {
          this.selected.splice(this.selected.indexOf(item), 1)
        }
      }
    },
    deleteSelected() {
      const vm = this

      f7.dialog.confirm(
        `Delete ${this.selectedDeletableItems.length} rule${this.selectedDeletableItems.length === 1 ? '' : 's'}?`,
        'Delete Rules',
        () => {
          vm.doDeleteSelected()
        }
      )
    },
    doDeleteSelected() {
      let dialog = f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedDeletableItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises)
        .then((data) => {
          showToast((promises.length === 1 ? 'Rule' : 'Rules') + ' deleted')
          this.selected = []
          dialog.close()
          this.load()
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          f7.dialog.alert('An error occurred while deleting: ' + err)
        })
    },
    doDisableEnableSelected(enable) {
      if (!this.selected.length) return
      let dialog = f7.dialog.progress('Please Wait...')

      const items = this.selected.filter((i) => Boolean(isRuleStatusDisabled(this.ruleStatuses[i])) === Boolean(enable))
      const promises = items.map((i) => this.$oh.api.postPlain('/rest/rules/' + i + '/enable', enable.toString()))
      Promise.all(promises)
        .then((data) => {
          showToast((promises.length === 1 ? 'Rule ' : 'Rules ') + (enable ? 'enabled' : 'disabled'))
          this.selected = []
          dialog.close()
          this.load()
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          f7.dialog.alert('An error occurred while enabling/disabling: ' + err)
        })
    },
    regenerateSelected() {
      if (!this.selected.length) return
      const rules = this.regeneratableItems.map((i) => this.rules.find((r) => r.uid === i))
      if (rules.length === 0) return
      if (rules.length === 1 && rules[0].editable) {
        this.$oh.api
          .get('/rest/rules/' + rules[0].uid)
          .then((rule) => {
            this.f7router.navigate(
              {
                url: '/settings/rules/stub'
              },
              {
                reloadCurrent: false,
                props: {
                  ruleCopy: rule
                }
              }
            )
          })
          .catch((err) => {
            f7.dialog.alert('An error occurred when retrieving rule "' + rules[0].uid + '": ' + err)
          })
      } else {
        const promises = rules.map((r) => this.$oh.api.postPlain('/rest/rules/' + r.uid + '/regenerate'))
        Promise.all(promises)
          .then(() => {
            showToast((rules.length === 1 ? 'Rule' : 'Rules') + ' regenerated from template')
          })
          .catch((err) => {
            f7.dialog.alert('An error occurred when trying to regenerate rule(s) from template: ' + err)
          })
      }
    },
    templateName(rule) {
      let template = this.templates ? this.templates.find((t) => t.uid === rule.templateUID) : undefined
      return template ? template.label : rule.templateUID
    },
    async initRuleDefinitionsPopup() {
      const ruleUids = this.selected
      if (!ruleUids || !ruleUids.length) {
        return
      }
      const [yamlResult, dslResult] = await Promise.allSettled([
        canSerializeRules({
          targetFormat: 'application/yaml',
          body: ruleUids
        }),
        canSerializeRules({
          targetFormat: 'application/vnd.openhab.dsl.rule',
          body: ruleUids
        })
      ])
      if (yamlResult.status === 'fulfilled') {
        const results = yamlResult.value.results
        if (results.length > 0) {
          let can = []
          let reasons = []
          for (let i = 0; i < results.length; i++) {
            if (results[i].ok) {
              can.push(results[i].uid)
            } else {
              reasons.push(results[i].failureReason)
            }
          }

          if (reasons.length) {
            this.yamlCopyCanStub = false
            this.yamlCopyCanStrip = false
          }
          if (!reasons.length) {
            let stub = true
            let strip = true
            let rule
            for (let i = 0; (stub || strip) && i < ruleUids.length; i++) {
              rule = this.rules.find((r) => r.uid === ruleUids[i])
              if (rule) {
                if (stub && (!rule.templateUID || !rule.configuration || Object.keys(rule.configuration).length < 1)) {
                  stub = false
                }
                if (strip && (!rule.templateUID || rule.templateState !== 'instantiated')) {
                  strip = false
                }
              } else {
                stub = false
                strip = false
              }
            }
            this.yamlCopyCanStub = stub
            this.yamlCopyCanStrip = strip
          }

          this.yamlCopyOk = can
          this.yamlCopyErrors = reasons
        } else {
          this.yamlCopyOk = []
          this.yamlCopyErrors = []
          console.warn('Failed to check YAML serialization support, received an empty result')
        }
      } else {
        this.yamlCopyOk = []
        this.yamlCopyErrors = []
        console.warn('Failed to check YAML serialization support:', yamlResult.reason)
      }
      if (dslResult.status === 'fulfilled') {
        const results = dslResult.value.results
        if (results.length > 0) {
          let can = []
          let reasons = []
          for (let i = 0; i < results.length; i++) {
            if (results[i].ok) {
              can.push(results[i].uid)
            } else {
              reasons.push(results[i].failureReason)
            }
          }
          this.dslCopyOk = can
          this.dslCopyErrors = reasons
        } else {
          this.dslCopyOk = []
          this.dslCopyErrors = []
          console.warn('Failed to check DSL serialization support, received an empty result')
        }
      } else {
        this.dslCopyOk = []
        this.dslCopyErrors = []
        console.warn('Failed to check DSL serialization support:', dslResult.reason)
      }

      this.copyPopupOpened = true
      console.debug("Can't serialize to YAML:", this.yamlCopyErrors)
      console.debug("Can't serialize to DSL:", this.dslCopyErrors)
    },
    deselectIncompatibleDsl() {
      if (!this.selected || !this.selected.length) {
        return
      }
      this.selected = this.dslCopyOk
      this.initRuleDefinitionsPopup()
    },
    deselectIncompatibleYaml() {
      if (!this.selected || !this.selected.length) {
        return
      }
      this.selected = this.yamlCopyOk
      this.initRuleDefinitionsPopup()
    },
    exportDslClicked() {
      if (this.canCopyToDSL) {
        this.copyRuleDefinitionsToClipboard('DSL')
      } else {
        this.showDslErrors = !this.showDslErrors
      }
    },
    exportYamlClicked() {
      if (this.canCopyToYAML) {
        this.showYamlExportOptions = !this.showYamlExportOptions
      } else {
        this.showYamlErrors = !this.showYamlErrors
      }
    },
    copyRuleDefinitionsToClipboard(type, serializationOption) {
      if (!this.selected || !this.selected.length) {
        return
      }
      const mediaType = type === 'DSL' ? 'application/vnd.openhab.dsl.rule' : 'application/yaml'
      const progressDialog = f7.dialog.progress(`Loading ${type || 'YAML'} definition${this.selected.length === 1 ? '' : 's'}...`)
      createFileFormatForRules(
        {
          serializationOption: serializationOption || undefined,
          body: this.selected
        },
        {
          parseAs: 'text',
          headers: {
            Accept: mediaType
          }
        }
      )
        .then((ruleDefinition) => {
          progressDialog.close()
          copyToClipboard(ruleDefinition, {
            dialogTitle: `Copy ${this.selected.length} Rule File Definition${this.selected.length === 1 ? '' : 's'}`,
            dialogText: `Rule definition${this.selected.length === 1 ? '' : 's'} retrieved successfully. Click OK to copy ${this.selected.length === 1 ? 'it' : 'them'} to the clipboard.`,
            onSuccess: () => {
              showToast(
                `${this.selected.length} ${type || 'YAML'} rule definition${this.selected.length === 1 ? '' : 's'} copied to clipboard`
              )
            },
            onError: () => {
              f7.dialog.alert(
                `Error copying rule ${type || 'YAML'} definition${this.selected.length === 1 ? '' : 's'} to the clipboard`,
                'Error'
              )
            }
          })
          this.copyPopupOpened = false
        })
        .catch((error) => {
          progressDialog.close()
          console.error(`Failed to generate rule definition${this.selected.length === 1 ? '' : 's'}`, error)
          f7.dialog.alert(`Error loading rule ${type || 'YAML'} definition${this.selected.length === 1 ? '' : 's'}: ${error}`, 'Error')
          this.copyPopupOpened = false
        })
    }
  }
}
</script>
