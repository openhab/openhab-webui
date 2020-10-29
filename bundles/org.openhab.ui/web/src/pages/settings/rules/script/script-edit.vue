<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar :title="pageTitle" :subtitle="mode" back-link="Back">
      <f7-nav-right v-if="isEditable && !newScript">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span></f7-link>
      </f7-nav-right>
      <f7-nav-right v-else-if="isEditable && newScript">
        <f7-link @click="createScript" v-if="$theme.md && newScript" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="createScript" v-if="$theme.ios && newScript">Create</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar v-if="!newScript && ready" position="bottom">
      <span class="display-flex flex-direction-row">
        <f7-link :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'" :tooltip="((rule.status.statusDetail === 'DISABLED') ? 'Enable' : 'Disable') + (($device.desktop) ? ' (Ctrl-D)' : '')" icon-ios="f7:pause_circle" icon-md="f7:pause_circle" icon-aurora="f7:pause_circle" color="orange" @click="toggleDisabled"></f7-link>
        <f7-link v-if="!$theme.aurora" :tooltip="'Run Now' + (($device.desktop) ? ' (Ctrl-R)' : '')" icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round" color="blue" @click="runNow"></f7-link>
        <f7-link v-else class="margin-left" :text="'Run Now' + (($device.desktop) ? ' (Ctrl-R)' : '')" icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round" color="blue" @click="runNow"></f7-link>
      </span>
      <span class="display-flex flex-direction-row align-items-center">
        <f7-chip class="margin-right"
          :text="ruleStatusBadgeText(rule.status)"
          :color="ruleStatusBadgeColor(rule.status)"
          :tooltip="rule.status.description"
        />
        <f7-link v-if="isScriptRule" class="right details-link padding-right" ref="detailsLink" @click="detailsOpened = true" icon-f7="chevron_up"></f7-link>
      </span>
    </f7-toolbar>
    <editor v-if="ready && !newScript" class="rule-script-editor" :mode="mode" :value="script" @input="(value) => { script = value; dirty = true }" :tern-autocompletion-hook="true" />
    <script-general-settings v-else-if="createMode" :createMode="newScript" :rule="rule" />
    <f7-block class="block-narrow" v-if="newScript">
      <f7-col>
        <f7-block-title medium class="margin-bottom">Script Language</f7-block-title>
        <f7-list media-list>
          <f7-list-item media-item radio radio-icon="start"
            :value="mode" :checked="mode === language.contentType" @change="mode = language.contentType"
            v-for="language in languages" :key="language.contentType"
            :title="language.name" :after="language.version" :footer="language.contentType"></f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
    <div v-if="ready && newScript" class="if-aurora display-flex justify-content-center margin padding">
      <div class="flex-shrink-0">
        <f7-button class="padding-left padding-right" style="width: 150px" color="blue" large raised fill @click="createScript">Create Script</f7-button>
      </div>
    </div>
    <f7-sheet ref="detailsSheet" class="script-details-sheet" :backdrop="false" :close-on-escape="true" :opened="detailsOpened" @sheet:closed="detailsOpened = false">
      <f7-page>
        <f7-toolbar tabbar bottom>
          <span class="margin-left">Script details</span>
          <div class="right">
            <f7-link sheet-close class="padding-right"><f7-icon f7="chevron_down"></f7-icon></f7-link>
          </div>
        </f7-toolbar>
        <f7-block>
          <script-general-settings :createMode="newScript" :rule="rule" />
        </f7-block>
      </f7-page>
    </f7-sheet>
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
import RuleStatus from '@/components/rule/rule-status-mixin'
import ScriptGeneralSettings from './script-general-settings.vue'

export default {
  mixins: [RuleStatus],
  components: {
    ScriptGeneralSettings,
    'editor': () => import('@/components/config/controls/script-editor.vue')
  },
  props: ['ruleId', 'moduleId', 'createMode'],
  data () {
    return {
      newScript: this.createMode,
      ready: false,
      loading: false,
      dirty: false,
      rule: {},
      isScriptRule: false,
      moduleTypes: {
        actions: [],
        conditions: [],
        triggers: []
      },
      currentModule: null,
      currentModuleConfig: {},
      scriptModuleType: null,
      languages: null,
      moduleError: null,
      script: '',
      mode: '',
      eventSource: null,
      keyHandler: null,
      detailsOpened: false
    }
  },
  computed: {
    pageTitle () {
      if (this.newScript) return 'Add Script'
      if (this.isScriptRule) return this.rule.name
      if (this.currentModule && this.currentModule.label) return this.currentModule.label
      return 'Edit Script'
    },
    isEditable () {
      return this.rule && this.rule.editable !== false
    }
  },
  methods: {
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
      this.rule = {
        uid: '',
        name: '',
        description: '',
        triggers: [],
        conditions: [],
        actions: [],
        tags: ['Script']
      }
      this.mode = 'application/javascript'
      this.$oh.api.get('/rest/module-types/script.ScriptAction').then((data) => {
        this.$set(this, 'scriptModuleType', data)
        this.$set(this, 'languages',
          this.scriptModuleType.configDescriptions
            .find((c) => c.name === 'type').options
            .map((l) => {
              return {
                contentType: l.value,
                name: l.label.split(' (')[0],
                version: l.label.split(' (')[1].replace(')', '')
              }
            }))
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

      this.rule.actions.push({
        id: 'script',
        type: 'script.ScriptAction',
        configuration: {
          type: this.mode,
          script: ''
        }
      })

      this.$oh.api.postPlain('/rest/rules', JSON.stringify(this.rule), 'text/plain', 'application/json').then(() => {
        this.$f7.toast.create({
          text: 'Script created',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + this.rule.uid), { reloadCurrent: true })
        this.newScript = false
        this.ready = false
        if (window) {
          window.addEventListener('keydown', this.keyDown)
        }
        this.load()
      })
    },
    load () {
      if (this.loading) return
      this.loading = true

      this.$oh.api.get('/rest/rules/' + this.ruleId).then((data) => {
        this.$set(this, 'rule', data)
        this.loading = false

        if (this.moduleId) {
          this.currentModule = this.rule.actions.concat(this.rule.conditions).find((m) => m.id === this.moduleId)
        } else if (this.rule.tags && this.rule.tags.indexOf('Script') >= 0) {
          this.currentModule = this.rule.actions.find((m) => m.id === 'script')
          this.isScriptRule = true
        }

        if (!this.currentModule || this.currentModule.type.indexOf('script') !== 0) {
          this.moduleError = true
        } else {
          this.mode = this.currentModule.configuration.type
          this.script = this.currentModule.configuration.script
        }

        this.ready = true
        if (!this.eventSource) this.startEventSource()
      })
    },
    save (noToast) {
      if (!this.isEditable) return
      if (this.currentTab === 'code') {
        if (!this.fromYaml()) {
          return
        }
      }
      this.currentModule.configuration.script = this.script
      return this.$oh.api.put('/rest/rules/' + this.rule.uid, this.rule).then((data) => {
        this.dirty = false
        if (!noToast) {
          this.$f7.toast.create({
            text: 'Rule updated',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
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

      const savePromise = (this.dirty) ? this.save(true) : Promise.resolve()

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
            this.save()
            ev.stopPropagation()
            ev.preventDefault()
            break
        }
      }
    }
  }
}
</script>
