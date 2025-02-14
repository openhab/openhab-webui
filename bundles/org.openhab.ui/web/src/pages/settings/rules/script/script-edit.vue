<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="pageTitle + dirtyIndicator" :subtitle="(!createMode) ? mode : undefined" back-link="Back">
      <f7-nav-right>
        <developer-dock-icon />
        <template v-if="editable && !createMode">
          <f7-link @click="onSave()" v-if="$theme.md" icon-md="material:save" icon-only />
          <f7-link @click="onSave()" v-if="!$theme.md">
            Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
          </f7-link>
        </template>
        <template v-else-if="editable && createMode">
          <f7-link @click="createScript" v-if="$theme.md && createMode" icon-md="material:save" icon-only />
          <f7-link @click="createScript" v-if="$theme.ios && createMode">
            Create
          </f7-link>
        </template>
      </f7-nav-right>
    </f7-navbar>

    <template v-if="ready">
      <f7-toolbar v-if="!createMode" position="bottom">
        <span class="display-flex flex-direction-row align-items-center">
          <f7-link :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'"
                   :tooltip="((rule.status.statusDetail === 'DISABLED') ? 'Enable' : 'Disable') + (($device.desktop) ? ' (Ctrl-D)' : '')"
                   icon-ios="f7:pause_circle" icon-md="f7:pause_circle" icon-aurora="f7:pause_circle"
                   color="orange"
                   @click="toggleDisabled" />
          <f7-link v-if="!$theme.aurora"
                   :tooltip="isMimeTypeAvailable(mode) ? ('Run Now' + (($device.desktop) ? ' (Ctrl-R)' : '')) : (isScriptRule ? 'Script' : 'Rule') + ' cannot be run, scripting addon for ' + mimeTypeDescription(mode) + ' is not installed'"
                   icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round"
                   :color="((rule.status.status === 'IDLE') && isMimeTypeAvailable(mode)) ? 'blue' : 'gray'"
                   @click="runNow" />
          <f7-link v-else class="margin-left"
                   :text="'Run Now' + (($device.desktop) ? ' (Ctrl-R)' : '')"
                   :tooltip="!isMimeTypeAvailable(mode) ? (isScriptRule ? 'Script' : 'Rule') + ' cannot be run, scripting addon for ' + mimeTypeDescription(mode) + ' is not installed' : undefined"
                   icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round"
                   :color="(rule.status.status === 'IDLE') && isMimeTypeAvailable(mode) ? 'blue' : 'gray'"
                   @click="runNow" />
          <f7-chip class="margin-left" v-if="currentModule && currentModule.configuration.script"
                   :text="ruleStatusBadgeText(rule.status)"
                   :color="ruleStatusBadgeColor(rule.status)"
                   :tooltip="rule.status.description" />
        </span>
        <span class="display-flex flex-direction-row align-items-center">
          <template v-if="isBlockly">
            <f7-popover class="config-popover">
              <f7-list class="config-menu">
                <f7-list-item group-title title="Block Style" />
                <f7-list-item v-for="renderer in blocklyRenderers" :key="renderer" :title="renderer" style="text-transform:capitalize" color="blue" radio :checked="renderer === blocklyRenderer" @click="setBlocklyRenderer(renderer)" />
                <f7-list-item v-if="!$device.desktop" group-title title="Show Items" />
                <f7-list-item v-if="!$device.desktop" title="As Labels" color="blue" radio :checked="blocklyShowLabels" @click="setBlocklyShowLabels(true)" />
                <f7-list-item v-if="!$device.desktop" title="As Item IDs" color="blue" radio :checked="!blocklyShowLabels" @click="setBlocklyShowLabels(false)" />
              </f7-list>
            </f7-popover>
            <template v-if="$device.desktop">
              <f7-button v-if="!blocklyCodePreview" outline small icon-f7="paintbrush" :icon-size="($theme.aurora) ? 20 : 22" class="no-ripple" style="margin-right: 5px" tooltip="Block Style" popover-open=".config-popover" />
              <f7-button v-if="!createMode && !blocklyCodePreview" outline small :active="blocklyShowLabels" icon-f7="square_on_circle" :icon-size="($theme.aurora) ? 20 : 22" class="no-ripple" style="margin-right: 5px" @click="setBlocklyShowLabels(!blocklyShowLabels)" tooltip="Toggle to show either Item labels or IDs" />
            </template>
            <f7-button v-else-if="!blocklyCodePreview" outline small icon-f7="ellipsis_vertical" :icon-size="($theme.aurora) ? 20 : 22" class="no-ripple" style="margin-right: 5px" tooltip="Blockly Settings" popover-open=".config-popover" />
            <f7-segmented v-if="!createMode" class="margin-right">
              <f7-button outline small :active="!blocklyCodePreview" icon-f7="ticket" :icon-size="($theme.aurora) ? 20 : 22" class="no-ripple" @click="blocklyCodePreview = false" tooltip="Show blocks" />
              <f7-button outline small :active="blocklyCodePreview" icon-f7="doc_text" :icon-size="($theme.aurora) ? 20 : 22" class="no-ripple" @click="showBlocklyCode" tooltip="Show generated code" />
            </f7-segmented>
          </template>
          <f7-link v-if="documentationLink(mode) && !isBlockly"
                   icon-color="blue"
                   :text="$device.desktop ? 'Open Documentation' : 'Docs'"
                   tooltip="Open documentation"
                   icon-ios="f7:question_circle" icon-md="f7:question_circle" icon-aurora="f7:question_circle"
                   color="blue"
                   :href="$store.state.websiteUrl + documentationLink(mode)" target="_blank" external />
          <f7-link class="right details-link margin-left padding-right" ref="detailsLink" @click="detailsOpened = true" icon-f7="chevron_up" />
        </span>
      </f7-toolbar>

      <f7-icon v-if="!createMode && (!isBlockly && !editable) || (blocklyCodePreview && isBlockly)" f7="lock" class="float-right margin" style="opacity:0.5; z-index: 4000; user-select: none;" size="50" color="gray"
               :tooltip="(isBlockly) ? 'Cannot edit the code generated by Blockly' : 'This rule is not editable because it has been provisioned from a file'" />
      <editor v-if="!createMode && (!isBlockly || blocklyCodePreview)" class="rule-script-editor" :mode="mode" :value="script" @input="onEditorInput" :read-only="isBlockly || !editable" :tern-autocompletion-hook="true" />
      <blockly-editor ref="blocklyEditor" v-else-if="!createMode && isBlockly" :blocks="currentModule.configuration.blockSource" @change="scriptDirty = true" @mounted="onBlocklyMounted" @ready="onBlocklyReady" />
      <script-general-settings v-else-if="createMode" :createMode="true" :rule="rule" />
      <f7-block class="block-narrow" v-if="createMode && !ruleCopy">
        <f7-col>
          <f7-block-title medium class="margin-left margin-bottom">
            Scripting Method
          </f7-block-title>
          <f7-list media-list>
            <f7-list-item media-item radio radio-icon="start"
                          title="Design with Blockly"
                          text="A beginner-friendly way to build scripts visually by assembling blocks"
                          :footer="!isJsAvailable ? 'You need to install the JavaScript Scripting addon before you will be able to run' : undefined"
                          :value="'application/javascript+blockly'" :checked="mode === 'application/javascript+blockly'"
                          @change="mode = 'application/javascript+blockly'">
              <img src="@/images/blockly.svg" height="32" width="32" slot="media">
            </f7-list-item>
          </f7-list>
          <f7-block-footer class="margin-vertical margin-left">
            or choose the scripting language:
          </f7-block-footer>
          <f7-list media-list>
            <f7-list-item media-item radio radio-icon="start"
                          :value="mode" :checked="mode === language.contentType" @change="mode = language.contentType"
                          v-for="language in languages" :key="language.contentType"
                          :title="language.name" :after="language.version" :footer="language.contentType" />
          </f7-list>
        </f7-col>
      </f7-block>
      <div v-if="createMode" class="if-aurora display-flex justify-content-center margin padding">
        <div class="flex-shrink-0">
          <f7-button class="padding-left padding-right" style="width: 150px" color="blue" large raised fill @click="createScript">
            Create Script
          </f7-button>
        </div>
      </div>

      <f7-fab v-show="!createMode && !script && mode === 'application/javascript' && !isBlockly" position="center-bottom" slot="fixed" color="blue" @click="convertToBlockly" text="Design with Blockly">
        <f7-icon f7="ticket_fill" />
      </f7-fab>

      <f7-sheet ref="detailsSheet" class="script-details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
        <f7-page>
          <f7-toolbar tabbar bottom>
            <span class="margin-left">Script details</span>
            <div class="right">
              <f7-link sheet-close class="padding-right">
                <f7-icon f7="chevron_down" />
              </f7-link>
            </div>
          </f7-toolbar>
          <script-general-settings class="margin-top" :createMode="createMode" :rule="rule" :module="currentModule" :module-type="scriptModuleType" :module-types="moduleTypes" :isScriptRule="isScriptRule" :mode="mode" :languages="languages" @newLanguage="changeLanguage" />
          <f7-block class="block-narrow" v-if="editable && isScriptRule">
            <f7-col>
              <f7-list>
                <f7-list-button color="blue" @click="duplicateRule">
                  Duplicate Script
                </f7-list-button>
                <f7-list-button color="red" @click="deleteRule">
                  Remove Script
                </f7-list-button>
              </f7-list>
            </f7-col>
          </f7-block>
        </f7-page>
      </f7-sheet>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.rule-script-editor.vue-codemirror
  display block
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - 2*var(--f7-navbar-height))
  width 100%
