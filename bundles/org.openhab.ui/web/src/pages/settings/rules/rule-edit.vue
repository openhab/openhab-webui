<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar :title="(createMode ? 'Create rule' : rule.name) + dirtyIndicator" back-link="Back" no-hairline>
      <f7-nav-right>
        <developer-dock-icon />
        <template v-if="isEditable">
          <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
          <f7-link @click="save()" v-if="!$theme.md">
            Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
          </f7-link>
        </template>
        <f7-link v-else icon-f7="lock_fill" icon-only tooltip="This rule is not editable through the UI" />
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('design', fromYaml)" :tab-link-active="currentTab === 'design'" class="tab-link">
        Design
      </f7-link>
      <f7-link @click="switchTab('code', toYaml)" :tab-link-active="currentTab === 'code'" class="tab-link">
        Code
      </f7-link>
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="ready && rule.status && (!createMode)" class="block-narrow padding-left padding-right" strong>
          <f7-col v-if="!createMode">
            <div class="float-right align-items-flex-start align-items-center">
              <!-- <f7-toggle class="enable-toggle"></f7-toggle> -->
              <f7-link :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'" :tooltip="((rule.status.statusDetail === 'DISABLED') ? 'Enable' : 'Disable') + (($device.desktop) ? ' (Ctrl-D)' : '')" icon-ios="f7:pause_circle" icon-md="f7:pause_circle" icon-aurora="f7:pause_circle" icon-size="32" color="orange" @click="toggleDisabled" />
              <f7-link :tooltip="'Run Now' + (($device.desktop) ? ' (Ctrl-R)' : '')" icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round" icon-size="32" :color="(rule.status.status === 'IDLE') ? 'blue' : 'gray'" @click="runNow" />
            </div>
            Status:
            <f7-chip class="margin-left"
                     :text="rule.status.status"
                     :color="ruleStatusBadgeColor(rule.status)" />
            <div>
              <strong>{{ (rule.status.statusDetail !== 'NONE') ? rule.status.statusDetail : '&nbsp;' }}</strong>
              <br>
              <div v-if="rule.status.description">
                {{ rule.status.description }}
              </div>
            </div>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block v-else-if="!createMode" class="block-narrow padding-left padding-right skeleton-text skeleton-effect-blink" strong>
          <f7-col>
            ______:
            <f7-chip class="margin-left" text="________" />
            <div>
              <strong>____ _______</strong>
              <br>
            </div>
          </f7-col>
        </f7-block>

        <rule-general-settings :rule="rule" :ready="ready" :createMode="createMode" :hasTemplate="hasTemplate" :templateName="templateName" />

        <f7-block v-if="ready" class="block-narrow">
          <f7-block-footer v-if="!isEditable" class="no-margin padding-left">
            <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: this rule is not editable.
          </f7-block-footer>
          <!-- <f7-col v-if="isEditable" class="text-align-right justify-content-flex-end">
          </f7-col> -->
          <f7-col v-if="createMode && templates.length > 0" class="new-rule-from-template">
            <f7-block-title medium class="margin-bottom">
              Create from Template
            </f7-block-title>
            <f7-list media-list>
              <f7-list-item title="No template" footer="Create a new rule from scratch"
                            radio :checked="!hasTemplate" radio-icon="start"
                            :value="''"
                            @change="selectTemplate(null)" />
            </f7-list>
            <f7-block-footer class="margin-left">
              or choose a rule template:
            </f7-block-footer>
            <f7-list media-list>
              <f7-list-item :key="template.uid" v-for="template in templates"
                            :title="template.label" :footer="template.description"
                            :value="template.uid"
                            radio :checked="hasTemplate && currentTemplate.uid === template.uid" radio-icon="start"
                            @change="selectTemplate(template.uid)" />
            </f7-list>
            <f7-block-title v-if="hasTemplate" medium class="margin-vertical padding-top">
              Template Configuration
            </f7-block-title>
            <f7-link v-if="templateTopicLink" target="_blank" class="external margin-left" color="blue" :href="templateTopicLink">
              Template Community Marketplace Topic
            </f7-link>
            <config-sheet v-if="hasTemplate"
                          :parameter-groups="[]" :parameters="currentTemplate.configDescriptions"
                          :configuration="rule.configuration" />
          </f7-col>
          <f7-col v-if="!hasTemplate" class="rule-modules">
            <div v-if="isEditable" class="no-padding float-right">
              <f7-button @click="toggleModuleControls" small outline :fill="showModuleControls" sortable-toggle=".sortable" style="margin-top: -3px; margin-right: 5px"
                         color="gray" icon-size="12" icon-ios="material:wrap_text" icon-md="material:wrap_text" icon-aurora="material:wrap_text">
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
                <f7-list-item media
                              :title="mod.label || suggestedModuleTitle(mod, null, section)"
                              :footer="mod.description || suggestedModuleDescription(mod, null, section)"
                              v-for="mod in rule[section]" :key="mod.id"
                              :link="!showModuleControls"
                              @click.native="(ev) => editModule(ev, section, mod)" swipeout>
                  <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled" icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline" @click="showSwipeout" />
                  <f7-swipeout-actions right v-if="isEditable">
                    <f7-swipeout-button @click="(ev) => deleteModule(ev, section, mod)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'" :subtitle="SECTION_LABELS[section][2]" @click="addModule(section)">
                  <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
                </f7-list-item>
                <!-- <f7-list-button :color="(showModuleControls) ? 'gray' : 'blue'" :title="sectionLabels[section][1]"></f7-list-button> -->
              </f7-list>
            </div>
          </f7-col>
          <f7-col v-if="isEditable && (!createMode)">
            <f7-list>
              <f7-list-button color="blue" @click="duplicateRule">
                Duplicate Rule
              </f7-list-button>
              <f7-list-button color="red" @click="deleteRule">
                Delete Rule
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <f7-icon v-if="!createMode && !isEditable" f7="lock" class="float-right margin" style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray" tooltip="This code is not editable" />
        <editor v-if="currentTab === 'code'" class="rule-code-editor" mode="application/vnd.openhab.rule+yaml" :value="ruleYaml" :readOnly="!isEditable" @input="onEditorInput" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
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
.rule-code-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap

</style>

<script>
import YAML from 'yaml'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import RuleModulePopup from './rule-module-popup.vue'

import RuleMixin from './rule-edit-mixin'
import ModuleDescriptionSuggestions from './module-description-suggestions'
import RuleStatus from '@/components/rule/rule-status-mixin'
import DirtyMixin from '../dirty-mixin'

import ConfigSheet from '@/components/config/config-sheet.vue'
import RuleGeneralSettings from '@/components/rule/rule-general-settings.vue'

export default {
  mixins: [RuleMixin, ModuleDescriptionSuggestions, RuleStatus, DirtyMixin],
  components: {
    RuleGeneralSettings,
    ConfigSheet,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  props: ['ruleId', 'createMode', 'ruleCopy', 'schedule'],
  data () {
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
      ruleYaml: '',
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
      currentTemplate: null
    }
  },
  watch: {
    rule: {
      handler: function () {
        if (!this.loading) { // ignore changes during loading
          // create rule object clone in order to be able to delete status part
          // which can change from eventsource but doesn't mean a rule modification
          let ruleClone = cloneDeep(this.rule)
          delete ruleClone.status
          delete this.savedRule.status

          this.dirty = !fastDeepEqual(ruleClone, this.savedRule)
        }
      },
      deep: true
    }
  },
  methods: {
    load () {
      if (this.loading) return
      this.loading = true

      const loadModules1 = this.$oh.api.get('/rest/module-types?type=action')
      const loadModules2 = this.$oh.api.get('/rest/module-types?type=condition')
      const loadModules3 = this.$oh.api.get('/rest/module-types?type=trigger')

      const loadingFinished = () => {
        this.$nextTick(() => {
          this.savedRule = cloneDeep(this.rule)
          this.ready = true
          this.loading = false
        })
      }

      Promise.all([loadModules1, loadModules2, loadModules3]).then((data) => {
        this.moduleTypes.actions = data[0]
        this.moduleTypes.conditions = data[1]
        this.moduleTypes.triggers = data[2]
        if (this.createMode) {
          const newRule = this.ruleCopy || {
            uid: this.$f7.utils.id(),
            name: '',
            triggers: [],
            actions: [],
            conditions: [],
            tags: (this.schedule) ? ['Schedule'] : [],
            configuration: {},
            templateUID: null,
            visibility: 'VISIBLE',
            status: {
              status: 'NEW'
            }
          }
          if (this.ruleCopy) newRule.uid = this.$f7.utils.id()
          this.$set(this, 'rule', newRule)
          this.$oh.api.get('/rest/templates').then((templateData) => {
            this.$set(this, 'templates', templateData)
            loadingFinished()
          })
          // no need for an event source, the rule doesn't exist yet
        } else {
          this.$oh.api.get('/rest/rules/' + this.ruleId).then((data2) => {
            this.$set(this, 'rule', data2)
            if (data2.templateUID) {
              this.$oh.api.get('/rest/templates').then((templateData) => {
                this.$set(this, 'templates', templateData)
                if (!this.eventSource) this.startEventSource()
                loadingFinished()
              })
            } else {
              if (!this.eventSource) this.startEventSource()
              loadingFinished()
            }
          })
        }
      })
    },
    save (noToast) {
      if (!this.isEditable) return Promise.reject()
      if (this.currentTab === 'code') {
        if (!this.fromYaml()) {
          return Promise.reject()
        }
      }
      if (!this.rule.uid) {
        this.$f7.dialog.alert('Please give an ID to the rule')
        return Promise.reject()
      }
      if (!this.rule.name) {
        this.$f7.dialog.alert('Please give a name to the rule')
        return Promise.reject()
      }
      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/rules', JSON.stringify(this.rule), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/rules/' + this.rule.uid, this.rule)
      return promise.then((data) => {
        this.dirty = false
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Rule created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.navigate(this.$f7route.url
            .replace('/add', '/' + this.rule.uid)
            .replace('/duplicate', '/' + this.rule.uid)
            .replace('/schedule/', '/rules/'), { reloadCurrent: true })
          this.load()
        } else {
          if (!noToast) {
            this.$f7.toast.create({
              text: 'Rule updated',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          }
          this.savedRule = cloneDeep(this.rule)
        }
        // if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving rule: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    duplicateRule () {
      let ruleClone = cloneDeep(this.rule)
      this.$f7router.navigate({
        url: '/settings/rules/duplicate'
      }, {
        props: {
          ruleCopy: ruleClone
        }
      })
    },
    runNow () {
      if (this.createMode) return
      if (this.rule.status.status === 'RUNNING' || this.rule.status.status === 'UNINITIALIZED') {
        return this.$f7.toast.create({
          text: `Rule cannot be run ${(this.rule.status.status === 'RUNNING') ? 'while already running, please wait' : 'if it is uninitialized'}!`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }
      this.$f7.toast.create({
        text: 'Running rule',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()

      const savePromise = (this.isEditable && this.dirty) ? this.save(true) : Promise.resolve()

      savePromise.then(() => {
        this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/runnow', '').catch((err) => {
          this.$f7.toast.create({
            text: 'Error while running rule: ' + err,
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        })
      })
    },
    deleteRule () {
      this.$f7.dialog.confirm(
        `Are you sure you want to delete ${this.rule.name}?`,
        'Delete Rule',
        () => {
          this.$oh.api.delete('/rest/rules/' + this.rule.uid).then(() => {
            this.dirty = false
            this.$f7router.back('/settings/rules/', { force: true })
          })
        }
      )
    },
    selectTemplate (uid) {
      this.$set(this.rule, 'configuration', {})
      this.$set(this.rule, 'triggers', [])
      this.$set(this.rule, 'conditions', [])
      this.$set(this.rule, 'actions', [])
      if (!uid) {
        this.$set(this, 'currentTemplate', null)
        return
      }
      this.$set(this, 'currentTemplate', this.templates.find((t) => t.uid === uid))
      this.rule.templateUID = uid
    },
    editModule (ev, section, mod) {
      if (this.showModuleControls) return
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
      this.$f7router.navigate({
        url: 'module-config',
        route: {
          path: 'module-config',
          popup
        }
      }, {
        props: {
          rule: this.rule,
          currentSection: this.currentSection,
          ruleModule: this.currentModule,
          ruleModuleType: this.currentModuleType,
          moduleTypes: this.moduleTypes,
          readOnly: !this.isEditable
        }
      })

      if (this.isEditable) {
        this.$f7.once('ruleModuleConfigUpdate', this.saveModule)
        this.$f7.once('ruleModuleConfigClosed', () => {
          this.$f7.off('ruleModuleConfigUpdate', this.saveModule)
          this.moduleConfigClosed()
        })
      }
    },
    deleteModule (ev, section, mod) {
      let swipeoutElement = ev.target
      if (!this.isEditable) return
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$f7.swipeout.delete(swipeoutElement, () => {
        const idx = this.rule[section].findIndex((m) => m.id === mod.id)
        this.rule[section].splice(idx, 1)
      })
    },
    addModule (section) {
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
      this.$f7router.navigate({
        url: 'module-config',
        route: {
          path: 'module-config',
          popup
        }
      }, {
        props: {
          currentSection: this.currentSection,
          ruleModule: this.currentModule,
          ruleModuleType: this.currentModuleType,
          moduleTypes: this.moduleTypes
        }
      })

      this.$f7.once('ruleModuleConfigUpdate', this.saveModule)
      this.$f7.once('editNewScript', this.saveAndEditNewScript)
      this.$f7.once('ruleModuleConfigClosed', () => {
        this.$f7.off('ruleModuleConfigUpdate', this.saveModule)
        this.$f7.off('editNewScript', this.saveAndEditNewScript)
        this.moduleConfigClosed()
      })
    },
    reorderModule (ev, section) {
      const newSection = [...this.rule[section]]
      newSection.splice(ev.to, 0, newSection.splice(ev.from, 1)[0])
      this.$set(this.rule, section, newSection)
    },
    saveModule (updatedModule) {
      if (!updatedModule.type) return
      if (!updatedModule.label) delete updatedModule.label
      if (!updatedModule.description) delete updatedModule.description
      if (updatedModule.new) {
        delete updatedModule.new
        this.rule[this.currentSection].push(updatedModule)
      } else {
        const idx = this.rule[this.currentSection].findIndex((m) => m.id === updatedModule.id)
        this.$set(this.rule[this.currentSection], idx, updatedModule)
      }
    },
    saveAndEditNewScript (updatedModule) {
      this.saveModule(updatedModule)
      this.save().then(() => {
        this.$f7router.navigate('/settings/rules/' + this.rule.uid + '/script/' + updatedModule.id, { transition: this.$theme.aurora ? 'f7-cover-v' : '' })
      })
    },
    moduleConfigClosed () {
      this.currentModule = null
      this.currentModuleType = null
    },
    editScriptDirect (ev, mod) {
      ev.cancelBubble = true
      this.currentModule = mod
      this.currentModuleType = mod.type
      this.scriptCode = mod.configuration.script

      const updatePromise = (this.rule.editable || this.createMode) && this.dirty ? this.save() : Promise.resolve()
      updatePromise.then(() => {
        this.$f7router.navigate('/settings/rules/' + this.rule.uid + '/script/' + mod.id, { transition: this.$theme.aurora ? 'f7-cover-v' : '' })
      })
    },
    toYaml () {
      this.ruleYaml = YAML.stringify({
        configuration: this.rule.configuration,
        triggers: this.rule.triggers,
        conditions: this.rule.conditions,
        actions: this.rule.actions
      })
    },
    fromYaml () {
      if (!this.isEditable) return
      try {
        const updatedRule = YAML.parse(this.ruleYaml)
        this.$set(this.rule, 'configuration', updatedRule.configuration)
        this.$set(this.rule, 'triggers', updatedRule.triggers)
        this.$set(this.rule, 'conditions', updatedRule.conditions)
        this.$set(this.rule, 'actions', updatedRule.actions)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  },
  computed: {
    hasTemplate () {
      return this.rule && this.currentTemplate !== null
    },
    templateName () {
      if (!this.rule || !this.rule.templateUID || !this.templates) {
        return undefined
      }
      let result = this.templates.find((t) => t.uid === this.rule.templateUID)
      return result ? result.label : this.rule.templateUID
    },
    templateTopicLink () {
      if (!this.currentTemplate) return null
      if (!this.currentTemplate.tags) return null
      const marketplaceTag = this.currentTemplate.tags.find((t) => t.indexOf('marketplace:') === 0)
      if (marketplaceTag) return 'https://community.openhab.org/t/' + marketplaceTag.replace('marketplace:', '')
      return null
    }
  }
}
</script>
