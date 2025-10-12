<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut" class="thing-details-page">
    <f7-navbar :title="pageTitle + dirtyIndicator" back-link="Back" no-hairline>
      <f7-nav-right v-if="!error && ready">
        <f7-link v-if="!editable"
                 icon-f7="lock_fill"
                 icon-only
                 tooltip="This Thing is not editable through the UI" />
        <f7-link v-else-if="theme.md"
                 icon-md="material:save"
                 icon-only
                 @click="save()" />
        <f7-link v-else @click="save()">
          Save<span v-if="$device.desktop">&nbsp;(Ctrl-S)</span>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="switchTab('thing')"
               :tab-link-active="currentTab === 'thing' ? true : null"
               tab-link="#thing">
        Thing
      </f7-link>
      <f7-link v-show="!error"
               @click="switchTab('channels')"
               :tab-link-active="currentTab === 'channels' ? true : null"
               tab-link="#channels">
        Channels
      </f7-link>
      <f7-link v-show="!error"
               @click="switchTab('code')"
               :tab-link-active="currentTab === 'code' ? true : null"
               tab-link="#code">
        Code
      </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <f7-tab id="thing" :tab-active="currentTab === 'thing'? true : null">
        <f7-block v-if="ready && thing.statusInfo" class="block-narrow" strong>
          <f7-col class="padding-horizontal">
            <div v-show="!error" class="float-right align-items-flex-start align-items-center">
              <f7-link :icon-color="(thing.statusInfo.statusDetail === 'DISABLED') ? 'orange' : 'gray'"
                       :tooltip="((thing.statusInfo.statusDetail === 'DISABLED') ? 'Enable' : 'Disable') + (($device.desktop) ? ' (Ctrl-D)' : '')"
                       icon-ios="f7:pause_circle"
                       icon-md="f7:pause_circle"
                       icon-aurora="f7:pause_circle"
                       icon-size="32"
                       color="orange"
                       @click="toggleDisabled" />
            </div>
            Status:
            <f7-chip class="margin-left" :text="thing.statusInfo.status" :color="thingStatusBadgeColor(thing.statusInfo)" />
            <div>
              <strong>{{ (thing.statusInfo.statusDetail !== 'NONE') ? thing.statusInfo.statusDetail : '&nbsp;' }}</strong>
              <br>
              <div v-if="thingStatusDescription(thing.statusInfo)" v-html="thingStatusDescription(thing.statusInfo)" />
            </div>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block v-else class="block-narrow skeleton-text skeleton-effect-blink" strong>
          <f7-col class="padding-horizontal">
            ______:
            <f7-chip class="margin-left" text="________" />
            <div>
              <strong>____ _______</strong>
              <br>
            </div>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready && !error" class="block-narrow no-margin-bottom">
          <f7-col>
            <thing-general-settings :thing="thing"
                                    :thing-type="thingType"
                                    :ready="true"
                                    :read-only="!editable" />
            <f7-block-title v-if="thingType && thingType.UID" medium style="margin-bottom: var(--f7-list-margin-vertical)">
              Information
            </f7-block-title>
            <f7-block-footer v-if="!editable" class="no-margin padding-left">
              <f7-icon f7="lock_fill" size="12" color="gray" />&nbsp;Note: {{ notEditableMsg }}
            </f7-block-footer>
            <f7-list accordion-opposite>
              <f7-list-item accordion-item title="Thing Type" :after="thingType.label">
                <f7-accordion-content class="thing-type-description">
                  <div class="margin" v-html="thingType.description" />
                </f7-accordion-content>
              </f7-list-item>
              <f7-list-item v-if="Object.keys(thing.properties).length > 0"
                            accordion-item
                            title="Thing Properties"
                            :badge="Object.keys(thing.properties).length">
                <f7-accordion-content>
                  <f7-list>
                    <f7-list-item v-for="(value, key) in thing.properties"
                                  class="thing-property"
                                  :key="key"
                                  @click="showFullPropertyIfTruncated(key, value)">
                      <template #title>
                        <div class="item-title-content">
                          <span :ref="'titleSpan-' + key">{{ key }}</span>
                        </div>
                      </template>
                      <template #after>
                        <div class="item-after-content">
                          <span :ref="'valueSpan-' + key">{{ value }}</span>
                          <f7-icon v-if="isTruncated(key, 'title') || isTruncated(key, 'value')"
                                   f7="info_circle"
                                   size="16"
                                   class="truncation-icon" />
                        </div>
                      </template>
                    </f7-list-item>
                  </f7-list>
                </f7-accordion-content>
              </f7-list-item>
              <f7-list-item v-if="thing.firmwareStatus"
                            accordion-item
                            title="Firmware"
                            :badge="firmwares.length"
                            :badge-color="(thing.firmwareStatus.status) === 'UPDATE_EXECUTABLE' ? 'green' : 'gray'">
                <f7-accordion-content>
                  <f7-list>
                    <f7-list-item class="thing-property" title="Status" :after="thing.firmwareStatus.status" />
                    <f7-list-item class="thing-property"
                                  title="Current Version"
                                  :after="thing.properties.firmwareVersion" />
                    <f7-list-item v-for="firmware in firmwares"
                                  class="thing-property"
                                  :key="firmware.version"
                                  header="Version"
                                  :title="firmware.version"
                                  :after="firmware.description"
                                  :footer="firmware.changelog">
                      <f7-icon v-if="firmware.version === thing.properties.firmwareVersion"
                               f7="checkmark"
                               color="green" />
                    </f7-list-item>
                  </f7-list>
                </f7-accordion-content>
              </f7-list-item>
            </f7-list>

            <f7-block-title medium class="no-margin-bottom">
              Configuration
            </f7-block-title>
            <config-sheet ref="thingConfiguration"
                          :parameter-groups="configDescriptions.parameterGroups"
                          :parameters="configDescriptions.parameters"
                          :configuration="thing.configuration"
                          :status="configStatusInfo"
                          :set-empty-config-as-null="true"
                          :read-only="!editable" />

            <!-- Thing Actions & UI Actions -->
            <template v-if="thingActions.length > 0 || thingType?.UID?.startsWith('zwave:')">
              <f7-block-title medium class="no-margin-top">
                Actions
              </f7-block-title>
              <f7-list class="margin-top" media-list>
                <f7-list-item v-if="thingType?.UID?.startsWith('zwave:')"
                              title="View Network Map"
                              link=""
                              @click="openZWaveNetworkPopup()" />
                <f7-list-item v-for="action in thingActions"
                              :key="action.name"
                              :title="action.label"
                              :footer="action.description"
                              link=""
                              @click="doThingAction(action)" />
              </f7-list>
            </template>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block v-else-if="!error" class="block-narrow skeleton-text skeleton-effect-blink">
          <f7-col>
            <thing-general-settings :thing="thing" :thing-type="thingType" :ready="false" />
            <f7-block-title medium>
              ____ _______
            </f7-block-title>
            <div class="margin-left">
              ____ ____ ____ _____ ___ __ ____ __ ________ __ ____ ___ ____
            </div>
          </f7-col>
        </f7-block>

        <!-- Config Actions (DEPRECATED) -->
        <div v-if="ready && !error">
          <f7-block v-for="actionGroup in configActionsByGroup" class="block-narrow" :key="actionGroup.group.name">
            <f7-col>
              <f7-block-title class="parameter-group-title">
                {{ actionGroup.group.label }}
              </f7-block-title>
              <f7-block-footer class="param-description" v-if="actionGroup.group.description">
                <div v-html="actionGroup.group.description" />
              </f7-block-footer>
              <f7-list>
                <f7-list-button v-for="action in actionGroup.actions"
                                :color="(action.verify) ? 'yellow' : 'blue'"
                                :key="action.name"
                                :title="action.label"
                                @click="action.execute()" />
              </f7-list>
            </f7-col>
          </f7-block>
        </div>

        <f7-block class="block-narrow no-margin-top" v-if="ready">
          <f7-col>
            <f7-list>
              <f7-list-button v-if="thing.statusInfo.statusDetail === 'HANDLER_MISSING_ERROR'"
                              color="blue"
                              title="Install Binding"
                              @click="installBinding" />
              <f7-list-button v-if="!error"
                              color="blue"
                              title="Duplicate Thing"
                              @click="duplicateThing" />
              <f7-list-button v-if="!error"
                              color="blue"
                              title="Copy File Definition"
                              @click="copyFileDefinitionToClipboard(ObjectType.THING, [thingId])" />
              <f7-list-button v-if="editable"
                              color="red"
                              title="Remove Thing"
                              @click="deleteThing" />
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="channels" disabled="!thingType.channels ? true : null" :tab-active="currentTab === 'channels' ? true : null">
        <f7-block v-if="currentTab === 'channels'" class="block-narrow">
          <channel-list :thingType="thingType"
                        :thing="thing"
                        :channelTypes="channelTypes"
                        @channels-updated="onChannelsUpdated"
                        :context="context"
                        :f7router />
          <f7-col v-if="isExtensible || thing.channels.length > 0">
            <f7-list>
              <f7-list-button v-if="isExtensible && editable"
                              class="searchbar-ignore"
                              color="blue"
                              title="Add Channel"
                              @click="addChannel()" />
              <f7-list-button class="searchbar-ignore"
                              color="blue"
                              title="Add Equipment to Model"
                              @click="addToModel(true)" />
              <f7-list-button class="searchbar-ignore"
                              color="blue"
                              title="Add Points to Model"
                              @click="addToModel(false)" />
              <f7-list-button class="searchbar-ignore"
                              color="red"
                              title="Unlink all Items"
                              @click="unlinkAll(false)" />
              <f7-list-button class="searchbar-ignore"
                              color="red"
                              title="Unlink all and Remove Items"
                              @click="unlinkAll(true)" />
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="code" :tab-active="currentTab === 'code' ? true : null">
        <f7-icon v-if="!editable"
                 f7="lock"
                 class="float-right margin"
                 style="opacity: 0.5; z-index: 4000; user-select: none"
                 size="50"
                 color="gray"
                 :tooltip="notEditableMsg" />
        <editor v-if="ready"
                class="thing-code-editor"
                mode="application/vnd.openhab.thing+yaml"
                :value="thingYaml"
                :hint-context="{ thingType: thingType, channelTypes: channelTypes }"
                @input="onEditorInput"
                :read-only="!editable" />
        <!-- <pre class="yaml-message padding-horizontal" :class="[yamlError === 'OK' ? 'text-color-green' : 'text-color-red']">{{yamlError}}</pre> -->
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
.md .code-popup
  margin-bottom 0 !important

