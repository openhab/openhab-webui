<template>
  <f7-page ref="rule-edit-page" @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar no-hairline>
      <oh-nav-content
        :title="pageTitle + dirtyIndicator"
        :subtitle="hasOpaqueModule ? opaqueModulesTypeText : undefined"
        :editable="isEditable"
        :disable-save-link="!(uidValid && labelValid)"
        :save-link="
          (stubMode ? $t('dialogs.regenerate') : $t(createMode ? 'dialogs.create' : 'dialogs.save')) +
          `${$device.desktop ? ' (Ctrl-S)' : ''}`
        "
        @save="save()"
        :f7router />
    </f7-navbar>
    <f7-toolbar v-if="ready" tabbar position="top">
      <f7-link @click="switchTab('design')" :tab-link-active="currentTab === 'design' ? true : null" tab-link="#design"> Design </f7-link>
      <f7-link v-if="hasCode" @click="switchTab('code')" :tab-link-active="currentTab === 'code' ? true : null" tab-link="#code">
        Code
      </f7-link>
      <f7-link v-if="hasSource" @click="switchTab('source')" :tab-link-active="currentTab === 'source' ? true : null" tab-link="#source">
        {{ sourceTypeText }} Source
      </f7-link>
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab id="design" :tab-active="currentTab === 'design'">
        <f7-block v-if="ready && rule.status && !createMode && !stubMode" class="block-narrow padding-left padding-right" strong>
          <f7-col v-if="!createMode && !stubMode">
            <div class="float-right align-items-flex-start align-items-center">
              <!-- <f7-toggle class="enable-toggle"></f7-toggle> -->
              <f7-link
                v-if="canRegenerate"
                :color="uiOptionsStore.darkMode === 'dark' ? 'purple' : 'deeppurple'"
                :tooltip="'Regenerate from template'"
                icon-md="f7:arrow_2_circlepath"
                icon-ios="f7:arrow_2_circlepath"
                icon-aurora="f7:arrow_2_circlepath"
                icon-size="32"
                @click="regenerateFromTemplate" />
              <f7-link
                :color="rule.status.statusDetail === 'DISABLED' ? 'orange' : 'gray'"
                :tooltip="(rule.status.statusDetail === 'DISABLED' ? 'Enable' : 'Disable') + ($device.desktop ? ' (Ctrl-D)' : '')"
                icon-ios="f7:pause_circle"
                icon-md="f7:pause_circle"
                icon-aurora="f7:pause_circle"
                icon-size="32"
                @click="toggleDisabled" />
              <f7-link
                :tooltip="'Run Now' + ($device.desktop ? ' (Ctrl-R)' : '')"
                icon-ios="f7:play_round"
                icon-md="f7:play_round"
                icon-aurora="f7:play_round"
                icon-size="32"
                :color="rule.status.status === 'IDLE' ? 'blue' : 'gray'"
                @click="runNow" />
            </div>
            Status:
            <f7-chip class="margin-left" :text="rule.status.status" :color="ruleStatusBadgeColor(rule.status)" />
            <div>
              <strong>{{ rule.status.statusDetail !== 'NONE' ? rule.status.statusDetail : '&nbsp;' }}</strong>
              <br />
              <div v-if="rule.status.description">
                {{ rule.status.description }}
              </div>
            </div>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block
          v-else-if="!createMode && !stubMode"
          class="block-narrow padding-left padding-right skeleton-text skeleton-effect-blink"
          strong>
          <f7-col>
            ______:
            <f7-chip class="margin-left" text="________" />
            <div>
              <strong>____ _______</strong>
              <br />
            </div>
          </f7-col>
        </f7-block>

        <rule-general-settings :rule="rule" :ready="ready" :createMode="createMode" :stubMode="stubMode" :templateName="templateName" />

        <f7-block v-if="ready" class="block-narrow">
          <f7-block-footer v-if="!isEditable" class="no-margin padding-left">
            <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: this rule is not editable.
          </f7-block-footer>
          <f7-col v-if="createMode && templates.length > 0 && !ruleCopy" class="new-rule-from-template">
            <f7-list>
              <f7-list-item ref="templateAccordion" accordion-item>
                <template #title>
                  <template v-if="currentTemplate"> Create from Template: {{ currentTemplate.label }} </template>
                  <template v-else> Create a new rule from scratch (or expand to select a template) </template>
                </template>
                <f7-accordion-content>
                  <f7-list media-list>
                    <f7-list-item
                      title="No template"
                      footer="Create a new rule from scratch"
                      radio
                      :checked="!hasTemplate"
                      radio-icon="start"
                      :value="''"
                      @change="selectTemplate(null)" />
                  </f7-list>
                  <f7-block-header class="margin-left margin-top"> or choose a rule template: </f7-block-header>
                  <f7-list media-list>
                    <f7-list-item
                      v-for="template in templates"
                      :key="template.uid"
                      :footer="template.description"
                      :value="template.uid"
                      radio
                      :checked="currentTemplate && currentTemplate.uid === template.uid ? true : null"
                      radio-icon="start"
                      @change="selectTemplate(template.uid)">
                      <template #title>
                        {{ template.label }}
                        <template v-if="getTopicLink(template)">
                          &nbsp;
                          <f7-link
                            :href="getTopicLink(template)"
                            tooltip="View openHAB Community Marketplace topic for this template"
                            target="_blank"
                            class="external"
                            color="gray"
                            :icon-size="18"
                            icon="info_circle"
                            icon-ios="f7:info_circle"
                            icon-md="f7:info_circle"
                            icon-aurora="f7:info_circle" />
                        </template>
                      </template>
                    </f7-list-item>
                  </f7-list>
                </f7-accordion-content>
              </f7-list-item>
            </f7-list>
          </f7-col>
          <f7-col v-if="currentTemplate && (createMode || stubMode)">
            <f7-block-title medium> Template </f7-block-title>
            <f7-list media-list>
              <f7-list-item :footer="currentTemplate.description">
                <template #title>
                  {{ currentTemplate.label }}
                  <template v-if="currentTemplateTopicLink">
                    &nbsp;
                    <f7-link
                      :href="currentTemplateTopicLink"
                      tooltip="View openHAB Community Marketplace topic for this template"
                      target="_blank"
                      class="external"
                      color="gray"
                      :icon-size="18"
                      icon="info_circle"
                      icon-ios="f7:info_circle"
                      icon-md="f7:info_circle"
                      icon-aurora="f7:info_circle" />
                  </template>
                </template>
              </f7-list-item>
            </f7-list>
            <!-- Show radio options only if integrating template (createMode && ruleCopy?.templateUID) -->
            <f7-list v-if="createMode && ruleCopy?.templateUID" media-list>
              <f7-list-item
                title="Keep template"
                footer="The rule will still be linked to the template and can be regenerated if the template changes."
                :value="currentTemplate.uid"
                radio
                :checked="Boolean(rule.templateUID) ? true : null"
                radio-icon="start"
                @change="keepTemplate(true)" />
              <f7-list-item
                title="Integrate template"
                footer="Integrates the template in the rule so that the rule is no longer linked to the template."
                value="integrate"
                radio
                :checked="!rule.templateUID ? true : null"
                radio-icon="start"
                @change="keepTemplate(false)" />
            </f7-list>
            <!-- Show Template Configuration only if template is kept or not integrating -->
            <template v-if="rule.templateUID || !createMode || !ruleCopy?.templateUID">
              <f7-block-title medium class="margin-vertical padding-top"> Template Configuration </f7-block-title>
              <config-sheet :parameter-groups="[]" :parameters="currentTemplate.configDescriptions" :configuration="rule.configuration" />
            </template>
          </f7-col>
          <f7-col v-if="!hasTemplate || (createMode && ruleCopy?.templateUID && !rule.templateUID)" class="rule-modules">
            <div v-if="isEditable" class="no-padding float-right">
              <f7-button
                @click="toggleModuleControls"
                small
                outline
                :fill="showModuleControls"
                sortable-toggle=".sortable"
                style="margin-top: -3px; margin-right: 5px"
                color="gray"
                icon-size="12"
                icon-ios="material:wrap_text"
                icon-md="material:wrap_text"
                icon-aurora="material:wrap_text">
                &nbsp;Reorder
              </f7-button>
            </div>
            <div v-for="section in ['triggers', 'actions', 'conditions']" :key="section">
              <template v-if="isEditable || rule[section].length > 0">
                <f7-block-title medium class="no-margin-bottom">
                  {{ SECTION_LABELS[section][0] }}
                </f7-block-title>
                <f7-block-footer class="no-margin-top margin-horizontal" style="margin-bottom: var(--f7-list-margin-vertical)">
                  {{ SECTION_LABELS[section][1] }}
                </f7-block-footer>
              </template>
              <f7-list sortable swipeout media-list @sortable:sort="(ev) => reorderModule(ev, section)">
                <f7-list-item
                  v-for="mod in rule[section]"
                  media
                  :title="mod.label || suggestedModuleTitle(mod, null, section)"
                  :footer="mod.description || suggestedModuleDescription(mod, null, section)"
                  :key="mod.id"
                  :link="!showModuleControls && !isOpaqueModule(mod)"
                  @click="(ev) => editModule(ev, section, mod)"
                  swipeout>
                  <template #media>
                    <f7-link
                      v-if="isEditable"
                      icon-color="red"
                      icon-aurora="f7:minus_circle_filled"
                      icon-ios="f7:minus_circle_filled"
                      icon-md="material:remove_circle_outline"
                      @click="showSwipeout" />
                  </template>
                  <f7-swipeout-actions v-if="isEditable" right>
                    <f7-swipeout-button
                      @click="(ev) => deleteModule(ev, section, mod)"
                      style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <f7-list-item
                  link
                  no-chevron
                  media-item
                  :color="uiOptionsStore.darkMode === 'dark' ? 'black' : 'white'"
                  :subtitle="SECTION_LABELS[section][2]"
                  @click="addModule(section)">
                  <template #media>
                    <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
                  </template>
                </f7-list-item>
                <!-- <f7-list-button :color="(showModuleControls) ? 'gray' : 'blue'" :title="sectionLabels[section][1]"></f7-list-button> -->
              </f7-list>
            </div>
          </f7-col>
          <f7-col v-if="!createMode && !stubMode">
            <f7-list>
              <f7-list-button v-if="isEditable || (!hasOpaqueModule && !hasSharedContextModule)" color="blue" @click="duplicateRule">
                Duplicate Rule
              </f7-list-button>
              <f7-list-button
                v-if="!hasOpaqueModule"
                color="blue"
                title="Copy File Definition"
                @click="copyPopupOpened = !copyPopupOpened" />
              <f7-list-button v-if="isEditable" color="red" @click="deleteRule"> Delete Rule </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>
      <f7-tab v-if="ready && hasCode && rule" id="code" :tab-active="currentTab === 'code' ? true : null">
        <code-editor
          v-if="ready"
          ref="codeEditor"
          object-type="rules"
          :object="rule"
          :object-id="rule.uid"
          :read-only="!isEditable"
          :read-only-msg="notEditableMsg"
          :valid-media-types="validMediaTypes"
          :opt-show-all-media-types="stubMode ? [] : ['application/yaml+rule']"
          :is-object-empty="isEmpty"
          :empty-media-type-templates="emptyMediaTypeTemplates"
          :post-parse-callback="
            () => {
              return this.resolveEditorTypes()
            }
          "
          :hint-context="{ rule: rule }"
          @save="save()"
          @parsed="updateRule"
          @changed="onCodeChanged">
          <template v-if="!createMode && !stubMode" #additional-panel-controls>
            <f7-button
              :color="rule.status.statusDetail === 'DISABLED' ? 'orange' : 'gray'"
              :tooltip="(rule.status.statusDetail === 'DISABLED' ? 'Enable rule' : 'Disable rule') + ($device.desktop ? ' (Ctrl-D)' : '')"
              icon-ios="f7:pause_circle"
              icon-md="f7:pause_circle"
              icon-aurora="f7:pause_circle"
              class="toggle-enabled display-flex flex-direction-row"
              @click="toggleDisabled">
              &nbsp;{{ $f7dim.width < 550 ? '' : rule.status.statusDetail === 'DISABLED' ? 'Enable' : 'Disable' }}
            </f7-button>
            <f7-button
              :color="rule.status.status === 'IDLE' ? 'blue' : 'gray'"
              :tooltip="`Run '${rule.name}' now${$device.desktop ? ' (Ctrl-R)' : ''}`"
              icon-ios="f7:play_round"
              icon-md="f7:play_round"
              icon-aurora="f7:play_round"
              class="run-now display-flex flex-direction-row"
              @click="runNow">
              &nbsp;{{ $f7dim.width < 550 ? '' : 'Run' }}
            </f7-button>
            <f7-chip
              v-if="$f7dim.width > 600"
              class="display-flex flex-direction-row"
              :text="rule.status.status"
              :color="ruleStatusBadgeColor(rule.status)"
              :tooltip="`Rule '${rule.name}' is ${rule.status.status ? rule.status.status.toLocaleLowerCase() : 'unknown'}`" />
          </template>
        </code-editor>
      </f7-tab>
      <f7-tab v-if="ready && hasSource" id="source" :tab-active="currentTab === 'source'">
        <editor
          v-if="currentTab === 'source'"
          class="rule-source-viewer"
          :mode="sourceType"
          :value="source"
          :readOnly="true"
          readOnlyMsg="Source code is not editable" />
      </f7-tab>
    </f7-tabs>

    <f7-popup v-model:opened="copyPopupOpened" class="copy-definition-popup" backdrop closeOnEscape>
      <div class="popup-content-wrapper">
        <f7-block-title>Copy Rule File Definition</f7-block-title>
        <f7-block>
          <p>Select the format to copy to clipboard</p>
          <div class="button-stack">
            <f7-button
              fill
              large
              :color="canDSL ? 'teal' : 'red'"
              :tooltip="canDSL ? 'Copy DSL to clipboard' : showDslErrors ? 'Hide DSL errors' : 'Show DSL errors'"
              @click="exportDslClicked">
              DSL{{ canDSL ? '' : showDslErrors ? ' ▲' : ' ▼' }}
            </f7-button>
            <f7-block v-if="!canDSL && showDslErrors" inset class="dsl-errors">
              <f7-block-title small>DSL problems:</f7-block-title>
              {{ dslErrors }}
            </f7-block>
            <f7-button
              fill
              large
              :color="canYAML ? 'blue' : 'red'"
              :tooltip="
                canYAML
                  ? showYamlExportOptions
                    ? 'Hide YAML options'
                    : 'Show YAML options'
                  : showYamlErrors
                    ? 'Hide YAML errors'
                    : 'Show YAML errors'
              "
              @click="exportYamlClicked">
              YAML{{ (canYAML && showYamlExportOptions) || (!canYAML && showYamlErrors) ? ' ▲' : ' ▼' }}
            </f7-button>
            <div v-if="canYAML && showYamlExportOptions" class="yaml-sub-menu">
              <f7-button
                fill
                color="blue"
                tooltip="Copy YAML, where empty collections and normally irrelevant elements are omitted, to clipboard"
                @click="copyRuleDefinitionToClipboard('YAML', serializationOptions.NORMAL)">
                Normal
              </f7-button>
              <f7-button
                fill
                color="blue"
                tooltip="Copy YAML, where empty collections and normally irrelevant elements are included, to clipboard"
                @click="copyRuleDefinitionToClipboard('YAML', serializationOptions.ALL)">
                With All Details
              </f7-button>
              <f7-button
                v-if="rule.templateUID && Object.keys(rule.configuration).length > 0"
                fill
                color="blue"
                tooltip="Copy YAML, where only the template and the configured template parameters are included, to clipboard"
                @click="copyRuleDefinitionToClipboard('YAML', serializationOptions.STUB)">
                Rule Stub Only
              </f7-button>
              <f7-button
                v-if="rule.templateUID && rule.templateState === 'instantiated'"
                fill
                color="blue"
                tooltip="Copy YAML, where the template and the configured parameters are removed, resulting in an indentical but fully independent rule, to clipboard"
                @click="copyRuleDefinitionToClipboard('YAML', serializationOptions.STRIPPED)">
                Stripped Of Template
              </f7-button>
            </div>
            <f7-block v-if="!canYAML && showYamlErrors" inset class="yaml-errors">
              <f7-block-title small>YAML problems:</f7-block-title>
              {{ yamlErrors }}
            </f7-block>
            <f7-button fill large @click="copyPopupOpened = false" color="gray">Cancel</f7-button>
          </div>
        </f7-block>
      </div>
    </f7-popup>
  </f7-page>
