<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar :title="(createMode) ? 'Create rule' : rule.name" back-link="Back" no-hairline>
      <f7-nav-right>
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
              <f7-link icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round" icon-size="32" color="blue" @click="runNow"></f7-link>
            </div>
            Status:
            <f7-chip class="margin-left"
              :text="rule.status.status"
              :color="(rule.status.status === 'RUNNING') ? 'orange' : (rule.status.status != 'IDLE') ? 'red' : ''"
            >{{rule.status.status}}</f7-chip>
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
                            @input="rule.uid = $event.target.value" clear-button>
              </f7-list-input>
              <f7-list-input label="Name" type="text" placeholder="Required" :value="rule.name" required validate
                            @input="rule.name = $event.target.value" clear-button>
              </f7-list-input>
              <f7-list-input label="Description" type="text" :value="rule.description"
                            @input="rule.description = $event.target.value" clear-button>
              </f7-list-input>
            </f7-list>
          </f7-col>
          <f7-col class="text-align-right justify-content-flex-end">
            <div class="no-padding float-right">
              <f7-button @click="toggleModuleControls" small outline :fill="showModuleControls" sortable-toggle=".sortable" style="margin-top: -3px; margin-right: 5px"
                color="gray" icon-size="12" icon-ios="material:wrap_text" icon-md="material:wrap_text" icon-aurora="material:wrap_text">&nbsp;Reorder</f7-button>
            </div>
          </f7-col>
          <f7-col class="rule-modules" v-for="section in ['triggers', 'actions', 'conditions']" :key="section">
            <f7-block-title>{{sectionLabels[section][0]}}</f7-block-title>
            <f7-list sortable swipeout media-list @sortable:sort="(ev) => reorderModule(ev, section)">
              <f7-list-item media
                  :title="mod.label || suggestedModuleTitle(mod, null, section)"
                  :footer="mod.description || suggestedModuleDescription(mod, null, section)"
                  v-for="mod in rule[section]" :key="mod.id"
                  :link="!showModuleControls" @click.native="(ev) => editModule(ev, section, mod)" swipeout>
                <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled" icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline" @click="showSwipeout"></f7-link>
                <f7-link slot="after" v-if="mod.type === 'script.ScriptAction'" icon-f7="pencil_ellipsis_rectangle" color="gray" @click.native="(ev) => editScriptDirect(ev, mod)" tooltip="Edit script"></f7-link>
                <f7-link slot="after" v-if="mod.type === 'timer.GenericCronTrigger'" icon-f7="calendar" color="gray" @click.native="(ev) => buildCronExpression(ev, mod)" tooltip="Build cron expression"></f7-link>
                <f7-swipeout-actions right>
                  <f7-swipeout-button @click="(ev) => deleteModule(ev, section, mod)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">Delete</f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
            </f7-list>
            <f7-list>
              <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'" :subtitle="sectionLabels[section][1]" @click="addModule(section)">
                <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point"></f7-icon>
              </f7-list-item>
              <!-- <f7-list-button :color="(showModuleControls) ? 'gray' : 'blue'" :title="sectionLabels[section][1]"></f7-list-button> -->
            </f7-list>
          </f7-col>
          <f7-col>
            <f7-block-title>Tags</f7-block-title>
            <semantics-picker :item="rule"></semantics-picker>
            <tag-input :item="rule"></tag-input>
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
            <f7-list-item radio v-for="moduleType in moduleTypes[currentSection].filter((t) => t.visibility === 'VISIBLE')"
              :value="moduleType.uid"
              @change="currentModule.type = moduleType.uid; currentModuleType = moduleType; $set(currentModule, 'configuration', {})"
              :checked="currentModule.type === moduleType.uid"
              :key="moduleType.uid" :title="moduleType.label" name="module-type"></f7-list-item>
          </f7-list>
          <f7-list v-else>
            <f7-list-item :title="sectionLabels[currentSection][0]" ref="moduleTypeSmartSelect" smart-select :smart-select-params="{ view: $f7.views.main, openIn: 'popup', closeOnSelect: true }">
              <select name="currentModuleType"
                @change="currentModuleType = moduleTypes[currentSection].find((t) => t.uid === $refs.moduleTypeSmartSelect.f7SmartSelect.getValue());
                         currentModule.type = currentModuleType.uid;
                         currentModule.label = currentModule.description = '';
                         $set(currentModule, 'configuration', {})">
                <option v-for="moduleType in moduleTypes[currentSection].filter((t) => t.visibility === 'VISIBLE')"
                  :value="moduleType.uid" :key="moduleType.uid" :selected="currentModuleType.uid === moduleType.uid">
                  {{moduleType.label}}
                </option>
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

    <script-editor-popup v-if="currentModule" title="Edit Script" popup-id="edit-rule-script-direct-popup" :value="scriptCode" :fullscreen="false" :opened="codeEditorOpened" @closed="codePopupClosed"></script-editor-popup>
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
import cronstrue from 'cronstrue'
import YAML from 'yaml'