.ios .code-popup
  margin-bottom 44px !important

p.action-description
  margin-top: 0
  font-size: 80%
  color: var(--f7-block-footer-text-color)

.code-popup
  width 100%
  position fixed
  bottom 0 !important
  top var(--f7-toolbar-height) !important
  background-color white !important
  border-top 2px solid #555

  code
    max-height 50% !important
    overflow-y auto !important

.thing-details-page
  .page-content
    overflow-x hidden

  .thing-type-description
    h1
      font-size 16px
    h2
      font-size 12px
    h3
      font-size 11px

  .thing-property
    .item-after
      max-width 50%

      span
        max-width 100%
        overflow hidden
        text-overflow ellipsis

  .item-title-content, .item-after-content
    display flex
    align-items center
    overflow hidden
    width 100%

    span
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
      flex-shrink 1
      min-width 0

  .truncation-icon
    margin-left 4px
    flex-shrink 0
    color var(--f7-text-color-secondary)

.thing-code-editor.v-codemirror
  position absolute
  top calc(var(--f7-navbar-height) + var(--f7-tabbar-height))
  height calc(100% - var(--f7-navbar-height, 56px) - var(--f7-tabbar-height, 48px))
  width 100%

.dialog.wide-property-dialog
  --f7-dialog-width: 560px

  @media (max-width: 599px) {
    --f7-dialog-width: 95vw
  }

  @media (min-width: 768px) {
    --f7-dialog-width: 700px
  }
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7, theme } from 'framework7-vue'

