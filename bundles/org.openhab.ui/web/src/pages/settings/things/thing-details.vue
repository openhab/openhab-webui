<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="onPageAfterOut">
    <f7-navbar :title="thing.label" back-link="Back" no-hairline>
      <f7-nav-right v-if="dirty">
        <f7-link @click="save()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="save()" v-if="!$theme.md">Save</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'info'" :tab-link-active="currentTab === 'info'" class="tab-link">Info</f7-link>
      <f7-link @click="currentTab = 'config'" :tab-link-active="currentTab === 'config'" class="tab-link">Config</f7-link>
      <f7-link @click="currentTab = 'channels'" :tab-link-active="currentTab === 'channels'" class="tab-link">Channels</f7-link>
    </f7-toolbar>

    <f7-tabs>
      <f7-tab id="info" @tab:show="() => this.currentTab = 'info'" :tab-active="currentTab === 'info'">
        <f7-block v-if="ready && thing.statusInfo" class="block-narrow padding-left padding-right" strong>
          <f7-col>
            <div class="float-right align-items-flex-start align-items-center">
              <f7-link :icon-color="(thing.statusInfo.statusDetail === 'DISABLED') ? 'orange' : 'gray'" icon-ios="f7:pause_circle" icon-md="f7:pause_circle" icon-aurora="f7:pause_circle" icon-size="32" color="orange" @click="toggleDisabled"></f7-link>
            </div>
            Status:
            <f7-chip class="margin-left"
              :text="thing.statusInfo.status"
              :color="thing.statusInfo.status === 'ONLINE' ? 'green' : 'red'"
            >{{thing.statusInfo.status}}</f7-chip>
            <div v-if="thing.statusInfo.statusDetail !== 'NONE' || thing.statusInfo.description">
              <strong
                v-if="thing.statusInfo.statusDetail !== 'NONE'"
              >{{thing.statusInfo.statusDetail}}</strong>
              <br>
              <div v-if="thing.statusInfo.description">{{thing.statusInfo.description}}</div>
            </div>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block v-else class="block-narrow padding-left padding-right skeleton-text skeleton-effect-blink" strong>
          <f7-col>______:
            <f7-chip class="margin-left" text="________"></f7-chip>
            <div>
              <strong>____ _______</strong>
              <br>
            </div>
          </f7-col>
        </f7-block>

        <f7-block v-if="ready" class="block-narrow padding-left padding-right">
          <f7-col>
            <h3>{{thingType.label}}</h3>
            <div v-html="thingType.description"></div>
          </f7-col>
        </f7-block>
        <!-- skeletons for not ready -->
        <f7-block v-else class="block-narrow padding-left padding-right skeleton-text skeleton-effect-blink">
          <f7-col>
            <h3>____ _______</h3>
            <div>____ ____ ____ _____ ___ __ ____ __ ________ __ ____ ___ ____</div>
          </f7-col>
        </f7-block>

        <f7-block class="block-narrow" v-if="ready && thing.properties">
          <f7-col>
            <f7-block-title v-if="Object.keys(thing.properties).length > 0">Properties</f7-block-title>
            <f7-list>
              <!-- <f7-list-item v-if="Object.keys(thing.properties).length > 0" divider>Properties</f7-list-item> -->
              <f7-list-item
                v-for="(value, key) in thing.properties"
                :key="key"
                :title="key"
                :after="value"
              ></f7-list-item>
            </f7-list>
          </f7-col>
        </f7-block>

        <f7-block class="block-narrow" v-if="ready && thingType && thingType.UID.indexOf('zwave') === 0">
          <f7-col>
            <f7-block-title>Z-Wave</f7-block-title>
            <f7-list>
              <f7-list-button color="blue" title="View Network Map" @click="zwaveNetworkPopupOpened = true"></f7-list-button>
              <f7-list-button color="blue" v-for="action in zwaveActions" :key="action.name" :title="action.label" @click="doZWaveAction(action)"></f7-list-button>
            </f7-list>
          </f7-col>
          <z-wave-network-popup :opened="zwaveNetworkPopupOpened" @closed="zwaveNetworkPopupOpened = false" />
        </f7-block>

        <f7-block class="block-narrow" v-if="ready">
          <f7-col>
            <f7-list>
              <f7-list-button color="red" title="Delete Thing" @click="deleteThing"></f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>

      <f7-tab id="config" :disabled="!(thing.configuration && thingType.configParameters)" @tab:show="() => this.currentTab = 'config'" :tab-active="currentTab === 'config'">
        <f7-block v-if="currentTab === 'config'" class="block-narrow">
          <thing-general-settings :thing="thing" :thing-type="thingType" @updated="dirty = true" />
          <config-sheet
            :parameter-groups="configDescriptions.parameterGroups"
            :parameters="configDescriptions.parameters"
            :configuration="thing.configuration"
            @updated="dirty = true"
          />
        </f7-block>
      </f7-tab>

      <f7-tab id="channels" disabled="!thingType.channels" @tab:show="() => this.currentTab = 'channels'" :tab-active="currentTab === 'channels'">
        <f7-block v-if="currentTab === 'channels'" class="block-narrow">
          <channel-list :thingType="thingType" :thing="thing" :channelTypes="channelTypes"
            @channels-updated="onChannelsUpdated"
          />
          <f7-col v-if="isExtensible || thing.channels.length > 0">
            <f7-list>
              <f7-list-button class="searchbar-ignore" color="blue" title="Add Channel" v-if="isExtensible" @click="addChannel()"></f7-list-button>
              <f7-list-button class="searchbar-ignore" color="blue" title="Add Equipment to Model" @click="addToModel(true)"></f7-list-button>
              <f7-list-button class="searchbar-ignore" color="blue" title="Add Points to Model" @click="addToModel(false)"></f7-list-button>
              <f7-list-button class="searchbar-ignore" color="red" title="Unlink all Items" @click="unlinkAll(false)"></f7-list-button>
              <f7-list-button class="searchbar-ignore" color="red" title="Unlink all and Remove Items" @click="unlinkAll(true)"></f7-list-button>
            </f7-list>
          </f7-col>
        </f7-block>
      </f7-tab>
    </f7-tabs>

    <f7-fab position="right-bottom" color="blue" slot="fixed" @click="codePopupOpened = true">
      <f7-icon ios="f7:document_text" md="material:assignment" aurora="f7:document_text"></f7-icon>
      <f7-icon ios="f7:close" md="material:close"></f7-icon>
    </f7-fab>

    <f7-popup tablet-fullscreen :opened="codePopupOpened" close-on-escape @popup:closed="codePopupOpened = false">
      <f7-page>
        <f7-toolbar>
          <div class="left">
            <f7-link @click="copyTextualDefinition">Copy</f7-link>
          </div>
          <div class="right">
            <f7-link popup-close>Close</f7-link>
          </div>
        </f7-toolbar>
        <!-- <pre class="textual-definition" v-html="textualDefinition"></pre> -->
        <textarea class="textual-definition" id="textual-definition" :value="textualDefinition"></textarea>
      </f7-page>
    </f7-popup>
  </f7-page>