</template>

<style lang="stylus">
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
      padding-block-end var(--f7-block-padding-vertical)
      background var(--f7-page-bg-color)
      margin-top 0
      margin-bottom 0

      .block-title
        font-size var(--f7-block-title-font-size)

.enable-toggle
  vertical-align inherit
.moduleconfig-popup
  .page-content
    overflow-x hidden !important
  .config-sheet, .parameter-group
    margin-top 0 !important
.rule-modules
  .swipeout-opened
    .sortable-handler
      display none
  .item-media .icon
    color var(--f7-theme-color)
  .media-list
    margin-bottom 0
  .list
    margin-top 0
.rule-code-editor
.rule-source-viewer
  position absolute
  height calc(100% - var(--f7-navbar-height) - var(--f7-toolbar-height))
  width 100%
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import RuleModulePopup from './rule-module-popup.vue'

import RuleMixin from './rule-edit-mixin'
import ModuleDescriptionSuggestions from './module-description-suggestions'
import RuleStatus from '@/components/rule/rule-status-mixin'
import { RULE_UID_PATTERN } from '@/js/openhab/uid.ts'

import ConfigSheet from '@/components/config/config-sheet.vue'
import RuleGeneralSettings from '@/components/rule/rule-general-settings.vue'
import AUTOMATION_LANGUAGES from '@/assets/automation-languages'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { showToast } from '@/js/dialog-promises'
import { useDirty } from '@/pages/useDirty'
import { canSerializeRules, create } from '@/api'
import copyToClipboard from '@/js/clipboard'