// import ConfigParameter from '@/components/config/config-parameter.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'
import SemanticsPicker from '@/components/tags/semantics-picker.vue'
import TagInput from '@/components/tags/tag-input.vue'
// import RuleConfigureModulePage from './rule-configure-module.vue'

const ScriptEditorPopup = () => import('@/components/config/controls/script-editor-popup.vue')
import CronEditor from '@/components/config/controls/cronexpression-editor.vue'

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export default {
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
            uid: uuidv4().split('-')[0],
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
      if (this.currentTab === 'code') {
        if (!this.fromYaml()) {
          return
        }
      }
      // TODO properly validate rule
      if (!this.rule.uid) return
      if (!this.rule.name) return
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
      this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/runnow', '').then((data) => {
        this.$f7.toast.create({
          text: 'Running rule',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while running rule: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/rules/*/*', null, (event) => {
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
      if (ev.keyCode === 83 && (ev.ctrlKey || ev.metaKey)) {
        this.save(!this.createMode)
        ev.stopPropagation()
        ev.preventDefault()
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
      this.rule[section].splice(ev.detail.to, 0, this.rule[section].splice(ev.detail.from, 1)[0])
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
      this.currentModule.configuration.script = value
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
    suggestedModuleTitle (mod, moduleType, section) {
      if (!moduleType) {
        moduleType = this.moduleTypes[section].find((m) => m.uid === mod.type)
        if (!moduleType) return 'Name'
      }
      const config = mod.configuration
      switch (moduleType.uid) {
        // triggers
        case 'timer.TimeOfDayTrigger':
          if (!config.time) return moduleType.label
          return 'When the time is ' + config.time
        case 'timer.GenericCronTrigger':
          if (!config.cronExpression) return moduleType.label
          try {
            return cronstrue.toString(config.cronExpression, {
              use24HourTimeFormat: true
            })
          } catch (err) {
            return err.toString()
          }
        case 'core.ItemCommandTrigger':
          if (!config.itemName || !config.command) return moduleType.label
          return 'When ' + config.itemName + ' received command ' + config.command
        case 'core.ItemStateUpdateTrigger':
          if (!config.itemName) return moduleType.label
          return 'When ' + config.itemName + ' was updated' +
                        ((config.state) ? ' to ' + config.state : '')
        case 'core.ItemStateChangeTrigger':
          if (!config.itemName) return moduleType.label
          return 'When ' + config.itemName + ' changed' +
              ((config.previousState) ? ' from ' + config.previousState : '') +
              ((config.state) ? ' to ' + config.state : '')
        case 'core.ChannelEventTrigger':
          if (!config.channelUID) return moduleType.label
          return 'When channel ' + config.channelUID + ' was triggered'
        // actions
        case 'core.ItemCommandAction':
          if (!config.itemName || !config.command) return moduleType.label
          return 'Send command ' + config.command + ' to ' + config.itemName
        case 'media.SayAction':
          if (!config.text) return moduleType.label
          return 'Say "' + config.text + '"'
        case 'media.PlaySound':
          if (!config.sound) return moduleType.label
          return 'Say ' + config.sound
        // conditions
        case 'timer.DayOfWeekCondition':
          if (!config.days || !config.days.join || !config.days.length) return moduleType.label
          return 'If the day is ' + config.days.join(',')
        case 'core.TimeOfDayCondition':
          if (!config.startTime || !config.endTime) return moduleType.label
          return 'If the time is between ' + config.startTime + ' and ' + config.endTime
        case 'core.ItemStateCondition':
          if (!config.itemName || !config.operator || !config.state) return moduleType.label
          return 'If ' + config.itemName + ' ' + config.operator + ' ' + config.state

        default:
          return moduleType.label
      }
    },
    suggestedModuleDescription (mod, moduleType, section) {
      if (!moduleType) {
        moduleType = this.moduleTypes[section].find((m) => m.uid === mod.type)
        if (!moduleType) return 'Description'
      }
      const config = mod.configuration
      switch (moduleType.uid) {
        // triggers
        case 'timer.GenericCronTrigger':
          if (!config.cronExpression) return moduleType.description
          return 'Cron: ' + config.cronExpression

        default:
          return moduleType.description
      }
    }
  },
  computed: {
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