</template>

<style lang="stylus">
code.textual-definition pre {
  overflow-x: auto;
  white-space: normal;
}

pre.textual-definition {
  padding: 5px;
}

textarea.textual-definition {
  position: absolute;
  top: var(--f7-toolbar-height);
  left: 5px;
  right: 5px;
  bottom: 0;
  width: calc(100% - 10px);
  font-family: monospace;
}

.md .code-popup {
  margin-bottom: 0 !important;
}

.ios .code-popup {
  margin-bottom: 44px !important;
}

.code-popup {
  width: 100%;
  position: fixed;
  bottom: 0 !important;
  top: var(--f7-toolbar-height) !important;
  // margin -2px !important
  background-color: white !important;
  border-top: 2px solid #555;

  // z-index 1000 !important
  code {
    max-height: 50% !important;
    overflow-y: auto !important;
  }
}
</style>

<script>
import ConfigSheet from '@/components/config/config-sheet.vue'

import ChannelList from '@/components/thing/channel-list.vue'
import ThingGeneralSettings from '@/components/thing/thing-general-settings.vue'

import ZWaveNetworkPopup from './zwave/zwave-network-popup.vue'

import AddChannelPage from '@/pages/settings/things/channel/channel-add.vue'
import AddFromThingPage from '@/pages/settings/model/add-from-thing.vue'

