<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar :title="(createMode) ? 'Create rule' : rule.name" back-link="Back" no-hairline>
      <f7-nav-right v-if="isEditable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'design'; fromYaml()" :tab-link-active="currentTab === 'design'" class="tab-link">Design</f7-link>
      <f7-link @click="currentTab = 'code'; toYaml()" :tab-link-active="currentTab === 'code'" class="tab-link">Code</f7-link>
    </f7-toolbar>
    <f7-tabs class="sitemap-editor-tabs">
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="ready && rule.status && !createMode" class="block-narrow padding-left padding-right" strong>
          <f7-col v-if="!createMode">
            <div class="float-right align-items-flex-start align-items-center">
              <!-- <f7-toggle class="enable-toggle"></f7-toggle> -->
              <f7-link :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'" icon-ios="f7:pause_circle" icon-md="f7:pause_circle" icon-aurora="f7:pause_circle" icon-size="32" color="orange" @click="toggleDisabled"></f7-link>
              <f7-link :tooltip="'Run Now' + (($device.desktop) ? ' (Ctrl-R)' : '')" icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round" icon-size="32" color="blue" @click="runNow"></f7-link>
            </div>
            Status:
            <f7-chip class="margin-left"
              :text="rule.status.status"
              :color="(rule.status.status === 'RUNNING') ? 'orange' : (rule.status.status != 'IDLE') ? 'red' : ''"
            />
            <div v-if="rule.status.statusDetail !== 'NONE' || rule.status.description">
              <strong
                v-if="rule.status.statusDetail !== 'NONE'"
              >{{rule.status.statusDetail}}</strong>
              <br>
              <div v-if="rule.status.description">{{rule.status.description}}</div>
            </div>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block v-else-if="!createMode" class="block-narrow padding-left padding-right skeleton-text skeleton-effect-blink" strong>
          <f7-col>______:
            <f7-chip class="margin-left" text="________"></f7-chip>
            <div>
              <strong>____ _______</strong>
              <br>
            </div>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready" class="block-narrow">
          <f7-col>
            <f7-list inline-labels no-hairlines-md>
              <f7-list-input label="Unique ID" type="text" placeholder="Required" :value="rule.uid" required validate
                            :disabled="!createMode" :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
                            @input="rule.uid = $event.target.value" :clear-button="createMode">
              </f7-list-input>
              <f7-list-input label="Name" type="text" placeholder="Required" :value="rule.name" required validate
                            :disabled="!isEditable" @input="rule.name = $event.target.value" :clear-button="isEditable">
              </f7-list-input>
              <f7-list-input label="Description" type="text" :value="rule.description"
                            :disabled="!isEditable" @input="rule.description = $event.target.value" :clear-button="isEditable">
              </f7-list-input>
            </f7-list>
          </f7-col>
          <f7-block-footer v-if="!isEditable" class="no-margin padding-left"><f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: this rule is not editable because it has been provisioned from a file.</f7-block-footer>
          <f7-col v-if="isEditable" class="text-align-right justify-content-flex-end">
            <div class="no-padding float-right">
              <f7-button @click="toggleModuleControls" small outline :fill="showModuleControls" sortable-toggle=".sortable" style="margin-top: -3px; margin-right: 5px"
                color="gray" icon-size="12" icon-ios="material:wrap_text" icon-md="material:wrap_text" icon-aurora="material:wrap_text">&nbsp;Reorder</f7-button>
            </div>
          </f7-col>
          <f7-col class="rule-modules" v-for="section in ['triggers', 'actions', 'conditions']" :key="section">
            <f7-block-title v-if="isEditable || rule[section].length > 0">{{sectionLabels[section][0]}}</f7-block-title>
            <f7-list sortable swipeout media-list @sortable:sort="(ev) => reorderModule(ev, section)">
              <f7-list-item media
                  :title="mod.label || suggestedModuleTitle(mod, null, section)"
                  :footer="mod.description || suggestedModuleDescription(mod, null, section)"
                  v-for="mod in rule[section]" :key="mod.id"
                  :link="isEditable && !showModuleControls" @click.native="(ev) => editModule(ev, section, mod)" swipeout>
                <f7-link slot="media" v-if="isEditable" icon-color="red" icon-aurora="f7:minus_circle_filled" icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline" @click="showSwipeout"></f7-link>
                <f7-link slot="after" v-if="mod.type === 'script.ScriptAction'" icon-f7="pencil_ellipsis_rectangle" color="gray" @click.native="(ev) => editScriptDirect(ev, mod)" tooltip="Edit script"></f7-link>
                <f7-link slot="after" v-if="mod.type === 'timer.GenericCronTrigger' && isEditable" icon-f7="calendar" color="gray" @click.native="(ev) => buildCronExpression(ev, mod)" tooltip="Build cron expression"></f7-link>
                <f7-swipeout-actions right v-if="isEditable">
                  <f7-swipeout-button @click="(ev) => deleteModule(ev, section, mod)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">Delete</f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
            </f7-list>
            <f7-list v-if="isEditable">
              <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'" :subtitle="sectionLabels[section][1]" @click="addModule(section)">
                <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point"></f7-icon>
              </f7-list-item>
              <!-- <f7-list-button :color="(showModuleControls) ? 'gray' : 'blue'" :title="sectionLabels[section][1]"></f7-list-button> -->
            </f7-list>
          </f7-col>
          <f7-col v-if="isEditable || rule.tags.length > 0">
            <f7-block-title>Tags</f7-block-title>
            <semantics-picker v-if="isEditable" :item="rule"></semantics-picker>
            <tag-input :item="rule" :disabled="!isEditable"></tag-input>
          </f7-col>
        </f7-block>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="rule-code-editor" mode="text/x-yaml" :value="ruleYaml" @input="(value) => ruleYaml = value" />
        <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre>
      </f7-tab>
    </f7-tabs>

    <f7-popup ref="modulePopup" class="moduleconfig-popup" close-on-escape :opened="moduleConfigOpened" @popupClosed="moduleConfigClosed">
      <f7-page>
        <f7-navbar>
          <f7-nav-left>
            <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" popup-close></f7-link>
          </f7-nav-left>
          <f7-nav-title v-if="currentModule && currentModule.new">{{sectionLabels[currentSection][1]}}</f7-nav-title>
          <f7-nav-title v-else>Edit module</f7-nav-title>
          <f7-nav-right>
            <f7-link v-show="currentModuleType" @click="saveModule">Done</f7-link>
          </f7-nav-right>
        </f7-navbar>
        <f7-block v-if="currentModule">
          <f7-col>
            <f7-list inline-labels no-hairlines-md class="no-margin">
              <f7-list-input type="text" :placeholder="currentSuggestedModuleTitle" :value="currentModule.label" required
                            @input="currentModule.label = $event.target.value" clear-button>
              </f7-list-input>
              <f7-list-input type="text" :placeholder="currentSuggestedModuleDescription" :value="currentModule.description"
                            @input="currentModule.description = $event.target.value" clear-button>
              </f7-list-input>
            </f7-list>
          </f7-col>
          <f7-block-footer class="no-margin padding-left"><small>Tip: leave fields blank to set automatically to the suggested name and description. <f7-link @click="currentModule.label = null; currentModule.description = null">Clear</f7-link></small></f7-block-footer>

          <f7-block-title>Type of {{currentSection.replace(/.$/, '')}}</f7-block-title>
          <f7-list v-if="!currentModuleType">
            <ul v-for="(mt, scope) in groupedModuleTypes(currentSection)" :key="scope">
              <f7-list-item divider :title="scope" />
              <f7-list-item radio v-for="moduleType in mt"
                :value="moduleType.uid"
                @change="currentModule.type = moduleType.uid; currentModuleType = moduleType; $set(currentModule, 'configuration', {})"
                :checked="currentModule.type === moduleType.uid"
                :key="moduleType.uid" :title="moduleType.label" name="module-type"></f7-list-item>
            </ul>
          </f7-list>
          <f7-list v-else>
            <f7-list-item :title="sectionLabels[currentSection][0]" ref="moduleTypeSmartSelect" smart-select :smart-select-params="{ view: $f7.views.main, openIn: 'popup', closeOnSelect: true }">
              <select name="currentModuleType"
                @change="currentModuleType = moduleTypes[currentSection].find((t) => t.uid === $refs.moduleTypeSmartSelect.f7SmartSelect.getValue());
                         currentModule.type = currentModuleType.uid;
                         currentModule.label = currentModule.description = '';
                         $set(currentModule, 'configuration', {})">
                <optgroup v-for="(mt, scope) in groupedModuleTypes(currentSection)" :key="scope" :label="scope">
                  <option v-for="moduleType in mt"
                    :value="moduleType.uid" :key="moduleType.uid" :selected="currentModuleType.uid === moduleType.uid">
                    {{moduleType.label}}
                  </option>
                </optgroup>
              </select>
            </f7-list-item>
          </f7-list>
          <f7-block-title v-if="currentModule && currentModuleType" style="margin-bottom: calc(var(--f7-block-title-margin-bottom) - var(--f7-list-margin-vertical))">Configuration</f7-block-title>
          <f7-col v-if="currentModule && currentModuleType">
            <config-sheet :key="currentSection + currentModule.id"
              :parameterGroups="[]"
              :parameters="currentModuleType.configDescriptions"
              :configuration="currentModule.configuration"
              @updated="dirty = true"
            />
          </f7-col>
        </f7-block>
      </f7-page>
    </f7-popup>

    <script-editor-popup v-if="currentModule" title="Edit Script" ref="codePopup" popup-id="edit-rule-script-direct-popup" :value="scriptCode" :fullscreen="false" :opened="codeEditorOpened" @closed="codePopupClosed"></script-editor-popup>
    <cron-editor popup-id="edit-rule-cron-popup" :value="cronExpression" :opened="cronPopupOpened" @closed="cronPopupOpened = false" @input="(value) => updateCronExpression(value)" />
  </f7-page>