import YAML from 'yaml'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'

import ConfigSheet from '@/components/config/config-sheet.vue'

import ChannelList from '@/components/thing/channel-list.vue'
import ThingGeneralSettings from '@/components/thing/thing-general-settings.vue'

import ZWaveNetworkPopup from '@/pages/settings/things/zwave/zwave-network-popup.vue'

import AddChannelPage from '@/pages/settings/things/channel/channel-add.vue'
import AddFromThingPage from '@/pages/settings/model/add-from-thing.vue'

import ThingStatus from '@/components/thing/thing-status-mixin'

import DirtyMixin from '../dirty-mixin'
import ThingActionPopup from '@/pages/settings/things/thing-action-popup.vue'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
  mixins: [ThingStatus, DirtyMixin, FileDefinition],
  components: {
    ConfigSheet,
    ChannelList,
    ThingGeneralSettings,
    editor: defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))
  },
  props: {
    thingId: String,
    f7router: Object
  },
  setup () {
    return { theme }
  },
  data () {
    return {
      ready: false,
      loading: false,
      error: false,
      configDirty: false,
      thingDirty: false,
      currentTab: 'thing',
      thing: {},
      savedThing: {},
      thingType: {},
      channelTypes: {},
      configDescriptions: {},
      thingActions: [],
      configStatusInfo: [],
      firmwares: [],
      /**
       * @deprecated
       */
      configActionsByGroup: [],
      thingEnabled: true,
      eventSource: null,
      thingYaml: null,
      notEditableMsg: 'This Thing is not editable because it has been provisioned from a file.',
      propertyTruncation: {}
    }
  },
  computed: {
    editable () {
      return this.thing && this.thing.editable
    },
    pageTitle () {
      if (!this.ready) return ''
      return this.thing.label || this.thing.UID
    },
    isExtensible () {
      if (!this.thingType || !this.thingType.extensibleChannelTypeIds) return false
      return this.thingType.extensibleChannelTypeIds.length > 0
    },
    context () {
      return {
        store: useStatesStore().trackedItems
      }
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
  },
  watch: {
    configDirty: function () { this.dirty = this.configDirty || this.thingDirty },
    thingDirty: function () { this.dirty = this.configDirty || this.thingDirty },
    thing: {
      handler () {
        if (!this.loading) { // ignore changes during loading
          // create rule object clone in order to be able to delete status part
          // which can change from eventsource but doesn't mean a rule modification
          let thingClone = cloneDeep(this.thing)
          let savedThingClone = cloneDeep(this.savedThing)

          // check if the configuration has changed between the thing and the original/saved version
          this.configDirty = !fastDeepEqual(thingClone.configuration, savedThingClone.configuration)

          // check if the rest of the thing has changed between the thing and the original/saved version
          delete thingClone.statusInfo
          delete thingClone.configuration
          delete savedThingClone.statusInfo
          delete savedThingClone.configuration
          this.thingDirty = !fastDeepEqual(thingClone, savedThingClone)
        }
      },
      deep: true
    },
    'thing.properties': {
      handler () {
        this.checkPropertyTruncation()
      },
      deep: true
    }
  },
  methods: {
    onPageAfterIn (event) {
      useStatesStore().startTrackingStates()
      if (window) {
        window.addEventListener('keydown', this.keyDown)
      }
      // When coming back from the channel add/edit page with a change, let the handler below take care of the reloading logic (the thing has to be saved first)
      if (!event.pageFrom || !event.pageFrom.name || event.pageFrom.name.indexOf('channel') < 0) {
        if (!this.eventSource) this.stopEventSource()
        this.load()
      }
    },
    onPageBeforeOut (event) {
      useStatesStore().stopTrackingStates()
      this.stopEventSource()
      if (window) {
        window.removeEventListener('keydown', this.keyDown)
      }
    },
    onEditorInput (value) {
      this.thingYaml = value
    },
    switchTab (tab) {
      if (this.currentTab === tab) return
      if (this.currentTab === 'code') {
        const previousYaml = this.toYaml()
        if (this.thingYaml !== previousYaml && this.fromYaml()) {
          this.save()
        }
      }
      this.currentTab = tab
      if (this.currentTab === 'code') {
        this.thingYaml = this.toYaml()
      }
    },
    /**
     * Loads the Thing actions.
     *
     * @returns {Promise<void>}
     */
    loadThingActions () {
      return this.$oh.api.get('/rest/actions/' + this.thingId).then((data) => {
        this.thingActions = data
          .filter((a) => a.visibility === 'VISIBLE')
          .filter((a) => a.inputConfigDescriptions !== undefined)
          .sort((a, b) => a.label.localeCompare(b.label))
        return Promise.resolve()
      }).catch((err) => {
        if (err === 'Not Found' || err === 404) {
          console.log('No actions available for this Thing')
          return Promise.resolve()
        }
        console.error('Error loading thing actions: ' + err)
        return Promise.reject(err)
      })
    },
    load () {
      // if (this.ready) return
      if (this.loading) return
      this.loading = true

      const loadingFinished = () => {
        nextTick(() => {
          this.savedThing = cloneDeep(this.thing)
          this.ready = true
          this.loading = false
          this.checkPropertyTruncation()
        })
      }

      this.$oh.api.get('/rest/things/' + this.thingId).then((data) => {
        this.thing = data

        const promises = [this.$oh.api.get('/rest/thing-types/' + this.thing.thingTypeUID),
          this.$oh.api.get('/rest/channel-types?prefixes=system,' + this.thing.thingTypeUID.split(':')[0]),
          this.loadThingActions()]

        Promise.all(promises).then((data2) => {
          this.thingType = data2[0]
          this.channelTypes = data2[1]

          this.$oh.api.get('/rest/config-descriptions/thing:' + this.thingId).then((data3) => {
            this.configDescriptions = data3

            // gather actions (rendered as buttons at the bottom)
            let bindingActionsGrouped = this.getBindingActions(this.configDescriptions)
            let bindingActionsNames = bindingActionsGrouped.flatMap((g) => g.actions).flatMap((a) => a.name)
            this.configDescriptions.parameters = this.configDescriptions.parameters.filter((p) => !bindingActionsNames.includes(p.name)) // params except actions

            this.configActionsByGroup = bindingActionsGrouped

            loadingFinished()
            if (!this.eventSource) this.startEventSource()
          }).catch((err) => {
            console.log('No config descriptions for this thing, using those on the thing type: ' + err)
            this.configDescriptions = {
              parameterGroups: this.thingType.parameterGroups,
              parameters: this.thingType.configParameters
            }

            loadingFinished()
            if (!this.eventSource) this.startEventSource()
          })

          // config status unrelated to the other queries, so load it in parallel with the types
          this.$oh.api.get('/rest/things/' + this.thingId + '/config/status').then((statusData) => {
            this.configStatusInfo = statusData
          })
          this.$oh.api.get('/rest/things/' + this.thingId + '/firmwares').then((firmwareData) => {
            this.firmwares = firmwareData
          }).catch(() => {
            // ignore error
            console.debug(`Firmware info not available for Thing ${this.thingId}`)
          })
        }).catch((err) => {
          console.warn('Cannot load the related info: ' + err)
          this.error = true
          loadingFinished()
        })
      })
    },
    /**
     * @deprecated to be removed once all Things that use config actions use real Thing actions instead
     */
    getBindingActions (configDescriptionsResponse) {
      // Returns an array of parameters which qualify as "actions", grouped by the paramGroup. The actions themselves are enriched by execute() method
      let actionContextGroups = configDescriptionsResponse.parameterGroups.filter((pg) => pg.context === 'actions')
      if (actionContextGroups.length === 0) {
        // No match by context, fall back to heuristic match by group name and label
        actionContextGroups = configDescriptionsResponse.parameterGroups.filter((pg) => pg.name === 'actions' && pg.label === 'Actions')
      }
      let bindingActions = configDescriptionsResponse.parameters.filter((p) => actionContextGroups.map((acg) => acg.name).includes(p.groupName) && p.type === 'BOOLEAN')

      return map(groupBy(bindingActions, 'groupName'), (gActions, gName) => {
        return {
          group: configDescriptionsResponse.parameterGroups.find((pg) => pg.name === gName),
          actions: map(gActions, (a) => { return { ...a, execute: () => this.doConfigAction(a) } })
        }
      })
    },
    save (saveThing) {
      if (!this.ready || !this.editable) return

      if (this.currentTab === 'code') {
        if (!this.fromYaml()) {
          return
        }
      }

      let endpoint, payload, successMessage
      // if configDirty flag is set, assume the config has to be saved with PUT /rest/things/:thingId/config
      if (this.configDirty && !this.thingDirty && !saveThing) {
        endpoint = '/rest/things/' + this.thingId + '/config'
        payload = this.thing.configuration
        successMessage = 'Thing configuration updated'
        // otherwise (for example, channels or label) use the regular PUT /rest/thing/:thingId
      } else {
        endpoint = '/rest/things/' + this.thingId
        payload = this.thing
        successMessage = 'Thing updated'
      }
      if (!this.$refs.thingConfiguration.isValid()) {
        f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      this.$oh.api.put(endpoint, payload).then((data) => {
        // this.$set(this, 'thing', data)
        if (this.configDirty && !this.thingDirty && !saveThing) this.configDirty = false
        this.thingDirty = false
        if (this.configDirty) {
          // if still dirty, save again to save the configuration
          this.save()
        }
        f7.toast.create({
          text: successMessage,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        if (err === 409 || err === 'Conflict') {
          f7.toast.create({
            text: 'Cannot modify configuration of uninitialized Thing',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
        }
      })
    },
    doThingAction (action) {
      const popup = {
        component: ThingActionPopup
      }
      this.f7router.navigate({
        url: 'thing-action',
        route: {
          path: 'thing-action',
          popup
        }
      }, {
        props: {
          thingUID: this.thingId,
          action
        }
      })
    },
    doConfigAction (action) {
      if (action.type !== 'BOOLEAN') {
        console.warn('Invalid action type', action)
        return
      }
      let prompt = (action.label) ? `${action.label}?` : `Do you want to perform ${action.name} action?`
      if (action.description) {
        prompt += `<p class="action-description">${action.description}</p>`
      }
      if (action.verify) {
        prompt += '<p><small><strong class="text-color-yellow"><i class="f7-icons">exclamationmark_triangle</i>WARNING:</strong>&nbsp;This action may be dangerous!</small></p>'
      }
      f7.dialog.confirm(
        prompt,
        this.thing.label,
        () => {
          // Make sure Vue reactivity notices the change
          this.thing.configuration = ({
            ...this.thing.configuration,
            [action.name]: true
          })
          // Vue reactivity is too slow to recognize config change before the API call, manually mark the config dirty
          this.configDirty = true
          this.save()
        }
      )
    },
    openZWaveNetworkPopup () {
      const popup = {
        component: ZWaveNetworkPopup
      }
      this.f7router.navigate({
        url: 'zwave-network',
        route: {
          path: 'zwave-network',
          popup
        }
      }, {
        props: {
          bridgeUID: this.thing.bridgeUID || this.thing.UID
        }
      })
    },
    duplicateThing () {
      let thingClone = cloneDeep(this.thing)
      this.f7router.navigate({
        url: '/settings/things/duplicate'
      }, {
        props: {
          thingTypeId: this.thing.thingTypeUID,
          thingCopy: thingClone
        }
      })
    },
    deleteThing () {
      let url, message
      if (this.thing.statusInfo.status === 'REMOVING') {
        message = `${this.thing.label || this.thing.UID} is currently being removed but the binding has not confirmed it has finished the operation yet. Would you like to force its removal? Warning: this could cause stability issues with the binding!`
        url = '/rest/things/' + this.thingId + '?force=true'
      } else {
        message = `Are you sure you want to delete ${this.thing.label || this.thing.UID}?`
        url = '/rest/things/' + this.thingId
      }
      f7.dialog.confirm(
        message,
        'Delete Thing',
        () => {
          this.$oh.api.delete(url).then(() => {
            this.dirty = this.configDirty = this.thingDirty = false
            this.f7router.back('/settings/things/', { force: true })
          })
        }
      )
    },
    installBinding () {
      this.f7router.navigate({
        url: '/addons/binding/'
      }, {
        props: {
          searchFor: this.thing.UID.split(':')[0]
        }
      })
    },
    toggleDisabled () {
      const enable = (this.thing.statusInfo.statusDetail === 'DISABLED')
      this.$oh.api.putPlain('/rest/things/' + this.thingId + '/enable', enable.toString()).then((data) => {
        f7.toast.create({
          text: (enable) ? 'Thing enabled' : 'Thing disabled',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        f7.toast.create({
          text: 'Error while disabling or enabling: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    keyDown (ev) {
      if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey || ev.shiftKey)) {
        switch (ev.keyCode) {
          case 68:
            this.toggleDisabled()
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
    },
    addChannel () {
      const self = this
      this.f7router.navigate({
        url: 'channels/new',
        route: {
          component: AddChannelPage,
          path: 'channels/new',
          context: {
            operation: 'add-channel'
          },
          on: {
            pageAfterOut (event, page) {
              const context = page.route.route.context
              const finalChannel = context.finalChannel
              if (finalChannel) {
                self.thing.channels.push(finalChannel)
                self.save()
                self.onChannelsUpdated(true)
              } else {
                self.onChannelsUpdated(false)
              }
            }
          }
        }
      }, {
        props: {
          thing: this.thing,
          thingType: this.thingType
        }
      })
    },
    addToModel (createEquipment) {
      this.f7router.navigate({
        url: 'add-to-model',
        route: {
          component: AddFromThingPage,
          path: 'add-to-model',
          props: {
          },
          on: {
            pageAfterOut (event, page) {
            }
          }
        }
      }, {
        props: {
          thingId: this.thing.UID,
          createEquipment
        }
      })
    },
    onChannelsUpdated (save) {
      if (save) this.save(true)
      if (!this.eventSource) this.startEventSource()
    },
    unlinkAll (removeItems) {
      const message = (removeItems)
        ? 'Are you sure you wish to unlink and remove all items currently linked to this thing?'
        : 'Are you sure you wish to unlink all items currently linked to this thing?'
      f7.dialog.confirm(message, 'Unlink all',
        () => {
          this.$oh.api.get('/rest/links').then((data) => {
            let dialog = f7.dialog.progress('Unlinking all items...')
            this.stopEventSource()
            const links = data.filter((l) => l.channelUID.indexOf(this.thingId) === 0)

            const unlinkPromises = links.map((l) => this.$oh.api.delete(`/rest/links/${l.itemName}/${encodeURIComponent(l.channelUID)}`))
            Promise.all(unlinkPromises).then(() => {
              if (removeItems) {
                dialog.setText('Removing items...')
                const deletePromises = links.map((l) => this.$oh.api.delete(`/rest/items/${l.itemName}`))
                Promise.all(deletePromises).then(() => {
                  dialog.close()
                  f7.toast.create({
                    text: 'All items unlinked and removed',
                    destroyOnClose: true,
                    closeTimeout: 2000
                  }).open()
                  this.load()
                }).catch((err) => {
                  dialog.close()
                  f7.dialog.alert('Some of the items could not be unlinked: ' + err)
                  this.load()
                })
              } else {
                dialog.close()
                f7.toast.create({
                  text: 'All items unlinked',
                  destroyOnClose: true,
                  closeTimeout: 2000
                }).open()
                this.load()
              }
            }).catch((err) => {
              dialog.close()
              f7.dialog.alert('Some of the items could not be removed: ' + err)
              this.load()
            })
          })
        })
    },
    startEventSource () {
      if (this.eventSource) this.stopEventSource()
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/things/*/*,openhab/links/*/*' /* + encodeURIComponent(this.thingId) */, null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[1]) {
          case 'things':
            if (topicParts[2] !== this.thingId) return
            switch (topicParts[3]) {
              case 'status':
                this.thing.statusInfo = JSON.parse(event.payload)
                break
              case 'removed':
                f7.toast.create({
                  text: 'The Thing was deleted',
                  destroyOnClose: true,
                  closeTimeout: 2000
                }).open()
                this.f7router.back('/settings/things/', { force: true })
                break
              case 'updated':
                console.log('Thing updated according to SSE, reloading')
                this.load()
                break
            }
            break
          case 'links':
            // if (topicParts[2].indexOf(this.thingId) < 0) return
            // console.log('Links updated according to SSE, reloading')
            // this.ready = false
            // this.load()
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    toYaml () {
      const editableThing = {
        UID: this.thing.UID,
        label: this.thing.label,
        thingTypeUID: this.thing.thingTypeUID,
        configuration: this.thing.configuration
      }

      if (this.thing.bridgeUID) editableThing.bridgeUID = this.thing.bridgeUID
      if (this.thing.location) editableThing.location = this.thing.location

      const editableChannels = []

      for (const channel of this.thing.channels) {
        const editableChannel = {
          id: channel.id,
          channelTypeUID: channel.channelTypeUID,
          label: channel.label,
          description: channel.description,
          configuration: channel.configuration
        }
        editableChannels.push(editableChannel)
      }

      if (editableChannels.length > 0) editableThing.channels = editableChannels

      return YAML.stringify(editableThing)
    },
    fromYaml () {
      const updatedThing = YAML.parse(this.thingYaml)

      const isExtensible = (channel, thingType) => {
        if (!channel || !channel.channelTypeUID) return false
        const bindingId = thingType.UID.split(':')[0]
        return thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t).indexOf(channel.channelTypeUID) >= 0
      }

      try {
        if (updatedThing.UID !== this.thing.UID) throw new Error('Changing the thing UID is not supported')
        if (updatedThing.thingTypeUID !== this.thing.thingTypeUID) throw new Error('Changing the thing type is not supported')
        if (updatedThing.label) this.thing.label = updatedThing.label
        if (updatedThing.location) this.thing.location = updatedThing.location
        if (updatedThing.bridgeUID) this.thing.bridgeUID = updatedThing.bridgeUID

        if (updatedThing.configuration && JSON.stringify(this.thing.configuration) !== JSON.stringify(updatedThing.configuration)) {
          this.thing.configuration = updatedThing.configuration
        }

        if (updatedThing.channels && Array.isArray(updatedThing.channels)) {
          for (const updatedChannel of updatedThing.channels) {
            const existingChannel = this.thing.channels.find((c) => c.id === updatedChannel.id)
            if (existingChannel) {
              if (isExtensible(existingChannel, this.thingType)) {
                if (existingChannel.channelTypeUID) existingChannel.channelTypeUID = updatedChannel.channelTypeUID
                if (existingChannel.label) existingChannel.label = updatedChannel.label
                if (existingChannel.description) existingChannel.description = updatedChannel.description
              }
              if (existingChannel.configuration && JSON.stringify(existingChannel.configuration) !== JSON.stringify(updatedChannel.configuration)) {
                existingChannel.configuration = updatedChannel.configuration
              }
            } else {
              if (!updatedChannel.id || !updatedChannel.label || !updatedChannel.channelTypeUID) continue
              const channelType = this.channelTypes.find((ct) => ct.UID === updatedChannel.channelTypeUID)
              if (!channelType) continue
              const newChannel = {
                id: updatedChannel.id,
                label: updatedChannel.label,
                description: updatedChannel.description || undefined,
                uid: this.thing.UID + ':' + updatedChannel.id,
                channelTypeUID: channelType.UID,
                kind: channelType.kind,
                itemType: channelType.itemType,
                linkedItems: [],
                properties: [],
                defaultTags: [],
                configuration: updatedChannel.configuration
              }
              if (!isExtensible(newChannel, this.thingType)) continue
              this.thing.channels.push(newChannel)
            }
          }

          // deleting channels which are not in the updated thing anymore - but only if they are extensible and no items are linked to it
          let existingChannels = [...this.thing.channels]
          for (let i = 0; i < existingChannels.length; i++) {
            const existingChannel = existingChannels[i]
            if (isExtensible(existingChannel, this.thingType)) {
              const foundIdx = updatedThing.channels.findIndex((c) => c.id === existingChannel.id)
              if (foundIdx < 0) {
                if (existingChannel.linkedItems && existingChannel.linkedItems.length > 0) {
                  f7.dialog.alert(`Not removing channel ${existingChannel.id} because there are items linked to it`).open()
                  continue
                }
                this.thing.channels.splice(this.thing.channels.findIndex((c) => c.id === existingChannel.id), 1)
              }
            }
          }
        }
        return true
      } catch (e) {
        f7.dialog.alert(e).open()
        return false
      }
    },
    checkPropertyTruncation () {
      nextTick(() => {
        const newTruncationStatus = {}
        if (!this.thing || !this.thing.properties || !this.ready) {
          if (Object.keys(this.propertyTruncation).length > 0) {
            this.propertyTruncation = {}
          }
          return
        }

        for (const key in this.thing.properties) {
          const getElement = (refName) => {
            const ref = this.$refs[refName]
            return Array.isArray(ref) ? ref[0] : ref
          }

          const titleSpan = getElement(`titleSpan-${key}`)
          const valueSpan = getElement(`valueSpan-${key}`)

          const titleTruncated = titleSpan ? titleSpan.scrollWidth > titleSpan.offsetWidth : false
          const valueTruncated = valueSpan ? valueSpan.scrollWidth > valueSpan.offsetWidth : false

          if (titleTruncated || valueTruncated) {
            newTruncationStatus[key] = { title: titleTruncated, value: valueTruncated }
          }
        }

        if (!fastDeepEqual(this.propertyTruncation, newTruncationStatus)) {
          this.propertyTruncation = newTruncationStatus
        }
      })
    },

    isTruncated (key, type) {
      return !!(this.propertyTruncation[key] && this.propertyTruncation[key][type])
    },

    showFullProperty (key, value) {
      const dialogContent = `
        <div class="dialog-title" style="margin-bottom: 8px;">${key}</div>
        <pre class="dialog-text" style="font-size: var(--f7-font-size); margin: 0; white-space: pre-wrap; word-wrap: break-word;">${value}</pre>
      `
      const dialog = f7.dialog.create({
        title: 'Property Details',
        content: dialogContent,
        cssClass: 'wide-property-dialog',
        buttons: [
          { text: 'OK' }
        ]
      })
      dialog.open()
    },

    showFullPropertyIfTruncated (key, value) {
      const isTitleTruncated = this.isTruncated(key, 'title')
      const isValueTruncated = this.isTruncated(key, 'value')
      if (isTitleTruncated || isValueTruncated) {
        this.showFullProperty(key, value)
      }
    }
  },
  mounted () {
    this.checkPropertyTruncation()
  },
  updated () {
    this.checkPropertyTruncation()
  }
}
</script>