import buildTextualDefinition from './thing-textual-definition'

let copyToast = null

export default {
  components: {
    ConfigSheet,
    ChannelList,
    ThingGeneralSettings,
    ZWaveNetworkPopup
  },
  props: ['thingId'],
  data () {
    return {
      ready: false,
      loading: false,
      dirty: false,
      currentTab: 'info',
      thing: {},
      thingType: {},
      channelTypes: {},
      configDescriptions: {},
      zwaveActions: {},
      thingEnabled: true,
      codePopupOpened: false,
      zwaveNetworkPopupOpened: false,
      eventSource: null
    }
  },
  created () {
    copyToast = this.$f7.toast.create({
      text: 'Textual definition copied to clipboard',
      closeTimeout: 2000
    })
  },
  computed: {
    isExtensible () {
      return this.thingType.extensibleChannelTypeIds.length > 0
    },
    textualDefinition () {
      return buildTextualDefinition(this.thing, this.thingType)
    }
  },
  methods: {
    onPageAfterIn (event) {
      // When coming back from the channel add/edit page with a change, let the handler below take care of the reloading logic (the thing has to be saved first)
      if (!event.pageFrom || !event.pageFrom.name || event.pageFrom.name.indexOf('channel') < 0) {
        console.log('Loading')
        if (!this.eventSource) this.stopEventSource()
        this.load()
      }
    },
    onPageAfterOut (event) {
      this.stopEventSource()
    },
    load () {
      // if (this.ready) return
      if (this.loading) return
      this.loading = true
      this.$oh.api.get('/rest/things/' + this.thingId).then(data => {
        this.$set(this, 'thing', data)

        let typePromises = [this.$oh.api.get('/rest/thing-types/' + this.thing.thingTypeUID),
          this.$oh.api.get('/rest/channel-types?prefixes=system,' + this.thing.thingTypeUID.split(':')[0])]

        Promise.all(typePromises).then(data2 => {
          this.thingType = data2[0]
          this.channelTypes = data2[1]

          this.$oh.api.get('/rest/config-descriptions/thing:' + this.thingId).then(data3 => {
            this.configDescriptions = data3
            this.ready = true
            this.loading = false
            this.dirty = false

            // special treatment for Z-Wave actions
            if (this.thingType.UID.indexOf('zwave') === 0) {
              this.zwaveActions = this.configDescriptions.parameters.filter((p) => p.groupName === 'actions')
              this.configDescriptions.parameters = this.configDescriptions.parameters.filter((p) => p.groupName !== 'actions')
            }

            if (!this.eventSource) this.startEventSource()
          }).catch(err => {
            console.log('No config descriptions for this thing, using those on the thing type: ' + err)
            this.ready = true
            this.loading = false
            this.dirty = false
            this.configDescriptions = {
              parameterGroups: this.thingType.parameterGroups,
              parameters: this.thingType.configParameters
            }

            if (!this.eventSource) this.startEventSource()
          })
        })
      })
    },
    save () {
      if (!this.ready) return
      console.log('Saving thing')
      this.$oh.api.put('/rest/things/' + this.thingId, this.thing).then(data => {
        // this.$set(this, 'thing', data)
        this.dirty = false
        this.$f7.toast.create({
          text: 'Thing updated',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    doZWaveAction (action) {
      let thing = this.thing
      let save = this.save
      if (action.type !== 'BOOLEAN') return
      this.$f7.dialog.confirm(
        `${action.label}?`,
        this.thing.label,
        () => {
          console.log(action)
          thing.configuration[action.name] = true
          save()
        }
      )
    },
    deleteThing () {
      let url, message
      if (this.thing.statusInfo.status === 'REMOVING') {
        message = `${this.thing.label} is currently being removed but the binding has not confirmed it has finished the operation yet. Would you like to force its removal? Warning: this could cause stability issues with the binding!`
        url = '/rest/things/' + this.thingId + '?force=true'
      } else {
        message = `Are you sure you want to delete ${this.thing.label}?`
        url = '/rest/things/' + this.thingId
      }
      this.$f7.dialog.confirm(
        message,
        'Delete Thing',
        () => {
          this.$oh.api.delete(url).then(() => {
            this.$f7router.back('/settings/things/', { force: true })
          })
        }
      )
    },
    toggleDisabled () {
      const enable = (this.thing.statusInfo.statusDetail === 'DISABLED')
      this.$oh.api.putPlain('/rest/things/' + this.thingId + '/enable', enable.toString(), 'application/json', 'application/json').then((data) => {
        this.$f7.toast.create({
          text: (enable) ? 'Thing enabled' : 'Thing disabled',
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
    addChannel () {
      const self = this
      this.$f7router.navigate({
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
      const self = this
      this.$f7router.navigate({
        url: 'add-to-model',
        route: {
          component: AddFromThingPage,
          path: 'add-to-model',
          props: {
          },
          on: {
            pageAfterOut (event, page) {
              console.log('Add to model page closed')
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
      if (save) this.save()
      if (!this.eventSource) this.startEventSource()
    },
    unlinkAll (removeItems) {
      const message = (removeItems)
        ? 'Are you sure you wish to unlink and remove all items currently linked to this thing?'
        : 'Are you sure you wish to unlink all items currently linked to this thing?'
      this.$f7.dialog.confirm(message, 'Unlink all',
        () => {
          this.$oh.api.get('/rest/links').then((data) => {
            let dialog = this.$f7.dialog.progress('Unlinking all items...')
            this.stopEventSource()
            const links = data.filter((l) => l.channelUID.indexOf(this.thingId) === 0)

            const unlinkPromises = links.map((l) => this.$oh.api.delete(`/rest/links/${l.itemName}/${encodeURIComponent(l.channelUID)}`))
            Promise.all(unlinkPromises).then(() => {
              if (removeItems) {
                dialog.setText('Removing items...')
                const deletePromises = links.map((l) => this.$oh.api.delete(`/rest/items/${l.itemName}`))
                Promise.all(deletePromises).then(() => {
                  dialog.close()
                  this.$f7.toast.create({
                    text: 'All items unlinked and removed',
                    destroyOnClose: true,
                    closeTimeout: 2000
                  }).open()
                  this.load()
                }).catch((err) => {
                  dialog.close()
                  this.$f7.dialog.alert('Some of the items could not be unlinked: ' + err)
                  this.load()
                })
              } else {
                dialog.close()
                this.$f7.toast.create({
                  text: 'All items unlinked',
                  destroyOnClose: true,
                  closeTimeout: 2000
                }).open()
                this.load()
              }
            }).catch((err) => {
              dialog.close()
              this.$f7.dialog.alert('Some of the items could not be removed: ' + err)
              this.load()
            })
          })
        })
    },
    startEventSource () {
      if (this.eventSource) this.stopEventSource()
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/things/*/*,smarthome/links/*/*' /* + encodeURIComponent(this.thingId) */, null, (event) => {
        // console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[1]) {
          case 'things':
            if (topicParts[2] !== this.thingId) return
            switch (topicParts[3]) {
              case 'status':
                this.$set(this.thing, 'statusInfo', JSON.parse(event.payload))
                break
              case 'removed':
                this.$f7.toast.create({
                  text: 'The Thing was deleted',
                  destroyOnClose: true,
                  closeTimeout: 2000
                }).open()
                this.$f7router.back('/settings/things/', { force: true })
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
    copyTextualDefinition () {
      let el = document.getElementById('textual-definition')
      el.select()
      document.execCommand('copy')
      copyToast.open()
    }
  }
}
</script>
