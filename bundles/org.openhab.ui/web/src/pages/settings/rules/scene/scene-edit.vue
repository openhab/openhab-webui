<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar back-link="Back" no-hairline>
      <template slot="title">
        {{ createMode ? 'Create scene' : rule.name }}
        {{ dirtyIndicator }}
      </template>
      <f7-nav-right v-if="isEditable">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="save()" v-if="!$theme.md">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
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
    <f7-tabs class="scene-editor-tabs">
      <f7-tab id="design" @tab:show="() => this.currentTab = 'design'" :tab-active="currentTab === 'design'">
        <f7-block v-if="ready && rule.status && !createMode" class="block-narrow padding-left padding-right" strong>
          <f7-col v-if="!createMode">
            <div class="float-right align-items-flex-start align-items-center">
              <!-- <f7-toggle class="enable-toggle"></f7-toggle> -->
              <f7-link :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'" :tooltip="((rule.status.statusDetail === 'DISABLED') ? 'Enable' : 'Disable') + (($device.desktop) ? ' (Ctrl-D)' : '')" icon-ios="f7:pause_circle" icon-md="f7:pause_circle" icon-aurora="f7:pause_circle" icon-size="32" color="orange" @click="toggleDisabled" />
              <f7-link :tooltip="'Activate Now' + (($device.desktop) ? ' (Ctrl-R)' : '')" icon-ios="f7:play_round" icon-md="f7:play_round" icon-aurora="f7:play_round" icon-size="32" :color="(rule.status.status === 'IDLE') ? 'blue' : 'gray'" @click="runNow" />
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

        <rule-general-settings :rule="rule" :ready="ready" :createMode="createMode" :inSceneEditor="true" />

        <f7-block v-if="ready" class="block-narrow">
          <f7-block-footer v-if="!isEditable" class="no-margin padding-left">
            <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: this rule is not editable because it has been
            provisioned from a file.
          </f7-block-footer>
          <!-- <f7-col v-if="isEditable" class="text-align-right justify-content-flex-end">
            </f7-col> -->
          <f7-col class="rule-modules">
            <div class="no-padding float-right" v-if="rule['actions'].length > 0">
              <f7-button @click="toggleModuleControls" small outline :fill="showModuleControls" sortable-toggle=".sortable"
                         style="margin-top: -3px; margin-right: 5px"
                         color="gray" icon-size="12" icon-ios="material:wrap_text" icon-md="material:wrap_text"
                         icon-aurora="material:wrap_text">
                &nbsp;Reorder
              </f7-button>
            </div>
            <div>
              <f7-block-title medium style="margin-bottom: var(--f7-list-margin-vertical)">
                Configuration
              </f7-block-title>
              <f7-list class="scene-items" sortable swipeout media-list @sortable:sort="(ev) => reorderModule(ev, 'actions')">
                <f7-list-item :title="mod.configuration.itemName" media
                              v-for="mod in rule['actions']" :key="mod.id"
                              :link="!showModuleControls"
                              @click.native="(ev) => editModule(ev, mod)" swipeout no-chevron>
                  <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled"
                           icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline"
                           @click="showSwipeout" />
                  <span slot="inner" class="inline-command-input">
                    <f7-input type="text" outline
                              :value="mod.configuration.command"
                              @input="updateActionModule([mod.configuration.itemName, $event.target.value])"
                              :disabled="showModuleControls" />
                  </span>
                  <span slot="after">
                    <f7-link icon-f7="arrow_uturn_left_circle"
                             class="margin-left-half" color="blue" tooltip="Set to current state"
                             @click.native="(ev) => updateCommandFromCurrentState(ev, mod)" />
                    <f7-link icon-f7="arrowtriangle_right_circle"
                             class="margin-left-half" color="blue" tooltip="Test command"
                             @click.native="(ev) => testCommand(ev, mod)" />
                  </span>
                  <f7-swipeout-actions right>
                    <f7-swipeout-button @click="(ev) => deleteModule(ev, 'actions', mod)"
                                        style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                      Delete
                    </f7-swipeout-button>
                  </f7-swipeout-actions>
                </f7-list-item>
              </f7-list>
              <f7-list v-if="isEditable">
                <!-- <f7-list-item link no-chevron media-item :color="($theme.dark) ? 'black' : 'white'" subtitle="Add Item"
                              @click="addModule()">
                  <f7-icon slot="media" color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill"
                           md="material:control_point" />
                </f7-list-item> -->
                <item-picker title="Select Items" name="newItem" :multiple="true" :value="selectedItems" @input="selectItems" :no-after="true" class="scene-items-picker" />
                <!-- <f7-list-button :color="(showModuleControls) ? 'gray' : 'blue'" :title="sectionLabels[section][1]"></f7-list-button> -->
              </f7-list>
            </div>
          </f7-col>
          <f7-col v-if="isEditable && !createMode">
            <f7-list>
              <f7-list-button color="red" @click="deleteRule">
                Remove Scene
              </f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>
      <f7-tab id="code" @tab:show="() => { this.currentTab = 'code'; toYaml() }" :tab-active="currentTab === 'code'">
        <editor v-if="currentTab === 'code'" class="rule-code-editor" mode="application/vnd.openhab.rule+yaml" :value="ruleYaml" @input="onEditorInput" />
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

  .scene-items
    .inline-command-input
      position: relative
      display: flex
      flex-direction: row-reverse
      .input
        max-width: 30%
        padding-left: 5px
        background: var(--f7-list-bg-color)