const UID_REGEX = new RegExp('^' + RULE_UID_PATTERN + '$')

export default {
  mixins: [RuleMixin, ModuleDescriptionSuggestions, RuleStatus, FileDefinition],
  components: {
    RuleGeneralSettings,
    ConfigSheet,
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')),
    CodeEditor: defineAsyncComponent(() => import(/* webpackChunkName: "code-editor" */ '@/components/config/controls/code-editor.vue'))
  },
  props: {
    ruleId: String,
    createMode: Boolean,
    ruleCopy: Object,
    stubMode: Boolean,
    schedule: Object,
    f7router: Object,
    f7route: Object
  },
  setup() {
    const { dirty, dirtyIndicator } = useDirty('rule-edit-page')
    const serializationOptions = Object.freeze({
      NORMAL: 'Normal',
      ALL: 'Include all',
      STUB: 'Stub only',
      STRIPPED: 'Strip template'
    })
    return { theme, dirty, dirtyIndicator, serializationOptions }
  },
  data() {
    return {
      SECTION_LABELS: {
        triggers: ['When', 'Events that cause this rule to run', 'Add Trigger'],
        actions: ['Then', 'Actions to take when this rule runs', 'Add Action'],
        conditions: ['But only if', 'Conditions that must be matched for the actions of this rule to run', 'Add Condition']
      },

      ready: false,
      loading: false,

      rule: {},
      savedRule: {},
      moduleTypes: {
        actions: [],
        conditions: [],
        triggers: []
      },
      currentSection: 'actions',
      currentModuleType: null,
      currentModule: null,
      currentModuleConfig: {},

      currentTab: 'design',
      codeEditorOpened: false,
      cronPopupOpened: false,
      scriptCode: '',
      cronExpression: null,
      templates: null,
      currentTemplate: null,
      ruleDirty: false,
      codeDirty: false,
      notEditableMsg: 'This rule is read-only.',
      uidPattern: RULE_UID_PATTERN,

      canYAML: false,
      yamlErrors: undefined,
      canDSL: false,
      dslErrors: undefined,

      copyPopupOpened: false,
      showYamlExportOptions: false,
      showYamlErrors: false,
      showDslErrors: false,

      emptyMediaTypeTemplates: {
        'application/vnd.openhab.dsl.rule': () => {
          return `rule "${this.rule.name || 'New Rule'}" uid="${this.rule.uid || f7.utils.id()}"\nwhen\n\nthen\n\nend\n`
        }
      }
    }
  },
  watch: {
    rule: {
      handler: function () {
        if (!this.loading) {
          // ignore changes during loading
          // create rule object clone in order to be able to delete status part
          // which can change from eventsource but doesn't mean a rule modification
          let ruleClone = cloneDeep(this.rule)
          delete ruleClone.status
          delete this.savedRule.status

          this.ruleDirty = !fastDeepEqual(ruleClone, this.savedRule)
        }
      },
      deep: true
    },
    savedRule: function () {
      let ruleClone = cloneDeep(this.rule)
      delete ruleClone.status
      delete this.savedRule.status

      this.ruleDirty = !fastDeepEqual(ruleClone, this.savedRule)
    },
    ruleDirty: function () {
      this.dirty = this.ruleDirty || this.codeDirty
    },
    codeDirty: function () {
      this.dirty = this.ruleDirty || this.codeDirty
    }
  },
  methods: {
    load() {
      if (this.loading) return
      this.loading = true

      const loadingFinished = () => {
        nextTick(() => {
          this.savedRule = cloneDeep(this.rule)
          this.ready = true
          this.loading = false
          if (!this.createMode && !this.stubMode && this.hasOpaqueModule && this.hasSource) {
            this.switchTab('source')
          }
        })
      }

      this.$oh.api.get('/rest/module-types?asMap=true').then((data) => {
        this.moduleTypes = data
        if (this.createMode) {
          let newRule
          if (this.ruleCopy) {
            newRule = cloneDeep(this.ruleCopy)
            newRule.uid = f7.utils.id()
            if (newRule.templateUID) {
              newRule.triggers = []
              newRule.actions = []
              newRule.conditions = []
              if (newRule.templateState === 'instantiated') {
                newRule.templateState = 'pending'
              }
            }
          } else {
            newRule = {
              uid: f7.utils.id(),
              name: '',
              triggers: [],
              actions: [],
              conditions: [],
              tags: this.schedule ? ['Schedule'] : [],
              configuration: {},
              templateUID: null,
              visibility: 'VISIBLE',
              status: {
                status: 'NEW'
              }
            }
          }
          this.rule = newRule
          this.$oh.api.get('/rest/templates').then((templateData) => {
            templateData = templateData.sort((a, b) => a.label.localeCompare(b.label))
            this.templates = templateData
            if (newRule.templateUID) {
              const currentTemplate = templateData.find((t) => t.uid === newRule.templateUID) || {
                uid: newRule.templateUID,
                label: newRule.templateUID
              }
              this.currentTemplate = currentTemplate
            }
            this.resolveEditorTypes().then(() => {
              // no need for an event source, the rule doesn't exist yet
              loadingFinished()
            })
          })
        } else if (this.stubMode) {
          if (!this.ruleCopy || !this.ruleCopy.templateUID) {
            showToast(
              !this.ruleCopy
                ? "Failed to create rule stub because there's no source rule"
                : "Failed to create rule stub because there's no template UID"
            )
            this.f7router.back()
          }
          const ruleStub = this.ruleCopy
          ruleStub.triggers = []
          ruleStub.actions = []
          ruleStub.conditions = []
          ruleStub.templateState = 'pending'
          this.rule = ruleStub
          this.$oh.api.get('/rest/templates').then((templateData) => {
            this.templates = templateData
            let template = this.templates.find((t) => t.uid === ruleStub.templateUID)
            if (!template) {
              showToast(`Template ${ruleStub.templateUID} not found`)
              this.f7router.back()
            }
            this.currentTemplate = template
            this.canYAML = true
            this.yamlErrors = undefined
            this.canDSL = false
            this.dslErrors = undefined

            loadingFinished()
          })
          // no need for an event source, we're going to overwrite the existing rule
        } else {
          this.$oh.api.get('/rest/rules/' + this.ruleId).then((data2) => {
            this.rule = data2
            if (data2.templateUID) {
              this.$oh.api.get('/rest/templates').then((templateData) => {
                this.templates = templateData
                this.resolveEditorTypes().then(() => {
                  if (!this.eventSource) this.startEventSource()
                  loadingFinished()
                })
              })
            } else {
              this.resolveEditorTypes().then(() => {
                if (!this.eventSource) this.startEventSource()
                loadingFinished()
              })
            }
          })
        }
      })
    },
    async resolveEditorTypes() {
      if (this.createMode && this.isEmpty) {
        // Allow code editors for new, empty rules that haven't been edited yet.
        this.canYAML = true
        this.yamlErrors = undefined
        this.canDSL = true
        this.dslErrors = undefined
        return
      }
      const [yamlResult, dslResult] = await Promise.allSettled([
        canSerializeRules({
          targetFormat: 'application/yaml',
          body: {
            rules: [this.rule]
          }
        }),
        canSerializeRules({
          targetFormat: 'application/vnd.openhab.dsl.rule',
          body: {
            rules: [this.rule]
          }
        })
      ])
      if (yamlResult.status === 'fulfilled') {
        const yamlRes = yamlResult.value.results.filter((r) => r.uid === this.rule.uid)
        if (yamlRes.length > 0) {
          if (yamlRes[0].ok) {
            this.canYAML = true
            this.yamlErrors = undefined
          } else {
            this.canYAML = false
            this.yamlErrors = yamlRes[0].failureReason
          }
        } else {
          this.canYAML = false
          this.yamlErrors = undefined
          console.warn('Failed to check YAML serialization support, received an empty result')
        }
      } else {
        this.canYAML = false
        this.yamlErrors = undefined
        console.warn('Failed to check YAML serialization support:', yamlResult.reason)
      }
      if (dslResult.status === 'fulfilled') {
        const dslRes = dslResult.value.results.filter((r_1) => r_1.uid === this.rule.uid)
        if (dslRes.length > 0) {
          if (dslRes[0].ok) {
            this.canDSL = true
            this.dslErrors = undefined
          } else {
            this.canDSL = false
            this.dslErrors = dslRes[0].failureReason
          }
        } else {
          this.canDSL = false
          this.dslErrors = undefined
          console.warn('Failed to check DSL serialization support, received an empty result')
        }
      } else {
        this.canDSL = false
        this.dslErrors = undefined
        console.error('Failed to check DSL serialization support:', dslResult.reason)
      }
      console.debug('Can serialize ' + this.rule.uid + ' to YAML:', this.canYAML)
      console.debug('Can serialize ' + this.rule.uid + ' to DSL:', this.canDSL)
    },
    switchTab(newTab) {
      if (this.currentTab === newTab) return

      // We can't prevent the tab switch here. Instead, we'll switch back if parsing fails
      const previousTab = this.currentTab
      this.currentTab = newTab

      const editor = this.$refs.codeEditor
      if (newTab === 'code') {
        this.resolveEditorTypes().then(() => {
          if (!this.hasCode) {
            showToast('This rule cannot be shown in code form because it contains elements that cannot be serialized to YAML or DSL.')
            this.currentTab = 'design'
            f7.tab.show('#design')
          } else {
            this.$refs.codeEditor.generateCode()
          }
        })
      } else if (previousTab === 'code' && this.codeDirty) {
        editor.parseCode(
          () => {
            this.codeDirty = false
          },
          () => {
            this.currentTab = 'code'
            f7.tab.show('#code')
          },
          { editorType: this.uiOptionsStore.codeEditorType, showAll: editor.isShowAll }
        )
      }
    },
    onCodeChanged(codeDirty) {
      this.codeDirty = codeDirty
    },
    updateRule(updatedRule, params = {}) {
      const yaml = params.editorType === 'YAML'
      const showAll = params.showAll || false
      try {
        if (!this.createMode && this.rule.uid && updatedRule.uid !== this.rule.uid)
          throw new Error('Changing the rule UID is not allowed, it must remain "' + this.rule.uid + '"')
        if (yaml) {
          if (showAll && updatedRule.templateState != this.rule.templateState) {
            console.debug(
              `Ignoring template state change to ${updatedRule.templateState}, template state is controlled by the rule engine.`
            )
          }
          if (updatedRule.templateUID !== this.rule.templateUID) {
            this.rule.templateUID = updatedRule.templateUID
            // if the template is changed, the templateState becomes invalid
            delete this.rule.templateState
          }
        }
        if (updatedRule.name !== this.rule.name) this.rule.name = updatedRule.name
        if (!fastDeepEqual(updatedRule.tags, this.rule.tags)) this.rule.tags = updatedRule.tags
        if (updatedRule.description !== this.rule.description) this.rule.description = updatedRule.description
        if (!this.rule.description) {
          // The UI control returns an empty string for description if it's not set, but the code editor sets it to null if it's not set.
          // In both cases, we want to end up with no description.
          delete this.rule.description
        }
        if (yaml && updatedRule.visibility !== this.rule.visibility && (showAll || updatedRule.visibility !== 'VISIBLE')) {
          this.rule.visibility = updatedRule.visibility
        }

        if (yaml) {
          // "source" and "sourceType" should only exist for read-only rules, so they should never get here. If they do,
          // they will be stripped from the rule unless "showAll" is enabled, which would be confusing to the user,
          // so let's make sure they don't get here by throwing an error if they do.
          const updatedConfigKeys = Object.keys(updatedRule.configuration || {})
          if (updatedConfigKeys.includes('source') || updatedConfigKeys.includes('sourceType')) {
            throw new Error(`Invalid configuration key ${updatedConfigKeys.find((key) => ['source', 'sourceType'].includes(key))} found.`)
          }
          if (!fastDeepEqual(updatedRule.configuration, this.rule.configuration)) this.rule.configuration = updatedRule.configuration
        }

        if (yaml && showAll) {
          // The configuration description is only shown with YAML and showAll enabled, so leave it along unless both conditions are true
          if (!fastDeepEqual(updatedRule.configDescriptions, this.rule.configDescriptions))
            this.rule.configDescriptions = updatedRule.configDescriptions
        }

        if (!fastDeepEqual(updatedRule.conditions, this.rule.conditions)) this.rule.conditions = updatedRule.conditions
        if (!fastDeepEqual(updatedRule.actions, this.rule.actions)) this.rule.actions = updatedRule.actions
        if (!fastDeepEqual(updatedRule.triggers, this.rule.triggers)) this.rule.triggers = updatedRule.triggers

        this.resolveEditorTypes()
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        this.resolveEditorTypes()
        return false
      }
    },
    async save(noToast) {
      if (!this.ready || !this.isEditable) return Promise.reject()
      if (this.currentTab === 'code' && this.codeDirty) {
        const editor = this.$refs.codeEditor
        try {
          await editor.parseCode(undefined, undefined, { editorType: this.uiOptionsStore.codeEditorType, showAll: editor.isShowAll })
        } catch (e) {
          this.currentTab = 'code'
          f7.tab.show('#code')
          throw e
        }
        this.codeDirty = false
      }
      if (!this.rule.uid) {
        f7.dialog.alert('Please provide a unique rule UID.', 'UID required').open()
        return Promise.reject()
      }
      if (!this.uidValid) {
        f7.dialog
          .alert("Please provide a valid rule UID. It can't contain '/', '\\' or have leading or trailing whitespace.", 'Invalid UID')
          .open()
        return Promise.reject()
      }
      if (!this.rule.name) {
        f7.dialog
          .alert('Please provide a rule label. The label is required and will be shown in the UI to identify this rule.', 'Label required')
          .open()
        return Promise.reject()
      }
      const promise = this.createMode
        ? this.$oh.api.postPlain('/rest/rules', JSON.stringify(this.rule), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/rules/' + this.rule.uid, this.rule)
      return promise
        .then((data) => {
          if (this.createMode) {
            if (!noToast) {
              showToast('Rule created')
            }
            this.dirty = this.ruleDirty = this.codeDirty = false
            this.f7router.navigate(
              this.f7route.url
                .replace('/add', '/' + this.rule.uid)
                .replace('/duplicate', '/' + this.rule.uid)
                .replace('/schedule/', '/rules/'),
              { reloadCurrent: true }
            )
            this.load()
          } else if (this.stubMode) {
            if (!noToast) {
              showToast('Rule generated')
            }
            this.dirty = this.ruleDirty = this.codeDirty = false
            this.f7router.navigate(this.f7route.url.replace('/stub', '/' + this.rule.uid).replace('/schedule/', '/rules/'), {
              reloadCurrent: true
            })
            this.load()
          } else {
            if (!noToast) {
              showToast('Rule updated')
            }
            this.savedRule = cloneDeep(this.rule)
          }
          // if (!stay) this.f7router.back()
        })
        .catch((err) => {
          showToast('Error while saving rule: ' + err)
        })
    },
    duplicateRule() {
      let ruleClone = cloneDeep(this.rule)

      // Remove embedded information that only applied to the original
      const config = ruleClone.configuration
      if (config) {
        delete config.source
        delete config.sourceType
      }

      // Remove embedded DSL context information
      if (ruleClone.actions?.length == 1) {
        const action = ruleClone.actions[0]
        if (action.configuration?.script && action.configuration?.type === 'application/vnd.openhab.dsl.rule') {
          action.configuration.script = action.configuration.script.replace(/^\/\/ context:[^\r\n]+$(?:\r\n|\r|\n)/m, '')
          delete action.configuration.sharedContext
        }
      }

      ruleClone.name = (ruleClone.name || '') + ' copy'
      ruleClone.editable = true
      this.f7router.navigate(
        {
          url: '/settings/rules/duplicate'
        },
        {
          props: {
            ruleCopy: ruleClone
          }
        }
      )
    },
    regenerateFromTemplate() {
      if (this.isEditable) {
        this.createStub()
      } else {
        this.$oh.api
          .postPlain('/rest/rules/' + this.rule.uid + '/regenerate')
          .then(() => {
            showToast('Rule regenerated from template')
            this.load()
          })
          .catch((err) => {
            f7.dialog.alert('An error occurred when trying to regenerate rule "' + this.rule.uid + '" from template: ' + err)
          })
      }
    },
    createStub() {
      let ruleClone = cloneDeep(this.rule)
      this.f7router.navigate(
        {
          url: '/settings/rules/stub'
        },
        {
          reloadCurrent: true,
          props: {
            ruleCopy: ruleClone
          }
        }
      )
    },
    runNow() {
      if (this.createMode) return
      if (this.rule.status.status === 'RUNNING' || this.rule.status.status === 'UNINITIALIZED') {
        showToast(
          `Rule cannot be run ${this.rule.status.status === 'RUNNING' ? 'while already running, please wait' : 'if it is uninitialized'}!`
        )
        return
      }
      showToast('Running rule...')

      const savePromise = this.isEditable && this.dirty ? this.save(true) : Promise.resolve()

      savePromise.then(() => {
        this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/runnow', '').catch((err) => {
          showToast('Error while running rule: ' + err)
        })
      })
    },
    deleteRule() {
      f7.dialog.confirm(`Are you sure you want to delete ${this.rule.name}?`, 'Delete Rule', () => {
        this.$oh.api.delete('/rest/rules/' + this.rule.uid).then(() => {
          this.dirty = this.ruleDirty = this.codeDirty = false
          this.f7router.back('/settings/rules/', { force: true })
        })
      })
    },
    selectTemplate(uid) {
      this.rule.configuration = {}
      this.rule.triggers = []
      this.rule.conditions = []
      this.rule.actions = []
      if (uid) {
        this.currentTemplate = this.templates.find((t) => t.uid === uid)
        this.rule.templateUID = uid
        this.rule.templateState = 'pending'
      } else {
        this.currentTemplate = null
      }
      if (this.$refs.templateAccordion) {
        f7.accordion.close(this.$refs.templateAccordion.$el)
      }
    },
    keepTemplate(keep) {
      if (!this.ruleCopy) return
      let newRule = this.rule
      if (keep) {
        newRule.triggers = []
        newRule.actions = []
        newRule.conditions = []
        newRule.configuration = this.ruleCopy.configuration
        newRule.templateUID = this.ruleCopy.templateUID
        newRule.templateState = 'pending'
        if (!newRule.tags?.some((t) => t.indexOf('marketplace:') === 0)) {
          const tag = this.ruleCopy.tags?.find((t) => t.indexOf('marketplace:') === 0)
          if (tag) {
            if (!newRule.tags) {
              newRule.tags = [tag]
            } else {
              newRule.tags.push(tag)
            }
          }
        }
      } else {
        newRule.triggers = this.ruleCopy.triggers
        newRule.actions = this.ruleCopy.actions
        newRule.conditions = this.ruleCopy.conditions
        newRule.configuration = {}
        newRule.templateUID = null
        newRule.templateState = 'no-template'
        if (newRule.tags) {
          newRule.tags = newRule.tags.filter((t) => t.indexOf('marketplace:') !== 0)
        }
      }
      this.rule = newRule
    },
    getTopicLink(template) {
      if (!template) return null
      if (!template.tags) return null
      const marketplaceTag = template.tags.find((t) => t.indexOf('marketplace:') === 0)
      if (marketplaceTag) return 'https://community.openhab.org/t/' + marketplaceTag.replace('marketplace:', '')
      return null
    },
    editModule(ev, section, mod) {
      if (this.showModuleControls || this.isOpaqueModule(mod)) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      if (swipeoutElement && swipeoutElement.classList.contains('swipeout-opened')) return

      if (mod.type && mod.type.indexOf('script') === 0) {
        this.editScriptDirect(ev, mod)
        return
      }

      this.currentSection = section
      this.currentModule = Object.assign({}, mod)
      if (!this.currentModule.label) this.currentModule.label = ''
      if (!this.currentModule.description) this.currentModule.description = ''
      this.currentModuleType = this.moduleTypes[section].find((m) => m.uid === mod.type)

      const popup = {
        component: RuleModulePopup
      }
      this.f7router.navigate(
        {
          url: 'module-config',
          route: {
            path: 'module-config',
            popup
          }
        },
        {
          props: {
            rule: this.rule,
            currentSection: this.currentSection,
            ruleModule: this.currentModule,
            ruleModuleType: this.currentModuleType,
            moduleTypes: this.moduleTypes,
            readOnly: !this.isEditable
          }
        }
      )

      if (this.isEditable) {
        f7.once('ruleModuleConfigUpdate', this.saveModule)
        f7.once('ruleModuleConfigClosed', () => {
          f7.off('rule-module-config', this.saveModule)
          this.moduleConfigClosed()
        })
      }
    },
    deleteModule(ev, section, mod) {
      let swipeoutElement = ev.target
      if (!this.isEditable) return
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      f7.swipeout.delete(swipeoutElement, () => {
        const idx = this.rule[section].findIndex((m) => m.id === mod.id)
        this.rule[section].splice(idx, 1)
      })
    },
    addModule(section) {
      if (this.showModuleControls) return
      if (!this.isEditable) return
      let moduleId = 1
      for (; ['triggers', 'actions', 'conditions'].some((s) => this.rule[s].some((m) => m.id === moduleId.toString())); moduleId++);
      console.debug('new moduleId=' + moduleId)
      const newModule = {
        id: moduleId.toString(),
        configuration: {},
        description: '',
        label: '',
        type: '',
        new: true
      }

      // this.rule[section].push(newModule)
      this.currentSection = section
      this.currentModule = newModule
      this.currentModuleType = null

      const popup = {
        component: RuleModulePopup
      }
      this.f7router.navigate(
        {
          url: 'module-config',
          route: {
            path: 'module-config',
            popup
          }
        },
        {
          props: {
            currentSection: this.currentSection,
            ruleModule: this.currentModule,
            ruleModuleType: this.currentModuleType,
            moduleTypes: this.moduleTypes
          }
        }
      )

      f7.once('ruleModuleConfigUpdate', this.saveModule)
      f7.once('editNewScript', this.saveAndEditNewScript)
      f7.once('ruleModuleConfigClosed', () => {
        f7.off('ruleModuleConfigUpdate', this.saveModule)
        f7.off('editNewScript', this.saveAndEditNewScript)
        this.moduleConfigClosed()
      })
    },
    reorderModule(ev, section) {
      const newSection = [...this.rule[section]]
      newSection.splice(ev.to, 0, newSection.splice(ev.from, 1)[0])
      this.rule[section] = newSection
    },
    saveModule(updatedModule) {
      if (!updatedModule.type) return
      if (!updatedModule.label) delete updatedModule.label
      if (!updatedModule.description) delete updatedModule.description
      if (updatedModule.new) {
        delete updatedModule.new
        this.rule[this.currentSection].push(updatedModule)
      } else {
        const idx = this.rule[this.currentSection].findIndex((m) => m.id === updatedModule.id)
        this.rule[this.currentSection][idx] = updatedModule
      }
    },
    saveAndEditNewScript(updatedModule) {
      this.saveModule(updatedModule)
      this.save().then(() => {
        this.f7router.navigate('/settings/rules/' + this.rule.uid + '/script/' + updatedModule.id, {
          transition: theme.aurora ? 'f7-cover-v' : ''
        })
      })
    },
    moduleConfigClosed() {
      this.currentModule = null
      this.currentModuleType = null
    },
    editScriptDirect(ev, mod) {
      ev.cancelBubble = true
      this.currentModule = mod
      this.currentModuleType = mod.type
      this.scriptCode = mod.configuration.script

      const updatePromise = (this.rule.editable || this.createMode) && this.dirty ? this.save() : Promise.resolve()
      updatePromise.then(() => {
        this.f7router.navigate('/settings/rules/' + this.rule.uid + '/script/' + mod.id, { transition: theme.aurora ? 'f7-cover-v' : '' })
      })
    },
    /**
     * Determines if the module is "opaque" in that it doesn't actually execute the content of the module, but instead executes
     * a referenced in-memory runnable method, or that the code depends on a referenced in-memory object/context.
     *
     * @param module the module to evaluate
     */
    isOpaqueModule(module) {
      if (!module?.type) return false
      return (
        module.type === 'jsr223.ScriptedAction' || module.type === 'jsr223.ScriptedCondition' || module.type === 'jsr223.ScriptedTrigger'
      )
    },
    /**
     * Determines if a module relies on shared context without being "opaque", that is, it's possible to show the script, but it won't
     * work without an "invisible" context that can't be shown.
     *
     * @param module the module to evaluate
     */
    moduleHasSharedContext(module) {
      if (!module?.type) return false
      return (
        module.type === 'script.ScriptAction' &&
        module.configuration?.type === 'application/vnd.openhab.dsl.rule' &&
        module.configuration?.sharedContext === true
      )
    },
    copyRuleDefinitionToClipboard(type, serializationOption) {
      if (!this.rule) {
        return
      }
      const mediaType = type === 'DSL' ? 'application/vnd.openhab.dsl.rule' : 'application/yaml'
      const progressDialog = f7.dialog.progress(`Loading '${this.rule.name}' ${type || 'YAML'} definition...`)
      create(
        {
          serializationOption: serializationOption || undefined,
          fileFormat: {
            rules: [this.rule]
          }
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
            dialogTitle: `Copy '${this.rule.name}' File Definition`,
            dialogText: 'Rule definition retrieved successfully. Click OK to copy it to the clipboard.',
            onSuccess: () => {
              showToast(`Rule ${type || 'YAML'} definition copied to clipboard:\n${this.rule.name}`)
            },
            onError: () => {
              f7.dialog.alert(`Error copying rule ${type || 'YAML'} definition to the clipboard`, 'Error')
            }
          })
          this.copyPopupOpened = false
        })
        .catch((error) => {
          progressDialog.close()
          console.error('Failed to generate rule definiton', error)
          f7.dialog.alert(`Error loading rule ${type || 'YAML'} definition: ${error}`, 'Error')
          this.copyPopupOpened = false
        })
    },
    exportDslClicked() {
      if (this.canDSL) {
        this.copyRuleDefinitionToClipboard('DSL')
      } else {
        this.showDslErrors = !this.showDslErrors
      }
    },
    exportYamlClicked() {
      if (this.canYAML) {
        this.showYamlExportOptions = !this.showYamlExportOptions
      } else {
        this.showYamlErrors = !this.showYamlErrors
      }
    }
  },
  computed: {
    pageTitle() {
      if (this.createMode) {
        return this.ruleCopy ? 'Create a duplicate rule' : 'Create rule'
      } else if (this.stubMode) {
        return 'Regenerate rule from template'
      } else {
        return this.rule.name
      }
    },
    hasTemplate() {
      return this.rule && (this.stubMode || this.currentTemplate !== null)
    },
    templateName() {
      if (!this.rule || !this.rule.templateUID || !this.templates) {
        return undefined
      }
      let result = this.templates.find((t) => t.uid === this.rule.templateUID)
      return result ? result.label : this.rule.templateUID
    },
    currentTemplateTopicLink() {
      return this.getTopicLink(this.currentTemplate)
    },
    canRegenerate() {
      if (
        !this.rule ||
        !this.rule.templateUID ||
        !this.rule.templateState ||
        this.rule.templateState === 'no-template' ||
        this.rule.templateState === 'template-missing'
      ) {
        return false
      }
      return this.templates ? this.templates.some((t) => t.uid === this.rule.templateUID) : false
    },
    hasOpaqueModule() {
      return this.opaqueModules.length > 0
    },
    opaqueModulesTypeText() {
      const result = this.opaqueModulesType
      return result ? AUTOMATION_LANGUAGES[result]?.name || result : result
    },
    opaqueModulesType() {
      const modules = this.opaqueModules
      if (!modules || !modules.length) return undefined
      // "Opaque modules" implies that the rule is created programmatically.
      // The assumption is therefore that all opaque module types are of the same type/scripting language.
      return modules.find((m) => m.configuration?.type)?.configuration?.type
    },
    opaqueModules() {
      if (!this.rule) return []
      return [...(this.rule.actions || []), this.rule.triggers || [], this.rule.conditions || []].filter((m) => this.isOpaqueModule(m))
    },
    hasSharedContextModule() {
      return this.sharedContextModules.length > 0
    },
    sharedContextModules() {
      if (!this.rule) return []
      return [...(this.rule.actions || []), this.rule.triggers || [], this.rule.conditions || []].filter((m) =>
        this.moduleHasSharedContext(m)
      )
    },
    hasSource() {
      const sourceContainer = this.sourceSource
      return sourceContainer ? sourceContainer.source || sourceContainer.script : false
    },
    source() {
      const sourceContainer = this.sourceSource
      if (!sourceContainer) return ''
      return sourceContainer.source || sourceContainer.script || ''
    },
    sourceTypeText() {
      const result = this.sourceType
      return result ? AUTOMATION_LANGUAGES[result]?.shortName || result : result
    },
    sourceType() {
      const sourceContainer = this.sourceSource
      return sourceContainer ? sourceContainer.sourceType || sourceContainer.type : undefined
    },
    sourceSource() {
      if (!this.rule) return undefined
      if (this.rule.configuration?.source) {
        return this.rule.configuration
      }
      if (this.rule.actions?.length) {
        for (const action of this.rule.actions) {
          if (this.isOpaqueModule(action)) {
            return action.configuration
          }
        }
      }
      return undefined
    },
    uidValid() {
      if (!this.rule || !this.rule.uid) return false
      return UID_REGEX.test(this.rule.uid)
    },
    labelValid() {
      return this.rule?.name?.trim()
    },
    hasCode() {
      return this.canYAML || this.canDSL
    },
    validMediaTypes() {
      const types = []
      if (this.canYAML) types.push('application/yaml+rule')
      if (this.canDSL) types.push('application/vnd.openhab.dsl.rule')
      return types
    },
    /**
     * Determines if the rule is "empty" from the code editor's perspective. An "empty" rule is one that
     * can't yet be tested for YAML/DSL serialization support, and will allow showing the code editor
     * regardless, so that a new rule can be created from the code editor.
     *
     * To qualify as empty, the rule must not have any properties other than an optional UID, and optional
     * label/name, and optional empty arrays for triggers, actions, and conditions.
     *
     * @returns true if the rule is "empty" as defined above, false otherwise
     */
    isEmpty() {
      const rule = this.rule
      if (!rule) return true
      if (
        rule.description ||
        rule.tags?.length ||
        rule.templateUID ||
        (rule.visibility && rule.visibility !== 'VISIBLE') ||
        (rule.configuration && Object.keys(rule.configuration).length > 0) ||
        (rule.configDescriptions && Object.keys(rule.configDescriptions).length > 0) ||
        rule.triggers?.length > 0 ||
        rule.actions?.length > 0 ||
        rule.conditions?.length > 0
      ) {
        return false
      }
      return true
    },
    ...mapStores(useUIOptionsStore)
  }
}
</script>