</template>

<style lang="stylus">
.enable-toggle
  vertical-align inherit
.moduleconfig-popup
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
  height calc(80% - 2*var(--f7-navbar-height))
  width 100%
.yaml-message
  display block
  position absolute
  top 80%
  white-space pre-wrap

</style>

<script>
import YAML from 'yaml'

// import ConfigParameter from '@/components/config/config-parameter.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'
import SemanticsPicker from '@/components/tags/semantics-picker.vue'
import TagInput from '@/components/tags/tag-input.vue'
// import RuleConfigureModulePage from './rule-configure-module.vue'

import ScriptEditorPopup from '@/components/config/controls/script-editor-popup.vue'
import CronEditor from '@/components/config/controls/cronexpression-editor.vue'

import ModuleDescriptionSuggestions from './module-description-suggestions'

export default {
  mixins: [ModuleDescriptionSuggestions],
  components: {
    ConfigSheet,
    SemanticsPicker,
    TagInput,
    ScriptEditorPopup,
    CronEditor,
    'editor': () => import('@/components/config/controls/script-editor.vue')
  },
  props: ['ruleId', 'createMode', 'schedule'],
  data () {
    return {
      ready: false,
      loading: false,
      dirty: false,
      rule: {},
      ruleYaml: '',
      moduleTypes: {
        actions: [],
        conditions: [],
        triggers: []
      },
      moduleConfigOpened: false,
      showModuleControls: false,
      currentSection: 'actions',
      currentTab: 'design',
      currentModuleType: null,
      currentModule: null,
      currentModuleConfig: {},
      sectionLabels: {
        triggers: ['When', 'Add Trigger'],
        actions: ['Then', 'Add Action'],
        conditions: ['But only if', 'Add Condition']
      },
      eventSource: null,
      keyHandler: null,

      codeEditorOpened: false,
      cronPopupOpened: false,
      scriptCode: '',
      cronExpression: null
    }
  },
  methods: {
    onPageAfterIn () {
      if (this.ready) return
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      this.load()
    },
    onPageAfterOut () {
      this.stopEventSource()
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    load () {
      if (this.loading) return
      this.loading = true

      const loadModules1 = this.$oh.api.get('/rest/module-types?type=action')
      const loadModules2 = this.$oh.api.get('/rest/module-types?type=condition')
      const loadModules3 = this.$oh.api.get('/rest/module-types?type=trigger')
      Promise.all([loadModules1, loadModules2, loadModules3]).then((data) => {
        this.moduleTypes.actions = data[0]
        this.moduleTypes.conditions = data[1]
        this.moduleTypes.triggers = data[2]
        if (this.createMode) {
          this.$set(this, 'rule', {
            uid: this.$f7.utils.id(),
            name: '',
            triggers: [],
            actions: [],
            conditions: [],
            tags: (this.schedule) ? ['Schedule'] : [],
            configuration: {},
            visibility: 'VISIBLE',
            status: {
              status: 'NEW'
            }
          })
          this.ready = true
          this.loading = false
          // no need for an event source, the rule doesn't exist yet
          return
        }
        this.$oh.api.get('/rest/rules/' + this.ruleId).then((data2) => {
          this.$set(this, 'rule', data2)
          this.ready = true
          this.loading = false

          if (!this.eventSource) this.startEventSource()
        })
      })
    },
    save (stay) {
      if (!this.isEditable) return
      if (this.currentTab === 'code') {
        if (!this.fromYaml()) {
          return
        }
      }
      if (!this.rule.uid) {
        this.$f7.dialog.alert('Please give an ID to the rule')
        return
      }
      if (!this.rule.name) {
        this.$f7.dialog.alert('Please give a name to the rule')
        return
      }
      if (this.codeEditorOpened) {
        // save the code currently being edited if the dialog is open
        // this allows to hit ctrl-S to save (and ctrl-R to run the rule) while editing the code
        // without closing the window
        this.currentModule.configuration.script = this.$refs.codePopup.code
      }
      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/rules', JSON.stringify(this.rule), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/rules/' + this.rule.uid, this.rule)
      promise.then((data) => {
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Rule created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.load()
        } else {
          this.$f7.toast.create({
            text: 'Rule updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
        if (!stay) this.$f7router.back()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving rule: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    toggleDisabled () {
      if (this.createMode) return
      const enable = (this.rule.status.statusDetail === 'DISABLED')
      this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/enable', enable.toString()).then((data) => {
        this.$f7.toast.create({
          text: (enable) ? 'Rule enabled' : 'Rule disabled',
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
      if (this.rule.status === 'RUNNING') return
      this.$f7.toast.create({
        text: 'Running rule',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
      this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/runnow', '').catch((err) => {
        this.$f7.toast.create({
          text: 'Error while running rule: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/rules/' + this.ruleId + '/*', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'state':
            this.$set(this.rule, 'status', JSON.parse(event.payload))
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    keyDown (ev) {
      if (ev.ctrlKey || ev.metakKey) {
        switch (ev.keyCode) {
          case 82:
            this.runNow()
            ev.stopPropagation()
            ev.preventDefault()
            break
          case 83:
            this.save(!this.createMode)
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    },
    toggleModuleControls () {
      this.showModuleControls = !this.showModuleControls
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        this.$f7.swipeout.open(swipeoutElement)
      }
    },
    editModule (ev, section, mod) {
      if (this.showModuleControls) return
      if (!this.isEditable) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      if (swipeoutElement && swipeoutElement.classList.contains('swipeout-opened')) return
      this.currentSection = section
      this.currentModule = Object.assign({}, mod)
      this.currentModuleType = this.moduleTypes[section].find((m) => m.uid === mod.type)
      this.$refs.modulePopup.f7Popup.open()
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
        type: '',
        new: true
      }

      // this.rule[section].push(newModule)
      this.currentSection = section
      this.currentModule = newModule
      this.currentModuleType = null
      this.$refs.modulePopup.f7Popup.open()
    },
    reorderModule (ev, section) {
      const newSection = [...this.rule[section]]
      newSection.splice(ev.to, 0, newSection.splice(ev.from, 1)[0])
      this.$set(this.rule, section, newSection)
    },
    saveModule () {
      if (!this.currentModule.type) return
      if (this.currentModule.new) {
        delete this.currentModule.new
        this.rule[this.currentSection].push(this.currentModule)
      } else {
        const idx = this.rule[this.currentSection].findIndex((m) => m.id === this.currentModule.id)
        this.$set(this.rule[this.currentSection], idx, this.currentModule)
      }
      // if (!this.currentModule.label) this.currentModule.label = this.suggestedModuleTitle
      // if (!this.currentModule.description) this.currentModule.description = this.suggestedModuleDescription
      this.moduleConfigOpened = false
      this.$refs.modulePopup.f7Popup.close()
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
      setTimeout(() => { this.codeEditorOpened = true })
    },
    buildCronExpression (ev, mod) {
      ev.cancelBubble = true
      this.currentModule = mod
      this.currentModuleType = mod.type
      this.cronExpression = mod.configuration.cronExpression
      this.cronPopupOpened = true
    },
    codePopupClosed (value) {
      this.codeEditorOpened = false
      if (this.isEditable) this.currentModule.configuration.script = value
      this.currentModule = null
      this.currentModuleType = null
    },
    updateCronExpression (value) {
      this.currentModule.configuration.cronExpression = value
      this.currentModule = null
      this.currentModuleType = null
    },
    toYaml () {
      this.ruleYaml = YAML.stringify({
        triggers: this.rule.triggers,
        conditions: this.rule.conditions,
        actions: this.rule.actions
      })
    },
    fromYaml () {
      if (!this.isEditable) return
      try {
        const updatedModules = YAML.parse(this.ruleYaml)
        this.$set(this.rule, 'triggers', updatedModules.triggers)
        this.$set(this.rule, 'conditions', updatedModules.conditions)
        this.$set(this.rule, 'actions', updatedModules.actions)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    },
    groupedModuleTypes (section) {
      const moduleTypes = this.moduleTypes[section].filter((t) => t.visibility === 'VISIBLE')
      let moduleTypesByScope = moduleTypes.reduce((prev, type, i, types) => {
        const scope = type.uid.split('.')[0]
        if (!prev[scope]) {
          prev[scope] = [type]
        } else {
          prev[scope] = [...prev[scope], type].sort((t1, t2) => t1.label.localeCompare(t2.label))
        }
        return prev
      }, {})
      return Object.keys(moduleTypesByScope).sort((s1, s2) => (s1 === 'core') ? -1 : (s2 === 'core') ? 1 : s1.localeCompare(s2))
        .reduce((prev, key) => {
          prev[key] = moduleTypesByScope[key]
          return prev
        }, {})
    }
  },
  computed: {
    isEditable () {
      return this.rule && this.rule.editable !== false
    },
    currentSuggestedModuleTitle () {
      if (!this.currentModule || !this.currentModuleType) return 'Title'
      return this.suggestedModuleTitle(this.currentModule, this.currentModuleType)
    },
    currentSuggestedModuleDescription () {
      if (!this.currentModule || !this.currentModuleType) return 'Description'
      return this.suggestedModuleDescription(this.currentModule, this.currentModuleType)
    },
    yamlError () {
      if (this.currentTab !== 'code') return null
      try {
        YAML.parse(this.ruleYaml, { prettyErrors: true })
        return 'OK'
      } catch (e) {
        return e
      }
    }
  }
}
</script>