</style>

<script>
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'

import RuleStatus from '@/components/rule/rule-status-mixin'
import ScriptGeneralSettings from './script-general-settings.vue'
import ModuleDescriptionSuggestions from '../module-description-suggestions'
import DirtyMixin from '../../dirty-mixin'
import AUTOMATION_LANGUAGES from '@/assets/automation-languages'

export default {
  mixins: [RuleStatus, ModuleDescriptionSuggestions, DirtyMixin],
  components: {
    ScriptGeneralSettings,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'),
    'blockly-editor': () => import(/* webpackChunkName: "blockly-editor" */ '@/components/config/controls/blockly-editor.vue')
  },
  props: ['ruleId', 'moduleId', 'createMode', 'ruleCopy'],
  data () {
    return {
      ready: false,
      loading: false,
      isScriptRule: false,

      scriptDirty: false,
      modeDirty: false,
      ruleDirty: false,
      currentModuleDirty: false,

      rule: {},
      savedRule: {},
      currentModule: {},
      savedCurrentModule: {},
      script: '',
      savedScript: '',
      mode: '',
      savedMode: '',

      moduleTypes: {
        actions: [],
        conditions: [],
        triggers: []
      },

      currentModuleConfig: {},
      scriptModuleType: null,
      languages: null,

      eventSource: null,
      keyHandler: null,
      detailsOpened: false,
      blocklyCodePreview: false,
      blocklyShowLabels: false,
      blocklyRenderer: 'default',
      blocklyRenderers: []
    }
  },
  computed: {
    pageTitle () {
      if (this.createMode) return 'Create Script'
      if (this.isScriptRule) return this.rule.name
      if (this.currentModule) {
        let title = 'Edit'
        switch (this.currentModule.type) {
          case 'script.ScriptAction':
          case 'script.ScriptCondition':
            title += ' ' + this.currentModule.type.slice('script.Script'.length)
            break
        }
        title += ' Script'
        if (this.currentModule.label) {
          title += ': ' + this.currentModule.label
        }
        return title
      }
      return 'Edit Script'
    },
    editable () {
      return this.rule && this.rule.editable !== false
    },
    isBlockly () {
      return this.currentModule && this.currentModule.configuration && this.currentModule.configuration.blockSource
    },
    isJsAvailable () {
      return this.isMimeTypeAvailable(this.GRAALJS_MIME_TYPE)
    }
  },
  watch: {
    // handle the script if not in Blockly
    script: {
      handler: function () {
        if (!this.isBlockly && !this.loading) { // ignore changes during loading
          this.scriptDirty = (this.script !== this.savedScript)
        }
      }
    },
    // handle mode change
    mode: {
      handler: function () {
        if (!this.loading) { // ignore changes during loading
          this.modeDirty = (this.mode !== this.savedMode)
        }
      }
    },
    // handle script rule title, description etc.
    rule: {
      handler: function () {
        if (this.isScriptRule && !this.loading) { // ignore changes during loading
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
    // handle script action module type, label, description ect.
    currentModule: {
      handler: function () {
        if (this.savedCurrentModule && !this.loading) { // ignore changes during loading
          this.currentModuleDirty = !fastDeepEqual(this.currentModule, this.savedCurrentModule)
        }
      },
      deep: true
    },
    // watch dirty vars
    scriptDirty () {
      this.calculateDirty()
    },
    modeDirty () {
      this.calculateDirty()
    },
    ruleDirty () {
      this.calculateDirty()
    },
    currentModuleDirty () {
      this.calculateDirty()
    }
  },
  methods: {
    /**
     * Calculates the value of `this.dirty` from the individual dirty states.
     */
    calculateDirty () {
      this.dirty = this.scriptDirty || this.modeDirty || this.ruleDirty || this.currentModuleDirty
    },
    /**
     * Resets `this.dirty` and all individual dirty states to `false`.
     */
    resetDirty () {
      this.dirty = this.scriptDirty = this.modeDirty = this.ruleDirty = this.currentModuleDirty = false
    },
    /**
     * Stores the current state of tracked objects as the saved state of those, e.g. `this.rule` is cloned to `this.savedRule`.
     */
    initDirty () {
      this.savedRule = cloneDeep(this.rule)
      if (this.currentModule) {
        this.savedCurrentModule = cloneDeep(this.currentModule)
        this.savedMode = this.mode
        this.savedScript = this.script = this.currentModule.configuration.script || ''
      }
    },
    onPageAfterIn () {
      if (this.ready) return
      if (this.createMode) {
        this.initializeNewScript()
        return
      }
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageBeforeOut () {
      this.$refs.detailsSheet.f7Sheet.close()
      this.stopEventSource()
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    initializeNewScript () {
      this.rule = this.ruleCopy || {
        uid: this.$f7.utils.id(),
        name: '',
        description: '',
        triggers: [],
        conditions: [],
        actions: [],
        tags: ['Script']
      }
      if (this.ruleCopy) this.rule.uid = this.$f7.utils.id()
      this.savedRule = cloneDeep(this.rule)
      this.savedMode = this.mode = 'application/javascript+blockly'
      this.loadScriptModuleTypes().then(() => {
        this.ready = true
      })
    },
    createScript () {
      if (!this.rule.uid) {
        this.$f7.dialog.alert('Please give an ID to the script')
        return
      }
      if (!this.rule.name) {
        this.$f7.dialog.alert('Please give a name to the script')
        return
      }

      if (!this.ruleCopy) {
        const actionModule = {
          id: 'script',
          type: 'script.ScriptAction',
          configuration: {
            type: this.mode,
            script: ''
          }
        }
        if (this.mode === 'application/javascript+blockly') {
          actionModule.configuration.type = this.GRAALJS_MIME_TYPE
          actionModule.configuration.blockSource = '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
        }
        this.rule.actions.push(actionModule)
      }

      this.$oh.api.postPlain('/rest/rules', JSON.stringify(this.rule), 'text/plain', 'application/json').then(() => {
        this.resetDirty()
        this.$f7.toast.create({
          text: 'Script created',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.$f7router.navigate(this.$f7route.url.replace(/(\/add)|(\/duplicate)/, '/' + this.rule.uid), { reloadCurrent: true })
      })
    },
    isMimeTypeAvailable (mimeType) {
      return this.languages.map(l => l.contentType).includes(mimeType)
    },
    mimeTypeDescription (mode) {
      return AUTOMATION_LANGUAGES[mode]?.name || mode
    },
    documentationLink (mode) {
      return AUTOMATION_LANGUAGES[mode]?.documentationLink
    },
    /**
     * Load the script module type, i.e. the available script languages
     * @returns {Promise}
     */
    loadScriptModuleTypes () {
      return this.$oh.api.get('/rest/module-types/script.ScriptAction').then((data) => {
        this.$set(this, 'scriptModuleType', data)
        let languages = this.scriptModuleType.configDescriptions
          .find((c) => c.name === 'type').options
          .map((l) => {
            return {
              contentType: l.value,
              name: l.label.split(' (')[0],
              version: l.label.split(' (')[1].replace(')', '')
            }
          })
        if (this.isBlockly) languages = languages.filter((l) => l.contentType === this.GRAALJS_MIME_TYPE)
        this.$set(this, 'languages', languages)
        return Promise.resolve()
      })
    },
    load () {
      if (this.loading) return
      this.loading = true

      Promise.all([this.$oh.api.get('/rest/module-types?type=trigger'), this.$oh.api.get('/rest/module-types?type=condition'), this.$oh.api.get('/rest/rules/' + this.ruleId)]).then((data) => {
        this.$set(this.moduleTypes, 'triggers', data[0])
        this.$set(this.moduleTypes, 'conditions', data[1])
        this.$set(this, 'rule', data[2])

        if (this.moduleId) {
          this.$set(this, 'currentModule', this.rule.actions.concat(this.rule.conditions).find((m) => m.id === this.moduleId))
        } else {
          this.$set(this, 'currentModule', this.rule.actions.find((m) => m.id === 'script' || m.configuration.script))
          this.isScriptRule = true
        }

        this.mode = this.currentModule.configuration.type

        this.initDirty()

        if (!this.rule.editable) {
          const commentChar = AUTOMATION_LANGUAGES[this.mode]?.commentChar
          let preamble = `${commentChar} Triggers:\n`
          for (const trigger of this.rule.triggers) {
            const triggerModuleType = this.moduleTypes.triggers.find((t) => t.uid === trigger.type)
            let description = trigger.label || this.suggestedModuleTitle(trigger, triggerModuleType, 'trigger')
            if (triggerModuleType.uid === 'timer.GenericCronTrigger') {
              description = description.charAt(0).toUpperCase() + description.slice(1)
            } else {
              description = 'When ' + description
            }
            preamble += `${commentChar} - ${description}\n`
          }

          if (this.rule.conditions.length > 0) {
            preamble += `\n${commentChar} Conditions:\n`
            for (const condition of this.rule.conditions) {
              const conditionModuleType = this.moduleTypes.conditions.find((t) => t.uid === condition.type)
              let description = condition.label || this.suggestedModuleTitle(condition, conditionModuleType, 'condition')
              description = 'Only If ' + description
              preamble += `${commentChar} - ${description}\n`
            }
          }

          this.script = preamble + '\n' + this.script
        }

        this.loadScriptModuleTypes().then(() => {
          if (this.rule.editable && this.mode === 'application/javascript;version=ECMAScript-2021') {
            const message = 'Your JavaScript script was created with a previous version of openHAB. Please save your script.'

            this.changeLanguage(this.GRAALJS_MIME_TYPE)
            this.$f7.dialog.alert(message)
          }

          this.loading = false
          this.ready = true
          if (!this.eventSource) this.startEventSource()
        })
      })
    },
    save (noToast) {
      if (!this.editable) return
      if (this.rule.status.status === 'RUNNING') {
        this.$f7.toast.create({
          text: `${this.isScriptRule ? 'Script' : 'Rule'} cannot be updated while running, please wait!`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        return Promise.reject('saveWhileRunningRejected')
      }
      if (this.isBlockly) {
        try {
          if (!this.blocklyCodePreview) {
            this.currentModule.configuration.blockSource = this.$refs.blocklyEditor.getBlocks()
            this.script = this.$refs.blocklyEditor.getCode()
          } else {
            this.$f7.toast.create({
              text: 'Running / saving is only supported in block mode!<br>Please switch back from code preview to block editor.',
              position: 'center',
              icon: '<i class="f7-icons">exclamationmark_bubble</i>',
              destroyOnClose: true,
              closeTimeout: 3000
            }).open()
            return Promise.reject('saveOnCodePreviewRejected')
          }
        } catch (e) {
          this.$f7.dialog.alert(e)
          return Promise.reject(e)
        }
      }
      this.currentModule.configuration.script = this.script
      this.currentModule.configuration.type = this.mode
      return this.$oh.api.put('/rest/rules/' + this.rule.uid, this.rule).then((data) => {
        this.initDirty()
        this.resetDirty()
        if (!noToast) {
          this.$f7.toast.create({
            text: (this.isScriptRule ? 'Script' : 'Rule') + ' updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    onSave () {
      this.save().catch((e) => { if (!['saveWhileRunningRejected', 'saveOnCodePreviewRejected'].includes(e)) { throw (e) } })
    },
    changeLanguage (contentType) {
      if (this.createMode) return
      this.mode = contentType
    },
    toggleDisabled () {
      if (this.createMode) return
      const enable = (this.rule.status.statusDetail === 'DISABLED')
      this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/enable', enable.toString()).then((data) => {
        this.$f7.toast.create({
          text: (this.isScriptRule ? 'Script' : 'Rule') + (enable ? ' enabled' : ' disabled'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while disabling or enabling: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    runNow () {
      if (this.createMode) return
      if (!this.isMimeTypeAvailable(this.mode)) {
        return this.$f7.toast.create({
          text: `${this.isScriptRule ? 'Script' : 'Rule'} cannot be run, scripting addon for ${this.mimeTypeDescription(this.mode)} is not installed`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }
      if (this.rule.status.status === 'RUNNING' || this.rule.status.status === 'UNINITIALIZED') {
        return this.$f7.toast.create({
          text: `${this.isScriptRule ? 'Script' : 'Rule'} cannot be run ${(this.rule.status.status === 'RUNNING') ? 'while already running, please wait' : 'if it is uninitialized'}!`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }

      const run = (saveBefore) => {
        const savePromise = saveBefore ? this.save(true) : Promise.resolve()
        savePromise.then(() => {
          this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/runnow', '').then(
            this.$f7.toast.create({
              text: 'Running ' + (this.isScriptRule ? 'script' : 'rule'),
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          ).catch((err) => {
            this.$f7.toast.create({
              text: 'Error while running: ' + err,
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          })
        }).catch((e) => { if (e !== 'saveOnCodePreviewRejected') { throw (e) } })
      }

      if (this.editable && this.dirty) {
        this.$f7.dialog.confirm(
          'Do you want to save the changes before running the script?',
          'Changes have not been saved',
          () => run(this),
          () => {}
        )
      } else {
        run(false)
      }
    },
    duplicateRule () {
      let ruleClone = cloneDeep(this.rule)
      this.$f7router.navigate({
        url: '/settings/scripts/duplicate'
      }, {
        props: {
          ruleCopy: ruleClone
        }
      })
    },
    deleteRule () {
      this.$f7.dialog.confirm(
        `Are you sure you want to delete ${this.rule.name}?`,
        'Delete ' + (this.isScriptRule ? 'Script' : 'Rule'),
        () => {
          this.$oh.api.delete('/rest/rules/' + this.rule.uid).then(() => {
            this.dirty = false
            this.$f7router.back('/settings/scripts/', { force: true })
          })
        }
      )
    },
    onBlocklyMounted () {
      this.blocklyRenderer = this.$refs.blocklyEditor.getCurrentRenderer()
      this.blocklyRenderers = this.$refs.blocklyEditor.getRenderers()
      if (this.$store.state.pagePath.indexOf('?blockly') < 0) {
        // A hint for 'help-sidebar.vue' to differentiate blockly vs normal script
        this.$store.commit('setPagePath', this.$store.state.pagePath + '?blockly')
      }
    },
    onBlocklyReady () {
      if (!this.isBlockly) return
      let message = ''

      // Make sure the MIME type is set correctly for Blockly rules and the saved script is up to date
      if (this.script) {
        let oldRule = false
        if (this.mode !== this.GRAALJS_MIME_TYPE) {
          this.mode = this.GRAALJS_MIME_TYPE
          oldRule = true
        } else {
          // Get the new code, and if it is different from stored code, it was created with an older version
          try {
            const newScript = this.$refs.blocklyEditor.getCode()
            if (newScript && (this.script !== newScript)) {
              this.scriptDirty = true
              oldRule = true
            }
          } catch (e) {
            this.$f7.dialog.alert(e)
          }
        }
        if (oldRule) message += 'Your Blockly script was created with a previous version of openHAB. Please save your script'
      }

      // Check if JS Scripting is installed
      if (!this.isJsAvailable) message += (message ? ' and' : 'You do not have JS Scripting installed. Please') + ' install the JS Scripting addon'

      if (message) this.$f7.dialog.alert(message + '.')
    },
    setBlocklyRenderer (newRenderer) {
      this.blocklyRenderer = newRenderer
      this.$refs.blocklyEditor.changeRenderer(this.blocklyRenderer)
    },
    setBlocklyShowLabels (showLabels) {
      this.blocklyShowLabels = showLabels
      this.$refs.blocklyEditor.showHideLabels(this.blocklyShowLabels)
    },
    showBlocklyCode () {
      if (this.blocklyCodePreview) return

      try {
        this.currentModule.configuration.blockSource = this.$refs.blocklyEditor.getBlocks()
        this.script = this.$refs.blocklyEditor.getCode()
        this.currentModule.configuration.blockSource = (this.script) ? this.$refs.blocklyEditor.getBlocks() : undefined
        if (this.isBlockly) this.blocklyCodePreview = true
      } catch (e) {
        this.$f7.dialog.alert(e)
      }
    },
    convertToBlockly () {
      if (this.script || this.isBlockly || this.mode !== this.GRAALJS_MIME_TYPE) return
      this.$set(this.currentModule.configuration, 'blockSource', '<xml xmlns="https://developers.google.com/blockly/xml"></xml>')
    },
    onEditorInput (value) {
      this.script = value
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/rules/' + this.ruleId + '/*', null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'state':
            this.$set(this.rule, 'status', JSON.parse(event.payload)) // e.g. {"status":"RUNNING","statusDetail":"NONE"}
            break
          case 'added':
          case 'updated':
            if (!this.dirty) {
              this.load()
            }
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 66:
            if (this.isBlockly) {
              if (this.blocklyCodePreview) {
                this.blocklyCodePreview = false
              } else {
                this.showBlocklyCode()
              }
            } else {
              this.convertToBlockly()
            }
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 68:
            this.toggleDisabled()
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 82:
            this.runNow()
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 83:
            this.onSave()
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    }
  },
  created () {
    this.GRAALJS_MIME_TYPE = 'application/javascript'
  }
}
</script>