.ios .scene-items
  --f7-input-height: 24px

.scene-items-picker
  .item-after
    display none

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

import SceneConfigureItemPopup from './scene-configure-item-popup.vue'

import RuleMixin from '../rule-edit-mixin'
import RuleStatus from '@/components/rule/rule-status-mixin'
import DirtyMixin from '../../dirty-mixin'

import ItemPicker from '@/components/config/controls/item-picker.vue'
import RuleGeneralSettings from '@/components/rule/rule-general-settings.vue'

export default {
  mixins: [RuleMixin, RuleStatus, DirtyMixin],
  components: {
    RuleGeneralSettings,
    ItemPicker,
    'editor': () => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue')
  },
  props: ['ruleId', 'createMode'],
  data () {
    return {
      ready: false,
      loading: false,
      rule: {},
      ruleYaml: '',
      moduleTypes: {
        actions: [],
        conditions: [],
        triggers: []
      },
      currentTab: 'design',
      currentModuleType: null,
      currentModule: null,
      currentModuleConfig: {},
      selectedItems: [],

      codeEditorOpened: false
    }
  },
  watch: {
    rule: {
      handler: function (newRule, oldRule) {
        if (!this.loading) { // ignore initial rule assignment
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

      const loadingFinished = () => {
        this.$nextTick(() => {
          this.savedRule = cloneDeep(this.rule)
          this.ready = true
          this.loading = false
          if (!this.eventSource) this.startEventSource()
        })
      }

      Promise.all([loadModules1]).then((data) => {
        this.moduleTypes.actions = data[0]
        if (this.createMode) {
          this.$set(this, 'rule', {
            uid: this.$f7.utils.id(),
            name: '',
            triggers: [],
            actions: [],
            conditions: [],
            tags: [],
            configuration: {},
            templateUID: null,
            visibility: 'VISIBLE',
            status: {
              status: 'NEW'
            }
          })
          loadingFinished()
        } else {
          this.$oh.api.get('/rest/rules/' + this.ruleId).then((data2) => {
            this.$set(this, 'rule', data2)
            this.rule.tags = this.rule.tags.filter(e => e !== 'Scene')
            this.$set(this, 'selectedItems', [])
            this.rule.actions.forEach((a) => {
              if (a.type === 'core.ItemCommandAction') {
                this.selectedItems.push(a.configuration.itemName)
              }
            })
            loadingFinished()
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
        this.$f7.dialog.alert('Please give an ID to the scene')
        return Promise.reject()
      }
      if (!this.rule.name) {
        this.$f7.dialog.alert('Please give a name to the scene')
        return Promise.reject()
      }
      let saveRule = cloneDeep(this.rule)
      saveRule.tags.push('Scene')
      const promise = (this.createMode)
        ? this.$oh.api.postPlain('/rest/rules', JSON.stringify(saveRule), 'text/plain', 'application/json')
        : this.$oh.api.put('/rest/rules/' + saveRule.uid, saveRule)
      return promise.then((data) => {
        this.dirty = false
        if (this.createMode) {
          this.$f7.toast.create({
            text: 'Scene created',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          this.$f7router.navigate(this.$f7route.url.replace('/add', '/' + this.rule.uid), { reloadCurrent: true })
          this.load()
        } else {
          if (!noToast) {
            this.$f7.toast.create({
              text: 'Scene updated',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
          }
          this.savedRule = cloneDeep(this.rule)
        }
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while saving scene: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    runNow () {
      if (this.createMode) return
      if (this.rule.status.status === 'RUNNING' || this.rule.status.status === 'UNINITIALIZED') {
        return this.$f7.toast.create({
          text: `Scene cannot be activated ${(this.rule.status.status === 'RUNNING') ? 'while currently activating, please wait' : 'if it is uninitialized'}!`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }
      this.$f7.toast.create({
        text: 'Activating scene',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()

      const savePromise = (this.isEditable && this.dirty) ? this.save(true) : Promise.resolve()

      savePromise.then(() => {
        this.$oh.api.postPlain('/rest/rules/' + this.rule.uid + '/runnow', '').catch((err) => {
          this.$f7.toast.create({
            text: 'Error while activating scene: ' + err,
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        })
      })
    },
    deleteRule () {
      this.$f7.dialog.confirm(
        `Are you sure you want to delete ${this.rule.name}?`,
        'Delete Scene',
        () => {
          this.$oh.api.delete('/rest/rules/' + this.rule.uid).then(() => {
            this.dirty = false
            this.$f7router.back('/settings/scenes/', { force: true })
          })
        }
      )
    },
    editModule (ev, mod) {
      if (ev.target.tagName.toLowerCase() === 'input') {
        ev.cancelBubble = true
        return
      }
      if (this.showModuleControls) return

      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      if (swipeoutElement && swipeoutElement.classList.contains('swipeout-opened')) return

      const popup = {
        component: SceneConfigureItemPopup
      }

      this.$f7router.navigate({
        url: 'item-config',
        route: {
          path: 'item-config',
          popup
        }
      }, {
        props: {
          rule: this.rule,
          module: mod
        }
      })

      this.$f7.once('sceneItemConfigUpdate', this.updateActionModule)
      this.$f7.once('sceneItemConfigClosed', () => {
        this.$f7.off('sceneItemConfigUpdate', this.updateActionModule)
      })
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
        const itemName = this.rule.actions[idx].configuration.itemName
        this.rule[section].splice(idx, 1)
        console.debug('Removing: ' + itemName)
        this.$set(this, 'selectedItems', this.selectedItems.filter((i) => i !== itemName))
        this.buildActionModules()
      })
    },
    selectItems (items) {
      console.log(items)
      this.$set(this, 'selectedItems', items)
      this.buildActionModules()
    },
    reorderModule (ev, section) {
      const newSection = [...this.rule[section]]
      newSection.splice(ev.to, 0, newSection.splice(ev.from, 1)[0])
      this.$set(this.rule, section, newSection)
    },
    buildActionModules () {
      const modulesToRemove = this.rule.actions.filter((a) => this.selectedItems.indexOf(a.configuration.itemName) < 0)
      if (modulesToRemove.length > 0) console.debug('Removing: ' + modulesToRemove.map((m) => m.configuration.itemName).join(', '))
      this.$set(this.rule, 'actions', this.rule.actions.filter((a) => this.selectedItems.indexOf(a.configuration.itemName) >= 0))
      const itemsToAdd = this.selectedItems.filter((i) => !this.rule.actions.some((a) => a.configuration.itemName === i))
      if (itemsToAdd.length > 0) console.debug('Adding: ' + itemsToAdd.join(', '))

      let moduleId = 1
      itemsToAdd.forEach((itemName) => {
        for (; ['triggers', 'actions', 'conditions'].some((s) => this.rule[s].some((m) => m.id === moduleId.toString())); moduleId++);
        console.debug('new moduleId=' + moduleId)
        const newModule = {
          id: moduleId.toString(),
          configuration: {
            itemName,
            command: null
          },
          type: 'core.ItemCommandAction'
        }
        this.rule.actions.push(newModule)
      })
      const statePromises = itemsToAdd.map((itemName) => this.$oh.api.getPlain('/rest/items/' + itemName + '/state'))
      Promise.all(statePromises).then((states) => {
        states.forEach((state, idx) => {
          const module = this.rule.actions.find((a) => a.configuration.itemName === itemsToAdd[idx])
          this.$set(module.configuration, 'command', state)
        })
      })
    },
    updateCommandFromCurrentState (ev, module) {
      if (ev) ev.cancelBubble = true
      const itemName = module.configuration.itemName
      this.$oh.api.getPlain('/rest/items/' + itemName + '/state').then((state) => {
        this.$set(module.configuration, 'command', state)
      })
    },
    testCommand (ev, module) {
      if (ev) ev.cancelBubble = true
      const itemName = module.configuration.itemName
      const command = module.configuration.command
      this.$oh.api.postPlain('/rest/items/' + itemName, command, 'text/plain', 'text/plain').then(() => {
        this.$f7.toast.create({
          text: `Updated desired state of ${itemName} to ${command}`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    updateActionModule (params) {
      const [itemName, command] = params
      const module = this.rule.actions.find((a) => a.configuration.itemName === itemName)
      if (module) module.configuration.command = command
    },
    toYaml () {
      const itemsConfig = {}
      this.rule.actions.forEach((a) => {
        itemsConfig[a.configuration.itemName] = a.configuration.command
      })

      this.ruleYaml = YAML.stringify({
        items: itemsConfig,
        triggers: this.rule.triggers,
        conditions: this.rule.conditions
      })
    },
    fromYaml () {
      if (!this.isEditable) return
      try {
        const updatedRule = YAML.parse(this.ruleYaml)
        if (updatedRule.triggers === null) updatedRule.triggers = []
        if (updatedRule.conditions === null) updatedRule.conditions = []
        const actions = []
        let moduleId = 1
        for (; ['triggers', 'actions', 'conditions'].some((s) => this.rule[s].some((m) => m.id === moduleId.toString())); moduleId++);
        for (let item in updatedRule.items) {
          actions.push({
            id: (moduleId++).toString(),
            configuration: {
              itemName: item,
              command: updatedRule.items[item]
            },
            type: 'core.ItemCommandAction'
          })
        }
        this.$set(this.rule, 'triggers', updatedRule.triggers)
        this.$set(this.rule, 'conditions', updatedRule.conditions)
        this.$set(this.rule, 'actions', actions)
        console.debug(this.rule)
        return true
      } catch (e) {
        this.$f7.dialog.alert(e).open()
        return false
      }
    }
  }
}
</script>
